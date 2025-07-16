/*
  # Update RLS policies for solutions and storage

  1. Changes
    - Enable RLS on solutions table
    - Add policies for solutions table (insert, read)
    - Create storage buckets for documents and images
    - Add storage policies for authenticated uploads and public reads
  
  2. Security
    - Authenticated users can only insert/update their own solutions
    - Public can only view approved solutions
    - Storage access is controlled per bucket
*/

-- Enable RLS on solutions table
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Create policies for solutions table
CREATE POLICY "Enable insert access for authenticated users"
ON solutions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users"
ON solutions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR status = 'approved');

CREATE POLICY "Enable public read access for approved solutions"
ON solutions
FOR SELECT
TO public
USING (status = 'approved');

-- Create storage bucket policies
DO $$
BEGIN
  -- Registration documents bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('registration', 'registration')
  ON CONFLICT (id) DO NOTHING;

  -- Pitch decks bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('pitch-decks', 'pitch-decks')
  ON CONFLICT (id) DO NOTHING;

  -- Product images bucket
  INSERT INTO storage.buckets (id, name)
  VALUES ('product-images', 'product-images')
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Storage policies for registration documents
CREATE POLICY "Allow authenticated users to upload registration docs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'registration');

CREATE POLICY "Allow public to read registration docs"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'registration');

-- Storage policies for pitch decks
CREATE POLICY "Allow authenticated users to upload pitch decks"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY "Allow public to read pitch decks"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'pitch-decks');

-- Storage policies for product images
CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow public to read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');