/*
  # Create Core Tables and Security Policies

  1. New Tables
    - users: Store user profiles
    - solutions: Store AI solution listings
    - interests: Store interest expressions in solutions
  
  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Set up foreign key relationships
*/

-- Create users table
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create solutions table
CREATE TABLE public.solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  country text NOT NULL,
  website text,
  revenue text,
  employees text,
  registration_doc text,
  linkedin text,
  solution_name text NOT NULL,
  summary text NOT NULL,
  description text,
  industry_focus text[] DEFAULT '{}',
  tech_categories text[] DEFAULT '{}',
  auto_tags text[] DEFAULT '{}',
  deployment_model text,
  arabic_support boolean DEFAULT false,
  product_images text[] DEFAULT '{}',
  trl text,
  deployment_status text,
  clients text,
  ksa_customization boolean DEFAULT false,
  ksa_customization_details text,
  pitch_deck text,
  demo_video text,
  contact_name text NOT NULL,
  position text,
  contact_email text NOT NULL,
  status text DEFAULT 'pending',
  tech_approval_status text DEFAULT 'pending',
  business_approval_status text DEFAULT 'pending',
  tech_feedback text,
  business_feedback text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interests table
CREATE TABLE public.interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES public.solutions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create RLS policies for solutions
CREATE POLICY "Anyone can view approved solutions"
  ON public.solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own solutions"
  ON public.solutions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert solutions"
  ON public.solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own solutions"
  ON public.solutions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for interests
CREATE POLICY "Users can view own interests"
  ON public.interests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert interests"
  ON public.interests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON public.solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();