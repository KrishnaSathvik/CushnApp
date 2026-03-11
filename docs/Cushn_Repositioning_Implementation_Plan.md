# Cushn Repositioning Implementation Plan

Source reviewed in full: [docs/Cushn_Repositioning_Blueprint.pdf](/Users/krishnasathvikmantripragada/subtrackrapp/docs/Cushn_Repositioning_Blueprint.pdf)

This plan is grounded in the current codebase, not just the blueprint. The relevant implementation areas already exist in:

- [src/screens/LandingPage.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/LandingPage.jsx)
- [src/screens/OnboardingScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/OnboardingScreen.jsx)
- [src/screens/GuestEntry.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/GuestEntry.jsx)
- [src/screens/AuthPages.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/AuthPages.jsx)
- [src/screens/HomeScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/HomeScreen.jsx)
- [src/screens/AddScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/AddScreen.jsx)
- [src/screens/AnalyticsScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/AnalyticsScreen.jsx)
- [src/screens/CalendarScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/CalendarScreen.jsx)
- [src/screens/BudgetScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/BudgetScreen.jsx)
- [src/screens/SettingsScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/SettingsScreen.jsx)
- [src/lib/parseSubscriptions.js](/Users/krishnasathvikmantripragada/subtrackrapp/src/lib/parseSubscriptions.js)
- [src/lib/vendorEnrichment.js](/Users/krishnasathvikmantripragada/subtrackrapp/src/lib/vendorEnrichment.js)
- [supabase/functions/parse-subscriptions/index.ts](/Users/krishnasathvikmantripragada/subtrackrapp/supabase/functions/parse-subscriptions/index.ts)
- [src/App.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/App.jsx)

## Objective

Reposition Cushn from "subscription tracker" to "subscription intelligence" without rebuilding the product from scratch. The core change is framing, insight hierarchy, and first-session value delivery.

Success means:

- first-time visitors see waste detection, not parsing mechanics
- new users reach a populated dashboard in under 30 seconds
- analytics become credible through category correctness
- guest mode becomes the primary low-friction conversion path
- home, analytics, budget, and calendar surfaces all push users toward action

## What The PDF Changes Mean For This Repo

The blueprint is mostly a sequencing problem, not a greenfield product effort.

- The public front door exists and needs repositioning, not replacement.
- The add flow already supports text, voice, and file parsing; it needs stronger onboarding usage and a better summary moment.
- The analytics page already has the right primitives for duplicates, subscriptions worth reconsidering, and trends; the main gaps are section order, actionability, and category quality.
- The app already has a subscription detail route; that reduces the cost of adding review/cancel flows.
- The largest foundational risk is category accuracy. Until that is fixed, landing claims about insights remain weaker than they should be.

## Execution Principles

- Do Sprint 1 first. Category correctness is a dependency for home, analytics, budget, and marketing credibility.
- Ship high-leverage framing changes before deep feature work. Landing, guest entry, and onboarding can materially improve activation quickly.
- Reuse existing screens and route structure. Avoid a parallel public-app architecture unless the current one proves too rigid.
- Instrument every funnel step before rollout so activation and conversion changes can be measured.

## Sprint Plan

### Sprint 1: Category System Overhaul

Goal: make insight data trustworthy.

Scope:

- Introduce a canonical category model aligned to the blueprint.
- Add vendor-to-category mapping for top vendors.
- Apply mapping during parsing and enrichment.
- Reclassify existing subscriptions through a one-time migration.
- Preserve user overrides so auto-categorization does not fight manual edits.

Implementation:

- Add a category taxonomy source in `src/lib` or `src/db` for:
  `Entertainment`, `Productivity`, `Dev Tools`, `Cloud & Storage`, `Debt & Loans`, `Utilities`, `Health & Fitness`, `Insurance`, `News & Media`, `Auto & Transport`, `Money Transfers`, `Shopping`, `Other`.
