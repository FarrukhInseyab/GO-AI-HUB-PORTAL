/*
  # Fix Authentication Schema

  1. Changes
    - Drop existing users table and recreate it to work with Supabase Auth
    - Update foreign key relationships to reference auth.users
    - Add proper indexes and RLS policies
    
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for data access
    - Ensure proper authentication checks
*/

-- Drop existing tables and constraints
DROP TABLE IF EXISTS users CASCADE;

-- Create users table that works with Supabase Auth
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

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
REFERENCES auth.users(id)
ON DELETE CASCADE;

ALTER TABLE interests
ADD CONSTRAINT interests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS solutions_user_id_idx ON solutions(user_id);
CREATE INDEX IF NOT EXISTS interests_user_id_idx ON interests(user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- RLS Policies for users table
CREATE POLICY "Anyone can view users"
  ON users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for solutions table
CREATE POLICY "Anyone can view approved solutions"
  ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can insert solutions"
  ON solutions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own solutions"
  ON solutions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for interests table
CREATE POLICY "Users can view own interests"
  ON interests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create interests"
  ON interests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();