# Cushn

Cushn is an AI-powered subscription intelligence app that surfaces what you're really spending, flags waste, and reminds you before renewals hit. It works offline as a guest or syncs across devices with a cloud account.

## 🧭 Product Philosophy

Cushn is designed around one principle: stop showing people their data and start showing them what their data means. The landing page leads with an interactive audit calculator. The onboarding drops users into adding subscriptions immediately rather than configuring settings. Analytics surfaces actionable insights before charts. Every screen answers 'what should I do' not just 'what do I have.'

## ✨ Features

1. **AI-Assisted Parsing:** Parse subscription details from typed text, screenshots, and statement uploads through a Supabase Edge Function.
2. **Review Workflow:** A shared `ReviewSheet` lets users decide whether a subscription is worth keeping, cancel it externally, or snooze the decision for later.
3. **Redesigned Analytics:** Analytics is organized into four zones: a headline insight, a visual breakdown, an interactive simulator, and a compact 6-month trend.
4. **Scheduled Cancellation Tracking:** Cancellation decisions record `cancelledAt` and `endsAt`, keep spend active until the end date passes, and log savings once the cancellation becomes effective.
5. **Comprehensive Tracking:** Manage budgets, savings history, and renewal timing across Home, Analytics, Budget, Calendar, and subscription detail views.
6. **Notifications & Reminders:** Live in-app and email reminder delivery for upcoming renewals.
7. **Vendor Enrichment & Cancellation Link Mapping:** Persisted vendor metadata (domain, confidence, match type) for smarter categorization. Common vendors map to known cancellation URLs, with a Google fallback for uncatalogued services.
8. **Smart Import/Export:** Upload PDF, CSV, XLSX, TXT, TSV, and image files into a review dialog before confirming findings; plus backup/restore and vendor-aware duplicate detection.
9. **Guest & Authenticated Modes:** Use the app locally with Dexie, track guest sessions in Supabase, or sign up to sync with a full cloud account.
10. **Realtime Sync & Cloud Preferences:** Instantly sync subscriptions, categories, budgets, and in-app reminder events across devices. Sync currency, theme preference, and bill-type mapping for authenticated users.

## 🛠️ Tech Stack

- **Frontend:** React 19 + Vite
- **Local Storage:** Dexie (IndexedDB)
- **Backend & Auth:** Supabase Postgres, Realtime, and Edge Functions
- **State Management:** React Context & Hooks (no centralized global store)

## 🚀 Getting Started

### Requirements
- Node.js 20+
- npm
- A Supabase project (for authenticated mode)

### Local Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**  
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<supabase-anon-key>
   VITE_PARSE_API_URL=https://<project-ref>.functions.supabase.co/parse-subscriptions
   VITE_SITE_URL=https://cushn.app
   VITE_APP_VERSION=1.1.0
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

### Available Scripts
- `npm run dev` - Start local dev server
- `npm run build` - Build the production bundle and prerender public routes
- `npm run preview` - Serve the production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest
- `npm run test:realtime` - Run a live Supabase realtime smoke test

## 🗄️ Database Setup (Supabase)

This app relies on Supabase for its backend. Depending on whether you are starting fresh or upgrading an existing project, follow the corresponding migration path.

### Fresh Project
Run `supabase/final_setup.sql` in the Supabase SQL Editor.  
*Why:* This is the current canonical schema. It includes core tables, reminder tables, indexes, RLS policies, realtime settings, and vendor metadata columns along with the `user_settings` structure.

*(If you previously ran an older version of `final_setup.sql` before recent updates, apply these extensions: `20260305_email_reminders.sql`, `20260308_user_settings.sql`, `20260308_vendor_metadata.sql`)*

### Existing Older Project
If your database was initialized with the older `supabase/migration.sql`, run the following files in order:
1. `supabase/migration.sql`
2. `supabase/20260305_audit_hardening.sql`
3. `supabase/20260305_reminders.sql`
4. `supabase/20260305_email_reminders.sql`
5. `supabase/20260308_user_settings.sql`
6. `supabase/20260308_vendor_metadata.sql`
7. `supabase/20260309_guest_sessions.sql`
8. `supabase/20260309_welcome_email_dispatches.sql`

### Database Verification
After running migrations, strictly execute this verification script:
```bash
supabase/verify_production_readiness.sql
```
This query verifies essential requirements: required tables, RLS enablement, indexes, realtime publication membership, email reminder queue logic, authenticated cloud settings storage, pg_cron extension and active jobs, etc.

### Subscription Review Fields
The app now expects the following subscription fields in both local and cloud storage:

- `endsAt`
- `cancelledAt`
- `reviewedAt`
- `snoozedUntil`
- `cancelUrl`

These power scheduled cancellations, reviewed badges, reminder suppression, and vendor cancellation-link overrides. Dexie storage has been updated locally; make sure your Supabase `subscriptions` table includes these columns.

## ☁️ Edge Functions

Cushn utilizes Supabase Edge Functions for parsing, emails, and account management.

