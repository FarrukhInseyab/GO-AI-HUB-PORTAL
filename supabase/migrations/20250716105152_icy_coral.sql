/*
  # Add Email Confirmation to Users Table
  
  1. Changes
    - Add email_confirmed boolean column (default false)
    - Add email_confirmation_token text column
    - Add confirmation_sent_at timestamptz column
    - Create index for faster token lookups
    
  2. Security
    - Tracks email confirmation status
    - Stores confirmation tokens for verification
*/

-- Add email confirmation columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS email_confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS email_confirmation_token text,
ADD COLUMN IF NOT EXISTS confirmation_sent_at timestamptz;

-- Create index for faster token lookups
CREATE INDEX IF NOT EXISTS idx_users_email_confirmation_token ON users(email_confirmation_token);

-- Add maintenance log entry
INSERT INTO maintenance_log (operation, details)
VALUES (
  'add_email_confirmation',
  jsonb_build_object(
    'timestamp', NOW(),
    'description', 'Added email confirmation tracking to users table',
    'changes', jsonb_build_array(
      'Added email_confirmed boolean column',
      'Added email_confirmation_token column',
      'Added confirmation_sent_at timestamp',
      'Created index on email_confirmation_token'
    ),
    'security_level', 'MEDIUM'
  )
);