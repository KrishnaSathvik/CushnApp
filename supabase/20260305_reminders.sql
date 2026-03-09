-- Renewal reminders backend (2026-03-05)
-- Creates notification preference/event tables and a queueing RPC.

BEGIN;

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
  error_text TEXT DEFAULT '',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_events_unique
  ON public.notification_events (user_id, subscription_id, renewal_date, reminder_date, channel);

CREATE INDEX IF NOT EXISTS idx_notification_events_user_date
  ON public.notification_events (user_id, reminder_date DESC);

CREATE INDEX IF NOT EXISTS idx_notification_events_status_date
  ON public.notification_events (status, reminder_date);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_preferences' AND policyname = 'Users own their notification preferences'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their notification preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id)';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notification_events' AND policyname = 'Users own their notification events'
  ) THEN
    EXECUTE 'CREATE POLICY "Users own their notification events" ON public.notification_events FOR ALL USING (auth.uid() = user_id)';
  END IF;
END $$;

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

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'notification_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_events;
  END IF;
END $$;

COMMIT;
