-- Update the handle_new_user trigger function to properly map user metadata
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_user_id uuid;
  existing_user_count integer;
  contact_name_val text;
  company_name_val text;
  country_val text;
BEGIN
  -- Extract metadata with better fallbacks
  contact_name_val := COALESCE(
    NEW.raw_user_meta_data->>'contact_name',
    NEW.raw_user_meta_data->>'contactName',
    NEW.raw_user_meta_data->>'name',
    'User'
  );
  
  company_name_val := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'companyName',
    NEW.raw_user_meta_data->>'company',
    'Company'
  );
  
  country_val := COALESCE(
    NEW.raw_user_meta_data->>'country',
    'Unknown'
  );

  -- Check if user with this email and role already exists
  SELECT COUNT(*) INTO existing_user_count
  FROM users
  WHERE email = NEW.email AND role = 'User';
  
  IF existing_user_count > 0 THEN
    RAISE NOTICE 'User with email % and role User already exists', NEW.email;
    RETURN NEW;
  END IF;

  -- Insert user profile with proper field mapping
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
    contact_name_val,
    company_name_val,
    country_val,
    'User' -- Set default role to 'User'
  )
  RETURNING id INTO new_user_id;
  
  RAISE NOTICE 'Created new user profile with ID: % for auth user: % (contact: %, company: %, country: %)', 
    new_user_id, NEW.id, contact_name_val, company_name_val, country_val;
  
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

-- Log the migration
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'fix_user_metadata_mapping', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'fix_user_field_mapping',
    'changes', ARRAY[
      'Updated handle_new_user function to properly extract contact_name, company_name, and country from user metadata',
      'Added fallback field names for better compatibility',
      'Improved logging to show extracted values',
      'Enhanced error handling for field mapping'
    ],
    'note', 'User signup now properly maps contact name, company name, and country fields'
  )
);