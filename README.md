# FIFA World Cup Pick'em

A modern, real-time World Cup prediction platform built with Next.js 15, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **Icons:** Lucide React
- **State Management:** Zustand
- **Theme:** next-themes (Dark mode support)
- **Validation:** Zod + React Hook Form
- **Testing:** Vitest + React Testing Library

## 📁 Project Structure

```
fifawcp/
├── app/                    # Next.js App Router pages
├── src/
│   ├── components/
│   │   ├── ui/            # Base shadcn components (auto-generated)
│   │   └── features/      # Feature-specific components
│   ├── lib/               # Utilities, constants, scoring logic
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── app/               # Additional app-level code
├── public/                # Static assets
└── ...config files
```

## 🛠️ Local Setup

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd fifawcp
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🎯 Key Features

- **Match Predictions:** Pick scores for all World Cup matches
- **Live Scoring:** Real-time points calculation
- **Leaderboards:** Track rankings against other players
- **Bracket Simulation:** Knockout stage predictions
- **Time Locking:** Picks locked 5 minutes before kickoff
- **Dark Mode:** Full theme support
- **Mobile-First:** Optimized for all devices

## 🏗️ Development Guidelines

### Code Standards

- **TypeScript:** Strict mode, no `any` types
- **Components:** PascalCase naming
- **Hooks:** camelCase with `use` prefix
- **Server Components:** Default to RSC, use `'use client'` only when needed
- **Styling:** Tailwind utility classes, mobile-first approach

### Import Aliases

Use `@/` for absolute imports from the `src` directory:

```typescript
import { calculatePoints } from "@/lib/scoring";
import type { Match, Pick } from "@/types";
import { useMatchLock } from "@/hooks/useMatchLock";
```

### Time Handling

All match times are stored in UTC. Convert to local time only in the UI layer.

## 📝 Architecture Decisions

- **Server-First:** Leverage React Server Components for data fetching
- **Type Safety:** Centralized type definitions in `src/types`
- **Scoring Logic:** Deterministic calculation in `src/lib/scoring.ts`
- **Accessibility:** ARIA labels and keyboard navigation throughout

## 🤝 Contributing

1. Follow the coding standards in `AGENTS.md`
2. Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)
3. Run `npm run lint` and `npm run format` before committing
4. Never commit API keys or sensitive data

## 📄 License

Private project - All rights reserved
