-- Cushn production database verification
-- Run this in the Supabase SQL Editor after applying schema migrations.
-- This script is read-only: it reports missing pieces instead of mutating data.

-- 1) Required tables
WITH expected(table_name) AS (
  VALUES
    ('categories'),
    ('subscriptions'),
    ('budgets'),
    ('user_settings'),
    ('notification_preferences'),
    ('notification_events')
)
SELECT
  'tables' AS check_type,
  e.table_name AS object_name,
  CASE WHEN c.table_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN information_schema.tables c
  ON c.table_schema = 'public'
 AND c.table_name = e.table_name
ORDER BY e.table_name;

-- 2) Required columns
WITH expected(table_name, column_name) AS (
  VALUES
    ('categories', 'id'),
    ('categories', 'user_id'),
    ('categories', 'name'),
    ('categories', 'color'),
    ('categories', 'icon'),
    ('categories', 'is_default'),
    ('categories', 'created_at'),
    ('subscriptions', 'id'),
    ('subscriptions', 'user_id'),
    ('subscriptions', 'name'),
    ('subscriptions', 'amount'),
    ('subscriptions', 'currency'),
    ('subscriptions', 'cycle'),
    ('subscriptions', 'category_id'),
    ('subscriptions', 'start_date'),
    ('subscriptions', 'renewal_date'),
    ('subscriptions', 'status'),
    ('subscriptions', 'notes'),
    ('subscriptions', 'icon'),
    ('subscriptions', 'raw_input'),
    ('subscriptions', 'vendor_domain'),
    ('subscriptions', 'vendor_confidence'),
    ('subscriptions', 'vendor_match_type'),
    ('subscriptions', 'created_at'),
    ('budgets', 'id'),
    ('budgets', 'user_id'),
    ('budgets', 'monthly_goal'),
    ('budgets', 'currency'),
    ('budgets', 'category_limits'),
    ('budgets', 'updated_at'),
    ('user_settings', 'user_id'),
    ('user_settings', 'currency'),
    ('user_settings', 'theme_preference'),
    ('user_settings', 'bill_type_by_category'),
    ('user_settings', 'updated_at'),
    ('notification_preferences', 'user_id'),
    ('notification_preferences', 'in_app_enabled'),
    ('notification_preferences', 'email_enabled'),
    ('notification_preferences', 'days_before'),
    ('notification_preferences', 'timezone'),
    ('notification_preferences', 'updated_at'),
    ('notification_events', 'id'),
    ('notification_events', 'user_id'),
    ('notification_events', 'subscription_id'),
    ('notification_events', 'renewal_date'),
    ('notification_events', 'reminder_date'),
    ('notification_events', 'channel'),
    ('notification_events', 'status'),
    ('notification_events', 'error_text'),
    ('notification_events', 'sent_at'),
    ('notification_events', 'created_at')
)
SELECT
  'columns' AS check_type,
  e.table_name || '.' || e.column_name AS object_name,
  CASE WHEN c.column_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN information_schema.columns c
  ON c.table_schema = 'public'
 AND c.table_name = e.table_name
 AND c.column_name = e.column_name
ORDER BY e.table_name, e.column_name;

-- 3) RLS enabled on all app tables
WITH expected(table_name) AS (
  VALUES
    ('categories'),
    ('subscriptions'),
    ('budgets'),
    ('user_settings'),
    ('notification_preferences'),
    ('notification_events')
)
SELECT
  'rls' AS check_type,
  e.table_name AS object_name,
  CASE WHEN c.relrowsecurity THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN pg_class c
  ON c.relname = e.table_name
LEFT JOIN pg_namespace n
  ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
   OR n.nspname IS NULL
ORDER BY e.table_name;

-- 4) Expected RLS policies
WITH expected(table_name, policy_name) AS (
  VALUES
    ('subscriptions', 'Users own their subscriptions'),
    ('categories', 'Users own their categories'),
    ('budgets', 'Users own their budgets'),
    ('user_settings', 'Users own their settings'),
    ('notification_preferences', 'Users own their notification preferences'),
    ('notification_events', 'Users own their notification events')
)
SELECT
  'policies' AS check_type,
  e.table_name || ' :: ' || e.policy_name AS object_name,
  CASE WHEN p.policyname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN pg_policies p
  ON p.schemaname = 'public'
 AND p.tablename = e.table_name
 AND p.policyname = e.policy_name
ORDER BY e.table_name, e.policy_name;

-- 5) Expected indexes
WITH expected(index_name) AS (
  VALUES
    ('idx_subscriptions_user_id'),
    ('idx_subscriptions_user_id_renewal_date'),
    ('idx_categories_user_id'),
    ('idx_notification_events_unique'),
    ('idx_notification_events_user_date'),
    ('idx_notification_events_status_date')
)
SELECT
  'indexes' AS check_type,
  e.index_name AS object_name,
  CASE WHEN i.indexname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN pg_indexes i
  ON i.schemaname = 'public'
 AND i.indexname = e.index_name
