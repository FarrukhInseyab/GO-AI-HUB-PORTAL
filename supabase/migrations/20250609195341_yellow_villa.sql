/*
  # Add role field to users table

  1. Changes
    - Add `role` column to `users` table with default value 'User'
    - Update the handle_new_user() trigger function to set role on signup
    - Add index for role-based queries

  2. Security
    - No changes to RLS policies needed
*/

-- Add role column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role text NOT NULL DEFAULT 'User';
  END IF;
END $$;

-- Create index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update the handle_new_user trigger function to set role
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
    country,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
    'User' -- Set default role to 'User'
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

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update existing users to have the 'User' role if they don't have a role set
UPDATE users SET role = 'User' WHERE role IS NULL;

-- Log the migration
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'add_user_role', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'add_user_role_field',
    'changes', ARRAY[
      'Added role column to users table with default "User" value',
      'Updated handle_new_user trigger function to set role on signup',
      'Added index for role-based queries',
      'Updated existing users to have the User role'
    ]
  )
);