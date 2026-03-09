# Public Pages Dashboard Alignment Plan

Date: 2026-03-07

## Goal

Make the public landing and footer/legal pages feel like they belong to the same design system as the dashboard pages while keeping them:

- publicly accessible
- SEO-friendly
- separate from authenticated app navigation
- safe for logged-out users

This is a design-system alignment project, not a routing/auth merge.

## Non-Goals

Do not:

- require login for landing, legal, or contact pages
- show dashboard-only controls like reminders, data-driven app nav, or tab bar on public pages
- turn public pages into copies of dashboard screens
- remove SEO/prerender support for public routes

## Target End State

Public pages should use the same underlying visual primitives as the dashboard:

- same page width and section rhythm
- same title, eyebrow, and subtitle hierarchy
- same reusable card styles
- same button/input/chip behavior
- same spacing scale and corner-radius rules

But public pages should keep public-only behavior:

- `PublicHeader` with login/signup CTA
- `PublicFooter` with legal/footer links
- public routes in `src/App.jsx`
- prerender support in `src/prerender/PublicRoutes.jsx`

## Strategy

Use a **shared primitive layer** rather than trying to reuse the dashboard shell directly.

Reason:

- the dashboard shell in `src/App.jsx:68` assumes authenticated navigation via `DashboardHeader` and `TabBar`
- public pages need a different top/bottom shell
- the design mismatch is mostly in primitives and layout contracts, not in route protection

So the implementation should:

1. extract dashboard page primitives into reusable public-safe styles/components
2. apply those primitives to landing/legal/footer surfaces
3. keep public routing and public navigation distinct

## Proposed Architecture

### 1. Introduce a shared page-shell layer

Create shared layout utilities/components for both app and public pages, for example:

- `src/components/layout/PageShell.jsx`
- `src/components/layout/PageSection.jsx`
- `src/components/layout/PageIntro.jsx`

Responsibilities:

- shared max-width behavior
- shared section spacing
- shared mobile/desktop padding
- optional background treatments

This should absorb the current split between:

- `PUBLIC_LAYOUT` in `src/lib/publicLayout.js`
- `.dashboard-container` and related layout classes in `src/index.css:421`

Recommended direction:

- keep one canonical content width token
- keep one canonical horizontal page padding rule
- expose variants like `wide`, `default`, `narrow`

### 2. Introduce shared public-safe surface components

Create reusable components that mirror dashboard styling but do not depend on auth state:

- `AppHeroCard`
- `AppSurfaceCard`
- `AppMutedCard`
- `AppSectionLabel`
- `AppPageHeading`

These should map directly to the dashboard visual language defined in:

- `src/index.css:460`
- `src/index.css:469`
- `src/index.css:478`
- `src/index.css:486`
- `src/index.css:493`
- `src/index.css:500`

This removes the current dependence on bespoke inline styling in:

- `src/screens/LandingPage.jsx`
- `src/screens/LegalPage.jsx`

### 3. Keep separate shell components for public and authenticated routes

Do not merge `PublicHeader` with `DashboardHeader`.

Instead:

- keep `PublicHeader`
- keep `PublicFooter`
- visually restyle them to use the same component primitives as the dashboard

Public header should remain public-specific because it has different navigation goals:

- feature links
- login/signup CTA
- no app section nav
- no reminders flyout

### 4. Remove landing variants after migration

The current variant split in `src/screens/LandingPage.jsx:1544` and `src/lib/landingVariant.js:1` increases design drift.

Recommended plan:

- migrate `template-v1` to the shared primitives first
- verify parity
- remove `legacy`
- delete `landingVariant.js` once no longer needed

## Implementation Phases

## Phase 1: Create shared primitives

### Scope

- define shared page container/padding rules
- define shared heading/text primitives
- define shared card primitives
- define shared action/button surface variants if needed

### Files likely affected

- `src/index.css`
- new shared layout/components files under `src/components/`
- `src/lib/publicLayout.js` or its replacement

### Deliverables

- one shared content width system
- one shared page intro pattern
- reusable hero/surface/muted card primitives

### Acceptance criteria

- public pages can render dashboard-style cards without one-off duplicated style blocks
- public pages no longer need separate title sizing constants like `PUBLIC_TYPE.heroTitle`
- dashboard pages can continue using existing classes without visual regression

## Phase 2: Align `PublicHeader`

### Scope

Restyle `PublicHeader` so it visually matches dashboard chrome more closely while remaining public.

### Changes

- keep sticky blurred top bar
- align internal spacing to the same content container as dashboard pages
- reuse dashboard nav pill/button styles where appropriate
- convert auth CTAs into the same button system used elsewhere

### Keep as-is behaviorally

- features link
- login
- create account
- mobile menu

### Acceptance criteria

- public and dashboard headers feel like sibling shells from one system
- public header still has no dependency on auth-only data

## Phase 3: Rebuild landing page using dashboard primitives

### Scope

Refactor `src/screens/LandingPage.jsx` to use the shared layout and surface components.

### Changes

