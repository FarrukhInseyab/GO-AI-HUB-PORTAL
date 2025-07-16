-- Fix profiles table RLS policies

-- Make sure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role bypass" ON profiles;

-- Allow authenticated users to read their own profile
CREATE POLICY "Allow users to read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to read all profiles (for evaluator lookups)
CREATE POLICY "Authenticated users can read profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role bypass for admin operations
CREATE POLICY "Service role bypass"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Also fix the is_evaluator function to work properly with the new auth system
CREATE OR REPLACE FUNCTION is_evaluator()
RETURNS boolean AS $$
BEGIN
  -- Check if current authenticated user has evaluator role in profiles table
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'evaluator'
  );
EXCEPTION
  WHEN OTHERS THEN
    -- If there's any error, return false (not an evaluator)
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add some test data for evaluators if needed (optional)
-- You can uncomment this if you want to create test evaluator accounts
/*
INSERT INTO profiles (id, name, email, role) 
VALUES 
  (gen_random_uuid(), 'Test Evaluator', 'evaluator@test.com', 'evaluator')
ON CONFLICT (email) DO NOTHING;
*/

-- Log the completion
DO $$
BEGIN
  RAISE NOTICE 'Profiles RLS policies have been properly configured';
  RAISE NOTICE 'Users can now read their own profiles and all profiles for evaluator checks';
END $$;