/*
  # Create rate limiting functions

  1. New Functions
    - `increment_rate_limit` - Increments or creates rate limit counter for user/action
    - `check_rate_limit` - Checks current rate limit status for user/action
    - `reset_rate_limits` - Resets rate limits (for maintenance)

  2. Security
    - Functions are accessible to authenticated users
    - Service role has full access
*/

-- Function to increment rate limit counter
CREATE OR REPLACE FUNCTION increment_rate_limit(
  action_param text,
  user_id_param uuid
) RETURNS void AS $$
DECLARE
  current_month_start timestamptz;
BEGIN
  -- Calculate start of current month
  current_month_start := date_trunc('month', now());
  
  -- Insert or update rate limit record
  INSERT INTO rate_limits (user_id, action, count, window_start)
  VALUES (user_id_param, action_param, 1, current_month_start)
  ON CONFLICT (user_id, action, window_start)
  DO UPDATE SET 
    count = rate_limits.count + 1,
    created_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check current rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  action_param text,
  user_id_param uuid
) RETURNS TABLE(current_count integer, limit_reached boolean) AS $$
DECLARE
  current_month_start timestamptz;
  count_result integer;
  rate_limit integer := 50; -- Default limit
BEGIN
  -- Calculate start of current month
  current_month_start := date_trunc('month', now());
  
  -- Get current count for this month
  SELECT COALESCE(count, 0) INTO count_result
  FROM rate_limits
  WHERE user_id = user_id_param 
    AND action = action_param 
    AND window_start = current_month_start;
  
  -- Return current count and whether limit is reached
  RETURN QUERY SELECT 
    COALESCE(count_result, 0) as current_count,
    COALESCE(count_result, 0) >= rate_limit as limit_reached;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset rate limits (for maintenance)
CREATE OR REPLACE FUNCTION reset_rate_limits(
  action_param text DEFAULT NULL,
  user_id_param uuid DEFAULT NULL
) RETURNS void AS $$
BEGIN
  IF action_param IS NOT NULL AND user_id_param IS NOT NULL THEN
    -- Reset specific user/action combination
    DELETE FROM rate_limits 
    WHERE user_id = user_id_param AND action = action_param;
  ELSIF action_param IS NOT NULL THEN
    -- Reset all users for specific action
    DELETE FROM rate_limits WHERE action = action_param;
  ELSIF user_id_param IS NOT NULL THEN
    -- Reset all actions for specific user
    DELETE FROM rate_limits WHERE user_id = user_id_param;
  ELSE
    -- Reset all rate limits (use with caution)
    DELETE FROM rate_limits;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint to prevent duplicate rate limit records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'rate_limits_user_action_window_unique'
  ) THEN
    ALTER TABLE rate_limits 
    ADD CONSTRAINT rate_limits_user_action_window_unique 
    UNIQUE (user_id, action, window_start);
  END IF;
END $$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_rate_limit(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_rate_limit(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION reset_rate_limits(text, uuid) TO service_role;