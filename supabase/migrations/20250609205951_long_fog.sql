/*
  # Fix Solutions RLS Policy for Auth Integration

  1. Changes
    - Simplify the RLS policy for solutions table
    - Ensure proper auth integration
    - Add debugging information

  2. Security
    - Maintain proper access control
    - Users can only insert solutions linked to their profile
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update solutions" ON solutions;

-- Create simplified and more robust policies
CREATE POLICY "Users can insert their own solutions"
  ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update solutions"
  ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    ) OR
    is_evaluator()
  );

-- Add a helper function to debug auth issues
CREATE OR REPLACE FUNCTION debug_user_auth()
RETURNS TABLE(
  auth_user_id uuid,
  profile_exists boolean,
  profile_id uuid,
  profile_email text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as auth_user_id,
    EXISTS(SELECT 1 FROM users WHERE user_id = auth.uid()) as profile_exists,
    u.id as profile_id,
    u.email as profile_email
  FROM users u
  WHERE u.user_id = auth.uid()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log the fix
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'fix_solutions_rls_final', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'simplify_solutions_rls_policy',
    'changes', ARRAY[
      'Simplified solutions RLS policy using IN clause',
      'Added debug function for troubleshooting auth issues',
      'Ensured policy works with current auth setup'
    ],
    'note', 'Solutions RLS policy now uses simplified IN clause for better reliability'
  )
);