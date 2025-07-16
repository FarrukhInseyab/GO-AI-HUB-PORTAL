/*
  # Integrate Supabase Authentication with Users Table

  1. Changes
    - Add user_id column to users table to link with auth.users
    - Create trigger to automatically create user profile on auth signup
    - Update RLS policies to use auth.uid()
    - Add function to handle new user creation
    - Remove password column from users table (handled by Supabase Auth)

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to manage their own data
    - Add service role bypass for admin operations
*/

-- Remove password column from users table since Supabase Auth handles this
ALTER TABLE users DROP COLUMN IF EXISTS password;

-- Add user_id column to link with auth.users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE users ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'users' AND constraint_name = 'users_user_id_key'
  ) THEN
    ALTER TABLE users ADD CONSTRAINT users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Add index for user_id lookups
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, contact_name, company_name, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'contact_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for users table
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Service role bypass" ON users;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = id)
  WITH CHECK (auth.uid() = user_id OR auth.uid() = id);

-- Policy for users to insert their own profile (for manual creation)
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

-- Update solutions table policies to use auth.uid()
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update solutions" ON solutions;

CREATE POLICY "Users can insert their own solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = solutions.user_id)
    )
  );

CREATE POLICY "Users can update solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      is_evaluator() OR 
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = solutions.user_id)
    )
  );

-- Update interests table policies
DROP POLICY IF EXISTS "Users can insert interests" ON interests;
DROP POLICY IF EXISTS "Users can read interests" ON interests;
DROP POLICY IF EXISTS "Users can update interests" ON interests;

CREATE POLICY "Users can insert interests" ON interests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id)
    )
  );

CREATE POLICY "Users can read interests" ON interests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      is_evaluator() OR 
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id) OR
      EXISTS (SELECT 1 FROM solutions WHERE solutions.id = interests.solution_id AND solutions.user_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM solutions, users WHERE solutions.id = interests.solution_id AND users.user_id = auth.uid() AND users.id = solutions.user_id)
    )
  );

CREATE POLICY "Users can update interests" ON interests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      is_evaluator() OR 
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id)
    )
  );

-- Update rate_limits table policies
DROP POLICY IF EXISTS "Users can access rate limits" ON rate_limits;

CREATE POLICY "Users can access rate limits" ON rate_limits
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = rate_limits.user_id)
    )
  );

-- Helper function to get current user from auth
CREATE OR REPLACE FUNCTION get_current_user()
RETURNS users AS $$
DECLARE
  current_user users;
BEGIN
  SELECT * INTO current_user
  FROM users
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  RETURN current_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if current user is evaluator
CREATE OR REPLACE FUNCTION is_evaluator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'evaluator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;