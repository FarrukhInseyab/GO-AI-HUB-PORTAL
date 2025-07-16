-- Add unique constraint on email and role combination
-- This ensures that each email can only have one record per role

-- First, check if there are any duplicate email+role combinations
DO $$
DECLARE
  duplicate_count integer;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT email, role, COUNT(*) as cnt
    FROM users
    GROUP BY email, role
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE WARNING 'Found % duplicate email+role combinations. These need to be resolved before adding the constraint.', duplicate_count;
    
    -- Log the duplicates for review
    INSERT INTO maintenance_log (operation, details) 
    VALUES (
      'duplicate_email_role_check', 
      jsonb_build_object(
        'timestamp', now(),
        'operation', 'check_duplicates_before_constraint',
        'duplicate_count', duplicate_count,
        'duplicates', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'email', email,
              'role', role,
              'count', cnt
            )
          )
          FROM (
            SELECT email, role, COUNT(*) as cnt
            FROM users
            GROUP BY email, role
            HAVING COUNT(*) > 1
          ) dups
        )
      )
    );
  ELSE
    RAISE NOTICE 'No duplicate email+role combinations found. Safe to add constraint.';
  END IF;
END $$;

-- Add the unique constraint on email and role combination
-- This will fail if there are duplicates, which is what we want
ALTER TABLE users ADD CONSTRAINT users_email_role_unique UNIQUE (email, role);

-- Create index to support the unique constraint and improve query performance
CREATE INDEX IF NOT EXISTS idx_users_email_role ON users(email, role);

-- Update the handle_new_user function to handle potential conflicts
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id uuid;
  existing_user_count integer;
BEGIN
  -- Check if user with this email and role already exists
  SELECT COUNT(*) INTO existing_user_count
  FROM users
  WHERE email = NEW.email AND role = 'User';
  
  IF existing_user_count > 0 THEN
    RAISE NOTICE 'User with email % and role User already exists', NEW.email;
    RETURN NEW;
  END IF;

  -- Insert user profile with proper error handling
  INSERT INTO public.users (
    user_id, 
    email, 
    contact_name, 
    company_name, 
    country,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'contact_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'Company'),
    COALESCE(NEW.raw_user_meta_data->>'country', 'Unknown'),
    'User' -- Set default role to 'User'
  )
  RETURNING id INTO new_user_id;
  
  RAISE NOTICE 'Created new user profile with ID: % for auth user: %', new_user_id, NEW.id;
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Check if it's the email+role constraint or user_id constraint
    IF SQLERRM LIKE '%users_email_role_unique%' THEN
      RAISE NOTICE 'User with email % and role User already exists (constraint violation)', NEW.email;
    ELSE
      RAISE NOTICE 'User already exists for auth user: %', NEW.id;
    END IF;
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth process
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update the signUp function in the application to handle this constraint
-- (This is a note for the application layer)

-- Log the migration
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'add_email_role_unique_constraint', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'add_unique_constraint_email_role',
    'changes', ARRAY[
      'Added unique constraint on email and role combination',
      'Added index for email+role queries',
      'Updated handle_new_user function to handle constraint violations',
      'Added duplicate checking before constraint creation'
    ],
    'constraint_name', 'users_email_role_unique',
    'note', 'Each email can now only have one record per role'
  )
);