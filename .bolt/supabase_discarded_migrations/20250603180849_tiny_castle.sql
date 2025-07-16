/*
  # Fix Authentication Schema
  
  1. New Tables
    - users table with proper authentication fields
    
  2. Changes
    - Drop existing auth-related tables and constraints
    - Create new users table with proper fields
    - Update foreign key relationships
    - Add appropriate indexes
    
  3. Security
    - Enable RLS
    - Add policies for data access
*/

-- Drop existing tables and constraints
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  contact_name text NOT NULL,
  company_name text NOT NULL,
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
REFERENCES users(id)
ON DELETE CASCADE;

ALTER TABLE interests
ADD CONSTRAINT interests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id)
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
  USING (email = current_setting('app.user_email', true));

CREATE POLICY "Users can insert data"
  ON users
  FOR INSERT
  WITH CHECK (true);

-- RLS Policies for solutions table
CREATE POLICY "Anyone can view approved solutions"
  ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can insert solutions"
  ON solutions
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('app.user_email', true)));

CREATE POLICY "Users can update own solutions"
  ON solutions
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('app.user_email', true)));

-- RLS Policies for interests table
CREATE POLICY "Users can view own interests"
  ON interests
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE email = current_setting('app.user_email', true)));

CREATE POLICY "Users can create interests"
  ON interests
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE email = current_setting('app.user_email', true)));

-- Function to set current user context
CREATE OR REPLACE FUNCTION set_user_context(user_email text)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_email', user_email, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();