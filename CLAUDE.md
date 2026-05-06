# Project Rules: World Cup Pick'em

This document serves as the source of truth for AI instructions and developer standards for the World Cup Pick'em platform.

## 1. Core Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict)
- **Styling:** Tailwind CSS (Mobile-first)
- **Components:** shadcn/ui (Radix UI)
- **Icons:** Lucide React (ONLY - never use inline SVG or other icon libraries)
- **Validation:** Zod + React Hook Form
- **Testing:** Vitest + React Testing Library
- **State Management:** Zustand

## 2. Architectural Guidelines

- **Server-First:** Default to React Server Components (RSC). Use `'use client'` strictly for interactive elements (buttons, forms, real-time filters).
- **Data Fetching:** Use `fetch` with Next.js caching or Server Actions for mutations. Avoid client-side `useEffect` for initial data loading.
- **Project Structure:**
  - `src/app`: Routes and layouts.
  - `src/components/ui`: Base shadcn components (do not edit directly).
  - `src/components/features`: Feature-specific logic (e.g., `ScoreGrid`, `BracketCard`).
  - `src/lib`: Shared utilities, database clients, and constants.
  - `src/types`: Centralized TypeScript interfaces.

## 3. Pick'em Domain Logic

- **Time Handling:** All match times must be stored/processed in UTC. Convert to user's local time only at the edge (UI).
- **Match Locking:** Implement a strict "Lock Time" check. Picks must be disabled 5 minutes before kick-off.
- **Scoring Engine:** Centralize scoring logic in `src/lib/scoring.ts` to ensure consistency between the leaderboard and user profiles.
- **Tournament Simulation:** Logic for bracket progression must be deterministic.

## 4. Design & UI Standards

- **Theme:** Maintain a professional sports-dashboard aesthetic, always define dark and light modes.
- **Responsiveness:** The "Pick'em Grid" must be highly optimized for mobile devices (touch-friendly targets).
- **States:** Always implement Loading (Suspense), skeleton loaders, and Error Boundary states for match data.
- **Feedback:** Use `sonner` or shadcn `Toast` for successful pick submissions.
- **Language:** Ensure all text is in English and spanish, dont forget tu use i18n.

## 5. Coding Standards

- **TypeScript:** No `any` or `unknown`. Define interfaces for Match, User, Pick, and Group.
- **Naming:**
  - Components: PascalCase (`MatchCard.tsx`)
  - Hooks: camelCase (`useMatchLock.ts`)
  - Server Actions: `action.ts` files within feature folders.
- **Tailwind:** Avoid arbitrary values; use the theme's spacing and color tokens.
- **Performance:** Use `useMemo` and `useCallback` for expensive calculations. Implement proper loading states.
- **Accessibility:** Ensure all interactive elements are keyboard navigable and have proper ARIA labels.
- **DRY Principle:** Extract repeated layout patterns (e.g., page containers, gradient backgrounds) into reusable components. Never duplicate the same layout code across multiple pages.
- **Linting:** **CRITICAL** - Always fix ALL lint errors and warnings before completing any task. Run Prettier/ESLint and resolve all issues. No exceptions.
- **Spacing:** ALWAYS prefer `gap` (flexbox, no grid) for spacing between elements. Only use margins when `gap` cannot be used (e.g., single element spacing, external spacing from parent).
- Instead of "bg-gradient-to-r" use "bg-linear-to-r"

## 6. Git & Workflow

- **Commits:** Conventional Commits (e.g., `feat(ui): add knockout bracket view`).
- **Safety:** Never hardcode API keys or database strings; use `.env.local`.
