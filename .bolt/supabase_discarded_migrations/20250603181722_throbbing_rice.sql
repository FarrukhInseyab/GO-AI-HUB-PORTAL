-- Create users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
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

-- Create updated_at trigger function if it doesn't exist
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

-- Create current_user_id function
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.user_id', true), '')::uuid;
END;
$$ language plpgsql SECURITY DEFINER;