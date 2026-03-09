-- Email reminder queueing support (2026-03-05)
-- Updates queue_renewal_reminders to enqueue email events when enabled.

BEGIN;

CREATE OR REPLACE FUNCTION public.queue_renewal_reminders(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  in_app_count INTEGER := 0;
  email_count INTEGER := 0;
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

  GET DIAGNOSTICS in_app_count = ROW_COUNT;

  INSERT INTO public.notification_events (
    user_id, subscription_id, renewal_date, reminder_date, channel, status
  )
  SELECT
    s.user_id,
    s.id,
    s.renewal_date,
    target_date,
    'email',
    'queued'
  FROM public.subscriptions s
  LEFT JOIN public.notification_preferences p
    ON p.user_id = s.user_id
  JOIN LATERAL unnest(COALESCE(p.days_before, ARRAY[1, 3])) AS d(days_before)
    ON TRUE
  WHERE s.status = 'active'
    AND s.renewal_date IS NOT NULL
    AND COALESCE(p.email_enabled, false) = true
    AND (s.renewal_date - d.days_before) = target_date
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS email_count = ROW_COUNT;
  RETURN in_app_count + email_count;
END;
$$;

COMMIT;