- Extend [src/lib/vendorEnrichment.js](/Users/krishnasathvikmantripragada/subtrackrapp/src/lib/vendorEnrichment.js) to return a recommended category from vendor metadata.
- Update [src/lib/parseSubscriptions.js](/Users/krishnasathvikmantripragada/subtrackrapp/src/lib/parseSubscriptions.js) so parsed items use canonical category names before UI save.
- Update [supabase/functions/parse-subscriptions/index.ts](/Users/krishnasathvikmantripragada/subtrackrapp/supabase/functions/parse-subscriptions/index.ts) to use the new category list in prompt and normalization.
- Add a migration script for existing local and synced data to remap bad historical categories.
- Update analytics and budget assumptions anywhere category labels are hardcoded.

Acceptance criteria:

- no debt, loan, transfer, or insurance vendors land in `Cloud`
- donut chart output reads plausibly on test data
- subscriptions worth reconsidering exclude debt and non-cancellable essentials by default

Risks:

- existing persisted category ids may not align with renamed categories
- migration needs to avoid overwriting explicit user edits

### Sprint 2: Landing Page Repositioning

Goal: change the first impression from "AI parser" to "find waste."

Scope:

- rewrite hero headline, subhead, CTA, and preview hierarchy
- replace feature parity grid with tiered outcome-driven messaging
- add urgency and credibility blocks
- route primary CTA into guest/audit entry focused on immediate value

Implementation:

- Refactor [src/screens/LandingPage.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/LandingPage.jsx) hero copy and CTA labels.
- Replace current `DashboardPreviewMock` usage with a before/after problem-to-insight preview.
- Rework the features section into three tiers:
  `Find what you are paying for`, `See what you are wasting`, `Never get surprised`.
- Add one statistics/social-proof strip and update footer tagline.
- Ensure SEO metadata matches the new positioning.

Acceptance criteria:

- the hero communicates outcome within one screen without mentioning parsing first
- the primary CTA promises discovery, not work
- duplicate detection and reconsideration intelligence are visible above the fold

### Sprint 3: Onboarding And Guest Flow

Goal: move from configuration-first to value-first activation.

Scope:

- remove the 5-step onboarding wizard
- make guest entry immediate
- route users into add-first onboarding
- show running totals and a post-parse summary before dashboard

Implementation:

- Replace [src/screens/OnboardingScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/OnboardingScreen.jsx) with:
  optional currency confirmation, then immediate add flow
- Make the name field optional or defer it in [src/screens/GuestEntry.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/GuestEntry.jsx).
- Update [src/App.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/App.jsx) onboarding gating so first-session users can land in add-first onboarding without dead-end setup steps.
- Update [src/screens/AddScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/AddScreen.jsx):
  stronger prompt copy, one-tap quick-add chips, running monthly and annual total, summary confirmation before save.
- Keep budget and reminders as contextual follow-ups after data exists instead of up-front blockers.

Acceptance criteria:

- a new guest can add subscriptions and hit a populated dashboard in under 30 seconds
- no screen asks for budget or reminders before at least one subscription exists
- skip links are no longer needed because friction is materially reduced

### Sprint 4: `/audit` Top-Of-Funnel Page

Goal: create a zero-friction marketing destination.

Scope:

- add a public `/audit` route
- implement a client-only subscription cost calculator
- expose conversion paths into guest mode or account creation

Implementation:

- Add route wiring in [src/App.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/App.jsx).
- Build a new public screen, likely `src/screens/AuditPage.jsx`.
- Store common service pricing in a static JSON file under `src/lib` or `src/db`.
- Support chip-based quick add, typed input, amount fallback for unknown services, and live monthly/annual/daily totals.
- Reuse public layout primitives from the landing page.

Acceptance criteria:

- zero backend dependency for the audit experience
- usable on first load with no auth or guest session
- strong CTA path from results into full product

### Sprint 5: Home, Analytics, Calendar, Budget Enhancements

Goal: make the product feel like an intelligence layer, not a ledger.

Scope:

- promote the highest-impact numbers on home
- reorder analytics toward action
- add quick wins and annualized context
- add calendar summaries and heavy-day emphasis
- add interactive savings framing to budget

Implementation:

