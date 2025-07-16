-- Make user_id column nullable in solutions table
ALTER TABLE solutions 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to handle NULL user_id
DROP POLICY IF EXISTS "Anyone can view approved solutions" ON solutions;
DROP POLICY IF EXISTS "Users can view own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can insert solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update own solutions" ON solutions;

-- Recreate policies with NULL handling
CREATE POLICY "Anyone can view approved solutions"
  ON solutions
  FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can view own solutions"
  ON solutions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can insert solutions"
  ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update own solutions"
  ON solutions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() OR user_id IS NULL);