/*
  # User Session Management Functions

  1. Functions Created
    - `set_user_id` - Set current user session
    - `get_current_user_id` - Get current user from session
    - `clear_user_id` - Clear user session
    - `handle_new_user` - Handle new user registration

  2. Security
    - Session management for custom authentication
    - User context tracking
*/

-- Function to set user ID in session
CREATE OR REPLACE FUNCTION set_user_id(user_id_param uuid)
RETURNS void AS $$
BEGIN
  -- Store user ID in session variable
  PERFORM set_config('app.current_user_id', user_id_param::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current user ID from session
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid AS $$
BEGIN
  -- Get user ID from session variable
  RETURN COALESCE(current_setting('app.current_user_id', true), NULL)::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clear user session
CREATE OR REPLACE FUNCTION clear_user_id()
RETURNS void AS $$
BEGIN
  -- Clear session variable
  PERFORM set_config('app.current_user_id', '', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log user registration in audit log
  INSERT INTO audit_log (
    user_id,
    action,
    table_name,
    record_id,
    new_values
  ) VALUES (
    NEW.id,
    'USER_REGISTERED',
    'users',
    NEW.id,
    to_jsonb(NEW)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER handle_new_user_trigger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function for bulk interest insertion
CREATE OR REPLACE FUNCTION bulk_insert_interests(interest_data jsonb)
RETURNS integer AS $$
DECLARE
  inserted_count integer := 0;
  interest_record jsonb;
BEGIN
  FOR interest_record IN SELECT * FROM jsonb_array_elements(interest_data)
  LOOP
    INSERT INTO interests (
      solution_id,
      user_id,
      company_name,
      contact_name,
      contact_email,
      contact_phone,
      message,
      status
    ) VALUES (
      (interest_record->>'solution_id')::uuid,
      (interest_record->>'user_id')::uuid,
      interest_record->>'company_name',
      interest_record->>'contact_name',
      interest_record->>'contact_email',
      interest_record->>'contact_phone',
      interest_record->>'message',
      COALESCE(interest_record->>'status', 'New Interest')
    );
    
    inserted_count := inserted_count + 1;
  END LOOP;
  
  RETURN inserted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'users', (SELECT COUNT(*) FROM users),
    'solutions', (SELECT COUNT(*) FROM solutions),
    'interests', (SELECT COUNT(*) FROM interests),
    'approved_solutions', (SELECT COUNT(*) FROM solutions WHERE status = 'approved'),
    'pending_solutions', (SELECT COUNT(*) FROM solutions WHERE status = 'pending'),
    'total_interests_today', (SELECT COUNT(*) FROM interests WHERE DATE(created_at) = CURRENT_DATE)
  ) INTO stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;