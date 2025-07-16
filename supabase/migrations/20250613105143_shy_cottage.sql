/*
  # Fix Market Insights Update System

  1. Changes
    - Update the get_market_insights_update_status function to handle date formatting properly
    - Add better error handling for date calculations
    - Ensure proper timezone handling for dates
    - Fix the update_market_insights function to return proper date values

  2. Security
    - Maintain existing RLS policies
    - Ensure proper permissions for functions
*/

-- Drop existing functions to recreate them with fixes
DROP FUNCTION IF EXISTS get_market_insights_update_status();
DROP FUNCTION IF EXISTS update_market_insights(text);
DROP FUNCTION IF EXISTS check_update_needed();

-- Function to get the latest market insights update status with better date handling
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
  days_until integer;
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
  
  -- Calculate days until next update with proper error handling
  BEGIN
    days_until := EXTRACT(DAY FROM (latest_update.next_update_date - CURRENT_TIMESTAMP))::integer;
    IF days_until < 0 THEN
      days_until := 0;
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      days_until := 7; -- Default to 7 days if calculation fails
  END;
  
  RETURN QUERY
  SELECT 
    latest_update.update_date,
    latest_update.next_update_date,
    latest_update.frequency,
    days_until,
    CURRENT_TIMESTAMP >= latest_update.next_update_date
  ;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update market insights with better date handling
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
  
  -- Check if user is authorized (evaluator or admin)
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = auth.uid() AND (role = 'Evaluator' OR role = 'Admin')
  ) AND NOT (SELECT current_setting('role') = 'service_role') THEN
    RETURN QUERY
    SELECT 
      false,
      'Unauthorized: Only evaluators can update market insights',
      NULL::timestamptz,
      NULL::timestamptz;
    RETURN;
  END IF;
  
  -- Calculate next update date based on frequency with proper timezone handling
  IF frequency_param = 'Weekly' THEN
    next_date := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '7 days';
  ELSIF frequency_param = 'Monthly' THEN
    next_date := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '1 month';
  ELSIF frequency_param = 'Daily' THEN
    next_date := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '1 day';
  ELSE
    next_date := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC') + INTERVAL '7 days';
  END IF;
  
  -- Insert new update record
  INSERT INTO market_insights_updates (
    update_date,
    next_update_date,
    frequency,
    updated_by
  ) VALUES (
    CURRENT_TIMESTAMP AT TIME ZONE 'UTC',
    next_date,
    frequency_param,
    user_id_val
  )
  RETURNING * INTO update_record;
  
  -- Return success with properly formatted dates
  RETURN QUERY
  SELECT 
    true,
    'Market insights updated successfully',
    update_record.update_date,
    update_record.next_update_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if an update is needed with better error handling
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
EXCEPTION
  WHEN OTHERS THEN
    -- If any error occurs, assume an update is needed
    RAISE NOTICE 'Error in check_update_needed: %', SQLERRM;
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_market_insights_update_status() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION update_market_insights(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_update_needed() TO authenticated, anon;

-- Ensure initial data exists with proper dates
DO $$
DECLARE
  record_count integer;
BEGIN
  SELECT COUNT(*) INTO record_count FROM market_insights_updates;
  
  IF record_count = 0 THEN
    INSERT INTO market_insights_updates (
      update_date,
      next_update_date,
      frequency
    ) VALUES (
      '2025-05-15 00:00:00+00'::timestamptz,
      '2025-05-22 00:00:00+00'::timestamptz,
      'Weekly'
    );
    RAISE NOTICE 'Inserted initial market insights update record';
  ELSE
    RAISE NOTICE 'Market insights update records already exist, skipping initial data';
  END IF;
END $$;

-- Log the migration
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'fix_market_insights_update_system', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'fix_date_handling_in_market_insights',
    'changes', ARRAY[
      'Fixed date handling in get_market_insights_update_status function',
      'Improved error handling for date calculations',
      'Added proper timezone handling for dates',
      'Fixed update_market_insights function to return proper date values',
      'Added better authorization checks for evaluators and admins',
      'Ensured initial data exists with proper dates'
    ],
    'note', 'This fixes issues with date formatting and handling in the market insights update system'
  )
);