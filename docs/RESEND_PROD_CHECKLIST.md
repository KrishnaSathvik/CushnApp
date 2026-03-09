# Resend Production Checklist

Use this checklist before enabling production email reminders.

## 1) Resend account and domain

- Create/upgrade your Resend account.
- Add your sending domain in Resend (`Domains`).
- Add required DNS records (SPF, DKIM, verification) at your DNS provider.
- Wait until domain status is `Verified`.

## 2) Sender identity

- Choose a production sender address on `cushn.app` (example: `support@cushn.app`).
- Do not use unverified free-mail senders (for example `@gmail.com`) in production.
- Update Supabase function secret:
  - `EMAIL_FROM=Cushn <support@cushn.app>`

## 3) Supabase function secrets

Set these secrets in Supabase project `Edge Functions -> Secrets`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`

Optional (for parser function, not reminders):

- `ANTHROPIC_API_KEY`

## 4) Deploy latest reminder function

Deploy after secrets are set:

```bash
supabase functions deploy send-renewal-reminders --project-ref <your-project-ref>
```

## 5) Database migrations

Ensure these are applied:

- `supabase/final_setup.sql`
- `supabase/20260305_email_reminders.sql`

## 6) Scheduling

Confirm only one active cron job exists:

- Job name: `daily-renewal-reminders`
- Schedule: `5 6 * * *` (06:05 UTC daily)

Verify:

```sql
select jobid, jobname, schedule, active
from cron.job
where jobname = 'daily-renewal-reminders';
```

## 7) End-to-end smoke test

Before go-live:

- Enable `Email reminders` for a test user in app Settings.
- Create a test subscription with `renewal_date = tomorrow`.
- Trigger function manually for today.
- Confirm:
  - `notification_events` contains `email` event with `status='sent'`.
  - Resend dashboard shows delivered message.

## 8) Monitoring and retries

- Monitor function logs in Supabase (`send-renewal-reminders`).
- Watch `notification_events.status='failed'` and `error_text`.
- Add retry logic policy (manual or scheduled retry) if failure volume grows.

## 9) Compliance and UX

- Keep reminder preference controls in-app (opt-in/opt-out).
- Include clear app-setting path for disabling email reminders.
- Add footer/help text for why email was received and how to disable reminders.

## 10) Launch guardrails

- Start with a small user subset if possible.
- Monitor bounce/complaint rates in Resend.
- Roll back by disabling cron job if anomalies appear.
