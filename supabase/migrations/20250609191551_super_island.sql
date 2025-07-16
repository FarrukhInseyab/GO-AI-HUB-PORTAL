/*
  # Fix Supabase Auth Integration

  1. Changes
    - Drop and recreate functions to avoid type conflicts
    - Fix user creation trigger for proper auth integration
    - Update RLS policies to work with Supabase Auth
    - Add proper permissions for auth endpoints

  2. Security
    - Enable RLS on users table
    - Add policies for authenticated users to manage their own data
    - Service role bypass for admin operations
*/

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS get_current_user_profile();
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Enable anonymous access to auth endpoints (with error handling)
DO $$
BEGIN
  -- Grant usage on necessary schemas
  BEGIN
    GRANT USAGE ON SCHEMA auth TO anon, authenticated;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not grant auth schema usage - may already be granted';
  END;
  
  -- Grant access to auth.users for the trigger function
  BEGIN
    GRANT SELECT ON auth.users TO anon, authenticated, service_role;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not grant auth.users access - may already be granted';
  END;
  
  -- Grant execute on auth functions
  BEGIN
    GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION auth.role() TO anon, authenticated, service_role;
  EXCEPTION
    WHEN insufficient_privilege THEN
      RAISE NOTICE 'Could not grant auth function access - may already be granted';
  END;
END $$;

-- Create the user creation trigger function
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

-- Drop and recreate the trigger
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

-- Create helper function to get current user profile (with new signature)
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  email text,
  contact_name text,
  company_name text,
  country text,
  created_at timestamptz,
  updated_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.user_id,
    u.email,
    u.contact_name,
    u.company_name,
    u.country,
    u.created_at,
    u.updated_at
  FROM users u
  WHERE u.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RPC functions for auth operations
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION set_user_id(user_id_param uuid)
RETURNS void AS $$
BEGIN
  -- This is a placeholder for session management
  -- In practice, Supabase handles this automatically
  RAISE NOTICE 'User ID set to: %', user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_user_id()
RETURNS void AS $$
BEGIN
  -- This is a placeholder for session management
  -- In practice, Supabase handles this automatically
  RAISE NOTICE 'User session cleared';
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
      'Added helper functions for auth state management',
      'Fixed function signature conflicts'
    ]
  )
);