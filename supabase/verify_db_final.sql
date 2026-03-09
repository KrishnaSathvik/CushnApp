-- Cushn database verification derived from application behavior.
-- Run in the Supabase SQL editor after applying your schema.
-- This script is read-only.

-- 1) Required tables used by the app and edge functions
WITH expected(table_name) AS (
  VALUES
    ('categories'),
    ('subscriptions'),
    ('budgets'),
    ('user_settings'),
    ('guest_sessions'),
    ('notification_preferences'),
    ('notification_events'),
    ('welcome_email_dispatches')
)
SELECT
  'tables' AS check_type,
  e.table_name AS object_name,
  CASE WHEN t.table_name IS NOT NULL THEN 'PASS' ELSE 'FAIL' END AS status
FROM expected e
LEFT JOIN information_schema.tables t
  ON t.table_schema = 'public'
 AND t.table_name = e.table_name
ORDER BY e.table_name;

-- 2) Required columns referenced directly by frontend/backend code
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
    ('guest_sessions', 'id'),
    ('guest_sessions', 'display_name'),
    ('guest_sessions', 'source'),
    ('guest_sessions', 'metadata'),
    ('guest_sessions', 'converted_to_user_id'),
    ('guest_sessions', 'converted_at'),
    ('guest_sessions', 'last_seen_at'),
    ('guest_sessions', 'created_at'),
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
    ('notification_events', 'created_at'),
    ('welcome_email_dispatches', 'user_id'),
    ('welcome_email_dispatches', 'status'),
    ('welcome_email_dispatches', 'lock_token'),
    ('welcome_email_dispatches', 'attempt_count'),
    ('welcome_email_dispatches', 'last_error'),
    ('welcome_email_dispatches', 'locked_at'),
    ('welcome_email_dispatches', 'sent_at'),
    ('welcome_email_dispatches', 'created_at'),
    ('welcome_email_dispatches', 'updated_at')
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

-- 3) Primary key / uniqueness contract the app depends on
WITH checks AS (
  SELECT
    'keys' AS check_type,
    'budgets.user_id unique' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'budgets'
          AND c.contype IN ('p', 'u')
          AND pg_get_constraintdef(c.oid) ILIKE '%(user_id)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'keys' AS check_type,
    'user_settings.user_id primary/unique' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'user_settings'
          AND c.contype IN ('p', 'u')
          AND pg_get_constraintdef(c.oid) ILIKE '%(user_id)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'keys' AS check_type,
    'notification_preferences.user_id primary/unique' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'notification_preferences'
          AND c.contype IN ('p', 'u')
          AND pg_get_constraintdef(c.oid) ILIKE '%(user_id)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'keys' AS check_type,
    'welcome_email_dispatches.user_id primary/unique' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'welcome_email_dispatches'
          AND c.contype IN ('p', 'u')
          AND pg_get_constraintdef(c.oid) ILIKE '%(user_id)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status
)
SELECT * FROM checks
ORDER BY object_name;

-- 4) Behavioral constraints the app assumes
WITH checks AS (
  SELECT
    'constraints' AS check_type,
    'subscriptions.cycle allows monthly/annual/weekly/quarterly/biweekly' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'subscriptions'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%cycle%'
          AND pg_get_constraintdef(c.oid) ILIKE '%monthly%'
          AND pg_get_constraintdef(c.oid) ILIKE '%annual%'
          AND pg_get_constraintdef(c.oid) ILIKE '%weekly%'
          AND pg_get_constraintdef(c.oid) ILIKE '%quarterly%'
          AND pg_get_constraintdef(c.oid) ILIKE '%biweekly%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'constraints' AS check_type,
    'subscriptions.status allows active/paused' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'subscriptions'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%status%'
          AND pg_get_constraintdef(c.oid) ILIKE '%active%'
          AND pg_get_constraintdef(c.oid) ILIKE '%paused%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'constraints' AS check_type,
    'notification_events.channel allows in_app/email' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'notification_events'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%channel%'
          AND pg_get_constraintdef(c.oid) ILIKE '%in_app%'
          AND pg_get_constraintdef(c.oid) ILIKE '%email%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'constraints' AS check_type,
    'notification_events.status allows queued/sent/failed' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'notification_events'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%status%'
          AND pg_get_constraintdef(c.oid) ILIKE '%queued%'
          AND pg_get_constraintdef(c.oid) ILIKE '%sent%'
          AND pg_get_constraintdef(c.oid) ILIKE '%failed%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'constraints' AS check_type,
    'welcome_email_dispatches.status allows processing/sent/failed' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'welcome_email_dispatches'
          AND c.contype = 'c'
          AND pg_get_constraintdef(c.oid) ILIKE '%status%'
          AND pg_get_constraintdef(c.oid) ILIKE '%processing%'
          AND pg_get_constraintdef(c.oid) ILIKE '%sent%'
          AND pg_get_constraintdef(c.oid) ILIKE '%failed%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status
)
SELECT * FROM checks
ORDER BY object_name;