- replace bespoke hero container with `hero-card`-style composition
- use `page-eyebrow`, `page-title`, `page-subtitle` or shared equivalents
- restyle feature cards to use `surface-card`
- restyle CTA block to use the same card and section spacing logic
- reduce arbitrary radii/padding values in inline styles

### Important constraint

The landing page should still read like a public marketing/product page, not like the signed-in home dashboard.

That means:

- reuse the system
- do not copy dashboard content structure

### Acceptance criteria

- landing page visually matches dashboard primitives in spacing, headings, and card styling
- landing page remains fast to scan for a new user
- public CTA flow remains unchanged

## Phase 4: Rebuild legal/contact pages using the same primitives

### Scope

Refactor `src/screens/LegalPage.jsx`.

### Changes

- use the same page intro pattern as dashboard pages
- convert section wrappers to shared surface cards
- align form fields and buttons with app control styling
- align section spacing and max width with shared shell rules

### Acceptance criteria

- privacy, terms, and contact pages no longer feel like a separate mini-site
- legal readability remains strong
- contact form remains public and functional

## Phase 5: Redesign `PublicFooter` to feel app-native

### Scope

Keep the footer public, but bring it into the dashboard visual language.

### Changes

- use a constrained app-style container
- align spacing and typography to section-label / mono utility rules
- optionally wrap footer content in a subtle `surface-card` or muted surface
- keep legal/GitHub links and copyright

### Important constraint

Do not introduce app tab bar patterns here. This remains a website footer, just in the same system.

### Acceptance criteria

- footer no longer feels disconnected from the rest of the app
- footer remains lightweight and clearly public-facing

## Phase 6: Remove legacy drift sources

### Scope

- retire `legacy` landing variant
- remove dead layout constants no longer needed
- reduce inline styling duplication

### Acceptance criteria

- one landing implementation
- one public page system
- lower maintenance risk

## Technical Recommendations

### Recommendation 1: Prefer shared CSS/component primitives over giant style objects

Current public pages rely heavily on inline styles. That makes dashboard alignment fragile.

Preferred direction:

- shared classes in `src/index.css`
- thin wrapper components for common page structures
- inline styles only for truly unique art-direction pieces

### Recommendation 2: Create public-safe heading primitives

The dashboard hierarchy is already clear and reusable.

Build a public-safe abstraction for:

- eyebrow
- title
- subtitle

Then use it in:

- landing hero
- legal page intro
- auth pages if desired later

### Recommendation 3: Keep SEO/public rendering untouched

Public pages are currently directly routed in `src/App.jsx` and supported by `src/prerender/PublicRoutes.jsx`.

Any refactor should preserve:

- route paths
- rendered public HTML structure
- SEO metadata behavior

### Recommendation 4: Use the dashboard system selectively

Reuse:

- containers
- type hierarchy
- card primitives
- controls
- spacing scale

Do not reuse:

- reminder dropdown
- app section nav
- tab bar
- signed-in workflow assumptions

## Suggested File Plan

### New files

- `src/components/layout/PageShell.jsx`
- `src/components/layout/PageIntro.jsx`
- `src/components/ui/AppSurfaceCard.jsx`
- `src/components/ui/AppHeroCard.jsx`

### Existing files to refactor

- `src/index.css`
- `src/components/PublicHeader.jsx`
- `src/components/PublicFooter.jsx`
- `src/screens/LandingPage.jsx`
- `src/screens/LegalPage.jsx`

### Existing files to simplify or remove later

- `src/lib/publicLayout.js`
- `src/lib/landingVariant.js`

## Rollout Order

Recommended execution order:

1. Build shared primitives in CSS/components.
2. Migrate `PublicHeader`.
3. Migrate legal/contact pages first.
4. Migrate landing page.
5. Migrate `PublicFooter`.
6. Remove legacy landing variant and obsolete layout constants.

Reason:

- legal/contact pages are lower-risk than landing hero redesign
- landing page should be migrated only after primitives are proven

## QA Checklist

- Public routes still open while logged out:
  - `/landing`
  - `/privacy`
  - `/terms`
  - `/contact`
- Logged-in redirect behavior for `/landing`, `/login`, `/signup` still works as intended.
- Public header mobile menu still works.
- Footer links still work.
- Contact mailto flow still works.
- Prerendered public pages still render.
- No dashboard-only controls appear on public pages.
- Visual comparison against dashboard shows matching:
  - spacing rhythm
  - heading hierarchy
  - surface/card styling
  - button/input styling
  - container width behavior

## Risks

### Risk 1: Overfitting public pages to dashboard density

If the public pages become too operational, they may feel less approachable for first-time visitors.

Mitigation:

- align primitives, not content density

### Risk 2: Regression from landing variant logic

The current variant system can hide inconsistent states.

Mitigation:

- remove `legacy` after migration

### Risk 3: CSS regressions on dashboard pages

If shared classes are changed carelessly, existing app screens could regress.

Mitigation:

- add new shared abstractions first
- migrate public pages onto them
- only consolidate dashboard classes after visual verification

## Definition of Done

This project is done when:

- public pages remain public
- public pages clearly match the dashboard design system
- header/footer/public screens still serve public conversion and legal needs
- landing design drift from dashboard is materially reduced
- `legacy` landing implementation is removed
