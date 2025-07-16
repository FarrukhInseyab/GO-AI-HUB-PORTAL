/*
  # Add User Session Management Functions
  
  1. New Functions
    - `set_user_id`: Stores user ID in session context
    - `get_current_user_id`: Retrieves current user ID from session
    - `clear_user_id`: Clears user ID from session
  
  2. Security
    - Functions use SECURITY DEFINER to ensure proper access control
    - `set_user_id` and `clear_user_id` are volatile functions
    - `get_current_user_id` is stable for better caching
*/

-- Function to set the current user ID in the session
CREATE OR REPLACE FUNCTION public.set_user_id(user_id_param uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id_param::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get the current user ID from the session
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_user_id', true)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to clear the current user ID from the session
CREATE OR REPLACE FUNCTION public.clear_user_id()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;