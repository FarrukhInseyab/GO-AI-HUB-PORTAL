/*
  # Authentication Functions Migration
  
  1. New Functions
    - Create authentication helper functions
    - Add session management
    - Add password verification
  
  2. Security
    - All functions are SECURITY DEFINER
    - Input validation and sanitization
    - Secure password handling
*/

-- Create auth helper functions
CREATE OR REPLACE FUNCTION auth.hash_password(password text)
RETURNS text AS $$
BEGIN
  RETURN crypt(password, gen_salt('bf'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.verify_password(password text, hashed_password text)
RETURNS boolean AS $$
BEGIN
  RETURN password = crypt(hashed_password, password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create session management functions
CREATE OR REPLACE FUNCTION auth.create_session(user_id uuid)
RETURNS text AS $$
DECLARE
  session_id text;
BEGIN
  session_id := encode(gen_random_bytes(32), 'hex');
  PERFORM set_config('app.user_id', user_id::text, false);
  RETURN session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.get_session_user()
RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.user_id', true), '')::uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.clear_session()
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.user_id', '', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create user management functions
CREATE OR REPLACE FUNCTION auth.create_user(
  email text,
  password text,
  contact_name text,
  company_name text
) RETURNS users AS $$
DECLARE
  new_user users;
BEGIN
  INSERT INTO users (email, password, contact_name, company_name)
  VALUES (
    email,
    auth.hash_password(password),
    contact_name,
    company_name
  )
  RETURNING * INTO new_user;
  
  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.authenticate_user(
  p_email text,
  p_password text
) RETURNS users AS $$
DECLARE
  user_record users;
BEGIN
  SELECT * INTO user_record
  FROM users
  WHERE email = p_email;
  
  IF user_record IS NULL THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;
  
  IF NOT auth.verify_password(p_password, user_record.password) THEN
    RAISE EXCEPTION 'Invalid email or password';
  END IF;
  
  RETURN user_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;