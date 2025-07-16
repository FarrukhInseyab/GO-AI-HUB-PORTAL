/*
  # Add RLS policies for solutions table and storage buckets

  1. Security Changes
    - Enable RLS on solutions table
    - Add policies for:
      - Authenticated users can insert solutions
      - Anyone can view approved solutions
      - Storage bucket policies for file uploads
*/

-- Enable RLS
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Solutions table policies
CREATE POLICY "Anyone can view approved solutions"
  ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Authenticated users can insert solutions"
  ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Storage bucket policies
CREATE POLICY "Anyone can read product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can read pitch decks"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'pitch-decks');

CREATE POLICY "Authenticated users can upload pitch decks"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'pitch-decks');

CREATE POLICY "Anyone can read registration docs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'registration');

CREATE POLICY "Authenticated users can upload registration docs"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'registration');