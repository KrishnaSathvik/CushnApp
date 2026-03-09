-- SubTrackr DB + Realtime Audit
-- Run in Supabase SQL Editor (safe: read-only checks).

WITH checks AS (
  -- 1) Required tables
  SELECT
    'table_exists:categories' AS check_name,
    EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'categories'
    ) AS passed,
    'public.categories table should exist' AS details
  UNION ALL
  SELECT
    'table_exists:subscriptions',
    EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ),
    'public.subscriptions table should exist'
  UNION ALL
  SELECT
    'table_exists:budgets',
    EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'budgets'
    ),
    'public.budgets table should exist'

  -- 2) Column parity (what app code expects)
  UNION ALL
  SELECT
    'columns_match:categories',
    NOT EXISTS (
      SELECT expected_col
      FROM (
        VALUES
          ('id'), ('user_id'), ('name'), ('color'), ('icon'), ('is_default'), ('created_at')
      ) AS expected(expected_col)
      EXCEPT
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'categories'
    ),
    'categories has required columns'
  UNION ALL
  SELECT
    'columns_match:subscriptions',
    NOT EXISTS (
      SELECT expected_col
      FROM (
        VALUES
          ('id'), ('user_id'), ('name'), ('amount'), ('currency'), ('cycle'),
          ('category_id'), ('start_date'), ('renewal_date'), ('status'),
          ('notes'), ('icon'), ('raw_input'), ('created_at')
      ) AS expected(expected_col)
      EXCEPT
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ),
    'subscriptions has required columns'
  UNION ALL
  SELECT
    'columns_match:budgets',
    NOT EXISTS (
      SELECT expected_col
      FROM (
        VALUES
          ('id'), ('user_id'), ('monthly_goal'), ('currency'), ('category_limits'), ('updated_at')
      ) AS expected(expected_col)
      EXCEPT
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'budgets'
    ),
    'budgets has required columns'

  -- 3) Critical constraints
  UNION ALL
  SELECT
    'constraint:budgets_user_unique',
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'budgets'
        AND tc.constraint_type = 'UNIQUE'
        AND kcu.column_name = 'user_id'
    ),
    'budgets.user_id must be UNIQUE (one budget per user)'
  UNION ALL
  SELECT
    'constraint:subscriptions_category_fk',
    EXISTS (
      SELECT 1
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = 'subscriptions'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'category_id'
    ),
    'subscriptions.category_id should have FK'

  -- 4) RLS enabled
  UNION ALL
  SELECT
    'rls_enabled:categories',
    EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'categories' AND c.relrowsecurity = true
    ),
    'RLS must be enabled on categories'
  UNION ALL
  SELECT
    'rls_enabled:subscriptions',
    EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'subscriptions' AND c.relrowsecurity = true
    ),
    'RLS must be enabled on subscriptions'
  UNION ALL
  SELECT
    'rls_enabled:budgets',
    EXISTS (
      SELECT 1 FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname = 'budgets' AND c.relrowsecurity = true
    ),
    'RLS must be enabled on budgets'

  -- 5) Required policies
  UNION ALL
  SELECT
    'policy_exists:subscriptions',
    EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'subscriptions'
        AND policyname = 'Users own their subscriptions'
    ),
    'Policy "Users own their subscriptions" exists'
  UNION ALL
  SELECT
    'policy_exists:categories',
    EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'categories'
        AND policyname = 'Users own their categories'
    ),
    'Policy "Users own their categories" exists'
  UNION ALL
  SELECT
    'policy_exists:budgets',
    EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public'
        AND tablename = 'budgets'
        AND policyname = 'Users own their budgets'
    ),
    'Policy "Users own their budgets" exists'

  -- 6) Realtime publication membership
  UNION ALL
  SELECT
    'realtime_publication:subscriptions',
    EXISTS (
      SELECT 1
      FROM pg_publication_rel pr
      JOIN pg_publication p ON p.oid = pr.prpubid
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = 'subscriptions'
    ),
    'subscriptions in supabase_realtime publication'
  UNION ALL
  SELECT
    'realtime_publication:categories',
    EXISTS (
      SELECT 1
      FROM pg_publication_rel pr
      JOIN pg_publication p ON p.oid = pr.prpubid
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = 'categories'
    ),
    'categories in supabase_realtime publication'
  UNION ALL
  SELECT
    'realtime_publication:budgets',
    EXISTS (
      SELECT 1
      FROM pg_publication_rel pr
      JOIN pg_publication p ON p.oid = pr.prpubid
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = 'budgets'
    ),
    'budgets in supabase_realtime publication'

  -- 7) Indexes (recommended for sync/realtime query performance)
  UNION ALL
  SELECT
    'index_exists:subscriptions_user_id',
    EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'subscriptions'
        AND indexdef ILIKE '%(user_id%'
    ),
    'subscriptions.user_id index exists (recommended)'
  UNION ALL
  SELECT
    'index_exists:categories_user_id',
    EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'categories'
        AND indexdef ILIKE '%(user_id%'
    ),
    'categories.user_id index exists (recommended)'
  UNION ALL
  SELECT
    'index_exists:subscriptions_user_id_renewal_date',
    EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'subscriptions'
        AND indexdef ILIKE '%(user_id, renewal_date%'
    ),
    'subscriptions(user_id, renewal_date) index exists (recommended)'
  UNION ALL
  SELECT
    'index_exists:budgets_user_id',
    EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'budgets'
        AND indexdef ILIKE '%(user_id%'
    ),
    'budgets.user_id index exists (recommended; unique index usually covers this)'

  -- 8) Check constraints for data validity
  UNION ALL
  SELECT
    'constraint:subscriptions_cycle_check',
    EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'subscriptions_cycle_check'
    ),
    'subscriptions.cycle must be constrained to supported values'
  UNION ALL
  SELECT
    'constraint:subscriptions_status_check',
    EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'subscriptions_status_check'
    ),
    'subscriptions.status must be constrained to active/paused'
)
SELECT
  check_name,
  CASE WHEN passed THEN 'PASS' ELSE 'FAIL' END AS status,
  details
FROM checks
ORDER BY
  CASE WHEN passed THEN 1 ELSE 0 END,
  check_name;

-- Summary row:
WITH checks AS (
  SELECT
    EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ('categories', 'subscriptions', 'budgets')
      GROUP BY table_schema
      HAVING COUNT(*) = 3
    ) AS basic_tables_ok
)
SELECT
  CASE
    WHEN basic_tables_ok THEN 'Schema baseline present. Review FAIL rows above for exact fixes.'
    ELSE 'Schema baseline missing required tables. Run supabase/migration.sql first.'
  END AS summary
FROM checks;
