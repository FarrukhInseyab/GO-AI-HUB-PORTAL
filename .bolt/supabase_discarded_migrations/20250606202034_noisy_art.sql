/*
  # Add OAuth support to users table

  1. Changes
    - Make password field nullable for OAuth users
    - Add OAuth provider tracking
    - Update RLS policies to handle OAuth users
  
  2. Security
    - Maintain existing RLS policies
    - Ensure OAuth users can be created and managed properly
*/

-- Make password nullable for OAuth users
ALTER TABLE users 
ALTER COLUMN password DROP NOT NULL;

-- Add OAuth provider tracking (optional)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS oauth_provider text;

-- Update RLS policies to handle OAuth users better
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (
    id = current_setting('app.current_user_id', true)::uuid OR
    id = auth.uid()
  );

-- Allow OAuth users to insert their profile
DROP POLICY IF EXISTS "Users can insert data" ON users;

CREATE POLICY "Users can insert data"
  ON users
  FOR INSERT
  WITH CHECK (
    id = auth.uid() OR
    auth.uid() IS NULL
  );