-- SubTrackr Final Setup (single-run, idempotent)
-- Run this in Supabase SQL Editor on a new project.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Core tables
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  cycle TEXT NOT NULL DEFAULT 'monthly',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  start_date DATE,
  renewal_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  notes TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  raw_input TEXT NOT NULL DEFAULT '',
  vendor_domain TEXT,
  vendor_confidence NUMERIC(4,2),
  vendor_match_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  monthly_goal NUMERIC(10,2) NOT NULL DEFAULT 200,
  currency TEXT NOT NULL DEFAULT 'USD',
  category_limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  currency TEXT NOT NULL DEFAULT 'USD',
  theme_preference TEXT NOT NULL DEFAULT 'system',
  bill_type_by_category JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Reminder tables
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  days_before INTEGER[] NOT NULL DEFAULT ARRAY[1, 3],
  timezone TEXT NOT NULL DEFAULT 'UTC',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  renewal_date DATE NOT NULL,
  reminder_date DATE NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'email')),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sent', 'failed')),
  error_text TEXT NOT NULL DEFAULT '',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Data integrity hardening
UPDATE public.subscriptions
SET cycle = 'monthly'
WHERE cycle IS NULL
   OR cycle NOT IN ('monthly', 'annual', 'weekly', 'quarterly', 'biweekly');

UPDATE public.subscriptions
SET status = 'active'
WHERE status IS NULL
   OR status NOT IN ('active', 'paused');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_cycle_check'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_cycle_check
      CHECK (cycle IN ('monthly', 'annual', 'weekly', 'quarterly', 'biweekly'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_status_check'
  ) THEN
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_status_check
      CHECK (status IN ('active', 'paused'));
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
  ON public.subscriptions (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id_renewal_date
  ON public.subscriptions (user_id, renewal_date);

CREATE INDEX IF NOT EXISTS idx_categories_user_id
  ON public.categories (user_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_events_unique
  ON public.notification_events (user_id, subscription_id, renewal_date, reminder_date, channel);

CREATE INDEX IF NOT EXISTS idx_notification_events_user_date
  ON public.notification_events (user_id, reminder_date DESC);

CREATE INDEX IF NOT EXISTS idx_notification_events_status_date
  ON public.notification_events (status, reminder_date);

-- RLS enable
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'Users own their subscriptions'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categories' AND policyname = 'Users own their categories'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their categories" ON public.categories FOR ALL USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'budgets' AND policyname = 'Users own their budgets'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users own their notification preferences'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_settings' AND policyname = 'Users own their settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_events' AND policyname = 'Users own their notification events'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their notification events" ON public.notification_events FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

-- Reminder queue function
CREATE OR REPLACE FUNCTION public.queue_renewal_reminders(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  queued_count INTEGER := 0;
BEGIN
  INSERT INTO public.notification_events (
    user_id, subscription_id, renewal_date, reminder_date, channel, status
  )
  SELECT
    s.user_id,
    s.id,
    s.renewal_date,
    target_date,
    'in_app',
    'queued'
  FROM public.subscriptions s
  LEFT JOIN public.notification_preferences p
    ON p.user_id = s.user_id
  JOIN LATERAL unnest(COALESCE(p.days_before, ARRAY[1, 3])) AS d(days_before)
    ON TRUE
  WHERE s.status = 'active'
    AND s.renewal_date IS NOT NULL
    AND COALESCE(p.in_app_enabled, true) = true
    AND (s.renewal_date - d.days_before) = target_date
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS queued_count = ROW_COUNT;
  RETURN queued_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.queue_renewal_reminders(DATE) TO service_role;

-- Realtime publication membership
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'user_settings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'subscriptions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'categories'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'budgets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime' AND n.nspname = 'public' AND c.relname = 'notification_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_events;
  END IF;
END $$;

COMMIT;
