/*
  # Update users table to use user_id

  1. Changes
    - Rename primary key column from 'id' to 'user_id'
    - Update RLS policies to use user_id
    - Update foreign key references

  2. Security
    - Maintain RLS policies with updated column name
    - Preserve existing security model
*/

-- Rename id column to user_id
ALTER TABLE public.users 
  RENAME COLUMN id TO user_id;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;

-- Recreate policies with user_id
CREATE POLICY "Users can read own data" 
  ON public.users
  FOR SELECT 
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Users can update own data" 
  ON public.users
  FOR UPDATE
  USING (user_id = current_setting('app.user_id', true)::uuid);

CREATE POLICY "Allow user registration" 
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Update foreign key references in solutions table
ALTER TABLE solutions
  DROP CONSTRAINT IF EXISTS solutions_user_id_fkey,
  ADD CONSTRAINT solutions_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;

-- Update foreign key references in interests table
ALTER TABLE interests
  DROP CONSTRAINT IF EXISTS interests_user_id_fkey,
  ADD CONSTRAINT interests_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES users(user_id) 
    ON DELETE CASCADE;