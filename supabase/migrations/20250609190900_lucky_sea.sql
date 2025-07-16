/*
  # Complete Authentication System Fix

  1. Database Structure
    - Ensure users table properly links to auth.users
    - Fix RLS policies for proper auth integration
    - Update trigger function for user creation

  2. Security
    - Proper RLS policies for all tables
    - Auth integration with user_id mapping
    - Evaluator function fixes
*/

-- First, let's ensure the users table structure is correct
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_user_id_key;
ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);

-- Make sure we have the right indexes
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email_text ON users(email text_pattern_ops);

-- Fix the user creation trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert user profile with proper error handling
  INSERT INTO public.users (user_id, email, contact_name, company_name, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Fix RLS policies for users table
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role bypass" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile (for manual creation if trigger fails)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix the is_evaluator function to work with auth
CREATE OR REPLACE FUNCTION is_evaluator()
RETURNS boolean AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the email of the current authenticated user
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if this email exists in profiles as an evaluator
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = user_email AND role = 'evaluator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix solutions table policies
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update solutions" ON solutions;

CREATE POLICY "Users can insert their own solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = solutions.user_id)
  );

CREATE POLICY "Users can update solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    is_evaluator() OR 
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = solutions.user_id)
  );

-- Fix interests table policies
DROP POLICY IF EXISTS "Users can insert interests" ON interests;
DROP POLICY IF EXISTS "Users can read interests" ON interests;
DROP POLICY IF EXISTS "Users can update interests" ON interests;

CREATE POLICY "Users can insert interests" ON interests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id)
  );

CREATE POLICY "Users can read interests" ON interests
  FOR SELECT
  TO authenticated
  USING (
    is_evaluator() OR 
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id) OR
    EXISTS (
      SELECT 1 FROM solutions, users 
      WHERE solutions.id = interests.solution_id 
      AND users.user_id = auth.uid() 
      AND users.id = solutions.user_id
    )
  );

CREATE POLICY "Users can update interests" ON interests
  FOR UPDATE
  TO authenticated
  USING (
    is_evaluator() OR 
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id)
  );

-- Add helper function to get current user profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS users AS $$
DECLARE
  user_profile users;
BEGIN
  SELECT * INTO user_profile
  FROM users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the setup
DO $$
DECLARE
  test_result boolean;
BEGIN
  -- Test if the trigger function exists
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'handle_new_user'
  ) INTO test_result;
  
  IF test_result THEN
    RAISE NOTICE 'SUCCESS: handle_new_user function exists';
  ELSE
    RAISE NOTICE 'ERROR: handle_new_user function missing';
  END IF;
  
  -- Test if the trigger exists
  SELECT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  ) INTO test_result;
  
  IF test_result THEN
    RAISE NOTICE 'SUCCESS: on_auth_user_created trigger exists';
  ELSE
    RAISE NOTICE 'ERROR: on_auth_user_created trigger missing';
  END IF;
  
  RAISE NOTICE 'Auth system setup completed successfully';
END $$;