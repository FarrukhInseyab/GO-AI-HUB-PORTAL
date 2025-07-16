/*
  # Comprehensive RLS Setup with Supabase Authentication - CORRECTED

  1. Tables Covered
    - users: User profiles linked to auth.users (role: 'User' or 'Evaluator')
    - solutions: AI solutions submitted by users
    - interests: User interests in solutions
    - rate_limits: Rate limiting data
    - audit_log: System audit logs
    - maintenance_log: System maintenance logs

  2. Security Model
    - Uses Supabase auth.uid() for user identification
    - Role-based access control using users.role ('User', 'Evaluator')
    - Public read access for approved solutions
    - Private data access for owners only
    - Evaluators have elevated permissions

  3. Helper Functions
    - is_evaluator(): Check if current user is an evaluator
    - user_owns_solution(): Check solution ownership
    - get_current_user_profile(): Get current user's profile
    - can_access_solution(): Check solution access permissions
*/

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to check if current user is an evaluator
CREATE OR REPLACE FUNCTION is_evaluator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND role = 'Evaluator'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user owns a solution
CREATE OR REPLACE FUNCTION user_owns_solution(solution_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND id = solution_user_id
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM users
  WHERE user_id = auth.uid();
EXCEPTION
  WHEN OTHERS THEN
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access a solution
CREATE OR REPLACE FUNCTION can_access_solution(solution_id uuid)
RETURNS boolean AS $$
DECLARE
  solution_record solutions;
BEGIN
  SELECT * INTO solution_record FROM solutions WHERE id = solution_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Public access for approved solutions
  IF solution_record.status = 'approved' AND 
     COALESCE(solution_record.tech_approval_status, '') = 'approved' AND 
     COALESCE(solution_record.business_approval_status, '') = 'approved' THEN
    RETURN true;
  END IF;
  
  -- Owner access
  IF user_owns_solution(solution_record.user_id) THEN
    RETURN true;
  END IF;
  
  -- Evaluator access
  IF is_evaluator() THEN
    RETURN true;
  END IF;
  
  RETURN false;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION is_evaluator() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION user_owns_solution(uuid) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_current_user_profile() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION can_access_solution(uuid) TO authenticated, anon;

-- =====================================================
-- USERS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Evaluators can read all profiles" ON users;
DROP POLICY IF EXISTS "Service role bypass users" ON users;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile (for manual creation if trigger fails)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Evaluators can read all user profiles
CREATE POLICY "Evaluators can read all profiles" ON users
  FOR SELECT
  TO authenticated
  USING (is_evaluator());

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass users" ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SOLUTIONS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on solutions table
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Public can read approved solutions" ON solutions;
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can read accessible solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update accessible solutions" ON solutions;
DROP POLICY IF EXISTS "Users can delete accessible solutions" ON solutions;
DROP POLICY IF EXISTS "Service role bypass solutions" ON solutions;

-- Public can read approved solutions
CREATE POLICY "Public can read approved solutions" ON solutions
  FOR SELECT
  TO public
  USING (
    status = 'approved' AND 
    COALESCE(tech_approval_status, '') = 'approved' AND 
    COALESCE(business_approval_status, '') = 'approved'
  );

-- Authenticated users can insert solutions for themselves
CREATE POLICY "Users can insert their own solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

-- Users can read their own solutions + approved solutions + evaluators can read all
CREATE POLICY "Users can read accessible solutions" ON solutions
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or it's an approved solution (public access)
      (status = 'approved' AND 
       COALESCE(tech_approval_status, '') = 'approved' AND 
       COALESCE(business_approval_status, '') = 'approved') OR
      -- Or user is an evaluator
      is_evaluator()
    )
  );

-- Users can update their own solutions + evaluators can update all
CREATE POLICY "Users can update accessible solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or user is an evaluator
      is_evaluator()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or user is an evaluator
      is_evaluator()
    )
  );