ORDER BY e.index_name;

-- 6) Required check constraints
WITH expected(constraint_name) AS (
  VALUES
    ('subscriptions_cycle_check'),
    ('subscriptions_status_check')
)
SELECT
  'constraints' AS check_type,
  e.constraint_name AS object_name,
  CASE WHEN c.conname IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN pg_constraint c
  ON c.conname = e.constraint_name
ORDER BY e.constraint_name;

-- 7) Realtime publication membership
WITH expected(table_name) AS (
  VALUES
    ('subscriptions'),
    ('categories'),
    ('budgets'),
    ('user_settings'),
    ('notification_events')
)
SELECT
  'realtime' AS check_type,
  e.table_name AS object_name,
  CASE WHEN pr.prrelid IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN pg_class c
  ON c.relname = e.table_name
LEFT JOIN pg_namespace n
  ON n.oid = c.relnamespace
LEFT JOIN pg_publication_rel pr
  ON pr.prrelid = c.oid
LEFT JOIN pg_publication p
  ON p.oid = pr.prpubid
 AND p.pubname = 'supabase_realtime'
WHERE n.nspname = 'public'
   OR n.nspname IS NULL
ORDER BY e.table_name;

-- 8) Reminder queue function and grant
WITH fn AS (
  SELECT
    p.oid,
    pg_get_functiondef(p.oid) AS definition
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
    AND p.proname = 'queue_renewal_reminders'
)
SELECT
  'function' AS check_type,
  'queue_renewal_reminders exists' AS object_name,
  CASE WHEN EXISTS (SELECT 1 FROM fn) THEN 'PASS' ELSE 'FAIL' END AS status
UNION ALL
SELECT
  'function' AS check_type,
  'queue_renewal_reminders queues email events' AS object_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM fn
      WHERE definition ILIKE '%''email''%'
        AND definition ILIKE '%email_enabled%'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS status
UNION ALL
SELECT
  'function' AS check_type,
  'service_role can execute queue_renewal_reminders' AS object_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM information_schema.role_routine_grants
      WHERE routine_schema = 'public'
        AND routine_name = 'queue_renewal_reminders'
        AND grantee = 'service_role'
        AND privilege_type = 'EXECUTE'
    ) THEN 'PASS'
    ELSE 'FAIL'
  END AS status;

-- 9) Optional pg_cron extension presence
SELECT
  'cron' AS check_type,
  'pg_cron installed' AS object_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN 'PASS' ELSE 'WARN' END AS status;

-- If pg_cron is installed, run this separately to inspect the actual schedule:
-- select jobid, jobname, schedule, active
-- from cron.job
-- where jobname = 'daily-renewal-reminders';

-- 10) Compact summary of any failures
WITH checks AS (
  WITH expected_tables(table_name) AS (
    VALUES ('categories'), ('subscriptions'), ('budgets'), ('notification_preferences'), ('notification_events')
  )
  SELECT
    'missing_table' AS failure_type,
    e.table_name AS object_name
  FROM expected_tables e
  LEFT JOIN information_schema.tables t
    ON t.table_schema = 'public'
   AND t.table_name = e.table_name
  WHERE t.table_name IS NULL

  UNION ALL

  SELECT
    'missing_policy' AS failure_type,
    x.table_name || ' :: ' || x.policy_name AS object_name
  FROM (
    VALUES
      ('subscriptions', 'Users own their subscriptions'),
      ('categories', 'Users own their categories'),
      ('budgets', 'Users own their budgets'),
      ('notification_preferences', 'Users own their notification preferences'),
      ('notification_events', 'Users own their notification events')
  ) AS x(table_name, policy_name)
  LEFT JOIN pg_policies p
    ON p.schemaname = 'public'
   AND p.tablename = x.table_name
   AND p.policyname = x.policy_name
  WHERE p.policyname IS NULL

  UNION ALL

  SELECT
    'missing_realtime' AS failure_type,
    x.table_name AS object_name
  FROM (VALUES ('subscriptions'), ('categories'), ('budgets'), ('notification_events')) AS x(table_name)
  LEFT JOIN pg_class c
    ON c.relname = x.table_name
  LEFT JOIN pg_namespace n
    ON n.oid = c.relnamespace
  LEFT JOIN pg_publication_rel pr
    ON pr.prrelid = c.oid
  LEFT JOIN pg_publication p
    ON p.oid = pr.prpubid
   AND p.pubname = 'supabase_realtime'
  WHERE (n.nspname = 'public' OR n.nspname IS NULL)
    AND p.pubname IS NULL

  UNION ALL

  SELECT
    'queue_function_missing_email_logic' AS failure_type,
    'queue_renewal_reminders' AS object_name
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'queue_renewal_reminders'
      AND pg_get_functiondef(p.oid) ILIKE '%''email''%'
      AND pg_get_functiondef(p.oid) ILIKE '%email_enabled%'
  )
)
SELECT
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS overall_status,
  COUNT(*) AS issue_count
FROM checks;
