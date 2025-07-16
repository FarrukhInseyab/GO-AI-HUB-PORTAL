/*
  # Add User Research Reports Table

  1. New Tables
    - `user_research_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text)
      - `summary` (text)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on user_research_reports table
    - Add policies for users to manage their own reports
    - Service role bypass for admin operations

  3. Performance
    - Add indexes for user_id, created_at, and category
    - Add trigger for automatic updated_at timestamp
*/

-- Create the user_research_reports table
CREATE TABLE IF NOT EXISTS user_research_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL,
  content text NOT NULL,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_research_reports_user_id ON user_research_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_research_reports_created_at ON user_research_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_user_research_reports_category ON user_research_reports(category);

-- Enable RLS
ALTER TABLE user_research_reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own reports" ON user_research_reports;
DROP POLICY IF EXISTS "Users can read their own reports" ON user_research_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON user_research_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON user_research_reports;
DROP POLICY IF EXISTS "Service role bypass user_research_reports" ON user_research_reports;

-- Create RLS policies
CREATE POLICY "Users can insert their own reports" ON user_research_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their own reports" ON user_research_reports
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own reports" ON user_research_reports
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own reports" ON user_research_reports
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    user_id IN (
      SELECT id FROM users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role bypass user_research_reports" ON user_research_reports
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create or replace the trigger function for updated_at
CREATE OR REPLACE FUNCTION update_user_research_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS set_user_research_reports_updated_at ON user_research_reports;

-- Create the trigger
CREATE TRIGGER set_user_research_reports_updated_at
  BEFORE UPDATE ON user_research_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_user_research_reports_updated_at();

-- Grant permissions on the table
GRANT SELECT, INSERT, UPDATE, DELETE ON user_research_reports TO authenticated;
GRANT ALL ON user_research_reports TO service_role;

-- Log the migration
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'add_user_research_reports', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'add_user_research_reports_table',
    'changes', ARRAY[
      'Created user_research_reports table with proper schema',
      'Added indexes for user_id, created_at, and category',
      'Set up RLS policies for data protection',
      'Created trigger function for automatic updated_at timestamp',
      'Granted appropriate permissions to roles'
    ],
    'table_schema', jsonb_build_object(
      'columns', ARRAY[
        'id (uuid, primary key)',
        'user_id (uuid, foreign key to users)',
        'title (text, not null)',
        'summary (text, not null)', 
        'content (text, not null)',
        'category (text, nullable)',
        'created_at (timestamptz, default now())',
        'updated_at (timestamptz, default now())'
      ],
      'indexes', ARRAY[
        'idx_user_research_reports_user_id',
        'idx_user_research_reports_created_at',
        'idx_user_research_reports_category'
      ],
      'policies', ARRAY[
        'Users can insert their own reports',
        'Users can read their own reports',
        'Users can update their own reports',
        'Users can delete their own reports',
        'Service role bypass user_research_reports'
      ]
    ),
    'note', 'This table stores research reports generated by GOAI agent for users with proper RLS and performance optimization'
  )
);