/*
  # Add country field to users table

  1. Changes
    - Add `country` column to `users` table
    - Make it nullable to support existing users
    - Add index for potential filtering by country

  2. Security
    - No changes to RLS policies needed
*/

-- Add country column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'country'
  ) THEN
    ALTER TABLE users ADD COLUMN country text;
  END IF;
END $$;

-- Add index for country filtering (optional but useful for analytics)
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);