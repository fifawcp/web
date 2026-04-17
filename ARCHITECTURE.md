# Feature-Based Architecture

This project follows a feature-based module architecture that aligns with backend microservices approach.

## Structure

```
src/
├── features/              # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/    # Auth-specific UI components
│   │   │   ├── auth-layout.tsx
│   │   │   └── form-input.tsx
│   │   ├── hooks/         # Auth business logic hooks
│   │   │   ├── useLogin.ts
│   │   │   └── useRegister.ts
│   │   ├── schemas/       # Validation schemas
│   │   │   └── auth.schema.ts
│   │   ├── types/         # Auth type definitions
│   │   │   └── auth.types.ts
│   │   ├── services/      # API calls (future)
│   │   │   └── auth.service.ts
│   │   └── index.ts       # Public API exports
│   │
│   └── home/
│       ├── components/
│       │   ├── banner-section.tsx
│       │   ├── description-section.tsx
│       │   └── final-section.tsx
│       └── index.ts
│
├── shared/                # Shared/common code
│   ├── components/
│   │   └── ui/           # shadcn/ui components
│   │       ├── button.tsx
│   │       └── floating-shape.tsx
│   ├── hooks/
│   │   └── useScrollAnimation.ts
│   ├── lib/
│   │   └── utils.ts      # Utility functions
│   └── types/
│       └── ui.ts         # Shared type definitions
│
└── app/                   # Next.js routes (thin layer)
    ├── (auth)/            # Route group for auth pages
    │   ├── login/
    │   │   └── page.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   └── layout.tsx     # Shared layout (optional)
    ├── page.tsx           # Home page
    └── layout.tsx         # Root layout
```

## Path Aliases

```json
{
  "@/*": ["./src/*"],
  "@features/*": ["./src/features/*"],
  "@shared/*": ["./src/shared/*"]
}
```

## Feature Module Pattern

Each feature module follows this structure:

### 1. **Components** (`components/`)

- Pure presentational components
- Feature-specific UI logic
- No direct API calls

### 2. **Hooks** (`hooks/`)

- Business logic and state management
- Form handling and validation
- Side effects (API calls, etc.)

### 3. **Schemas** (`schemas/`)

- Validation logic (Zod schemas, custom validators)
- Returns translation keys for i18n

### 4. **Types** (`types/`)

- TypeScript interfaces and types
- Domain models

### 5. **Services** (`services/`)

- API calls and data fetching
- External integrations
- Backend communication

### 6. **Public API** (`index.ts`)

- Exports only what other features/pages need
- Encapsulates internal implementation
- Single entry point for the feature

## Usage Example

```tsx
// ✅ Good - Import from feature module
import { AuthLayout, FormInput, useLogin } from "@features/auth";

// ❌ Bad - Don't import internals directly
import { useLogin } from "@features/auth/hooks/useLogin";
```

## Benefits

1. **Domain Alignment** - Matches backend microservices structure
2. **Scalability** - Easy to add new features without file sprawl
3. **Team Ownership** - Teams can own entire feature modules
4. **Code Locality** - Related code lives together
5. **Clear Boundaries** - Public API via index.ts prevents tight coupling
6. **Easier Testing** - Test entire features in isolation
7. **Better Organization** - No more hunting through generic folders

## Migration Status

- ✅ **Auth Feature** - Fully migrated with (auth) route group
- ✅ **Home Feature** - Fully migrated
- 🔄 **Leaderboard Feature** - Pending (future)
- 🔄 **Picks Feature** - Pending (future)

## Route Groups

Next.js route groups (folders wrapped in parentheses) are used to organize routes without affecting the URL structure:

- `(auth)/` - Groups authentication-related pages (/login, /register)
  - Allows shared layouts for auth pages
  - URL remains `/login` and `/register` (parentheses don't appear in URL)

## Next Steps

1. Migrate home page components to `features/home/`
2. Create `features/leaderboard/` when implementing leaderboard
3. Create `features/picks/` for match predictions
4. Move remaining shared components to `shared/components/`
5. Update all imports across the codebase
