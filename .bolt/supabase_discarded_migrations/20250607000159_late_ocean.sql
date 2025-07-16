/*
  # Fix timestamp handling for solutions and interests tables

  1. Changes
    - Ensure created_at and updated_at have proper defaults
    - Add triggers to automatically set timestamps
    - Fix any existing NULL timestamps

  2. Security
    - No changes to RLS policies
*/

-- Update solutions table to ensure proper timestamp defaults
ALTER TABLE solutions 
ALTER COLUMN created_at SET DEFAULT now(),
ALTER COLUMN updated_at SET DEFAULT now();

-- Update interests table to ensure proper timestamp defaults  
ALTER TABLE interests
ALTER COLUMN created_at SET DEFAULT now();

-- Update any existing NULL created_at values
UPDATE solutions 
SET created_at = now() 
WHERE created_at IS NULL;

UPDATE solutions 
SET updated_at = now() 
WHERE updated_at IS NULL;

UPDATE interests 
SET created_at = now() 
WHERE created_at IS NULL;

-- Ensure the update trigger exists and works properly
DROP TRIGGER IF EXISTS update_solutions_updated_at ON solutions;

CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add a trigger to automatically set created_at if not provided
CREATE OR REPLACE FUNCTION set_created_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.created_at IS NULL THEN
    NEW.created_at = now();
  END IF;
  IF NEW.updated_at IS NULL THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to solutions table
DROP TRIGGER IF EXISTS set_solutions_created_at ON solutions;
CREATE TRIGGER set_solutions_created_at
  BEFORE INSERT ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION set_created_at();

-- Apply the trigger to interests table  
DROP TRIGGER IF EXISTS set_interests_created_at ON interests;
CREATE TRIGGER set_interests_created_at
  BEFORE INSERT ON interests
  FOR EACH ROW
  EXECUTE FUNCTION set_created_at();