/*
  # Database Cleanup - Remove All Data
  
  This migration safely removes all data from the database while preserving:
  - Table structures and schemas
  - Indexes and constraints  
  - RLS policies
  - Functions and triggers
  - Materialized view definitions
  
  Tables cleaned in dependency order to respect foreign key constraints.
*/

-- Clean up data in dependency order (foreign key constraints)

-- 1. Clean interests table (references solutions and users)
DELETE FROM interests;

-- 2. Clean solutions table (references users and profiles)  
DELETE FROM solutions;

-- 3. Clean rate_limits table (references users)
DELETE FROM rate_limits;

-- 4. Clean audit_log table (references users)
DELETE FROM audit_log;

-- 5. Clean users table (primary table referenced by others)
DELETE FROM users;

-- 6. Clean profiles table (referenced by solutions)
DELETE FROM profiles;

-- 7. Clean maintenance_log table (standalone) - except we'll add our cleanup log
DELETE FROM maintenance_log;

-- Refresh materialized views to reflect empty state
REFRESH MATERIALIZED VIEW daily_interest_stats;
REFRESH MATERIALIZED VIEW solution_popularity; 
REFRESH MATERIALIZED VIEW user_activity_summary;

-- Log the cleanup operation
INSERT INTO maintenance_log (operation, details) 
VALUES (
  'database_cleanup', 
  jsonb_build_object(
    'timestamp', now(),
    'operation', 'full_data_cleanup',
    'tables_cleaned', ARRAY['users', 'solutions', 'interests', 'profiles', 'audit_log', 'rate_limits', 'maintenance_log'],
    'materialized_views_refreshed', ARRAY['daily_interest_stats', 'solution_popularity', 'user_activity_summary'],
    'note', 'All user data removed while preserving database structure'
  )
);