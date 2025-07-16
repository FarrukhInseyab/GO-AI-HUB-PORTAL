/*
  # Update users table to use user_id consistently

  1. Changes
    - Rename id column to user_id in users table
    - Update foreign key references in solutions and interests tables
    - Update RLS policies to use user_id
    - Maintain data integrity and security

  2. Security
    - Maintain existing RLS policies with updated column name
    - Ensure proper cascade behavior for foreign keys
*/

-- Rename id column to user_id if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'id'
  ) THEN
    ALTER TABLE users RENAME COLUMN id TO user_id;
  END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;

-- Recreate policies with user_id
CREATE POLICY "Users can read own data" 
  ON users
  FOR SELECT 
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can update own data" 
  ON users
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Allow user registration" 
  ON users
  FOR INSERT
  WITH CHECK (true);

-- Update foreign key references in solutions table
ALTER TABLE solutions
  DROP CONSTRAINT IF EXISTS solutions_user_id_fkey,
  ADD CONSTRAINT solutions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;

-- Update foreign key references in interests table
ALTER TABLE interests
  DROP CONSTRAINT IF EXISTS interests_user_id_fkey,
  ADD CONSTRAINT interests_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;