-- Users can delete their own solutions + evaluators can delete all
CREATE POLICY "Users can delete accessible solutions" ON solutions
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the solution
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- Or user is an evaluator
      is_evaluator()
    )
  );

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass solutions" ON solutions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- INTERESTS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on interests table
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can insert interests" ON interests;
DROP POLICY IF EXISTS "Users can read accessible interests" ON interests;
DROP POLICY IF EXISTS "Users can update accessible interests" ON interests;
DROP POLICY IF EXISTS "Users can delete accessible interests" ON interests;
DROP POLICY IF EXISTS "Public can read interests for approved solutions" ON interests;
DROP POLICY IF EXISTS "Service role bypass interests" ON interests;

-- Users can insert interests for themselves
CREATE POLICY "Users can insert interests" ON interests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

-- Users can read their own interests + solution owners can see interests in their solutions + evaluators can read all
CREATE POLICY "Users can read accessible interests" ON interests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the interest
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- User owns the solution that the interest is for
      EXISTS (
        SELECT 1 FROM solutions, users 
        WHERE solutions.id = interests.solution_id 
        AND users.id = solutions.user_id
        AND users.user_id = auth.uid()
      ) OR
      -- User is an evaluator
      is_evaluator()
    )
  );

-- Users can update their own interests + evaluators can update all
CREATE POLICY "Users can update accessible interests" ON interests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the interest
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- User is an evaluator
      is_evaluator()
    )
  );

-- Users can delete their own interests + evaluators can delete all
CREATE POLICY "Users can delete accessible interests" ON interests
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      -- User owns the interest
      user_id IN (
        SELECT id FROM users WHERE user_id = auth.uid()
      ) OR
      -- User is an evaluator
      is_evaluator()
    )
  );

-- Public can read interests for approved solutions
CREATE POLICY "Public can read interests for approved solutions" ON interests
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM solutions 
      WHERE solutions.id = interests.solution_id 
      AND solutions.status = 'approved'
      AND COALESCE(solutions.tech_approval_status, '') = 'approved'
      AND COALESCE(solutions.business_approval_status, '') = 'approved'
    )
  );

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass interests" ON interests
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- RATE_LIMITS TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on rate_limits table
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can access own rate limits" ON rate_limits;
DROP POLICY IF EXISTS "Service role bypass rate_limits" ON rate_limits;

-- Users can access their own rate limit data
CREATE POLICY "Users can access own rate limits" ON rate_limits
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass rate_limits" ON rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- AUDIT_LOG TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on audit_log table
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Evaluators can read audit logs" ON audit_log;
DROP POLICY IF EXISTS "Users can read own audit logs" ON audit_log;
DROP POLICY IF EXISTS "Service role bypass audit_log" ON audit_log;

-- Evaluators can read audit logs
CREATE POLICY "Evaluators can read audit logs" ON audit_log
  FOR SELECT
  TO authenticated
  USING (is_evaluator());

-- Users can read audit logs related to their own actions
CREATE POLICY "Users can read own audit logs" ON audit_log
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass audit_log" ON audit_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- MAINTENANCE_LOG TABLE RLS POLICIES
-- =====================================================

-- Enable RLS on maintenance_log table
ALTER TABLE maintenance_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Evaluators can read maintenance logs" ON maintenance_log;
DROP POLICY IF EXISTS "Service role bypass maintenance_log" ON maintenance_log;

-- Only evaluators can read maintenance logs
CREATE POLICY "Evaluators can read maintenance logs" ON maintenance_log
  FOR SELECT
  TO authenticated
  USING (is_evaluator());

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass maintenance_log" ON maintenance_log
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

-- Create indexes to optimize RLS policy performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_user_id_role ON users(user_id, role);

