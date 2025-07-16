-- Fix the RLS policy for solutions table to properly handle the auth integration

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update solutions" ON solutions;

-- Create corrected policy for inserting solutions
-- The solutions.user_id should reference users.id (primary key)
-- The auth.uid() should match users.user_id for that user record
CREATE POLICY "Users can insert their own solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = solutions.user_id 
      AND users.user_id = auth.uid()
    )
  );

-- Create corrected policy for updating solutions
CREATE POLICY "Users can update solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    is_evaluator() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = solutions.user_id 
      AND users.user_id = auth.uid()
    )
  );

-- Also fix the interests table policies to be consistent
DROP POLICY IF EXISTS "Users can insert interests" ON interests;
DROP POLICY IF EXISTS "Users can read interests" ON interests;
DROP POLICY IF EXISTS "Users can update interests" ON interests;

CREATE POLICY "Users can insert interests" ON interests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = interests.user_id 
      AND users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read interests" ON interests
  FOR SELECT
  TO authenticated
  USING (
    is_evaluator() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = interests.user_id 
      AND users.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM solutions, users 
      WHERE solutions.id = interests.solution_id 
      AND users.id = solutions.user_id
      AND users.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update interests" ON interests
  FOR UPDATE
  TO authenticated
  USING (
    is_evaluator() OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = interests.user_id 
      AND users.user_id = auth.uid()
    )
  );

-- Log the fix
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'fix_solutions_rls_policy', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'fix_rls_policies_for_auth_integration',
    'changes', ARRAY[
      'Fixed solutions table RLS policies to properly check users.user_id = auth.uid()',
      'Fixed interests table RLS policies for consistency',
      'Ensured foreign key relationships work correctly with auth integration'
    ],
    'note', 'RLS policies now correctly handle the relationship between auth.users.id, users.user_id, and solutions.user_id'
  )
);