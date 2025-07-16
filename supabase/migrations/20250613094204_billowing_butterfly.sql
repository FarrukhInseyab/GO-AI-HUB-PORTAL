/*
  # Add missing check_table_exists function

  1. Changes
    - Create the check_table_exists function that the GOAI Agent is trying to call
    - Grant proper permissions for authenticated users

  2. Security
    - Function is SECURITY DEFINER to ensure proper access
    - Only checks table existence, no data access
*/

-- Create the missing function
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO authenticated, anon, service_role;

-- Log the fix
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'add_missing_check_table_exists_function', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'fix_missing_rpc_function',
    'function_name', 'check_table_exists',
    'note', 'Added missing function that GOAI Agent was trying to call'
  )
);