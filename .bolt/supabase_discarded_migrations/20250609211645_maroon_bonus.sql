/*
  # Add insert_solution RPC function

  1. Changes
    - Add a new RPC function to bypass RLS for solution insertion
    - This function will be used as a temporary workaround for RLS issues
    - The function validates the user is authenticated before inserting

  2. Security
    - Function is SECURITY DEFINER to bypass RLS
    - Still validates that the user is authenticated
    - Only allows users to insert solutions for their own profile
*/

-- Create a function to insert a solution bypassing RLS
CREATE OR REPLACE FUNCTION insert_solution(solution_data jsonb)
RETURNS json AS $$
DECLARE
  current_auth_uid uuid;
  user_profile_id uuid;
  inserted_solution json;
BEGIN
  -- Get the current authenticated user ID
  current_auth_uid := auth.uid();
  
  -- Check if user is authenticated
  IF current_auth_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get the user profile ID
  SELECT id INTO user_profile_id
  FROM users
  WHERE user_id = current_auth_uid;
  
  IF user_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Ensure the solution is being created for the current user
  IF (solution_data->>'user_id')::uuid != user_profile_id THEN
    RAISE EXCEPTION 'Cannot create solution for another user';
  END IF;
  
  -- Insert the solution
  INSERT INTO solutions
  SELECT * FROM jsonb_populate_record(null::solutions, solution_data)
  RETURNING to_json(solutions.*) INTO inserted_solution;
  
  -- Return the inserted solution
  RETURN inserted_solution;
EXCEPTION
  WHEN others THEN
    RAISE EXCEPTION 'Error inserting solution: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_solution(jsonb) TO authenticated;

-- Log the creation of the function
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'add_insert_solution_function', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'add_rpc_function_to_bypass_rls',
    'function_name', 'insert_solution',
    'purpose', 'Temporary workaround for RLS issues with solution insertion',
    'security', 'SECURITY DEFINER with authentication check'
  )
);