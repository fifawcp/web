# Project Rules: World Cup Pick'em

This document serves as the source of truth for AI instructions and developer standards for the World Cup Pick'em platform.

## 1. Core Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS (Mobile-first)
- **Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React
- **Validation:** Zod + React Hook Form
- **Testing:** Vitest + React Testing Library
- **State Management:** Zustand

## 2. Architectural Guidelines

- **Server-First:** Default to React Server Components (RSC). Use `'use client'` strictly for interactivity (forms, mutations, filter state, anything DOM-bound).
- **Data Fetching:** Server reads via `fetch` with `next: { revalidate, tags: [...] }`. Client reads via TanStack Query seeded from the server through `initialData`. Mutations go through Route Handlers, not Server Actions. Never load initial data from a client `useEffect`.
- **Project Structure:**
  - `src/app`: Routes, layouts, and Route Handlers (`route.ts`).
  - `src/features/<feature>`: Feature-scoped modules.
    - `api/`: Typed fetchers + cache tags (e.g. `MATCHES_CACHE_TAG`).
    - `components/`: Mostly JSX. Sub-components inline only when tightly coupled to layout.
    - `hooks/`: Every `use*` hook.
    - `lib/`: Pure helpers (formatters, predicates, derivations).
    - `types/`: Feature-specific interfaces.
  - `src/shared`: Cross-feature primitives — `shared/components/ui` (shadcn base, do not edit), `shared/lib/api`, `shared/lib/query`.
  - `src/lib`: Cross-feature utilities not specific to any feature.
  - `i18n/messages/<feature>/{en,es}.json`: Feature-scoped translations, registered in `i18n/request.ts`.

### 2.1 Feature Patterns

Established with `/schedule`. Apply to every new feature unless there's a specific reason not to.

- **Pure helpers in `lib/`.** Any function that survives without its component (formatter, predicate, derivation) belongs there — even one-liners if they're shared or name a non-obvious operation.
- **Custom hooks in `hooks/`.** Non-trivial `useEffect` / `useMemo` chains become named hooks. Combined hooks returning `[value, setValue]` tuples (like `useState`) read most naturally at call sites.
- **Single-responsibility components.** A file holds JSX, its props, and only the sub-components that lose meaning when split out. Layout-coupled bits stay inline; reusable bits move to their own file.
- **Pure UI-state derivation.** Functions like `computeMatchUiState` return raw booleans (`isLocked`, `hasPick`). Callers derive their own badge / icon / text. The lib doesn't know about rendering.
- **Variant prop, not duplicate components.** Mobile/desktop renderings of the same control take a `variant: "chip" | "stacked"` (or similar) prop. One source of truth, no duplicated wiring.
- **URL-driven UI state.** Filters and selectable views live in the URL. Read via `useSearchParams`, write via `router.replace(qs, { scroll: false })`. Mobile drawers and desktop bars share the same write path — no draft state, no apply button.
- **Skeletons mirror real layout 1:1.** Same containers, widths, `min-h`. Use the actual `<Card>` wrappers when possible to avoid hydration shift.
- **CSS variables for layout offsets.** Sticky stacks (header + filter bar + section gap) compose into one var in `globals.css` (e.g. `--schedule-scroll-offset`), referenced via `scroll-mt-(--var)` or `top-(--var)`. One knob, change once.
- **Fixed-width chips for filter bars.** Pre-size each chip for the longest "Label: Value" combo across locales so value changes never reflow the bar.
- **Shared timers.** Multiple timed components (countdowns, pollers) subscribe to one module-level interval through a subscribers `Set`. Auto-start on first mount, auto-stop on last unmount. Don't spin up N intervals.

### 2.2 Cache Invalidation Pattern

For mutations whose effects must be visible after the next RSC navigation:

