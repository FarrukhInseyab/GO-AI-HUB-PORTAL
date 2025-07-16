/*
  # Initial Database Schema for GO AI Hub

  1. New Tables
    - `users` - User accounts and authentication
    - `profiles` - User profiles for evaluators
    - `solutions` - AI solution submissions
    - `interests` - User interests in solutions
    - `rate_limits` - Rate limiting tracking
    - `audit_log` - System audit logging
    - `maintenance_log` - System maintenance tracking

  2. Security
    - Enable RLS on all user-facing tables
    - Add appropriate policies for data access
    - Set up proper foreign key relationships

  3. Functions
    - Timestamp management functions
    - User session management functions
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create timestamp management function
CREATE OR REPLACE FUNCTION set_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create created_at timestamp function
CREATE OR REPLACE FUNCTION set_created_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.created_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text,
  contact_name text NOT NULL,
  company_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table (for evaluators)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'evaluator' NOT NULL,
  created_at timestamptz DEFAULT now(),
  password text
);

-- Solutions table
CREATE TABLE IF NOT EXISTS solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  company_name text,
  country text,
  website text,
  revenue text,
  employees text,
  registration_doc text,
  linkedin text,
  solution_name text,
  summary text,
  description text,
  industry_focus jsonb,
  tech_categories jsonb,
  auto_tags jsonb,
  deployment_model text,
  arabic_support boolean,
  trl text,
  deployment_status text,
  clients jsonb,
  ksa_customization boolean,
  ksa_customization_details text,
  pitch_deck text,
  demo_video text,
  contact_name text,
  position text,
  contact_email text,
  status text,
  approved_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  tech_approval_status text,
  business_approval_status text,
  tech_feedback text,
  business_feedback text,
  product_images jsonb,
  technical_eval_id uuid REFERENCES profiles(id),
  business_eval_id uuid REFERENCES profiles(id)
);

-- Interests table
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  message text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'New Interest',
  comments text,
  profile_id uuid REFERENCES profiles(id),
  initiated_at timestamptz
);

-- Rate limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Maintenance log table
CREATE TABLE IF NOT EXISTS maintenance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL,
  completed_at timestamptz DEFAULT now(),
  details jsonb
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for profiles
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO public
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO public
  USING (auth.uid() = id);

-- RLS Policies for solutions
CREATE POLICY "Users can read approved solutions or their own"
  ON solutions
  FOR SELECT
  TO public
  USING (status = 'approved' OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own solutions"
  ON solutions
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solutions"
  ON solutions
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id);

-- RLS Policies for interests
CREATE POLICY "Users can read their own interests"
  ON interests
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Solution owners can read interests for their solutions"
  ON interests
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM solutions 
    WHERE solutions.id = interests.solution_id 
    AND solutions.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own interests"
  ON interests
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for rate_limits
CREATE POLICY "Users can only see their own rate limits"
  ON rate_limits
  FOR ALL
  TO public
  USING (auth.uid() = user_id);

-- RLS Policies for audit_log
CREATE POLICY "Only authenticated users can read audit logs"
  ON audit_log
  FOR SELECT
  TO public
  USING (auth.uid() IS NOT NULL);

-- Create triggers for timestamp management
CREATE TRIGGER set_users_timestamps
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_solutions_timestamps
  BEFORE INSERT OR UPDATE ON solutions
  FOR EACH ROW EXECUTE FUNCTION set_timestamps();

CREATE TRIGGER set_interests_timestamps
  BEFORE INSERT ON interests
  FOR EACH ROW EXECUTE FUNCTION set_created_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email_text ON users USING btree (email text_pattern_ops);
CREATE INDEX IF NOT EXISTS idx_users_company_created ON users USING btree (company_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_solutions_user_status ON solutions USING btree (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_solutions_status_created ON solutions USING btree (status, created_at DESC) WHERE status = 'approved';
CREATE INDEX IF NOT EXISTS idx_solutions_company_country ON solutions USING btree (country, company_name);
CREATE INDEX IF NOT EXISTS idx_solutions_tech_categories ON solutions USING gin (tech_categories);
CREATE INDEX IF NOT EXISTS idx_solutions_industry_focus ON solutions USING gin (industry_focus);
CREATE INDEX IF NOT EXISTS idx_solutions_auto_tags ON solutions USING gin (auto_tags);
CREATE INDEX IF NOT EXISTS idx_solutions_arabic_support ON solutions USING btree (arabic_support, status) WHERE arabic_support = true AND status = 'approved';
CREATE INDEX IF NOT EXISTS idx_solutions_search_text ON solutions USING gin (to_tsvector('english', solution_name || ' ' || summary || ' ' || COALESCE(description, '')));

CREATE INDEX IF NOT EXISTS idx_interests_user_created ON interests USING btree (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interests_solution_created ON interests USING btree (solution_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interests_status_created ON interests USING btree (status, created_at DESC);