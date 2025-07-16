/*
  # Update RLS policies and storage configuration

  1. Changes
    - Update RLS policies for solutions table
    - Add storage buckets if they don't exist
    - Create storage policies for file uploads

  2. Security
    - Enable public read access for approved solutions
    - Allow authenticated users to create and manage their solutions
    - Set up secure file upload policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view approved solutions" ON solutions;
DROP POLICY IF EXISTS "Authenticated users can create solutions" ON solutions;
DROP POLICY IF EXISTS "Users can view their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update their own solutions" ON solutions;

-- Create updated policies
CREATE POLICY "Public can view approved solutions" ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view their own solutions" ON solutions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR status = 'approved');

CREATE POLICY "Users can update their own solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create storage buckets if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'registration') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('registration', 'registration', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'pitch-decks') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('pitch-decks', 'pitch-decks', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
  END IF;
END $$;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Public can read registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload registration documents" ON storage.objects;
DROP POLICY IF EXISTS "Public can read pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload pitch decks" ON storage.objects;
DROP POLICY IF EXISTS "Public can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;

-- Storage policies for registration documents
CREATE POLICY "Public can read registration documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'registration');

CREATE POLICY "Authenticated users can upload registration documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'registration');

-- Storage policies for pitch decks
CREATE POLICY "Public can read pitch decks"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pitch-decks');

CREATE POLICY "Authenticated users can upload pitch decks"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pitch-decks');

-- Storage policies for product images
CREATE POLICY "Public can read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');