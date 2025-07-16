/*
  # Create AI Solutions Schema

  1. New Tables
    - `solutions`
      - Basic info: id, name, company details, website
      - Solution details: summary, description, deployment model
      - Technical info: industries, technologies, tags
      - Status: deployment status, TRL level
      - Support: Arabic support, KSA customizations
      - Media: product images, pitch deck, demo video
      - Contact info
      - Timestamps
    
  2. Security
    - Enable RLS on solutions table
    - Add policies for:
      - Public read access for approved solutions
      - Authenticated users can create solutions
      - Solution owners can update their solutions
*/

CREATE TABLE solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  
  -- Basic Info
  company_name text NOT NULL,
  country text NOT NULL,
  website text,
  revenue text,
  employees text,
  registration_doc text,
  linkedin text,
  
  -- Solution Info
  solution_name text NOT NULL,
  summary text NOT NULL,
  description text,
  industry_focus text[] NOT NULL DEFAULT '{}',
  tech_categories text[] NOT NULL DEFAULT '{}',
  auto_tags text[] NOT NULL DEFAULT '{}',
  deployment_model text,
  arabic_support boolean DEFAULT false,
  product_images text[] DEFAULT '{}',
  
  -- Deployment & Maturity
  trl text,
  deployment_status text,
  clients text,
  ksa_customization boolean DEFAULT false,
  ksa_customization_details text,
  
  -- Attachments & Contact
  pitch_deck text,
  demo_video text,
  contact_name text NOT NULL,
  position text,
  contact_email text NOT NULL,
  
  -- Status
  status text NOT NULL DEFAULT 'pending',
  approved_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public can view approved solutions" ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own solutions" ON solutions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();