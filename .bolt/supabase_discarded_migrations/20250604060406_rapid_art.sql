/*
  # Add user_id column to interests table

  1. Changes
    - Add `user_id` column to `interests` table
    - Make it a foreign key referencing auth.users table
    - Add NOT NULL constraint since every interest must be associated with a user
  
  2. Security
    - No RLS changes needed as the table already inherits policies
*/

ALTER TABLE interests 
ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id);

-- Add index for better query performance on foreign key
CREATE INDEX interests_user_id_idx ON interests(user_id);