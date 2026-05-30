# Awards player-picker enhancements — design

Date: 2026-05-30
Branch: `WEB-awards-enhancements`
Scope: refine the player picker added in `d0d5e53` (`/pickems/awards`).

## Context

The awards picker (`src/features/awards`) lets users pick four tournament
honors. Field testing surfaced five rough edges, and the API branch
`API-awards` (commit `bf36251`) added a popular-picks endpoint plus a slimmed
`Player` shape we should align to.

API changes that matter here (`bf36251`):

- New `GET /awards/popular?limit=N` (default 10, max 50) → returns **all four
  awards in one call**: `{ golden_boot: [{ player, picks_count }], golden_ball,
  golden_glove, young_player }`. Eligibility enforced server-side (Glove → GKs;
  Young Player → age ≤ 21 **or unknown age**; Boot/Ball → full catalog),
  ordered by `picks_count DESC, name ASC`.
- `Player` dropped `nationality` and `photo_url`; `PlayerClub` dropped
  `logo_url` (now just `{ name }`); `age` is `omitempty` (may be absent).
- Young-player eligibility is now permissive for unknown ages (accepted).

## Changes

### 1. Debounce + request cancellation

- `lib/awards.ts`: replace the tiered `playerSearchDebounceMs` (30ms for long
  queries — the cause of per-keystroke requests) with a single constant
  `PLAYER_SEARCH_DEBOUNCE_MS = 250`.
- Thread `AbortSignal` end to end: React Query `queryFn`'s `signal` →
  `fetchPlayers(query, signal)` → `api.get(url, { authenticated: true, signal })`.
- `src/shared/lib/api/client.ts`: forward `signal` in `request()`'s
  `fetchOptions` (currently silently dropped). One-line shared fix; React Query
  then auto-aborts superseded searches.

### 2. Fixed-height results

- `PlayerPicker.tsx`: `CommandList` goes from `max-h-80` to a fixed `h-80` that
  always scrolls internally. Popular list, search results, loading, empty and
  error states all render inside the same 320px box (empty/error centered).
  With the existing `keepPreviousData`, dialog height is now constant.

### 3. Flag → 3:2 rectangle (match the rest of the app)

- Repurpose `PlayerFlagAvatar` → `PlayerFlag`: GroupTeamRow treatment —
  `overflow-hidden rounded-xs ring-1 ring-border/60` wrapper, `<img
  className="h-6 w-9 object-cover">`. Keep the plain `<img>` + initials fallback
  (the `next/image`-throws rationale still holds). Initials fall back to
  `team.fifa_code` (nationality is gone).
- `AwardCard.tsx`: the larger picked-player flag becomes a proportional rect
  (~`h-12 w-16`).

### 4. Row redesign — club + colored position chip

- Secondary line: `Country · Club` (e.g. *Senegal · FC Barcelona*) from the new
  `club.name`, truncated.
- New pure helper `positionChipClasses(position)` in `lib/awards.ts` → FUT
  colour scheme: GK amber, DEF sky, MID emerald, FWD red (soft tinted bg +
  matching text, dark-mode aware). `PlayerRow` chip consumes it.

### 5. Popular picks as the default

- Types: `PopularAwardPick`, `PopularPicksByAward`.
- `api/awards.ts`: `fetchPopularPicks(limit)` + `POPULAR_QUERY_KEY`.
- Hook `usePopularPicks(enabled)`: one React Query (`staleTime: 300_000`), gated
  on picker-open, **shared across all four cards** (single network call total).
- Route handler `src/app/api/awards/popular/route.ts`: GET proxy. Required —
  the catch-all rewrite in `next.config.ts` excludes `awards(?:/.*)?`, so the
  path 404s without a handler. Read-only, no cache-tag revalidation.
- Picker logic: `hasCriteria = trimmedQuery || positions.length`. No criteria →
  render the popular slice for this `awardType` under a "Popular picks" header
  (counts hidden — app is early-stage, most counts are 0). Any input → switch to
  `/players` search. Popular slice is already eligibility-filtered server-side.

### 6. Type alignment + young-player filter

- `awards.types.ts`: drop `nationality`, `photo_url`, `club.logo_url`; `age?:
  number`.
- Simplify `playerCountry` (drop dead nationality fallback) and `initials`.
- Young-player client filter becomes permissive: `p.age == null || p.age <=
  maxAge` (matches the API).

### i18n

- Add `awards.picker.popularTitle` (en "Popular picks" / es "Más elegidos").
- Remove the now-unused `awards.picker.idle` key (both locales).

## Out of scope

- No unit/integration tests (project convention: lint + browser review).
- Pick-count display (deferred until the app has traffic).

## Files

Edited: `lib/awards.ts`, `hooks/usePlayerSearch.ts`, `api/awards.ts`,
`components/PlayerPicker.tsx`, `components/PlayerFlagAvatar.tsx` (→ `PlayerFlag`),
`components/AwardCard.tsx`, `types/awards.types.ts`,
`shared/lib/api/client.ts`, `i18n/messages/awards/{en,es}.json`.
New: `hooks/usePopularPicks.ts`, `app/api/awards/popular/route.ts`.
