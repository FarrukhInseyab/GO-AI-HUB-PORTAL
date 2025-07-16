/*
  # Market Insights Update System

  1. New Tables
    - `market_insights_updates`
      - `id` (uuid, primary key)
      - `update_date` (timestamptz, when the data was updated)
      - `next_update_date` (timestamptz, scheduled next update)
      - `frequency` (text, update frequency)
      - `updated_by` (uuid, reference to users)
      - `created_at` (timestamptz)

  2. Functions
    - `get_market_insights_update_status()` - Returns the latest update status
    - `update_market_insights()` - Records a new update
    - `check_update_needed()` - Checks if an update is needed

  3. Security
    - Enable RLS on market_insights_updates table
    - Add policies for users to read update status
    - Only evaluators can create updates
*/

-- Create the market_insights_updates table
CREATE TABLE IF NOT EXISTS market_insights_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_date timestamptz NOT NULL DEFAULT now(),
  next_update_date timestamptz NOT NULL,
  frequency text NOT NULL DEFAULT 'Weekly',
  updated_by uuid REFERENCES users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_insights_updates_date ON market_insights_updates(update_date);
CREATE INDEX IF NOT EXISTS idx_market_insights_updates_next_date ON market_insights_updates(next_update_date);

-- Enable RLS
ALTER TABLE market_insights_updates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can read market insights updates" ON market_insights_updates
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Evaluators can insert market insights updates" ON market_insights_updates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE user_id = auth.uid() AND role = 'Evaluator'
    )
  );

CREATE POLICY "Service role bypass market_insights_updates" ON market_insights_updates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to get the latest market insights update status
CREATE OR REPLACE FUNCTION get_market_insights_update_status()
RETURNS TABLE(
  last_updated timestamptz,
  next_update timestamptz,
  frequency text,
  days_until_next_update integer,
  update_needed boolean
) AS $$
DECLARE
  latest_update market_insights_updates;
BEGIN
  -- Get the latest update
  SELECT * INTO latest_update
  FROM market_insights_updates
  ORDER BY update_date DESC
  LIMIT 1;
  
  -- If no updates exist, create an initial one
  IF latest_update IS NULL THEN
    INSERT INTO market_insights_updates (
      update_date,
      next_update_date,
      frequency
    ) VALUES (
      '2025-05-15 00:00:00+00'::timestamptz,
      '2025-05-22 00:00:00+00'::timestamptz,
      'Weekly'
    )
    RETURNING * INTO latest_update;
  END IF;
  
  RETURN QUERY
  SELECT 
    latest_update.update_date,
    latest_update.next_update_date,
    latest_update.frequency,
    EXTRACT(DAY FROM (latest_update.next_update_date - CURRENT_TIMESTAMP))::integer,
    CURRENT_TIMESTAMP >= latest_update.next_update_date
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update market insights
CREATE OR REPLACE FUNCTION update_market_insights(
  frequency_param text DEFAULT 'Weekly'
)
RETURNS TABLE(
  success boolean,
  message text,
  last_updated timestamptz,
  next_update timestamptz
) AS $$
DECLARE
  user_id_val uuid;
  next_date timestamptz;
  update_record market_insights_updates;
BEGIN
  -- Get current user's ID
  SELECT id INTO user_id_val
  FROM users
  WHERE user_id = auth.uid();
  
  -- Check if user is authorized (evaluator)
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND role = 'Evaluator'
  ) AND NOT (SELECT current_setting('role') = 'service_role') THEN
    RETURN QUERY
    SELECT 
      false,
      'Unauthorized: Only evaluators can update market insights',
      NULL::timestamptz,
      NULL::timestamptz;
    RETURN;
  END IF;
  
  -- Calculate next update date based on frequency
  IF frequency_param = 'Weekly' THEN
    next_date := CURRENT_TIMESTAMP + INTERVAL '7 days';
  ELSIF frequency_param = 'Monthly' THEN
    next_date := CURRENT_TIMESTAMP + INTERVAL '1 month';
  ELSIF frequency_param = 'Daily' THEN
    next_date := CURRENT_TIMESTAMP + INTERVAL '1 day';
  ELSE
    next_date := CURRENT_TIMESTAMP + INTERVAL '7 days';
  END IF;
  
  -- Insert new update record
  INSERT INTO market_insights_updates (
    update_date,
    next_update_date,
    frequency,
    updated_by
  ) VALUES (
    CURRENT_TIMESTAMP,
    next_date,
    frequency_param,
    user_id_val
  )
  RETURNING * INTO update_record;
  
  -- Return success
  RETURN QUERY
  SELECT 
    true,
    'Market insights updated successfully',
    update_record.update_date,
    update_record.next_update_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an update is needed
CREATE OR REPLACE FUNCTION check_update_needed()
RETURNS boolean AS $$
DECLARE
  latest_update market_insights_updates;
BEGIN
  -- Get the latest update
  SELECT * INTO latest_update
  FROM market_insights_updates
  ORDER BY update_date DESC
  LIMIT 1;
  
  -- If no updates exist, an update is needed
  IF latest_update IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if current time is past the next update date
  RETURN CURRENT_TIMESTAMP >= latest_update.next_update_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_market_insights_update_status() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_market_insights(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_update_needed() TO authenticated, anon;

-- Grant table permissions
GRANT SELECT ON market_insights_updates TO authenticated, anon;
GRANT INSERT ON market_insights_updates TO authenticated;
GRANT ALL ON market_insights_updates TO service_role;

-- Insert initial data if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM market_insights_updates) THEN
    INSERT INTO market_insights_updates (
      update_date,
      next_update_date,
      frequency
    ) VALUES (
      '2025-05-15 00:00:00+00'::timestamptz,
      '2025-05-22 00:00:00+00'::timestamptz,
      'Weekly'
    );
  END IF;
END $$;

-- Log the migration
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'add_market_insights_update_system', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'create_market_insights_update_system',
    'changes', ARRAY[
      'Created market_insights_updates table',
      'Added RLS policies for data protection',
      'Created function to get update status',
      'Created function to update market insights',
      'Created function to check if update is needed',
      'Inserted initial data'
    ],
    'note', 'This system tracks when market insights data was last updated and when it should be updated next'
  )
);