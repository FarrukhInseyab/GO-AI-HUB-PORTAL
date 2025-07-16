/*
  # Materialized Views for Analytics

  1. Views Created
    - `daily_interest_stats` - Daily statistics for interests
    - `solution_popularity` - Solution popularity metrics
    - `user_activity_summary` - User activity overview

  2. Functions
    - Refresh functions for materialized views
*/

-- Daily interest statistics materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_interest_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interests,
  COUNT(DISTINCT solution_id) as unique_solutions,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(*) FILTER (WHERE status = 'New Interest') as new_interests,
  COUNT(*) FILTER (WHERE status = 'Lead Initiated') as initiated_leads
FROM interests
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Solution popularity materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS solution_popularity AS
SELECT 
  s.id,
  s.solution_name,
  s.company_name,
  s.status,
  COUNT(i.id) as interest_count,
  COUNT(DISTINCT i.user_id) as unique_interested_users,
  MAX(i.created_at) as last_interest_date,
  s.created_at as solution_created_at
FROM solutions s
LEFT JOIN interests i ON s.id = i.solution_id
GROUP BY s.id, s.solution_name, s.company_name, s.status, s.created_at
ORDER BY interest_count DESC, s.created_at DESC;

-- User activity summary materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activity_summary AS
SELECT 
  u.id,
  u.contact_name,
  u.company_name,
  u.created_at as user_since,
  COUNT(DISTINCT s.id) as solutions_submitted,
  COUNT(DISTINCT i.id) as interests_shown,
  COUNT(DISTINCT i.solution_id) as unique_solutions_interested,
  GREATEST(MAX(s.updated_at), MAX(i.created_at)) as last_activity_date
FROM users u
LEFT JOIN solutions s ON u.id = s.user_id
LEFT JOIN interests i ON u.id = i.user_id
GROUP BY u.id, u.contact_name, u.company_name, u.created_at
ORDER BY last_activity_date DESC NULLS LAST;

-- Function to refresh daily stats
CREATE OR REPLACE FUNCTION refresh_daily_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_interest_stats;
  REFRESH MATERIALIZED VIEW solution_popularity;
  REFRESH MATERIALIZED VIEW user_activity_summary;
END;
$$ LANGUAGE plpgsql;

-- Create indexes on materialized views
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_interest_stats (date DESC);
CREATE INDEX IF NOT EXISTS idx_solution_popularity_count ON solution_popularity (interest_count DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_last_activity ON user_activity_summary (last_activity_date DESC NULLS LAST);