CREATE INDEX IF NOT EXISTS idx_solutions_user_id ON solutions(user_id);
CREATE INDEX IF NOT EXISTS idx_solutions_status ON solutions(status);
CREATE INDEX IF NOT EXISTS idx_solutions_approval_status ON solutions(tech_approval_status, business_approval_status);
CREATE INDEX IF NOT EXISTS idx_solutions_user_status ON solutions(user_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_interests_user_id ON interests(user_id);
CREATE INDEX IF NOT EXISTS idx_interests_solution_id ON interests(solution_id);
CREATE INDEX IF NOT EXISTS idx_interests_user_solution ON interests(user_id, solution_id);

CREATE INDEX IF NOT EXISTS idx_rate_limits_user_id ON rate_limits(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant basic permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solutions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON interests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits TO authenticated;
GRANT SELECT ON audit_log TO authenticated;
GRANT SELECT ON maintenance_log TO authenticated;

-- Grant read access to anonymous users for public data
GRANT SELECT ON solutions TO anon;
GRANT SELECT ON interests TO anon;

-- Ensure service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- =====================================================
-- LOG THE SETUP
-- =====================================================

-- Log the comprehensive RLS setup
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'comprehensive_rls_setup', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'setup_comprehensive_rls_policies',
    'tables_configured', ARRAY[
      'users',
      'solutions', 
      'interests',
      'rate_limits',
      'audit_log',
      'maintenance_log'
    ],
    'helper_functions', ARRAY[
      'is_evaluator()',
      'user_owns_solution(uuid)',
      'get_current_user_profile()',
      'can_access_solution(uuid)'
    ],
    'policies_created', jsonb_build_object(
      'users', ARRAY[
        'Users can read own profile',
        'Users can update own profile',
        'Users can insert own profile',
        'Evaluators can read all profiles',
        'Service role bypass users'
      ],
      'solutions', ARRAY[
        'Public can read approved solutions',
        'Users can insert their own solutions',
        'Users can read accessible solutions',
        'Users can update accessible solutions',
        'Users can delete accessible solutions',
        'Service role bypass solutions'
      ],
      'interests', ARRAY[
        'Users can insert interests',
        'Users can read accessible interests',
        'Users can update accessible interests',
        'Users can delete accessible interests',
        'Public can read interests for approved solutions',
        'Service role bypass interests'
      ],
      'rate_limits', ARRAY[
        'Users can access own rate limits',
        'Service role bypass rate_limits'
      ],
      'audit_log', ARRAY[
        'Evaluators can read audit logs',
        'Users can read own audit logs',
        'Service role bypass audit_log'
      ],
      'maintenance_log', ARRAY[
        'Evaluators can read maintenance logs',
        'Service role bypass maintenance_log'
      ]
    ),
    'indexes_created', ARRAY[
      'idx_users_user_id',
      'idx_users_role',
      'idx_users_user_id_role',
      'idx_solutions_user_id',
      'idx_solutions_status',
      'idx_solutions_approval_status',
      'idx_solutions_user_status',
      'idx_interests_user_id',
      'idx_interests_solution_id',
      'idx_interests_user_solution',
      'idx_rate_limits_user_id',
      'idx_audit_log_user_id'
    ],
    'security_model', jsonb_build_object(
      'authentication', 'Supabase auth.uid()',
      'authorization', 'Role-based using users.role (User, Evaluator)',
      'public_access', 'Approved solutions and their interests',
      'private_access', 'Owners and evaluators only',
      'user_roles', ARRAY['User', 'Evaluator'],
      'evaluator_privileges', 'Can read all profiles, solutions, interests, audit logs, and maintenance logs'
    ),
    'note', 'Comprehensive RLS setup with Supabase authentication, role-based access control using users table only (no profiles table), and optimized performance indexes'
  )
);

-- Final notification
DO $$
BEGIN
  RAISE NOTICE '=== COMPREHENSIVE RLS SETUP COMPLETED ===';
  RAISE NOTICE 'Tables configured: users, solutions, interests, rate_limits, audit_log, maintenance_log';
  RAISE NOTICE 'Helper functions created: is_evaluator(), user_owns_solution(), get_current_user_profile(), can_access_solution()';
  RAISE NOTICE 'Security model: Supabase auth with role-based access control using users.role';
  RAISE NOTICE 'User roles: User (default), Evaluator (elevated permissions)';
  RAISE NOTICE 'Public access: Approved solutions and their interests';
  RAISE NOTICE 'Private access: Owners and evaluators only';
  RAISE NOTICE 'Performance indexes created for optimal query performance';
  RAISE NOTICE 'NOTE: No profiles table - all user management through users table with role field';
  RAISE NOTICE '=== SETUP COMPLETE ===';
END $$;