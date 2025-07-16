/*
  # Fix check_table_exists function ambiguous column reference

  1. Changes
    - Fix the check_table_exists function to properly qualify the table_name parameter
    - Ensure the function works correctly with the GOAI Agent

  2. Security
    - Function remains SECURITY DEFINER to ensure proper access
    - Only checks table existence, no data access
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS check_table_exists(text);

-- Create the fixed function with properly qualified parameter
CREATE OR REPLACE FUNCTION check_table_exists(p_table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO authenticated, anon, service_role;

-- Log the fix
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'fix_check_table_exists_function', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'fix_ambiguous_column_reference',
    'function_name', 'check_table_exists',
    'issue', 'Column reference "table_name" is ambiguous',
    'fix', 'Renamed parameter to p_table_name to avoid ambiguity with information_schema.tables.table_name',
    'note', 'This fixes the GOAI Agent error when checking if user_research_reports table exists'
  )
);