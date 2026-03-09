## send-renewal-reminders edge function

Queues daily in-app renewal reminder events by calling:

- `public.queue_renewal_reminders(target_date date)`
- Sends queued email reminder events via Resend (if configured)

### Required secrets

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` (optional but required for email sending)
- `EMAIL_FROM` (optional, default: `Cushn <support@cushn.app>`)

### Deploy

```bash
supabase functions deploy send-renewal-reminders
```

### Invoke manually

```bash
curl -X POST \
  https://<project-ref>.functions.supabase.co/send-renewal-reminders \
  -H "Authorization: Bearer <anon-or-service-token>" \
  -H "Content-Type: application/json" \
  -d '{"targetDate":"2026-03-05"}'
```

### Schedule daily run

Use Supabase Dashboard -> Edge Functions -> Schedules and run this function once daily (for example, `06:05 UTC`).