-- 5) Indexes required for app queries / upserts
WITH checks AS (
  SELECT
    'indexes' AS check_type,
    'notification_events uniqueness for user+subscription+renewal+reminder+channel' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_indexes i
        WHERE i.schemaname = 'public'
          AND i.tablename = 'notification_events'
          AND i.indexdef ILIKE '%UNIQUE INDEX%'
          AND i.indexdef ILIKE '%(user_id, subscription_id, renewal_date, reminder_date, channel)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'indexes' AS check_type,
    'subscriptions index on user_id, renewal_date' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_indexes i
        WHERE i.schemaname = 'public'
          AND i.tablename = 'subscriptions'
          AND i.indexdef ILIKE '%(user_id, renewal_date)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'indexes' AS check_type,
    'categories index on user_id' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_indexes i
        WHERE i.schemaname = 'public'
          AND i.tablename = 'categories'
          AND i.indexdef ILIKE '%(user_id)%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'indexes' AS check_type,
    'notification_events index on user_id, reminder_date' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_indexes i
        WHERE i.schemaname = 'public'
          AND i.tablename = 'notification_events'
          AND i.indexdef ILIKE '%(user_id, reminder_date%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'indexes' AS check_type,
    'notification_events index on status, reminder_date' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_indexes i
        WHERE i.schemaname = 'public'
          AND i.tablename = 'notification_events'
          AND i.indexdef ILIKE '%(status, reminder_date%'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status
)
SELECT * FROM checks
ORDER BY object_name;

-- 6) Row level security enabled on app tables
WITH expected(table_name) AS (
  VALUES
    ('categories'),
    ('subscriptions'),
    ('budgets'),
    ('user_settings'),
    ('guest_sessions'),
    ('notification_preferences'),
    ('notification_events'),
    ('welcome_email_dispatches')
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

-- 7) Policy/grant capabilities required by the app
WITH checks AS (
  SELECT
    'access' AS check_type,
    'authenticated can access categories via policies' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'categories'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'authenticated can access subscriptions via policies' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'subscriptions'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'authenticated can access budgets via policies' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'budgets'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'authenticated can access user_settings via policies' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'user_settings'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'authenticated can access notification_preferences via policies' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'notification_preferences'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'authenticated can access notification_events via policies' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'notification_events'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'anon has guest_sessions SELECT grant' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM information_schema.table_privileges tp
        WHERE tp.table_schema = 'public'
          AND tp.table_name = 'guest_sessions'
          AND tp.grantee = 'anon'
          AND tp.privilege_type = 'SELECT'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'anon has guest_sessions INSERT grant' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM information_schema.table_privileges tp
        WHERE tp.table_schema = 'public'
          AND tp.table_name = 'guest_sessions'
          AND tp.grantee = 'anon'
          AND tp.privilege_type = 'INSERT'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'anon has guest_sessions UPDATE grant' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM information_schema.table_privileges tp
        WHERE tp.table_schema = 'public'
          AND tp.table_name = 'guest_sessions'
          AND tp.grantee = 'anon'
          AND tp.privilege_type = 'UPDATE'
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'guest_sessions has anon policy coverage' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'guest_sessions'
          AND (
            p.roles = '{public}'::name[]
            OR 'anon' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status

  UNION ALL

  SELECT
    'access' AS check_type,
    'guest_sessions has authenticated policy coverage' AS object_name,
    CASE
      WHEN EXISTS (
        SELECT 1
        FROM pg_policies p
        WHERE p.schemaname = 'public'
          AND p.tablename = 'guest_sessions'
          AND (
            p.roles = '{public}'::name[]
            OR 'authenticated' = ANY (p.roles)
          )
      ) THEN 'PASS' ELSE 'FAIL'
    END AS status
)
SELECT * FROM checks
ORDER BY object_name;

-- 8) Realtime publication membership needed by subscriptions, budget, reminders, and settings hooks
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

