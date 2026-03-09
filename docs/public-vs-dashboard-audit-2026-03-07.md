# Public vs Dashboard Design Audit

Date: 2026-03-07

## Scope

This audit compares:

- Landing and footer pages: `src/screens/LandingPage.jsx`, `src/screens/LegalPage.jsx`, `src/components/PublicHeader.jsx`, `src/components/PublicFooter.jsx`
- Dashboard pages: `src/components/DashboardHeader.jsx`, `src/screens/HomeScreen.jsx`, `src/screens/AnalyticsScreen.jsx`, `src/screens/BudgetScreen.jsx`
- Shared design system primitives: `src/index.css`, `src/lib/publicLayout.js`, `src/App.jsx`

## Executive Verdict

The landing/footer pages are **not the same as the dashboard pages** in design implementation.

They do share the same base theme tokens:

- Same color token family and theme model in `src/index.css`
- Same `Manrope` + `JetBrains Mono` typography stack
- Same glassy dark/light semantic palette
- Same logo, accent color, border treatment, and rounded geometry direction

But they diverge materially in:

- layout system
- card shapes and spacing scale
- header/navigation behavior
- typography hierarchy
- component language
- density and page rhythm

Current state is best described as:

- **same brand / same token system**
- **different page systems**

## What Matches

### 1. Shared tokens and brand palette

Public and dashboard surfaces pull from the same semantic token model in `src/index.css:5` and light-mode overrides in `src/index.css:99`.

Shared foundations include:

- `--color-bg-base`, `--color-bg-surface`, `--color-bg-elevated`
- `--color-accent-primary` teal accent
- shared foreground and border tokens
- shared radii model
- shared `Manrope` and `JetBrains Mono` fonts

This means the **color family and general brand mood are aligned**.

### 2. Shared sticky top bar treatment

Both headers use:

- sticky positioning
- blurred translucent background
- bottom border
- same logo lockup

Public header: `src/components/PublicHeader.jsx:17`

Dashboard header: `src/components/DashboardHeader.jsx:51`

So at a high level the app feels related across public and authenticated views.

### 3. Shared surface vocabulary

Both public and dashboard pages use:

- dark/elevated surfaces
- thin borders
- rounded cards
- mono eyebrow/status text
- teal accent for primary emphasis

Examples:

- public hero/mock panel in `src/screens/LandingPage.jsx:1115`
- legal hero card in `src/screens/LegalPage.jsx:180`
- dashboard surface card rules in `src/index.css:486`
- dashboard hero card rules in `src/index.css:500`

## What Does Not Match

### 1. Layout systems are different

Public pages use their own width and spacing constants from `src/lib/publicLayout.js:1`.

Key public widths:

- `maxWidthWide: 1100`
- `maxWidth: 1040`
- `legalMaxWidth: 980`
- fixed page padding `24px`

Dashboard pages use a separate shell in `src/index.css:415` and `src/index.css:421`:

- `dashboard-page`
- `dashboard-container`
- width `min(calc(100% - 32px), var(--page-max))`
- persistent bottom padding for the app tab bar

Impact:

- public pages feel like marketing/legal documents
- dashboard pages feel like an app workspace

These are intentionally different layouts, not one unified page framework.

### 2. Typography hierarchy is not the same

Dashboard pages rely on reusable title classes:

- `page-eyebrow` in `src/index.css:460`
- `page-title` in `src/index.css:469`
- `page-subtitle` in `src/index.css:478`

Used in:

- `src/screens/HomeScreen.jsx:180`
- `src/screens/AnalyticsScreen.jsx:79`
- `src/screens/BudgetScreen.jsx:132`

Public pages do not consistently use that same type system. They use separate public sizing:

- `PUBLIC_TYPE.heroTitle` in `src/lib/publicLayout.js:10`
- landing hero title in `src/screens/LandingPage.jsx:1065`
- legal page title in `src/screens/LegalPage.jsx:217`

Impact:

- dashboard typography is tighter, more systematic, and app-like
- public typography is looser and more bespoke

### 3. Card geometry and spacing scale differ

Dashboard cards are standardized:

- `surface-card` radius `var(--radius-card)` in `src/index.css:486`
- `hero-card` radius `var(--radius-hero)` in `src/index.css:500`
- `stat-grid`, `split-grid`, `pill-group`, `segmented-control` in `src/index.css:512`, `src/index.css:579`, `src/index.css:563`, `src/index.css:592`

Public cards are mostly inline-styled with different radii and spacing values:

- hero panel radius `14` in `src/screens/LandingPage.jsx:1118`
- feature card radius `12` in `src/screens/LandingPage.jsx:1409`
- CTA container radius `14` in `src/screens/LandingPage.jsx:1465`
- legal cards radius `12` and `14` in `src/screens/LegalPage.jsx:183`, `src/screens/LegalPage.jsx:253`, `src/screens/LegalPage.jsx:291`

Impact:

- public surfaces are visually adjacent to dashboard cards
- they are not built from the same reusable component contract

### 4. Header/navigation patterns diverge strongly

Public header:

- only exposes marketing nav and auth CTA actions
- desktop link list is minimal
- mobile menu expands into a simple stacked panel

Reference: `src/components/PublicHeader.jsx:56`, `src/components/PublicHeader.jsx:70`, `src/components/PublicHeader.jsx:114`

Dashboard header:

- exposes app section navigation
- uses pill-style active nav treatment
- includes notifications flyout
- changes based on guest state and reminders data

Reference: `src/components/DashboardHeader.jsx:75`, `src/components/DashboardHeader.jsx:87`, `src/components/DashboardHeader.jsx:99`, `src/components/DashboardHeader.jsx:134`

Impact:

- same chrome language at the very top
- different navigation design language after that

### 5. Public footer has no dashboard equivalent

The public footer is a centered legal/footer block in `src/components/PublicFooter.jsx:15`.

Dashboard pages do not have a comparable footer. Instead, the authenticated shell uses:

- `DashboardHeader`
- `TabBar`
- `InstallBanner`

Reference: `src/App.jsx:78`, `src/App.jsx:111`

Impact:

- public flow ends like a website
- dashboard flow ends like a mobile-first application shell

This is one of the clearest signs they are not the same page system.

### 6. Information density is different

Dashboard pages are dense and utilitarian:

- metrics
- charts
- filters
- search
- grouped data
- inline status chips

Examples:

- home dashboard command-center block in `src/screens/HomeScreen.jsx:197`
- analytics segmented control and charts in `src/screens/AnalyticsScreen.jsx:86` and `src/screens/AnalyticsScreen.jsx:125`
- budget editor plus live progress in `src/screens/BudgetScreen.jsx:136` and `src/screens/BudgetScreen.jsx:242`

Public pages are lighter and more presentational:

- hero messaging
- feature cards
- CTA block
- legal text sections
- contact form

Examples:

- landing hero in `src/screens/LandingPage.jsx:1033`
- features grid in `src/screens/LandingPage.jsx:1376`
- legal section cards in `src/screens/LegalPage.jsx:247`

Impact:

- same theme, different product posture

### 7. Public pages still use more bespoke inline styling

Dashboard pages are more standardized around CSS utility classes and shared component classes.

Public pages still lean heavily on one-off inline styles for:

- spacing
- radii
- grid behavior
- card treatment
- title sizing

This is visible throughout `src/screens/LandingPage.jsx` and `src/screens/LegalPage.jsx`.

Impact:

- public pages are harder to guarantee as exact matches to dashboard visual conventions
- drift risk is higher over time

### 8. Landing has variant-based implementation, which increases drift risk

`src/screens/LandingPage.jsx:1544` switches between `LegacyLandingPage` and `TemplateLandingV1`, driven by `src/lib/landingVariant.js:1`.

Impact:

- there are effectively two landing implementations
- public/dashboard consistency can drift further depending on the active variant

Even if `template-v1` is closer to the dashboard tone, the presence of `legacy` means the public side is not a single locked system.

## Category-by-Category Assessment

| Category | Match Level | Notes |
| --- | --- | --- |
| Brand identity | High | Same logo, fonts, accent, border language |
| Colors | High | Same token palette and theme model |
| Typography system | Medium-Low | Same fonts, different sizing and hierarchy contracts |
| Layout framework | Low | Public uses `PUBLIC_LAYOUT`; dashboard uses `dashboard-container` shell |
| Header styling | Medium | Same sticky blur shell, different nav behavior and controls |
| Card system | Medium-Low | Similar visual feel, different radii/spacing/componentization |
| Interaction patterns | Low | Public is CTA/link-driven; dashboard is tool/workflow-driven |
| Footer treatment | Very Low | Exists only on public pages |
| Information density | Low | Dashboard is far more dense and operational |
| Maintainability of consistency | Low-Medium | Public pages use more bespoke inline styling and variant switching |

## Conclusion

If the question is "Are the landing/footer pages the same as the dashboard pages in design/style/layout/colors/everything?"

The answer is:

- **Colors and core brand tokens: mostly yes**
- **Design system implementation and page structure: no**
- **Layouts, page rhythm, navigation model, and component behavior: no**

So the public pages are **brand-aligned but not system-matched** to the dashboard.

## Recommended Follow-Up

If the goal is to make public pages feel truly "same as dashboard," the highest-value fixes are:

1. Move public pages onto the same reusable page primitives as dashboard pages.
2. Replace bespoke public card styling with shared `surface-card` / `hero-card` variants.
3. Align public title/eyebrow/subtitle styles to the dashboard text hierarchy.
4. Introduce a shared shell contract for max width, spacing, and section rhythm.
5. Remove or retire the legacy landing variant so public design has one source of truth.

If the goal is only "same brand, different product context," the current implementation is acceptable, but it should be documented as intentional rather than assumed to be unified.
