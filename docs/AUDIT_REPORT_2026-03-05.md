# SubTrackr Audit Report
Date: 2026-03-05
Scope: `/Users/krishnasathvikmantripragada/subtrackrapp`

## Executive Summary
- Core app is implemented and runnable.
- `npm run test` passes (`39/39` tests), `npm run build` passes.
- `npm run lint` fails due unused vars in prototype file `SubTrackr_Auth.jsx` (not part of runtime app).
- Dual-storage architecture is implemented:
  - Guest mode: Dexie (local IndexedDB)
  - Auth mode: Supabase (cloud)
- Realtime sync is implemented in app code and migration SQL for `subscriptions`, `categories`, `budgets`.
- A DB audit SQL script was added: `supabase/audit_sync.sql`.

## File-by-File Implementation Status

### Root files
- `.DS_Store`: metadata file, ignore.
- `.env.local`: environment config exists (not audited for secret values).
- `.github/workflows/ci.yml`: implemented CI (`lint`, `test`, `build`).
- `.gitignore`: implemented.
- `CLAUDE.MD`: implementation guidance doc.
- `README.md`: implemented setup and deployment instructions.
- `SubTrackr_Auth.jsx`: prototype/standalone file, not used by runtime app; has lint errors.
- `SubTrackr_Landing_Wireframe.jsx`: prototype/wireframe, not used by runtime app.
- `SubTrackr_LightTokens_v2.jsx`: prototype/token exploration, not used by runtime app.
- `SubTrackr_PRD.docx`: product requirements doc.
- `SubTrackr_Wireframes.jsx`: prototype/wireframe, not used by runtime app.
- `eslint.config.js`: implemented.
- `index.html`: implemented.
- `lhreport.json`: generated Lighthouse report.
- `package-lock.json`: dependency lockfile.
- `package.json`: scripts and dependencies implemented.
- `vite.config.js`: implemented + PWA config + chunking strategy.

### Public assets
- `public/*.png|*.svg|*.ico|robots.txt|site.webmanifest`: static assets implemented and used by Vite/PWA manifest.

### App entry and routing
- `src/main.jsx`: implemented app bootstrap + Dexie default seeding and one-time demo cleanup.
- `src/App.jsx`: implemented route graph, auth guards, onboarding gate, lazy loading.
- `src/index.css`: implemented theme variables, base styles, animations.

### Contexts
- `src/context/AuthContext.jsx`: implemented auth state, guest mode, signup/login/oauth/reset, migration hook.
- `src/context/SettingsContext.jsx`: implemented currency settings persistence.
- `src/context/ThemeContext.jsx`: implemented light/dark theme switching.

### DB and service layer
- `src/db/index.js`: implemented Dexie schema + CRUD + budget + totals + renewals.
- `src/db/seedData.js`: legacy/default seed definitions (present, not central to runtime logic now).
- `src/lib/supabase.js`: implemented guarded client creation.
- `src/lib/dataService.js`: implemented full abstraction (Dexie/Supabase), realtime subscription helper.
- `src/lib/syncMigration.js`: implemented guest->auth migration to Supabase.
- `src/lib/parseSubscriptions.js`: implemented edge-function parse + fallback local parser.
- `src/lib/constants.js`: implemented app constants.
- `src/lib/billTypes.js`: implemented bill type mapping.
- `src/lib/formatCurrency.js`: implemented formatting helpers.
- `src/lib/normalizeAmount.js`: implemented cycle normalization.
- `src/lib/exportData.js`: implemented CSV/JSON export + download.
- `src/lib/importData.js`: implemented CSV parser.
- `src/lib/serviceDomains.js`: implemented large domain map + matching heuristics.
- `src/lib/tokens.js`: implemented theme token maps.

### Hooks
- `src/hooks/useSubscriptions.js`: implemented subscriptions/cats load + realtime refresh + CRUD wrappers.
- `src/hooks/useBudget.js`: implemented budget load/save + realtime refresh.

### Screens (runtime)
- `src/screens/LandingPage.jsx`: implemented marketing/entry page.
- `src/screens/AuthPages.jsx`: implemented signup/login/forgot-password UIs and auth calls.
- `src/screens/GuestEntry.jsx`: implemented guest login flow.
- `src/screens/OnboardingScreen.jsx`: implemented onboarding and budget setup.
- `src/screens/HomeScreen.jsx`: implemented grouped list, search, stats, budget gauge.
- `src/screens/AddScreen.jsx`: implemented AI parse/manual/voice add flows.
- `src/screens/SubscriptionDetail.jsx`: implemented view/edit/pause/delete.
- `src/screens/AnalyticsScreen.jsx`: implemented category analytics charts.
- `src/screens/BudgetScreen.jsx`: implemented budget management and category spend.
- `src/screens/CalendarScreen.jsx`: implemented renewal calendar with projections.
- `src/screens/SettingsScreen.jsx`: implemented export/import/theme/currency/clear/logout.
- `src/screens/LegalPage.jsx`: implemented privacy/terms/contact pages.