-- 9) Reminder queue function contract used by the reminder worker
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
  'queue_renewal_reminders uses notification_events' AS object_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM fn
      WHERE definition ILIKE '%notification_events%'
    ) THEN 'PASS' ELSE 'FAIL'
  END AS status
UNION ALL
SELECT
  'function' AS check_type,
  'queue_renewal_reminders queues in_app reminders' AS object_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM fn
      WHERE definition ILIKE '%''in_app''%'
        AND definition ILIKE '%in_app_enabled%'
    ) THEN 'PASS' ELSE 'FAIL'
  END AS status
UNION ALL
SELECT
  'function' AS check_type,
  'queue_renewal_reminders queues email reminders' AS object_name,
  CASE
    WHEN EXISTS (
      SELECT 1
      FROM fn
      WHERE definition ILIKE '%''email''%'
        AND definition ILIKE '%email_enabled%'
    ) THEN 'PASS' ELSE 'FAIL'
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
    ) THEN 'PASS' ELSE 'FAIL'
  END AS status;

-- 10) Optional operational check for scheduled reminder delivery
SELECT
  'cron' AS check_type,
  'pg_cron installed' AS object_name,
  CASE WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN 'PASS' ELSE 'WARN' END AS status;

-- 11) Final compact summary
WITH failures AS (
  WITH expected(table_name) AS (
    VALUES
      ('categories'),
      ('subscriptions'),
      ('budgets'),
      ('user_settings'),
      ('guest_sessions'),
      ('notification_preferences'),
      ('notification_events'),
      ('welcome_email_dispatches')
  )
  SELECT 'missing_table' AS failure_type, e.table_name AS object_name
  FROM expected e
  LEFT JOIN information_schema.tables t
    ON t.table_schema = 'public'
   AND t.table_name = e.table_name
  WHERE t.table_name IS NULL

  UNION ALL

  SELECT 'missing_rls' AS failure_type, e.table_name AS object_name
  FROM expected e
  LEFT JOIN pg_class c ON c.relname = e.table_name
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE (n.nspname = 'public' OR n.nspname IS NULL)
    AND COALESCE(c.relrowsecurity, false) = false

  UNION ALL

  SELECT 'missing_realtime' AS failure_type, e.table_name AS object_name
  FROM (VALUES ('subscriptions'), ('categories'), ('budgets'), ('user_settings'), ('notification_events')) AS e(table_name)
  LEFT JOIN pg_class c ON c.relname = e.table_name
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_publication_rel pr ON pr.prrelid = c.oid
  LEFT JOIN pg_publication p ON p.oid = pr.prpubid AND p.pubname = 'supabase_realtime'
  WHERE (n.nspname = 'public' OR n.nspname IS NULL)
    AND p.pubname IS NULL

  UNION ALL

  SELECT 'queue_function_missing' AS failure_type, 'queue_renewal_reminders' AS object_name
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'queue_renewal_reminders'
  )

  UNION ALL

  SELECT 'queue_function_missing_email_logic' AS failure_type, 'queue_renewal_reminders' AS object_name
  WHERE NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'queue_renewal_reminders'
      AND pg_get_functiondef(p.oid) ILIKE '%''email''%'
      AND pg_get_functiondef(p.oid) ILIKE '%email_enabled%'
  )

  UNION ALL

  SELECT 'queue_function_missing_execute_grant' AS failure_type, 'queue_renewal_reminders :: service_role' AS object_name
  WHERE NOT EXISTS (
    SELECT 1
    FROM information_schema.role_routine_grants
    WHERE routine_schema = 'public'
      AND routine_name = 'queue_renewal_reminders'
      AND grantee = 'service_role'
      AND privilege_type = 'EXECUTE'
  )
)
SELECT
  CASE WHEN COUNT(*) = 0 THEN 'PASS' ELSE 'FAIL' END AS overall_status,
  COUNT(*) AS issue_count
FROM failures;
