/*
  # Fix Solutions Insert Policy

  1. Security Changes
    - Drop existing insert policy for solutions table
    - Create new simplified insert policy that allows authenticated users to insert solutions
    - Ensure the policy correctly validates user ownership

  The issue is that the current policy has a complex EXISTS condition that may not be working correctly.
  We'll simplify it to ensure authenticated users can insert their own solutions.
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own solutions" ON solutions;

-- Create a new, simplified insert policy
CREATE POLICY "Users can insert their own solutions"
  ON solutions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );