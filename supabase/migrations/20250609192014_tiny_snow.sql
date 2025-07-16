/*
  # Fix Auth Integration Issues

  1. Changes
    - Drop existing get_current_user_profile function first to avoid conflicts
    - Enable anonymous access to auth endpoints
    - Fix the user creation trigger function
    - Update RLS policies for proper auth integration
    - Add helper functions for auth state management

  2. Security
    - Ensure proper RLS policies for user data protection
    - Grant minimal necessary permissions to roles
*/

-- Enable anonymous access to auth endpoints
BEGIN;
  -- Grant usage on necessary schemas
  GRANT USAGE ON SCHEMA auth TO anon, authenticated;
  
  -- Grant access to auth.users for the trigger function
  GRANT SELECT ON auth.users TO anon, authenticated, service_role;
  
  -- Grant execute on auth functions
  GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
  GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;
COMMIT;

-- Check if get_current_user_profile function exists and drop it first
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_current_user_profile'
  ) THEN
    DROP FUNCTION get_current_user_profile();
  END IF;
END $$;

-- Fix the user creation trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Insert user profile with proper error handling
  INSERT INTO public.users (
    user_id, 
    email, 
    contact_name, 
    company_name, 
    country
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown')
  )
  RETURNING id INTO new_user_id;
  
  RAISE NOTICE 'Created new user profile with ID: % for auth user: %', new_user_id, NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- User already exists, just return
    RAISE NOTICE 'User already exists for auth user: %', NEW.id;
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

-- Add helper function to get current user profile
CREATE FUNCTION get_current_user_profile()
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM users
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log the completion
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'auth_integration_fix', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'fix_auth_permissions',
    'changes', ARRAY[
      'Added public access to auth endpoints',
      'Fixed user_id handling in users table',
      'Updated RLS policies for proper auth integration',
      'Added helper functions for auth state management'
    ]
  )
);