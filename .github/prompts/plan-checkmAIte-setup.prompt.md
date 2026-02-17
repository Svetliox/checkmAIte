## Plan: checkmAIte Chess Analysis App Setup

This plan sets up a modern Next.js 16 chess analysis application with TypeScript, TailwindCSS, and react-chessboard. The architecture follows App Router conventions with Server Components by default, and structures the codebase for future Stockfish WASM integration and database connectivity.

**TL;DR**: Initialize a Next.js 16 App Router project with TailwindCSS, set up a modular folder structure separating UI components, future API routes, and features. Build a modern homepage with hero section, interactive chess board preview, feature highlights, and CTA. Prepare stub services for future Stockfish and database integration.

---

### Steps

**1. Initialize Next.js 16 Project**
- Run `npx create-next-app@latest checkmAIte` with TypeScript, ESLint, TailwindCSS, App Router, and Turbopack enabled
- Ensure project name is exactly `checkmAIte` (case-sensitive)
- Generated files: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`

**2. Establish Folder Structure**
Create this modular structure inside the project root:

```
checkmAIte/
├── app/                      # Next.js App Router
│   ├── layout.tsx            # Root layout with metadata
│   ├── page.tsx              # Homepage
│   ├── globals.css           # Tailwind imports
│   ├── loading.tsx           # Global loading state
│   ├── error.tsx             # Error boundary
│   ├── not-found.tsx         # 404 page
│   ├── analysis/             # Future: analysis board page
│   │   └── page.tsx
│   └── api/                  # Future: API routes
│       └── analysis/
│           └── route.ts
├── components/
│   ├── ui/                   # Reusable UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Container.tsx
│   ├── chess/                # Chess-specific components
│   │   ├── ChessBoard.tsx    # react-chessboard wrapper ('use client')
│   │   └── MoveHistory.tsx
│   ├── layout/               # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── home/                 # Homepage sections
│       ├── HeroSection.tsx
│       ├── FeaturesSection.tsx
│       └── CTASection.tsx
├── lib/                      # Utilities and services
│   ├── chess/                # Chess logic (future Stockfish)
│   │   └── engine.ts         # Stub for Stockfish WASM
│   ├── db/                   # Future database integration
│   │   └── index.ts          # DB connection stub
│   └── utils.ts              # General utilities
├── types/                    # TypeScript types
│   ├── chess.ts              # Chess-related types
│   └── index.ts              # Shared types
├── public/                   # Static assets
│   ├── images/
│   └── icons/
├── .env.local.example        # Environment variables template
├── .gitignore
├── README.md
└── Dockerfile                # Multi-stage Docker build
```

**3. Install Dependencies**
- Core: `react-chessboard`, `chess.js` (move validation)
- Dev: Already included by create-next-app (ESLint, TypeScript, Tailwind)
- Command: `npm install react-chessboard chess.js`

**4. Configure TailwindCSS Theme**
- Update [tailwind.config.ts](tailwind.config.ts) with custom colors for chess theme (dark squares, light squares, accent colors)
- Add custom fonts via `next/font/google` (e.g., Inter for UI, optional serif for headings)

**5. Create Root Layout**
- Build [app/layout.tsx](app/layout.tsx) with:
  - Metadata API for SEO (title: "checkmAIte - Chess Analysis", description, Open Graph)
  - Font configuration with `next/font`
  - Header and Footer components
  - Dark mode support via Tailwind `dark:` classes

**6. Build Homepage Components**

**HeroSection** - Server Component:
- Large headline: "Master Your Chess Game with AI Analysis"
- Subtext explaining the value proposition
- Animated chess piece graphics or SVG illustration
- Primary CTA button: "Start Analyzing"

**FeaturesSection** - Server Component:
- 3-4 feature cards in a grid:
  - "Real-time Analysis" - Stockfish-powered move suggestions
  - "Dynamic Statistics" - Win rates, accuracy tracking
  - "Play Both Sides" - Explore variations as white or black
  - "Learn & Improve" - Understand your mistakes

**CTASection** - Server Component:
- Final call-to-action with chess board preview
- Interactive mini demo board (Client Component wrapper)

**7. Create ChessBoard Client Component**
- Build [components/chess/ChessBoard.tsx](components/chess/ChessBoard.tsx) as a `'use client'` component
- Wrap `react-chessboard` with custom styling
- Accept props: `position`, `onMove`, `orientation`, `interactive`
- Use `chess.js` for move validation
- Prepare interface for future Stockfish analysis callbacks

**8. Implement Stub Services**
- [lib/chess/engine.ts](lib/chess/engine.ts): Export placeholder functions `analyzePosition()`, `getBestMove()` that return mock data
- [lib/db/index.ts](lib/db/index.ts): Export stub connection and placeholder model types
- Add comments indicating where Stockfish WASM and DB integration will go

**9. Create Type Definitions**
- [types/chess.ts](types/chess.ts): Define `ChessPosition`, `ChessMove`, `AnalysisResult`, `GameStatistics` interfaces
- [types/index.ts](types/index.ts): Re-export all types

**10. Add Placeholder Pages**
- [app/analysis/page.tsx](app/analysis/page.tsx): Placeholder "Analysis Board" page with chess board and coming soon stats panel
- [app/not-found.tsx](app/not-found.tsx): Custom 404 with chess theme
- [app/error.tsx](app/error.tsx): Error boundary component (`'use client'`)

**11. Set Up API Route Structure**
- [app/api/analysis/route.ts](app/api/analysis/route.ts): Stub POST handler returning mock analysis data
- Include proper TypeScript typing for request/response

**12. Create Docker Configuration**
- [Dockerfile](Dockerfile): Multi-stage build following [containerization-docker-best-practices.instructions.md](.github/instructions/containerization-docker-best-practices.instructions.md)
  - Stage 1: Dependencies installation
  - Stage 2: Build Next.js app
  - Stage 3: Production runner (minimal image)
- Create `.dockerignore` for node_modules, .next cache, etc.

**13. Add Project Documentation**
- [README.md](README.md): Project overview, setup instructions, folder structure explanation
- [.env.local.example](.env.local.example): Document environment variables needed for future DB and API integrations

---

### Verification

1. **Build check**: Run `npm run build` - should complete without errors
2. **Dev server**: Run `npm run dev` - homepage renders at `localhost:3000`
3. **TypeScript**: Run `npx tsc --noEmit` - no type errors
4. **Lint**: Run `npm run lint` - passes ESLint
5. **Chess board**: Interactive board renders and accepts drag-drop moves
6. **Docker**: Run `docker build -t checkmaite .` - builds successfully

---

### Decisions

- **Full-stack Next.js**: Using Next.js API routes instead of separate backend (simpler deployment, TypeScript end-to-end)
- **react-chessboard + chess.js**: Industry-standard combination for React chess UIs with proper move validation
- **Server Components for static content**: Hero, Features, layout sections are Server Components for better performance
- **Client Components for interactivity**: Only chess board and future analysis UI use `'use client'`
- **Stub services pattern**: Engine and DB services are stubbed with clear interfaces, making future integration straightforward
