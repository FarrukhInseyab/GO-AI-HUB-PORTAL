/*
  # Add Password Reset Function
  
  1. Changes
    - Create function to handle password reset requests
    - Create function to verify password reset tokens
    - Reuse existing email_confirmation_token column for password resets
    
  2. Security
    - Secure token generation and validation
    - Time-limited tokens (24 hours)
    - Proper error handling and logging
*/

-- Function to request password reset
CREATE OR REPLACE FUNCTION request_password_reset(email_param text)
RETURNS boolean AS $$
DECLARE
  user_record users;
  reset_token text;
BEGIN
  -- Find user by email
  SELECT * INTO user_record
  FROM users
  WHERE email = email_param;
  
  -- If user not found, return true anyway (security through obscurity)
  IF user_record IS NULL THEN
    RETURN true;
  END IF;
  
  -- Generate reset token (in real implementation, use a secure random generator)
  reset_token := encode(gen_random_bytes(32), 'hex');
  
  -- Store token in database
  UPDATE users
  SET 
    email_confirmation_token = reset_token,
    confirmation_sent_at = now()
  WHERE id = user_record.id;
  
  -- In a real implementation, send email here or trigger a notification
  -- For this migration, we'll just return success
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in request_password_reset: %', SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify password reset token
CREATE OR REPLACE FUNCTION verify_password_reset_token(token_param text)
RETURNS TABLE(
  is_valid boolean,
  user_id uuid,
  email text
) AS $$
DECLARE
  user_record users;
  token_age interval;
BEGIN
  -- Find user by token
  SELECT * INTO user_record
  FROM users
  WHERE email_confirmation_token = token_param;
  
  -- If user not found, token is invalid
  IF user_record IS NULL THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Check token age (24 hour expiry)
  token_age := now() - user_record.confirmation_sent_at;
  
  -- If token is older than 24 hours, it's expired
  IF token_age > interval '24 hours' THEN
    RETURN QUERY SELECT false, NULL::uuid, NULL::text;
    RETURN;
  END IF;
  
  -- Token is valid
  RETURN QUERY SELECT true, user_record.user_id, user_record.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION request_password_reset(text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verify_password_reset_token(text) TO authenticated, anon;

-- Log the migration
INSERT INTO maintenance_log (operation, details)
VALUES (
  'add_password_reset_functions',
  jsonb_build_object(
    'timestamp', NOW(),
    'description', 'Added password reset functions',
    'changes', jsonb_build_array(
      'Added request_password_reset function',
      'Added verify_password_reset_token function',
      'Reused email_confirmation_token column for password resets'
    ),
    'security_level', 'HIGH'
  )
);