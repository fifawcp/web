# Authentication Strategy

This document explains how authentication works end-to-end in this project. It is intended
for new contributors and anyone who needs to understand or modify the auth flow.

---

## Overview

The app uses a **two-token system**:

- **Access token** — a short-lived JWT (default 15 min) sent as a `Bearer` header on every
  API request. Stateless: the API validates it by verifying the signature, no DB lookup needed.
- **Refresh token** — a long-lived opaque token (default 7 days) stored in an `HttpOnly`
  cookie. Used only to rotate the access token when it expires. Requires a DB lookup.

The web app (Next.js) sits in front of the API (Go) and proxies all `/api/*` requests.
The browser never talks to the API directly.

```
Browser  ──────────────────►  Next.js  ──────────────────►  Go API
         (same origin)                  (server-to-server)
```

This proxy is the foundation of the entire session strategy: it allows the refresh-token
cookie to be `SameSite=Lax` and readable by Next.js middleware.

---

## Token Lifecycle

```
Login
  │
  ▼
OTP verified by API
  │
  ├─► Access token  (JWT, 15 min)  ──► stored in NextAuth session (in-memory + signed cookie)
  └─► Refresh token (opaque, 7d)   ──► stored in HttpOnly cookie  path="/"
  
                      ┌─── expires in ~15 min ───┐
                      │                           ▼
             Used for API requests          Middleware or client refreshes
                                                  │
                                                  ├─► New access token
                                                  └─► Rotated refresh token (new value, same TTL)
                                                  
                      ┌─── expires in 7 days ────┐
                      │                           ▼
             Used for refresh calls         Session ends → redirect to /login
```

---

## What "Stale" Means

A token is **stale** when it is within **60 seconds** of its expiry time — not yet expired,
but close enough that we refresh it proactively before it dies mid-request.

```
Timeline ──────────────────────────────────────────────────────────►
         │◄────── fresh ──────────►│◄── stale (60s) ──►│◄ expired ►│
         0                       t-60s                  t
                                   ▲
                                   └── refresh fires here, not at t
```

This 60-second buffer also absorbs minor clock drift between the browser and the API server.

---

## The Three Refresh Paths

Session continuity is maintained by three independent mechanisms. Each covers a different
scenario. Together they ensure the user is never logged out unexpectedly.

### 1. Middleware (page navigation)

**When**: the user navigates to a protected route (`/home`, `/boards`, etc.)

**Where**: `src/proxy.ts` — runs on the Next.js Edge before the page renders

```
Browser navigates to /boards
        │
        ▼
proxy.ts middleware runs
        │
        ├── access token fresh?  ──► NextResponse.next()  (render page normally)
        │
        └── access token stale?
                │
                ├── no refresh cookie?  ──► clear session cookie → redirect /login
                │
                └── call API /api/auth/token/refresh (server-to-server)
                        │
                        ├── success ──► re-encode NextAuth JWT
                        │              patch request cookie (so RSC sees fresh token)
                        │              set new session + refresh cookies on response
                        │              ──► NextResponse.next()  (render page normally)
                        │
                        └── hard failure (invalid/missing RT)
                                ──► clear session cookie → redirect /login
```

This path means **React Server Components always render with a fresh token** — no flicker,
no two-pass render.

### 2. Client-side fetch (API calls from the browser)

**When**: a component makes an authenticated API call (`api.get(...)`, `api.post(...)`, etc.)

**Where**: `src/shared/lib/api/client.ts` — `fetchWithAuth`

```
fetchWithAuth("/api/boards", { authenticated: true })
        │
        ├── access token fresh?  ──► attach Bearer header → fetch
        │
        └── access token stale?
                │
                └── refreshBackendAccessToken()
                        │
                        ├── [Web Lock acquired] POST /api/auth/token/refresh
                        │
                        ├── success ──► update NextAuth session (update())
                        │              attach new Bearer header → fetch
                        │
                        └── hard failure ──► signOut() → redirect /login
```

#### Cross-tab deduplication

If two browser tabs both detect a stale token at the same time, only **one** refresh fires:

```
Tab A ──► refreshBackendAccessToken()
Tab B ──► refreshBackendAccessToken()
                │
                ▼
        navigator.locks.request("auth-refresh", exclusive)
                │
                ├── Tab A wins lock ──► POST /api/auth/token/refresh ──► success
                │                      releases lock
                │
                └── Tab B waits ──► acquires lock ──► POST /api/auth/token/refresh
                                    (sends rotated token from Tab A's response)
```

Within a single tab, a module-level `inFlight` promise deduplicates concurrent callers
so only one network request fires even if multiple components refresh simultaneously.

### 3. Tab focus (idle session recovery)

**When**: the user leaves a page idle long enough for the token to expire, then switches
back to the tab.

**Where**: `src/features/auth/components/SessionMonitor.tsx`

```
User switches back to tab
        │
        ▼
visibilitychange event fires
        │
        ├── token still fresh?  ──► nothing (zero network requests)
        │
        └── token stale?
                └── refreshNextAuthSession(update)
                        │
                        └── POST /api/auth/token/refresh (via Web Lock, same as path 2)
                                ──► update NextAuth session in memory
```

`SessionMonitor` does **not poll**. In a normal session it produces zero network requests.

---

## Session Expiry and Logout

### Automatic logout (session expired)

