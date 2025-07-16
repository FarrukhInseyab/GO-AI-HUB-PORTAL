/*
  # Update users table structure and policies

  1. Changes
    - Add id column if not exists
    - Add password column if not exists
    - Enable RLS
    - Update policies for user access

  2. Security
    - Enable RLS on users table
    - Add policies for viewing and updating user data
*/

-- Add id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id'
  ) THEN
    ALTER TABLE users ADD COLUMN id uuid PRIMARY KEY DEFAULT gen_random_uuid();
  END IF;
END $$;

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
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert data" ON users;

-- Create new policies
CREATE POLICY "Users can view all users"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (email = current_setting('app.user_email', true));

CREATE POLICY "Users can insert data"
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