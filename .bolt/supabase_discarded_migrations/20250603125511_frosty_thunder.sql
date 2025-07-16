/*
  # Add password field to users table

  1. Changes
    - Add password field to existing users table
    - No need to recreate policies as they already exist
*/

-- Add password field to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password text;

-- Make password field required
ALTER TABLE users 
ALTER COLUMN password SET NOT NULL;