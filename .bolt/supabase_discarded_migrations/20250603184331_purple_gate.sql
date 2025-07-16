/*
  # Fix user_id references

  1. Changes
    - Update foreign key constraints in solutions and interests tables to reference correct column name
    - Ensure consistent column naming across tables
*/

-- Update foreign key references in solutions table
ALTER TABLE solutions
  DROP CONSTRAINT IF EXISTS solutions_user_id_fkey,
  ADD CONSTRAINT solutions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;

-- Update foreign key references in interests table
ALTER TABLE interests
  DROP CONSTRAINT IF EXISTS interests_user_id_fkey,
  ADD CONSTRAINT interests_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE;