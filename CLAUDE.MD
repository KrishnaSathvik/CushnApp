# SubTrackr — Project Context

## Stack
React 18 + Vite, Tailwind v4 (@tailwindcss/vite), Dexie.js (IndexedDB),
Framer Motion, Vite PWA plugin, React Router v7

## Design Tokens
bg: #000000 | surface: #141414 | elevated: #1C1C1C | border: #27272A
accent: #0D9488 | accentDim: #042F2E | accentLt: #99F6E4
white: #FFFFFF | gray2: #A1A1AA | gray3: #52525B

## Fonts
UI: system-ui | Amounts/data: JetBrains Mono (all currency values)

## Category Colors
entertainment: #F87171 | devtools: #60A5FA | health: #34D399
productivity: #0D9488 | news: #FBBF24 | cloud: #A78BFA

## AI
Model: claude-sonnet-4-6 | Key: VITE_CLAUDE_API_KEY env var
Parse endpoint: /v1/messages | Return JSON only

## Rules
- Never use external icon libraries — inline SVG only
- All money values use JetBrains Mono font
- Dark-first always — no light mode
- Dexie for all data — no localStorage
- Components match wireframe JSX exactly
