/*
  # Update solutions table policies for dual approval

  1. Changes
    - Update RLS policies to require both technical and business approval
    - Drop existing public access policies
    - Add new combined approval policy
    
  2. Security
    - Solutions only visible to public when both approvals are granted
    - Maintains existing authenticated user access
*/

-- Drop existing public access policy
DROP POLICY IF EXISTS "Public can view approved solutions" ON solutions;
DROP POLICY IF EXISTS "Enable public read access for approved solutions" ON solutions;

-- Create new public access policy requiring both approvals
CREATE POLICY "Public can view fully approved solutions"
ON solutions
FOR SELECT
TO public
USING (
  tech_approval_status = 'approved' 
  AND business_approval_status = 'approved'
);