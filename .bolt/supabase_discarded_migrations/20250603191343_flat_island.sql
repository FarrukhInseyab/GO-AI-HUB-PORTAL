-- Drop existing tables and functions
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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
CREATE POLICY "Anyone can view users"
  ON public.users
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert data"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (id = current_setting('app.user_id', true)::uuid);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create session management functions
CREATE OR REPLACE FUNCTION set_user_id(user_id uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', user_id::text, false);
END;
$$ language plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.user_id', true), '')::uuid;
END;
$$ language plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION clear_user_id()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', '', false);
END;
$$ language plpgsql SECURITY DEFINER;