- [src/screens/HomeScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/HomeScreen.jsx)
  - demote the arc gauge from hero
  - elevate monthly recurring total and annual projection
  - add weekly due-soon total
  - add a quick-wins card bridging to analytics/detail actions
  - default sort library by due date or amount instead of grouping-only emphasis
- [src/screens/AnalyticsScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/AnalyticsScreen.jsx)
  - reorder sections: actionable insights, subscriptions worth reconsidering, duplicate watch, trends, then passive charts
  - annualize all impact numbers
  - add buttons into detail/review flows
  - connect duplicate savings cards to the underlying subscriptions
- [src/screens/CalendarScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/CalendarScreen.jsx)
  - add monthly total and renewal count header
  - visually highlight heaviest day
  - add past-month comparison
  - add quick actions from day detail rows
- [src/screens/BudgetScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/BudgetScreen.jsx)
  - remove disconnected preset buttons
  - remove leaked internal design copy
  - replace empty `Over By $0.00` logic with savings framing
  - add what-if simulator tied to real subscriptions

Acceptance criteria:

- home shows monthly and annual recurring spend immediately
- every major insight surface has an obvious next action
- budget becomes a decision tool, not just a readout

### Sprint 6: Conversion And Retention Layer

Goal: turn guest value into account creation and sharing.

Scope:

- personalize signup/login with guest-state context
- expose guest continuation on auth pages
- add share, privacy, and account-stats surfaces
- complete detail flows needed by analytics and quick wins

Implementation:

- Update [src/screens/AuthPages.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/AuthPages.jsx) to:
  add `Continue as guest`, remove meaningless static preview usage for cold visitors, personalize signup based on guest totals when available.
- Update [src/screens/SettingsScreen.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/SettingsScreen.jsx):
  move CSV import emphasis into add flow, add privacy card, share card, and user stats card.
- Extend [src/screens/SubscriptionDetail.jsx](/Users/krishnasathvikmantripragada/subtrackrapp/src/screens/SubscriptionDetail.jsx) to support cancel, pause, amount change, category edit, and duplicate/trim badges cleanly.
- Add guest-to-auth prompts based on milestone events like `10+ subscriptions`, `duplicate found`, or `reminder setup`.

Acceptance criteria:

- guest users are prompted with their own numbers, not generic copy
- auth pages support non-committal trial paths
- sharing is possible from inside the product

## Post-Sprint Work

- savings history page
- week view in calendar
- per-subscription reminder timing
- richer empty states
- performance cleanup and edge-case hardening

## Cross-Cutting Technical Work

These should not be left implicit.

### Data Model

- confirm whether category identity is id-based, name-based, or mixed
- add a stable canonical key for categories before migration work
- add fields for `userOverrodeCategory`, `statusChangedAt`, and savings-related history if needed

### Routing

- add `/audit`
- verify onboarding gate behavior for guest sessions and first authenticated sessions
- ensure direct links into detail/review flows preserve navigation state

### Instrumentation

Track at minimum:

- landing CTA click-through
- guest start rate
- onboarding completion to first saved subscription
- time to first populated dashboard
- audit completion rate
- guest-to-auth conversion
- reconsideration review actions
- duplicate-resolution actions

### Testing

Add or update tests around:

- category mapping and migration
- parse normalization and category assignment
- guest onboarding path
- audit calculator logic
- analytics duplicate grouping
- budget simulator calculations

## Suggested Delivery Order Inside Each Sprint

Within each sprint, use this order:

1. data and state changes
2. route changes
3. UI changes
4. analytics instrumentation
5. regression tests

That order reduces rework because current screens are tightly coupled to shared subscription and settings state.

## Immediate Next Moves

If execution starts now, the first three implementation tasks should be:

1. Define the canonical category taxonomy and migration strategy.
2. Replace the onboarding gate and guest-entry flow so users hit add-first onboarding.
3. Rewrite the landing hero and preview so public positioning matches the product direction.

## Summary

The blueprint is directionally correct and largely compatible with the current architecture. The largest blocker is category integrity. After that, the highest-return changes are landing, guest flow, onboarding, and the `/audit` page. Most of the rest is enhancement of existing screens rather than net-new platform work.
