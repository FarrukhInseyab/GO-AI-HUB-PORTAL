/*
  # Create RLS Policies for Solutions Table

  1. Security Changes
    - Drop existing policies on solutions table
    - Create comprehensive RLS policies using Supabase authentication
    - Use users table for role-based access control
    - Enable proper CRUD operations based on user roles and ownership

  2. Policy Structure
    - Public can read approved solutions
    - Authenticated users can insert their own solutions
    - Users can read and update their own solutions
    - Evaluators can read and update all solutions
    - Service role has full access for admin operations
*/

-- Enable RLS on solutions table
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Public can read approved solutions" ON solutions;
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can read their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update their own solutions" ON solutions;
DROP POLICY IF EXISTS "Evaluators can read all solutions" ON solutions;
DROP POLICY IF EXISTS "Evaluators can update all solutions" ON solutions;
DROP POLICY IF EXISTS "Service role bypass" ON solutions;

-- Policy 1: Public can read approved solutions
CREATE POLICY "Public can read approved solutions"
  ON solutions
  FOR SELECT
  TO public
  USING (
    status = 'approved' AND 
    tech_approval_status = 'approved' AND 
    business_approval_status = 'approved'
  );

-- Policy 2: Authenticated users can insert solutions for themselves
CREATE POLICY "Users can insert their own solutions"
  ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

-- Policy 3: Users can read their own solutions
CREATE POLICY "Users can read their own solutions"
  ON solutions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or it's an approved solution (public access)
      (status = 'approved' AND tech_approval_status = 'approved' AND business_approval_status = 'approved') OR
      -- Or user is an evaluator
      EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = auth.uid() AND role = 'Evaluator'
      )
    )
  );

-- Policy 4: Users can update their own solutions
CREATE POLICY "Users can update their own solutions"
  ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or user is an evaluator
      EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = auth.uid() AND role = 'Evaluator'
      )
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or user is an evaluator
      EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = auth.uid() AND role = 'Evaluator'
      )
    )
  );

-- Policy 5: Users can delete their own solutions
CREATE POLICY "Users can delete their own solutions"
  ON solutions
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or user is an evaluator
      EXISTS (
        SELECT 1 FROM users 
        WHERE user_id = auth.uid() AND role = 'Evaluator'
      )
    )
  );

-- Policy 6: Service role bypass for admin operations
CREATE POLICY "Service role bypass"
  ON solutions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Update the is_evaluator function to work with the new structure
CREATE OR REPLACE FUNCTION is_evaluator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND role = 'Evaluator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user owns a solution
CREATE OR REPLACE FUNCTION user_owns_solution(solution_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND id = solution_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to get current user profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM users
  WHERE user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_evaluator() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_owns_solution(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_current_user_profile() TO authenticated, anon;

-- Create indexes to optimize RLS policy performance
CREATE INDEX IF NOT EXISTS idx_solutions_user_id ON solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);
CREATE INDEX IF NOT EXISTS idx_solutions_approval_status ON solutions(tech_approval_status, business_approval_status);
CREATE INDEX IF NOT EXISTS idx_users_user_id_role ON users(user_id, role);

-- Log the policy creation
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'create_solutions_rls_policies', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'create_comprehensive_rls_policies',
    'table', 'solutions',
    'policies_created', ARRAY[
      'Public can read approved solutions',
      'Users can insert their own solutions', 
      'Users can read their own solutions',
      'Users can update their own solutions',
      'Users can delete their own solutions',
      'Service role bypass'
    ],
    'helper_functions', ARRAY[
      'is_evaluator()',
      'user_owns_solution(uuid)',
      'get_current_user_profile()'
    ],
    'indexes_created', ARRAY[
      'idx_solutions_user_id',
      'idx_solutions_status', 
      'idx_solutions_approval_status',
      'idx_users_user_id_role'
    ],
    'note', 'Comprehensive RLS policies using Supabase auth with role-based access control'
  )
);