**Deploy all edge functions:**
```bash
supabase functions deploy parse-subscriptions
supabase functions deploy send-renewal-reminders
supabase functions deploy delete-account
supabase functions deploy send-welcome-email
```

### `parse-subscriptions` behavior

- Accepts typed text from the Add composer.
- Accepts extracted text from uploaded PDF, CSV, XLSX, TXT, and TSV files.
- Accepts uploaded images as direct AI vision inputs.
- Returns findings into a review flow before anything is saved.
- Uses deterministic client-side evidence checks to reject unsupported hallucinated services.
- For sparse or unreadable statement content, the intended output is `[]`.

### Required Secrets
Set these secrets in your Supabase project:

- **`parse-subscriptions`**: `ANTHROPIC_API_KEY`
- **`send-renewal-reminders`**: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` *(Recommended for production delivery: `RESEND_API_KEY`, `EMAIL_FROM`, `SITE_URL`)*
- **`delete-account`**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **`send-welcome-email`**: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY` *(Recommended: `EMAIL_FROM`, `SITE_URL`)*

## ⏰ Background Jobs & Reminders

### Scheduled Delivery (Cron Job)
Create an active cron job in Supabase to trigger daily renewal reminders:
- **Job Name**: `daily-renewal-reminders`
- **Schedule**: `5 6 * * *`  
*(The verification script includes queries to check if `pg_cron` is installed and the job exists).*

### Welcome Email Trigger
- Once a new authenticated user verifies their account, the frontend invokes the `send-welcome-email` edge function.
- It records `welcome_email_sent_at` in the user's `user_metadata` to prevent duplicate welcome emails on repeat logins.

## 🔄 User Data & Sync Behavior

The app architecture allows users to start locally and optionally transition to a cloud account:

- **Guests**: Complete onboarding, track subscriptions, configure settings, and use the app fully offline through local storage.
- **Guest Session Tracking**: Guest entries create a `guest_sessions` record in Supabase with a display name and metadata, and that session is marked as converted if the guest later signs in.
- **Migration**: When signing up, guest persistent data (subscriptions, categories, budget, notification preferences, themes, bill-types) automatically migrates to Supabase.
- **Authenticated Cloud Sync**: Essential user data and profile configurations are saved and synced immediately. UI states temporarily persisting for the session (like installing a PWA banner) remain local-only.

## 🔍 Review & Cancellation Flow

- **Single Review entry point:** Review actions on Home, Analytics, Calendar, and subscription rows funnel into one reusable `ReviewSheet`.
- **Keep it:** Marks the subscription as reviewed, shows a `Reviewed` badge in the library, and suppresses reconsideration prompts for 90 days.
- **Remind me later:** Stores a `snoozedUntil` date and hides the prompt for 30 days.
- **Cancel it:** Opens the vendor cancellation link, asks when access actually ends, and records the cancellation without immediately removing the spend.
- **Savings history:** Once the effective end date passes, the cancellation contributes to the Savings History page and lowers recurring spend totals across Home, Budget, and Analytics.

## 📊 Analytics Layout

The Analytics page now follows a four-zone structure instead of a stack of competing cards:

1. **Headline insight:** Big recurring-spend number, one sentence about subscriptions worth reconsidering, and the monthly/annual toggle.
2. **Visual story:** Category-share donut plus a ranked list of subscriptions by cost. Tapping a row opens the `ReviewSheet`.
3. **Scenario simulator:** One spend bar with live savings feedback and toggle switches for subscriptions worth reconsidering.
4. **Trend:** Compact 6-month projection chart with inline stats for top category and average per subscription.

Zone 1 is informational only. Review actions happen from specific subscription rows in the ranked list or simulator so the user always has context before opening the sheet.

## 📥 Add Flow

The Add screen supports three input styles:

- **Smart paste**: Type natural language like `Netflix 15.99 monthly` and review AI-detected subscriptions before saving.
- **Manual form**: Enter a subscription directly with amount, billing cycle, category, renewal date, and notes.
- **Upload review flow**: Upload PDF, CSV, XLSX, TXT, TSV, or image files. Cushn opens a dedicated review dialog that:
  - shows extraction / analysis progress
  - previews extracted text or uploaded images
  - displays findings or a final `No subscriptions found` result
  - requires user confirmation before adding anything

## 🧪 Testing & Quality Assurance

- **Continuous Integration (CI)**: GitHub Actions (see `.github/workflows/ci.yml`) automatically run `npm ci`, linting, unit tests, and the production build process.
- **Realtime Smoke Test**: Verify realtime interactions with live components. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `E2E_TEST_EMAIL`, and `E2E_TEST_PASSWORD` locally, then run `npm run test:realtime`.

## 📚 Further Reading
- [Architecture Details](docs/ARCHITECTURE.md)
- [Email Reminders Operations](docs/EMAIL_REMINDERS.md)
- [Resend Production Checklist](docs/RESEND_PROD_CHECKLIST.md)
