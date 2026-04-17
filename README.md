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
   git clone https://github.com/fifawcp/web.git
   cd fifawcp
   ```

2. **Install dependencies**

   ```bash
   npm ci
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

## 📄 License

Private project - All rights reserved