1. Tag the server fetch: `serverApi.get<T>(url, { next: { revalidate, tags: [FEATURE_CACHE_TAG] } })`.
2. Optimistic mutation in TanStack Query: `onMutate` writes to cache, `onError` rolls back, success does nothing. The optimistic value is treated as the new server state.
3. Add a Route Handler at `src/app/api/<resource>/.../route.ts` that proxies the upstream call and on success calls `revalidateTag(FEATURE_CACHE_TAG, { expire: 0 })`. The `{ expire: 0 }` is required for Next 16's legacy fetch cache (see `app/api/matches/[id]/pick/route.ts` for the canonical example).
4. In `next.config.ts`'s rewrites, exclude that path from the catch-all upstream proxy with a negative-lookahead pattern so the Route Handler runs before the rewrite would swallow it.

## 3. Pick'em Domain Logic

- **Time Handling:** All match times must be stored/processed in UTC. Convert to user's local time only at the edge (UI).
- **Match Locking:** Picks lock exactly at kickoff, mirroring the API. UI must disable the picker at `match.kickoff_at` (no pre-kickoff buffer).
- **Tournament Simulation:** Logic for bracket progression must be deterministic.

## 4. Design & UI Standards

- **Theme:** Clean, neutral, shadcn-style minimalism. Use the `background`/`foreground`/`muted`/`card`/`border` tokens for layout surfaces — no colorful page-background gradients. Reserve `wc-*` for branded touches (logo, occasional CTAs). Use `lime-*` as the success/picked accent (CTA "Tap to pick", "Picked" badge) so the action and its confirmed state share a color story. Always support dark and light modes.
- **Radius hierarchy:** Radius encodes role, not just visual variety. A child surface always uses a *smaller* radius than its parent so it visually nests inside instead of competing with the parent's outline.
  - `rounded-xl` — top-level surfaces (Card, Dialog, Drawer, full-card click targets)
  - `rounded-lg` — decorative containers nested in cards (icon holders, status pills, stat tiles)
  - `rounded-md` — interactive form controls (Button, Input, Select, filter triggers)
  - `rounded-full` — identity primitives (avatars, indicator dots, drawer handle)

  Avoid `rounded-xl` on small elements inside a card — at 40px it reads as ~35% radius and echoes the card's own corner.
- **Hover surfaces:** All hover backgrounds use `bg-muted` (and `dark:hover:bg-muted` where the dark variant doesn't inherit). Never overlay with opacity (`hover:bg-muted/40`, `/60`, etc.) — drift across components produced 3 different "hover gray" shades that almost matched but didn't. The `--muted` token is the canonical hover surface; let it speak at full opacity.
- **Responsiveness:** The "Pick'em Grid" must be highly optimized for mobile devices (touch-friendly targets).
- **States:** Always implement Loading (Suspense), skeleton loaders, and Error Boundary states for match data. Skeletons mirror the real layout 1:1 — see §2.1.
- **Feedback:** Use `sonner` or shadcn `Toast` for successful pick submissions.
- **i18n:** Every visible string goes through `next-intl`. Translations live in `i18n/messages/<feature>/{en,es}.json`. Delete unused keys during the same change that orphans them — do not keep "just in case." Spanish should be idiomatic and concise (verb-first CTAs like "Pronostica", not literal translations like "Toca para pronosticar").

## 5. Coding Standards

- **TypeScript:** No `any` or `unknown`. Define interfaces for Match, User, Pick, and Group.
- **Naming:** - Components: PascalCase (`MatchCard.tsx`)
  - Hooks: camelCase (`useMatchLock.ts`)
  - Server Actions: `action.ts` files within feature folders.
- **Tailwind:** Avoid arbitrary values; use the theme's spacing and color tokens.
- **Performance:** Use `useMemo` and `useCallback` for expensive calculations. Implement proper loading states.
- **Accessibility:** Ensure all interactive elements are keyboard navigable and have proper ARIA labels.

- Instead of "bg-gradient-to-r" use "bg-linear-to-r"

## 6. Git & Workflow

- **Commits:** Conventional Commits (e.g., `feat(ui): add knockout bracket view`).
- **Safety:** Never hardcode API keys or database strings; use `.env.local`.
