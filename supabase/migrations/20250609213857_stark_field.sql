/*
  # Clear All RLS Policies from All Tables

  1. Changes
    - Remove all RLS policies from existing tables
    - Disable RLS on all tables
    - Drop helper functions related to RLS
    - Set up basic role-based permissions

  2. Security
    - Switch from RLS to role-based permissions
    - Grant appropriate access to authenticated and anonymous users
    - Maintain service role full access
*/

-- Disable RLS and drop all policies from users table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    ALTER TABLE users DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can read own profile" ON users;
    DROP POLICY IF EXISTS "Users can update own profile" ON users;
    DROP POLICY IF EXISTS "Users can insert own profile" ON users;
    DROP POLICY IF EXISTS "Service role bypass" ON users;
    RAISE NOTICE 'Cleared policies from users table';
  END IF;
END $$;

-- Disable RLS and drop all policies from solutions table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solutions') THEN
    ALTER TABLE solutions DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public can read approved solutions" ON solutions;
    DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
    DROP POLICY IF EXISTS "Users can read their own solutions" ON solutions;
    DROP POLICY IF EXISTS "Users can update their own solutions" ON solutions;
    DROP POLICY IF EXISTS "Users can delete their own solutions" ON solutions;
    DROP POLICY IF EXISTS "Users can update solutions" ON solutions;
    DROP POLICY IF EXISTS "Evaluators can read all solutions" ON solutions;
    DROP POLICY IF EXISTS "Evaluators can update all solutions" ON solutions;
    DROP POLICY IF EXISTS "Service role bypass" ON solutions;
    RAISE NOTICE 'Cleared policies from solutions table';
  END IF;
END $$;

-- Disable RLS and drop all policies from interests table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interests') THEN
    ALTER TABLE interests DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can insert interests" ON interests;
    DROP POLICY IF EXISTS "Users can read interests" ON interests;
    DROP POLICY IF EXISTS "Users can update interests" ON interests;
    DROP POLICY IF EXISTS "Public can read interests for approved solutions" ON interests;
    DROP POLICY IF EXISTS "Service role bypass" ON interests;
    RAISE NOTICE 'Cleared policies from interests table';
  END IF;
END $$;

-- Disable RLS and drop all policies from profiles table (if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
    DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
    DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
    DROP POLICY IF EXISTS "Service role bypass" ON profiles;
    RAISE NOTICE 'Cleared policies from profiles table';
  ELSE
    RAISE NOTICE 'Profiles table does not exist, skipping';
  END IF;
END $$;

-- Disable RLS and drop all policies from rate_limits table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
    ALTER TABLE rate_limits DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can access rate limits" ON rate_limits;
    DROP POLICY IF EXISTS "Service role bypass" ON rate_limits;
    RAISE NOTICE 'Cleared policies from rate_limits table';
  END IF;
END $$;

-- Disable RLS and drop all policies from audit_log table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON audit_log;
    DROP POLICY IF EXISTS "Service role bypass" ON audit_log;
    RAISE NOTICE 'Cleared policies from audit_log table';
  END IF;
END $$;

-- Disable RLS and drop all policies from maintenance_log table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_log') THEN
    ALTER TABLE maintenance_log DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Service role bypass" ON maintenance_log;
    RAISE NOTICE 'Cleared policies from maintenance_log table';
  END IF;
END $$;

-- Drop helper functions related to RLS (with error handling)
DO $$
BEGIN
  DROP FUNCTION IF EXISTS is_evaluator();
  DROP FUNCTION IF EXISTS user_owns_solution(uuid);
  DROP FUNCTION IF EXISTS get_current_user_profile();
  DROP FUNCTION IF EXISTS debug_auth_state();
  DROP FUNCTION IF EXISTS debug_user_auth();
  DROP FUNCTION IF EXISTS insert_solution(jsonb);
  DROP FUNCTION IF EXISTS test_user_creation();
  RAISE NOTICE 'Dropped RLS helper functions';
END $$;

-- Drop any RLS-related indexes that are no longer needed
DROP INDEX IF EXISTS idx_users_user_id_role;
DROP INDEX IF EXISTS idx_solutions_approval_status;

-- Grant basic permissions to authenticated users for core operations
DO $$
BEGIN
  -- Users table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
  END IF;
  
  -- Solutions table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'solutions') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON solutions TO authenticated;
    GRANT SELECT ON solutions TO anon; -- Anonymous read access
  END IF;
  
  -- Interests table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'interests') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON interests TO authenticated;
    GRANT SELECT ON interests TO anon; -- Anonymous read access
  END IF;
  
  -- Profiles table (if exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    GRANT SELECT ON profiles TO authenticated;
  END IF;
  
  -- Rate limits table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'rate_limits') THEN
    GRANT SELECT, INSERT, UPDATE, DELETE ON rate_limits TO authenticated;
  END IF;
  
  -- Audit log table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log') THEN
    GRANT SELECT ON audit_log TO authenticated;
  END IF;
  
  -- Maintenance log table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'maintenance_log') THEN
    GRANT SELECT ON maintenance_log TO authenticated;
  END IF;
  
  RAISE NOTICE 'Granted permissions to authenticated and anonymous users';
END $$;

-- Ensure service role has full access
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Log the policy removal
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'clear_all_rls_policies', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'remove_all_rls_policies',
    'tables_checked', ARRAY[
      'users',
      'solutions', 
      'interests',
      'profiles',
      'rate_limits',
      'audit_log',
      'maintenance_log'
    ],
    'functions_dropped', ARRAY[
      'is_evaluator()',
      'user_owns_solution(uuid)',
      'get_current_user_profile()',
      'debug_auth_state()',
      'debug_user_auth()',
      'insert_solution(jsonb)',
      'test_user_creation()'
    ],
    'indexes_dropped', ARRAY[
      'idx_users_user_id_role',
      'idx_solutions_approval_status'
    ],
    'note', 'All RLS policies have been removed from existing tables. Tables now rely on role-based permissions only.'
  )
);

-- Final notification
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully';
  RAISE NOTICE 'All RLS policies have been cleared from existing tables';
  RAISE NOTICE 'Tables now use role-based permissions only';
  RAISE NOTICE 'Authenticated users have full CRUD access to main tables';
  RAISE NOTICE 'Anonymous users have read access to public solutions and interests';
END $$;