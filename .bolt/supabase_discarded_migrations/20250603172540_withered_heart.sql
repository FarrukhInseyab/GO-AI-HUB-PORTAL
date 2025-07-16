/*
  # Update Users Table and Policies

  1. Changes
    - Add password field to users table if not exists
    - Enable RLS on users table
    - Update policies for user data access
    - Add function for setting user context

  2. Security
    - Enable RLS for users table
    - Add policies for viewing, updating, and inserting user data
    - Add function to set user context securely
*/

-- Add password field if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password'
  ) THEN
    ALTER TABLE users ADD COLUMN password text NOT NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Users can insert data" ON users;

-- Create new policies
CREATE POLICY "View users policy"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Update users policy"
  ON users
  FOR UPDATE
  USING (email = current_setting('app.user_email', true));

CREATE POLICY "Insert users policy"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Function to set current user context
CREATE OR REPLACE FUNCTION set_user_context(user_email text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_email', user_email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;