When the NextAuth session JWT itself expires (`NEXTAUTH_SESSION_MAX_AGE`), `useSession`
returns `status: "unauthenticated"`. `SessionMonitor` detects this and redirects to `/login`.

```
NEXTAUTH_SESSION_MAX_AGE reached
        │
        ▼
useSession → status: "unauthenticated"
        │
        ▼
SessionMonitor detects status change
        │
        └── not on a guest page? ──► router.replace("/login")
```

### Manual logout

Logout invalidates the server-side session before clearing the local session:

```
User clicks logout
        │
        ▼
logoutAndSignOut()  (src/features/auth/lib/logout.ts)
        │
        ├── POST /api/auth/logout  (best-effort, swallows errors)
        │       └── API deletes session row + refresh token from DB
        │
        └── signOut()  (NextAuth)
                └── clears session cookie → redirect /
```

Calling the API first ensures the refresh token is invalidated server-side.
Replaying it afterwards returns 401.

---

## Cookie Architecture

| Cookie | Value | Path | HttpOnly | Notes |
|--------|-------|------|----------|-------|
| `next-auth.session-token` | Signed JWT (user + access token) | `/` | yes | Managed by NextAuth |
| `refresh_token` | Opaque token hash | `/` | yes | Set by Next.js route handlers, not the API directly |

### Why `path="/"`

The refresh-token cookie must be present on **all** requests so that Next.js middleware
can read it during page navigations to `/home`, `/boards`, etc. If the path were
`/api/auth`, the browser would only send it for requests under that path — middleware
would never see it.

The cookie is re-set with `path="/"` by two Next.js route handlers that own the token
endpoints (`src/app/api/auth/token/route.ts` and `src/app/api/auth/token/refresh/route.ts`),
overriding whatever path the upstream API sets.

---

## Key Files

```
src/
├── proxy.ts                                    # Middleware: token refresh on navigation
│
├── app/
│   ├── api/auth/
│   │   ├── [...nextauth]/route.ts              # NextAuth config (JWT strategy)
│   │   ├── token/route.ts                      # Login/register proxy → re-sets RT cookie path="/"
│   │   └── token/refresh/route.ts              # Refresh proxy      → re-sets RT cookie path="/"
│
├── features/auth/
│   ├── components/
│   │   └── SessionMonitor.tsx                  # Tab-focus refresh + expired-session redirect
│   ├── lib/
│   │   ├── refresh-session.ts                  # Bridges refreshBackendAccessToken ↔ NextAuth update()
│   │   └── logout.ts                           # logoutAndSignOut: API logout then NextAuth signOut
│   └── api/client.ts                           # Auth API calls (exchangeToken, logout, etc.)
│
└── shared/lib/api/
    ├── client.ts                               # fetchWithAuth: lazy refresh + 401 retry
    ├── refresh.ts                              # refreshBackendAccessToken: single-flight + Web Locks
    ├── jwt.ts                                  # isTokenStale, decodeJwtExpMs
    └── errors.ts                               # HARD_AUTH_FAILURE_CODES (triggers signOut)
```

---

## Environment Variables

### Frontend (`web/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXTAUTH_SECRET` | — | Required. Signs the session JWT. |
| `NEXTAUTH_URL` | — | Required. The app's public URL. |
| `NEXTAUTH_SESSION_MAX_AGE` | `604800` (7d) | NextAuth session lifetime in seconds. Should match `JWT_REFRESH_TOKEN_EXPIRY`. |
| `BACKEND_API_URL` | — | Internal URL of the Go API (server-to-server only, never sent to the browser). |

### API (`api/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ACCESS_TOKEN_EXPIRY` | `15m` | Access token lifetime. |
| `JWT_REFRESH_TOKEN_EXPIRY` | `168h` (7d) | Refresh token lifetime. |
| `AUTH_SESSION_TTL` | `168h` (7d) | DB session row lifetime. Keep in sync with `JWT_REFRESH_TOKEN_EXPIRY`. |
| `TRUSTED_PROXY_CIDRS` | `` (trust all) | Comma-separated CIDRs of trusted Next.js proxies. Set in production. |

### Testing values

To shorten token lifetimes for manual testing of the refresh flow:

```
# web/.env.local
NEXTAUTH_SESSION_MAX_AGE=300   # 5 minutes

# api/.env
JWT_ACCESS_TOKEN_EXPIRY=2m
JWT_REFRESH_TOKEN_EXPIRY=5m
AUTH_SESSION_TTL=5m
```

With these values: access tokens refresh every ~60s (within the 60s stale window),
and the full session ends after 5 minutes.

---

## Hard vs Transient Failures

Not all refresh failures are equal. The client distinguishes between two kinds:

| Type | Causes | Action |
|------|--------|--------|
| **Hard** | `INVALID_REFRESH_TOKEN`, `MISSING_REFRESH_TOKEN` | `signOut()` → redirect `/login` |
| **Transient** | Network error, 5xx, timeout | Do nothing — let the user retry |

This prevents false logouts when the API is briefly unavailable. Only a definitive
"your token is gone" response triggers a sign-out.

Hard failure codes are defined in `src/shared/lib/api/errors.ts`:

```ts
export const HARD_AUTH_FAILURE_CODES = new Set([
  "INVALID_REFRESH_TOKEN",
  "MISSING_REFRESH_TOKEN",
]);
```
