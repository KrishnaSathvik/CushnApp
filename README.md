# Cushn

Cushn is a React + Vite subscription tracker with:

- Guest mode backed by local Dexie storage
- Authenticated mode backed by Supabase
- Shared onboarding flow for guest and authenticated users
- AI-assisted subscription parsing
- CSV import preview, backup/restore, and vendor-aware duplicate detection
- Budgets, analytics, renewal reminders, and calendar views
- Cloud-synced authenticated settings for currency, theme preference, and bill-type mapping
- Realtime sync for subscriptions, categories, budgets, and in-app reminder events
- Live in-app and email reminder delivery for upcoming renewals
- Persisted vendor metadata on subscriptions for domain/confidence-aware UI and duplicate handling

## Requirements

- Node.js 20+
- npm
- A Supabase project for authenticated mode

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Configure frontend environment in `.env.local`:

```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
VITE_PARSE_API_URL=https://<project-ref>.functions.supabase.co/parse-subscriptions
VITE_SITE_URL=https://cushn.app
VITE_APP_VERSION=1.0.0
```

3. Start the app:

```bash
npm run dev
```

## Scripts

- `npm run dev` - start local dev server
- `npm run build` - build the production bundle and prerender public routes
- `npm run preview` - serve the production build locally
- `npm run lint` - run ESLint
- `npm run test` - run Vitest
- `npm run test:realtime` - run a live Supabase realtime smoke test

## Supabase Setup

This repo has an older `supabase/migration.sql`, but the current app expects the newer schema in `supabase/final_setup.sql`.

### Fresh project

Run these SQL files in order:

1. `supabase/final_setup.sql`

Why:

- `final_setup.sql` is the current canonical schema. It includes the core tables, reminder tables, indexes, RLS policies, realtime membership, `user_settings`, vendor metadata columns on `subscriptions`, and the current `queue_renewal_reminders` RPC behavior.

If you already used an older copy of `final_setup.sql` before the recent settings/vendor work, run these on top:

1. `supabase/20260305_email_reminders.sql`
2. `supabase/20260308_user_settings.sql`
3. `supabase/20260308_vendor_metadata.sql`

### Existing older project

If your database was originally created from `supabase/migration.sql`, run these files in order instead:

1. `supabase/migration.sql`
2. `supabase/20260305_audit_hardening.sql`
3. `supabase/20260305_reminders.sql`
4. `supabase/20260305_email_reminders.sql`
5. `supabase/20260308_user_settings.sql`
6. `supabase/20260308_vendor_metadata.sql`

## Database Verification

Run this SQL script in the Supabase SQL Editor after migrations:

```bash
supabase/verify_production_readiness.sql
```

It verifies:

- required tables and columns
- RLS enablement and policies
- required indexes and check constraints
- realtime publication membership
- authenticated cloud settings storage (`user_settings`)
- vendor metadata columns on `subscriptions`
- `queue_renewal_reminders` existence
- email reminder queue logic
- `service_role` execute grant
- `pg_cron` extension presence and includes the follow-up query for `daily-renewal-reminders`

## Current Product Behavior

- Guests can use the app, complete onboarding, and access Settings without creating an account.
- Guest-to-account migration now promotes the important persistent data set:
  - subscriptions
  - categories
  - budget
  - notification preferences
  - currency
  - theme preference
  - bill-type mapping
  - onboarding completion state
- Authenticated users sync the important persistent settings across devices through `user_settings`.
- Vendor enrichment is persisted on subscriptions with:
  - `vendor_domain`
  - `vendor_confidence`
  - `vendor_match_type`
- CSV import is preview-first and duplicate-aware before writes are committed.

## Edge Functions

Deploy all four edge functions used by the app:

- `supabase/functions/parse-subscriptions/index.ts`
- `supabase/functions/send-renewal-reminders/index.ts`
- `supabase/functions/delete-account/index.ts`
- `supabase/functions/send-welcome-email/index.ts`

Example:

```bash
supabase functions deploy parse-subscriptions
supabase functions deploy send-renewal-reminders
supabase functions deploy delete-account
supabase functions deploy send-welcome-email
```

## Edge Function Secrets

### `parse-subscriptions`

Required:

- `ANTHROPIC_API_KEY`

### `send-renewal-reminders`

Required:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Recommended for production email delivery:

- `RESEND_API_KEY`
- `EMAIL_FROM=Cushn <support@cushn.app>`

### `delete-account`

Required:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### `send-welcome-email`

Required:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

Recommended:

- `EMAIL_FROM=Cushn <support@cushn.app>`
- `SITE_URL=https://cushn.app`

## Scheduled Reminder Delivery

Create one active cron job in Supabase for the reminder function:

- job name: `daily-renewal-reminders`
- schedule: `5 6 * * *`

The SQL verification script confirms whether `pg_cron` is installed and includes the exact query to verify this job.

## Reminder Status

The renewal reminder pipeline has been validated against the linked Supabase production project:

- in-app reminders queue correctly
- email reminders send successfully through Resend
- `send-renewal-reminders` is deployed
- `daily-renewal-reminders` cron is active

## Welcome Email Trigger

Verified users now have a one-time welcome-email trigger path:

- the frontend invokes `send-welcome-email` after an authenticated, confirmed session is established
- the edge function sends the welcome email through Resend
- it records `welcome_email_sent_at` in the user's auth `user_metadata`
- repeat logins do not resend the welcome email once that field is present

## Realtime Smoke Test

The app depends on realtime updates for:

- `subscriptions`
- `categories`
- `budgets`
- `notification_events`
- `user_settings`

To run the live smoke test:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
E2E_TEST_EMAIL=...
E2E_TEST_PASSWORD=...
npm run test:realtime
```

## Quality Gate

Current CI in [ci.yml](/Users/krishnasathvikmantripragada/subtrackrapp/.github/workflows/ci.yml) runs:

- `npm ci`
- `npm run lint`
- `npm run test`
- `npm run build`

CI does not currently run the live Supabase realtime smoke test.

## App Architecture

- Frontend: React 19 + Vite
- Local guest storage: Dexie
- Authenticated sync: Supabase Postgres + Realtime + Edge Functions
- State: context/hooks, not a centralized global store

## Data Sync Summary

For authenticated users, the important persistent data is database-backed:

- subscriptions
- categories
- budgets
- notification preferences and reminder events
- cloud settings:
  - currency
  - theme preference
  - bill-type mapping
- auth metadata used by the app:
  - `full_name`
  - `cushn_onboarded`
  - `welcome_email_sent_at`

Still local by design:

- guest-mode storage before migration
- temporary UI state
- session-only flags such as install-banner dismissal

See [ARCHITECTURE.md](/Users/krishnasathvikmantripragada/subtrackrapp/docs/ARCHITECTURE.md).

## Production Checklists

- [RESEND_PROD_CHECKLIST.md](/Users/krishnasathvikmantripragada/subtrackrapp/docs/RESEND_PROD_CHECKLIST.md)
