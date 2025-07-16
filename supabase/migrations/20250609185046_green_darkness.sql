-- Fix RLS policies to properly handle auth integration

-- Update solutions table policies
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;
DROP POLICY IF EXISTS "Users can update solutions" ON solutions;

CREATE POLICY "Users can insert their own solutions" ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = solutions.user_id)
  );

CREATE POLICY "Users can update solutions" ON solutions
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      is_evaluator() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = solutions.user_id)
    )
  );

-- Update interests table policies
DROP POLICY IF EXISTS "Users can insert interests" ON interests;
DROP POLICY IF EXISTS "Users can read interests" ON interests;
DROP POLICY IF EXISTS "Users can update interests" ON interests;

CREATE POLICY "Users can insert interests" ON interests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id)
  );

CREATE POLICY "Users can read interests" ON interests
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      is_evaluator() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id) OR
      EXISTS (
        SELECT 1 FROM solutions, users 
        WHERE solutions.id = interests.solution_id 
        AND users.user_id = auth.uid() 
        AND users.id = solutions.user_id
      )
    )
  );

CREATE POLICY "Users can update interests" ON interests
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND (
      is_evaluator() OR 
      EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = interests.user_id)
    )
  );

-- Update rate_limits table policies
DROP POLICY IF EXISTS "Users can access rate limits" ON rate_limits;

CREATE POLICY "Users can access rate limits" ON rate_limits
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND 
    EXISTS (SELECT 1 FROM users WHERE users.user_id = auth.uid() AND users.id = rate_limits.user_id)
  );

-- Update the trigger function to handle missing metadata gracefully
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (user_id, email, contact_name, company_name, country)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the is_evaluator function to handle auth properly
CREATE OR REPLACE FUNCTION is_evaluator()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    ) AND role = 'evaluator'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;