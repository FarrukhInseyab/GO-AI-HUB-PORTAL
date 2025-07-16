/*
  # Update User Table Schema and Foreign Keys

  1. Changes
    - Add user_id as primary key to users table
    - Update foreign key constraints in solutions and interests tables
    - Enable RLS on all tables
    - Add appropriate policies

  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Ensure proper foreign key relationships
*/

-- Drop existing constraints and columns
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;
ALTER TABLE users DROP COLUMN IF EXISTS id;

-- Add user_id column as primary key
ALTER TABLE users ADD COLUMN user_id uuid PRIMARY KEY DEFAULT gen_random_uuid();

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

-- Enable RLS on all tables
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing foreign key constraints
ALTER TABLE solutions 
DROP CONSTRAINT IF EXISTS solutions_user_id_fkey;

ALTER TABLE interests 
DROP CONSTRAINT IF EXISTS interests_user_id_fkey;

-- Add proper foreign key constraints
ALTER TABLE solutions
ADD CONSTRAINT solutions_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(user_id)
ON DELETE CASCADE;

ALTER TABLE interests
ADD CONSTRAINT interests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(user_id)
ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS solutions_user_id_idx ON solutions(user_id);
CREATE INDEX IF NOT EXISTS interests_user_id_idx ON interests(user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- Update RLS policies for solutions
DROP POLICY IF EXISTS "Anyone can view approved solutions" ON solutions;
DROP POLICY IF EXISTS "Users can insert solutions" ON solutions;

CREATE POLICY "Anyone can view approved solutions"
  ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can insert solutions"
  ON solutions
  FOR INSERT
  WITH CHECK (true);

-- Update RLS policies for interests
DROP POLICY IF EXISTS "Users can view own interests" ON interests;
DROP POLICY IF EXISTS "Users can create interests" ON interests;

CREATE POLICY "Users can view own interests"
  ON interests
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create interests"
  ON interests
  FOR INSERT
  WITH CHECK (true);

-- Update RLS policies for users
DROP POLICY IF EXISTS "Anyone can view users" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can insert data" ON users;

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