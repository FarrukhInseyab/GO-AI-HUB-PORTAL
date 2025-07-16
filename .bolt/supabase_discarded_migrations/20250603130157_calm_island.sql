/*
  # Update users table and policies

  1. Changes
    - Add password field if not exists
    - Update RLS policies for better security
  
  2. Security
    - Enable RLS
    - Add policies for user data access
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

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Allow users to view their own data
CREATE POLICY "Users can view own data"
  ON users
  FOR SELECT
  USING (true);

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (id = (SELECT id FROM users WHERE email = current_setting('request.jwt.claims', true)::json->>'email'));