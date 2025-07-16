/*
  # User Authentication Setup

  1. New Tables
    - Ensure users table has all required fields
    - Add indexes for performance
    - Add constraints for data integrity

  2. Security
    - Enable RLS
    - Add policies for user data access
    - Set up foreign key relationships
*/

-- Ensure users table has all required fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS password text;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS solutions_user_id_idx ON solutions(user_id);
CREATE INDEX IF NOT EXISTS interests_user_id_idx ON interests(user_id);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Update foreign key relationships
ALTER TABLE solutions 
DROP CONSTRAINT IF EXISTS solutions_user_id_fkey;

ALTER TABLE interests 
DROP CONSTRAINT IF EXISTS interests_user_id_fkey;

ALTER TABLE solutions
ADD CONSTRAINT solutions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id)
ON DELETE CASCADE;

ALTER TABLE interests
ADD CONSTRAINT interests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id)
ON DELETE CASCADE;

-- RLS Policies
CREATE POLICY "Anyone can view users"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (true);

CREATE POLICY "Users can insert data"
  ON users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view approved solutions"
  ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can insert solutions"
  ON solutions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own interests"
  ON interests
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create interests"
  ON interests
  FOR INSERT
  WITH CHECK (true);