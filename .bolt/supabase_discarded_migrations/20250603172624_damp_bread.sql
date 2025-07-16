/*
  # Update interests table foreign key

  1. Changes
    - Drop existing foreign key if exists
    - Add new foreign key to users table with cascade delete
*/

-- First drop the existing foreign key constraint if it exists
ALTER TABLE interests 
DROP CONSTRAINT IF EXISTS interests_user_id_fkey;

-- Add the new foreign key constraint pointing to public.users
ALTER TABLE interests
ADD CONSTRAINT interests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(id)
ON DELETE CASCADE;