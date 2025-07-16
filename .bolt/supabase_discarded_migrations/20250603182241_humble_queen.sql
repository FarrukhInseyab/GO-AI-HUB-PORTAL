/*
  # Independent Authentication Setup

  1. New Tables
    - `users` table with:
      - `user_id` (uuid, primary key)
      - `email` (text, unique)
      - `password` (text)
      - `contact_name` (text)
      - `company_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on users table
    - Add policies for:
      - Reading own data
      - Updating own data
      - Allowing registration
    - Add session management functions

  3. Changes
    - Update foreign key references in solutions and interests tables
*/

-- Drop existing tables and functions if they exist
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.set_user_id CASCADE;
DROP FUNCTION IF EXISTS public.get_current_user_id CASCADE;
DROP FUNCTION IF EXISTS public.clear_user_id CASCADE;

-- Create users table
CREATE TABLE public.users (
  user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read own data" 
  ON public.users
  FOR SELECT 
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can update own data" 
  ON public.users
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Allow user registration" 
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create session management functions
CREATE OR REPLACE FUNCTION public.set_user_id(user_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', user_id::text, false);
END;
$$ language plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.user_id', true), '')::uuid;
END;
$$ language plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.clear_user_id()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', '', false);
END;
$$ language plpgsql SECURITY DEFINER;

-- Update foreign key references
ALTER TABLE solutions
  DROP CONSTRAINT IF EXISTS solutions_user_id_fkey,
  ADD CONSTRAINT solutions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;

ALTER TABLE interests
  DROP CONSTRAINT IF EXISTS interests_user_id_fkey,
  ADD CONSTRAINT interests_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;