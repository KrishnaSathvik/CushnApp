-- Audit hardening migration (2026-03-05)
-- Adds performance indexes and data-validating check constraints.

BEGIN;

-- Normalize legacy values so new CHECK constraints can be applied safely.
UPDATE public.subscriptions
SET cycle = 'monthly'
WHERE cycle IS NULL
   OR cycle NOT IN ('monthly', 'annual', 'weekly', 'quarterly', 'biweekly');

UPDATE public.subscriptions
SET status = 'active'
WHERE status IS NULL
   OR status NOT IN ('active', 'paused');

-- Performance indexes for common filters/sorts.
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_renewal_date
  ON public.subscriptions (user_id, renewal_date);

CREATE INDEX IF NOT EXISTS idx_categories_user_id
  ON public.categories (user_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_cycle_check'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_cycle_check
      CHECK (cycle IN ('monthly', 'annual', 'weekly', 'quarterly', 'biweekly'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_status_check
      CHECK (status IN ('active', 'paused'));
  END IF;
END $$;

COMMIT;
