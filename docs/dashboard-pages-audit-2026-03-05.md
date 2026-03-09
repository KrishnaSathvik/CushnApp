# Dashboard Pages Audit

Date: March 5, 2026
Scope: `Home`, `Add`, `Analytics`, `Calendar`, `Budget`
Codebase: `src/screens/*`, related hooks/components/services

## Audit Method
- Code review of screen logic, hooks, and shared row/components.
- Static validation with `npm run build` and `npm run test`.
- Lint check with `npm run lint` (noting non-scope failures).

## Validation Snapshot
- Build: Pass
- Tests: Pass (`46/46`)
- Lint: Fails, but in non-dashboard file:
  - `docs/SubTrackr_Auth.jsx` unused vars (`no-unused-vars`)

## Executive Summary
Dashboard core flows are implemented and generally functional:
- View and manage subscriptions from Home.
- Add via AI text, manual entry, and voice transcription.
- Analyze spend by category.
- View renewals in a calendar projection.
- Set and track a monthly budget.

Main correctness/quality gaps are concentrated in analytics period behavior, currency handling during add flow, and missing budget granularity controls (category limits exist in model but not UI).

---

## Page-by-Page Audit

## 1) Home (`src/screens/HomeScreen.jsx`)

### Implemented
- Sticky header with search toggle + settings entry.
- Monthly budget hero gauge (`ArcGauge`) using current spend vs monthly goal.
- Quick stats: active count, annual projection, next renewal days.
- Grouping toggle: by bill type or by category.
- Group expand/collapse with per-group monthly totals.
- Row-level actions via `SubscriptionRow`: open detail, delete, pause, duplicate.
- Empty-state with CTA to Add.

### Working
- Group computation and sorting by nearest renewal day.
- Amount normalization for group totals and annual projection.
- Search filtering by subscription name.
- Actions call data service through hooks and refresh state.

### Broken / Risky
- No explicit "no results" state when search filters to zero but subscriptions exist.
  - UX appears empty with no explanation.

### Not Implemented (but implied/useful)
- Search by category, notes, cycle (currently name-only).
- Overdue section (negative `daysUntilRenewal`) separated from upcoming.
- Quick filters (active/paused/type) beyond group toggle.

### Redundancy / Repetition
- Spend is shown in multiple layers (gauge, quick stats, group totals, row amounts). Not incorrect, but dense.
- Could reduce cognitive load by keeping one summary area expanded by default.

---

## 2) Add (`src/screens/AddScreen.jsx`)

### Implemented
- Mode switch: AI text input and manual entry.
- Voice input route (`VoiceInput`) and transcript append back into text mode.
- AI parse pipeline with fallback local parser.
- Parsed confirmation sheet with edit/remove before commit.
- Manual form with name, amount, cycle, category, renewal date, notes.

### Working
- Parse endpoint fallback to local parser is operational.
- Multi-item parsed confirmation and batch add to store.
- Auto-category inference in manual mode unless user manually overrides.

### Broken / Risky
- Currency handling on add is hardcoded to `DEFAULT_CURRENCY` (`USD`) for both parsed and manual saves.
  - Ignores selected app currency.
- Parse failure / empty parse has no user-facing error state.
  - Console logs exist, but UI does not guide recovery.
- Input history storage exists (`HISTORY_KEY`) but no history UI is rendered.
  - Partial implementation; dead-end feature from user perspective.

### Not Implemented
- Biweekly cycle selection is removed in UI (`filter(c => c !== 'biweekly')`) even though model supports it.
- Duplicate prevention at submit time (only warning in confirmation sheet).

### Redundancy / Repetition
- Billing cycle controls appear in both manual form and confirmation editor.
  - Expected, but same UI logic is duplicated in two places.

---

## 3) Analytics (`src/screens/AnalyticsScreen.jsx`)

### Implemented
- Monthly/annual period toggle.
- Hero total display.
- Category donut chart and breakdown list.
- Bottom callouts: highest spend category and avg per subscription.

### Working
- Category spend computation based on active subscriptions.
- Donut + progress bars render correctly with category colors.
- Monthly projection from annual total displayed in monthly mode.

### Broken / Incorrect
- Period toggle is only partially applied:
  - Hero total switches monthly/annual, but category breakdown remains monthly-normalized.
  - "Highest Spend" and "Avg Per Sub" remain `/mo` even in annual mode.
- This creates inconsistent analytics semantics in annual view.

### Not Implemented
- Trend over time (month-over-month, rolling 3/6/12 months).
- Drilldown by cycle/provider and export of analytics insights.
- Period-aware breakdown recalculation (monthly vs annual per category).

### Redundancy / Repetition
- Same spend info appears as hero + category totals + callouts.
- Could keep hero + one supporting panel, collapse secondary cards on smaller screens.

---

## 4) Calendar (`src/screens/CalendarScreen.jsx`)

### Implemented
- Month navigation and day grid.
- Renewal projection by cycle (monthly/annual/quarterly/weekly).
- Dot indicators by bill type color.
- Selected day detail list.
- Upcoming-this-month summary when no day selected.

### Working
- Projection logic across months and cycles is present and substantial.
- Weekly recurrence supports multiple occurrences in a month.
- Row actions (open/pause/delete) are available in detail lists.

### Broken / Risky
- Upcoming list can include same weekly subscription multiple times in one month.
  - May be intended, but keys use `s.id` only in mapped rows, which risks duplicate React keys for repeated weekly entries.
