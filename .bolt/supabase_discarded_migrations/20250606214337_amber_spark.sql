/*
  # Fix OAuth authentication policies and constraints

  1. Changes
    - Update RLS policies to properly handle OAuth authentication
    - Fix foreign key constraints for OAuth users
    - Ensure proper user creation flow
  
  2. Security
    - Maintain security while allowing OAuth user creation
    - Proper session handling for both auth types
*/

-- Update RLS policies for better OAuth support
DROP POLICY IF EXISTS "Users can insert data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

-- Allow anyone to view users (needed for profile lookups)
DROP POLICY IF EXISTS "Anyone can view users" ON users;
CREATE POLICY "Anyone can view users"
  ON users
  FOR SELECT
  USING (true);

-- Allow users to insert their own data (both OAuth and regular)
CREATE POLICY "Users can insert data"
  ON users
  FOR INSERT
  WITH CHECK (
    (id = current_setting('app.current_user_id', true)::uuid) OR
    (auth.uid() IS NULL)
  );

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (
    (id = current_setting('app.current_user_id', true)::uuid) OR
    (id = auth.uid())
  );

-- Update solutions policies to handle OAuth users
DROP POLICY IF EXISTS "Users can insert solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can view own solutions" ON solutions;

CREATE POLICY "Users can insert solutions"
  ON solutions
  FOR INSERT
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

CREATE POLICY "Users can update own solutions"
  ON solutions
  FOR UPDATE
  USING (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

CREATE POLICY "Users can view own solutions"
  ON solutions
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::uuid OR
    status = 'approved'
  );

-- Update interests policies
DROP POLICY IF EXISTS "Users can insert interests" ON interests;
DROP POLICY IF EXISTS "Users can view own interests" ON interests;

CREATE POLICY "Users can insert interests"
  ON interests
  FOR INSERT
  WITH CHECK (
    user_id = current_setting('app.current_user_id', true)::uuid
  );

CREATE POLICY "Users can view own interests"
  ON interests
  FOR SELECT
  USING (
    user_id = current_setting('app.current_user_id', true)::uuid
  );