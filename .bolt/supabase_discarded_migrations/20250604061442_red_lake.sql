-- Add user_id column to solutions table
ALTER TABLE solutions 
ADD COLUMN user_id uuid NOT NULL REFERENCES auth.users(id);

-- Add index for better query performance on foreign key
CREATE INDEX solutions_user_id_idx ON solutions(user_id);