- Month total uses raw `sub.amount` per occurrence from projected map.
  - For weekly this reflects per-occurrence dues (reasonable), but semantics should be explicitly labeled as "due this month" to avoid confusion with normalized monthly spend.

### Not Implemented
- Filters by category/type/status.
- Toggle between "calendar view" and "agenda view" with grouped dates.
- Visual marker for paused subscriptions in historical/future context.

### Redundancy / Repetition
- Selected-day rows and "upcoming this month" rows reuse same row representation with minimal differentiation.

---

## 5) Budget (`src/screens/BudgetScreen.jsx`)

### Implemented
- Monthly budget goal editor (+/- and direct input).
- Save action with persisted budget via hook/service.
- Budget usage bar with color state thresholds.
- Over-budget warning.
- Category spending cards with percentage of budget.

### Working
- Budget save/refresh flow works via `useBudget`.
- Monthly spend percentages update off `monthlyTotal`.
- Category-level spend uses normalized monthly amounts.

### Broken / Risky
- None critical in current primary flow.

### Not Implemented
- Category budget limits UI/logic.
  - Data model supports `category_limits`, but dashboard does not expose controls/enforcement.
- Budget scenario planning (e.g., projected with pending adds/pauses).
- Historical budget adherence trends.

### Redundancy / Repetition
- Similar category spend presentation is also in Analytics (different context, but overlaps heavily).

---

## Cross-Page Findings

## Implemented and Working
- Core CRUD and derived totals via `useSubscriptions` / `dataService`.
- Guest/local and authenticated/cloud data paths.
- Pause and delete actions available from multiple list surfaces.
- Shared currency formatting and amount normalization utilities.

## Broken / Inconsistent (Priority)
1. Analytics annual mode inconsistency (hero annual vs monthly breakdown/callouts).
2. Add flow currency hardcoded to USD instead of selected currency.
3. Add flow parse failure lacks user-facing error/empty-result guidance.
4. Calendar weekly repeated entries may cause duplicate key warnings in upcoming list.

## Not Implemented (Model/UI Gap)
1. Category budget limits (persisted field exists, no dashboard controls).
2. Biweekly cycle in add/edit UI despite backend/model support.
3. Input history recall in Add page (data is stored but not surfaced).

## Potential Redundant Data/Sections
- Home and Analytics both provide category and spend-heavy summaries with overlapping intent.
- Budget and Analytics both include category breakdowns without a distinct framing difference.
- Calendar detail and upcoming lists can feel repetitive depending on selected day behavior.

---

## Recommended Enhancements (Prioritized)

## P0 (Correctness)
1. Fix analytics period semantics:
   - Recompute category breakdown, highest spend, and avg per sub based on selected period.
   - Update labels (`/mo` vs `/yr`) accordingly.
2. Respect selected currency in Add screen:
   - Use `useSettings().currency` for both manual and parsed adds.
3. Add parse error/empty-result UX:
   - Inline error banner and "Try example" recovery action.

## P1 (Product Quality)
1. Implement category budget limits in Budget page (create/edit/remove limits, over-limit indicators).
2. Add biweekly cycle back into UI controls where model supports it.
3. Add "No results" state on Home search.
4. Resolve weekly-duplicate key risk in Calendar upcoming list (composite key with day + id).

## P2 (Experience / Clarity)
1. Distinguish Analytics vs Budget purpose:
   - Analytics = insight/trends, Budget = control/thresholds.
2. Add trend sparkline/history in Analytics and Budget.
3. Expose Add input history chips/recents (feature already partially wired).
4. Add calendar filters (type/category/status).

---

## Proposed Next Implementation Plan
1. Correctness sprint (P0) in one PR.
2. Budget limits + biweekly support (P1) in second PR.
3. UX clarity + history/trends/filter enhancements (P2) in third PR.


---

## Status Update (March 5, 2026)

This section reflects implementation progress after the initial audit.

### Resolved Since Initial Audit
- P0 completed:
  - Analytics period consistency fixed (annual/monthly now applied across breakdown + callouts).
  - Add flow now saves with selected app currency (no hardcoded USD).
  - Add flow now shows parse empty/error notices.
- P1 completed:
  - Category budget limits UI implemented and persisted via `budget.categoryLimits`.
  - Biweekly cycle restored in Add, ConfirmationSheet, and SubscriptionDetail.
  - Home search now has explicit no-results state.
- P2 completed:
  - Add page input history surfaced as clickable recent chips with clear action.
  - Calendar filters added (status/type/category).
  - Calendar now supports `Calendar` and `Agenda` modes.
  - Analytics and Budget gained short-term projection visualizations.
  - Duplicate-key risk reduced in Calendar upcoming list by using composite keys.

### Current Validation
- Build: Pass
- Tests: Pass (`46/46`)
- Lint: Fails only in non-dashboard documentation file:
  - `docs/SubTrackr_Auth.jsx` (unused vars)

### Remaining Improvements (Optional / Future)
1. Strengthen distinction between Analytics and Budget with deeper IA:
   - Analytics focused on trends and drivers.
   - Budget focused on controls, limits, and variance actions.
2. Add richer historical trend source (persisted monthly snapshots) instead of projection-only bars.
3. Calendar UX polish:
   - Quick preset filters (e.g., due in 7 days, utilities only).
   - Better past-vs-upcoming visual separation in agenda mode.
4. Add page UX polish:
   - Per-item history deletion.
   - “Reuse & parse” action with one tap from history chips.

