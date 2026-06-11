# API Requirements — Dashboard Redesign

## Shipped: `role` on the boards list (`GET /api/boards`)

`UserBoardListItem` now includes `role` (`owner|admin|member`) alongside `id/name/privacy`
(Go: `internal/domain/board.go` + `GetUserBoards` in `board_repository.go`). The dashboard's
"New match competition" modal uses it to list only boards where the viewer can create a
competition (`(owner|admin) && privacy != "global"`). The web `BoardListItem.role` is optional
so the client still works against an API that predates the field.

---

The redesigned dashboard (web) needs the following additions to `GET /api/dashboard`.
Until they ship, the web client fills them with mocks in
`src/features/dashboard/api/dashboard.mocks.ts` — every fill is `data.x ?? mock`,
so each mock dies automatically the moment the API provides the field. Once all
fields ship, delete that file and its single call site in `dashboard.api.ts`.

## 1. `next_match.user_score_pick` (populate existing field)

The `Match` shape already defines `user_score_pick: { home_score, away_score } | null`,
but the dashboard payload never populates it. For authenticated users, return their
score pick for `next_match` (or `null` when no pick exists). The featured-match card
uses it to switch between "Make your pick" and "Edit your pick" states and to show
the picked score.

## 2. `title_favorites` (new top-level array)

Top 3 most-picked champions across **all users** (platform-wide), sorted by
`pick_count` desc:

```json
"title_favorites": [
  { "team": { /* same Team shape as picked_champion */ }, "pick_count": 412, "pick_percent": 34 }
]
```

- `pick_percent`: integer 0–100, share of users with a champion pick who picked this team.
- Should also be returned for unauthenticated requests (guest spectator view uses it as social proof).

## 3. `recap` (new top-level object)

Points recap for the categories that lock at kickoff (bracket pick'em, awards).
Powers the locked state of the progress cards.

```json
"recap": {
  "pickem": { "points": 24, "correct_picks": 8, "scored_picks": 12 },
  "awards": { "points": 0, "correct_picks": 0, "scored_picks": 0 }
}
```

- `scored_picks`: picks whose outcome has been resolved so far (e.g. group finished, award announced).
- `correct_picks`: of those, how many scored points.
- `points`: total points earned in the category so far.

## 4. `progress.awards` (ship real data)

The web client currently hardcodes `{ completed: 1, total: 4 }` when absent
(folded into `dashboard.mocks.ts`). Return the user's real awards progress.

## 5. Unauthenticated payload

Confirm guests receive at least `next_match` and `title_favorites`. The spectator
dashboard renders the featured match with a sign-up CTA and the favorites card;
`stats`, `progress`, `recap`, and `leaderboard` may be `null`/omitted for guests.

## Full target payload example

```json
{
  "picked_champion": { "fifa_code": "ARG", "name": { "en": "Argentina", "es": "Argentina" }, "flag_url": "https://flagcdn.com/w320/ar.png", "group_code": "C" },
  "stats": {
    "pickem": { "rank": 4, "points": 171 },
    "match": { "rank": 3, "points": 82 }
  },
  "next_match": {
    "id": 12,
    "stage_code": "GROUP",
    "group_code": "C",
    "teams": { "home": { "fifa_code": "ARG", "...": "..." }, "away": { "fifa_code": "BRA", "...": "..." } },
    "venue": { "name": "MetLife Stadium", "city": "New Jersey" },
    "kickoff_at": "2026-06-12T20:00:00Z",
    "status": "scheduled",
    "result": null,
    "user_score_pick": { "home_score": 2, "away_score": 1 }
  },
  "progress": {
    "match_picks": { "completed": 3, "total": 104 },
    "pickem": {
      "groups": { "completed": 12, "total": 12 },
      "best_thirds": { "completed": 8, "total": 8 },
      "bracket": { "completed": 31, "total": 31 }
    },
    "awards": { "completed": 4, "total": 4 }
  },
  "recap": {
    "pickem": { "points": 24, "correct_picks": 8, "scored_picks": 12 },
    "awards": { "points": 0, "correct_picks": 0, "scored_picks": 0 }
  },
  "title_favorites": [
    { "team": { "fifa_code": "BRA", "...": "..." }, "pick_count": 412, "pick_percent": 34 },
    { "team": { "fifa_code": "ARG", "...": "..." }, "pick_count": 327, "pick_percent": 27 },
    { "team": { "fifa_code": "FRA", "...": "..." }, "pick_count": 194, "pick_percent": 16 }
  ],
  "leaderboard": {
    "pickem": {
      "competition_id": 1,
      "board_id": 1,
      "competition_name": "Pick'em",
      "entries": [
        { "rank": 1, "points": 205, "member": { "user_id": "…", "username": "…", "first_name": "…", "last_name": "…", "role": "member", "joined_at": "…" } }
      ]
    },
    "match": { "...": "same shape" }
  }
}
```
