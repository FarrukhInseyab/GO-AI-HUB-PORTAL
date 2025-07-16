/*
  # Add product_images column to solutions table

  1. Changes
    - Add product_images column to solutions table
    - Set default value to empty array
    - Make column nullable
    
  2. Security
    - No security changes needed
    - Existing RLS policies will cover the new column
*/

-- Add product_images column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'solutions' 
    AND column_name = 'product_images'
  ) THEN
    ALTER TABLE solutions ADD COLUMN product_images text[] DEFAULT '{}';
  END IF;
END $$;