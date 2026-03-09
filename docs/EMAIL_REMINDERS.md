# Email Reminders

This document covers how Cushn email reminders work in production, how to deploy the reminder worker, how to invoke it correctly, and how to troubleshoot failures.

## Overview

Cushn reminder delivery has two channels:

- `in_app`
- `email`

Reminder events are stored in `public.notification_events`.

The delivery flow is:

1. The app stores notification preferences in `public.notification_preferences`.
2. Active subscriptions with a `renewal_date` are evaluated by `public.queue_renewal_reminders(target_date date)`.
3. The `send-renewal-reminders` Edge Function:
   - queues `in_app` and `email` reminder events for the target date
   - sends queued email reminders through Resend
   - marks delivered email events as `sent`
4. In-app reminder events remain `queued` until the user sees or dismisses them in the app.

## Verified Production Behavior

The live production flow was verified with a real Supabase user.

Confirmed:

- `send-welcome-email` works for an authenticated verified user
- `send-renewal-reminders` works when invoked with both anon auth headers and `x-cron-secret`
- email reminder events can move to `sent`
- in-app reminder events remain `queued`, which is expected until handled by the app

## Required Secrets

Set these in Supabase `Edge Functions -> Secrets`.

### `send-renewal-reminders`

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SITE_URL`

### `send-welcome-email`

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `SITE_URL`

## Deployment

Deploy both email-related functions with gateway JWT verification disabled.

Why:

- `send-welcome-email` validates the signed-in user token inside the function
- `send-renewal-reminders` validates `CRON_SECRET` inside the function

Deploy commands:

```bash
supabase functions deploy send-welcome-email --no-verify-jwt --project-ref <project-ref>
supabase functions deploy send-renewal-reminders --no-verify-jwt --project-ref <project-ref>
```

## Correct Invocation Format

`send-renewal-reminders` must be called with both:

- anon gateway auth
- the cron secret header

### Required headers

- `Content-Type: application/json`
- `apikey: <SUPABASE_ANON_KEY>`
- `Authorization: Bearer <SUPABASE_ANON_KEY>`
- `x-cron-secret: <CRON_SECRET>`

### Request body

```json
{"targetDate":"2026-03-09"}
```

If `targetDate` is omitted, the function defaults to the current UTC date.

### Example curl

```bash
curl -X POST \
  "https://<project-ref>.functions.supabase.co/send-renewal-reminders" \
  -H "Content-Type: application/json" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <SUPABASE_ANON_KEY>" \
  -H "x-cron-secret: <CRON_SECRET>" \
  -d '{"targetDate":"2026-03-09"}'
```

### Expected success response

```json
{
  "queued": 2,
  "emailsSent": 1,
  "emailsFailed": 0,
  "targetDate": "2026-03-09"
}
```

## Response Meaning

- `queued`: total reminder events created for that date
- `emailsSent`: email events successfully delivered during that run
- `emailsFailed`: email events attempted but not delivered
- `targetDate`: the date evaluated by the worker

## Database Expectations

For reminder delivery to work correctly, the database must provide:

- `public.notification_preferences`
- `public.notification_events`
- `public.subscriptions`
- `public.queue_renewal_reminders(target_date date)`

The queue function must:

- create `in_app` events when `in_app_enabled = true`
- create `email` events when `email_enabled = true`
- respect `days_before`

## Scheduling

Run `send-renewal-reminders` once daily.

Recommended schedule:

- `5 6 * * *`

That is `06:05 UTC` each day.

If you use an external scheduler or custom job runner, make sure it sends the same header set shown above.

## Troubleshooting

### `401 Missing authorization header`

Cause:

- the request did not include `Authorization: Bearer <SUPABASE_ANON_KEY>`

Fix:

- add both `apikey` and `Authorization` headers

### `401 Unauthorized`

Cause:

- the request reached the function, but `x-cron-secret` did not match the deployed `CRON_SECRET`

Fix:

- update the live secret
- or update the scheduler to send the correct secret

### `401 Invalid JWT`

Cause:

- the function was deployed without `--no-verify-jwt`
- or the caller sent the wrong bearer token

Fix:

- redeploy with `--no-verify-jwt`
- for `send-renewal-reminders`, use `Authorization: Bearer <SUPABASE_ANON_KEY>`
- for `send-welcome-email`, invoke through a real signed-in Supabase session

### Welcome email returns `401`

Cause:

- gateway JWT verification is still enabled
- or the function was not redeployed after the auth fix

Fix:

```bash
supabase functions deploy send-welcome-email --no-verify-jwt --project-ref <project-ref>
```

### Reminder function queues events but does not send mail

Check:

- `RESEND_API_KEY`
- `EMAIL_FROM`
- sender domain verification in Resend
- `notification_events.error_text`
- Supabase function logs

### In-app reminders do not show in the UI

Check:

- user is authenticated
- `notification_events` has `channel = 'in_app'`
- event `status = 'queued'`
- `reminder_date <= today`
- realtime is enabled for `notification_events`

## Verification Checklist

Before production rollout:

1. Verify database readiness with [verify_db_final.sql](./../supabase/verify_db_final.sql).
2. Confirm live secrets are set for both email-related functions.
3. Deploy both functions with `--no-verify-jwt`.
4. Create a test subscription with `renewal_date = today`.
5. Enable both `in_app` and `email` reminders for the test user.
6. Invoke `send-renewal-reminders`.
7. Confirm:
   - email event becomes `sent`
   - in-app event remains `queued`
   - function response shows nonzero `queued`

## Related Files

- [send-renewal-reminders function](../supabase/functions/send-renewal-reminders/index.ts)
- [send-welcome-email function](../supabase/functions/send-welcome-email/index.ts)
- [Resend production checklist](./RESEND_PROD_CHECKLIST.md)
- [Database verifier](../supabase/verify_db_final.sql)
