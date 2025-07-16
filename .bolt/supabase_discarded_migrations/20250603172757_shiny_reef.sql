/*
  # Update foreign key constraints for interests table
  
  1. Changes:
    - Update foreign key to reference user_id instead of id
*/

-- First drop the existing foreign key constraint if it exists
ALTER TABLE interests 
DROP CONSTRAINT IF EXISTS interests_user_id_fkey;

-- Add the new foreign key constraint pointing to public.users
ALTER TABLE interests
ADD CONSTRAINT interests_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES public.users(user_id)
ON DELETE CASCADE;