### Components
- `src/components/ArcGauge.jsx`: implemented.
- `src/components/BottomSheet.jsx`: implemented.
- `src/components/Chip.jsx`: implemented.
- `src/components/ConfirmationSheet.jsx`: implemented parsed-review flow.
- `src/components/InstallBanner.jsx`: implemented PWA install prompt handling.
- `src/components/ServiceLogo.jsx`: implemented favicon + fallback avatar.
- `src/components/SubscriptionRow.jsx`: implemented swipe/delete/long-press actions.
- `src/components/TabBar.jsx`: implemented.
- `src/components/TypeBadge.jsx`: implemented.
- `src/components/VoiceInput.jsx`: implemented Web Speech API integration.
- `src/components/.gitkeep`: placeholder.

### Tests
- `src/__tests__/dataService.test.js`: implemented (cloud/guest behavior checks).
- `src/__tests__/utilities.test.js`: implemented utility coverage.

### Supabase
- `supabase/migration.sql`: implemented schema, RLS, policies, realtime publication config.
- `supabase/functions/parse-subscriptions/index.ts`: implemented edge function parser.
- `supabase/functions/parse-subscriptions/README.md`: implemented deployment instructions.
- `supabase/.temp/cli-latest`: Supabase CLI temp/runtime artifact.
- `supabase/audit_sync.sql`: added in this audit; run to verify DB/realtime alignment.

### Placeholder folders
- `src/hooks/.gitkeep`: placeholder.
- `src/lib/.gitkeep`: placeholder.
- `src/screens/.gitkeep`: placeholder.
- `src/store/.gitkeep`: placeholder; indicates no centralized store implemented.
- `src/db/.gitkeep`: placeholder.

## What Is Implemented vs Not Implemented

### Implemented
- Guest mode local storage with Dexie.
- Authenticated mode with Supabase.
- Guest->auth migration.
- Realtime subscriptions for subscriptions/categories/budgets.
- Core CRUD across subscriptions, categories, budget.
- AI parser integration via Supabase edge function + fallback parser.
- Onboarding, analytics, budget, calendar, settings.
- CSV import/export and JSON export.
- PWA install manifest/service worker.

### Not Implemented / Missing
- No global app state store despite `src/store` folder.
- No category CRUD UI (create/edit/delete categories) in runtime screens.
- No automated backend integration test proving realtime events end-to-end.
- No server-side scheduled reminders/notifications.
- No database-side check constraints for valid `cycle`/`status` enumerations.
- No explicit DB migration for performance indexes on common filters.

## Key Findings (Priority)

### High
1. CI lint gate currently fails.
   - File: `SubTrackr_Auth.jsx` (unused prototype file but included in lint scope)
   - Impact: CI fails on push/PR.

2. Theme token mismatch (`T.card`) referenced but not defined.
   - Files:
     - `src/screens/OnboardingScreen.jsx`
     - `src/screens/SettingsScreen.jsx`
   - Impact: wrong/undefined background values in specific UI blocks.

### Medium
1. DB migration lacks explicit indexes for common access paths.
   - `subscriptions.user_id`, `subscriptions(user_id, renewal_date)`, `categories.user_id`.
   - Impact: query/realtime filtering can degrade with larger datasets.

2. Import flow ignores category from CSV and defaults to `Other`.
   - File: `src/screens/SettingsScreen.jsx` import path.
   - Impact: weaker data quality after import.

3. Duplicate realtime subscriptions per logged-in client.
   - `useSubscriptions` and `useBudget` each create channels.
   - Impact: extra websocket/event overhead (functionally okay).

### Low
1. Console logging left in production path.
   - `src/context/AuthContext.jsx`, `src/lib/syncMigration.js`
2. `remember` state in login is UI-only (not wired to auth persistence options).

## Realtime and DB Sync Assessment
- Code-level assessment: implemented.
  - Client subscribes to `postgres_changes` on all relevant tables by `user_id`.
  - Migration adds all three tables to `supabase_realtime` publication.
  - RLS policies enforce per-user ownership and allow table ops for own records.
- Environment-level assessment: cannot be guaranteed from local code alone without running checks in your live DB.
  - Use `supabase/audit_sync.sql` in Supabase SQL Editor to validate live schema + realtime readiness.

## SQL Script Added
- File: `supabase/audit_sync.sql`
- Purpose: one-shot PASS/FAIL audit for:
  - required tables
  - required columns
  - critical constraints
  - RLS enabled
  - policy presence
  - realtime publication membership
  - recommended user_id indexes

## Recommended Enhancements
1. Split prototype files out of lint scope or move them under `prototypes/`.
2. Add DB migration for indexes + check constraints:
   - index `subscriptions(user_id, renewal_date)`
   - index `categories(user_id)`
   - check `cycle IN (...)`
   - check `status IN ('active','paused')`
3. Add category management UX (create/edit/delete custom categories).
4. Add e2e tests for auth + realtime update propagation.
5. Consolidate realtime listeners to one shared channel per user session.
6. Add in-app notifications/reminder system (email/push) for upcoming renewals.
