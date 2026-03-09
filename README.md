# Cushn

Cushn is a React + Vite subscription tracker that helps you manage recurring expenses, whether you prefer a lightweight guest experience or a fully cloud-synced account.

## ✨ Features

- **Guest & Authenticated Modes:** Use the app locally with Dexie, track guest sessions in Supabase, or sign up to sync with a full cloud account.
- **AI-Assisted Parsing:** Parse subscription details from typed text, screenshots, and statement uploads through a Supabase Edge Function.
- **Smart Import/Export:** Upload PDF, CSV, XLSX, TXT, TSV, and image files into a review dialog before confirming findings; plus backup/restore and vendor-aware duplicate detection.
- **Comprehensive Tracking:** Manage budgets, view analytics, and track expenses via calendar views.
- **Realtime Sync:** Instantly sync subscriptions, categories, budgets, and in-app reminder events across devices.
- **Notifications & Reminders:** Live in-app and email reminder delivery for upcoming renewals.
- **Cloud Preferences:** Sync currency, theme preference, and bill-type mapping for authenticated users.
- **Vendor Enrichment:** Persisted vendor metadata (domain, confidence, match type) for smarter categorization.

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

*(If you previously ran an older version of `final_setup.sql` before recent updates, apply these extensions: `20260305_email_reminders.sql`, `20260308_user_settings.sql`, `20260308_vendor_metadata.sql`, `20260309_guest_sessions.sql`, and `20260309_welcome_email_dispatches.sql` in that order).*

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
This query verifies essential requirements: required tables, RLS enablement, indexes, realtime publication membership, email reminder queue logic, authenticated cloud settings storage, pg_cron extension presence, and overall production readiness.

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
- **Authenticated Cloud Sync**: Essential user data and profile configurations are saved and synced immediately. UI states temporarily persisting for the session (like installing a PWA banner) remain isolated on the device.

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
