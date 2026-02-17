# checkmAIte ♟️

AI-powered chess analysis platform built with Next.js 16, TypeScript, and TailwindCSS.

## Features

- 🎯 **Real-time Analysis** - Get instant feedback on every move with Stockfish-powered analysis
- 📊 **Dynamic Statistics** - Track accuracy, identify patterns, and monitor improvement
- ♔ **Play Both Sides** - Explore variations as white or black
- 📚 **Learn & Improve** - Understand mistakes with detailed explanations

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **Chess Library**: react-chessboard + chess.js
- **Engine**: Stockfish WASM (coming soon)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/checkmAIte.git
cd checkmAIte

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

## Project Structure

```
checkmAIte/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── analysis/           # Analysis board page
│   │   └── api/                # API routes
│   │       └── analysis/       # Chess analysis endpoint
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── chess/              # Chess-specific components
│   │   ├── layout/             # Header, Footer, Navigation
│   │   └── home/               # Homepage sections
│   ├── lib/
│   │   ├── chess/              # Chess engine service
│   │   ├── db/                 # Database service (stub)
│   │   └── utils.ts            # Utility functions
│   └── types/                  # TypeScript definitions
├── public/                     # Static assets
├── Dockerfile                  # Docker configuration
└── docker-compose.yml          # Docker Compose (optional)
```

## Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Run ESLint
npx tsc --noEmit     # Type check
```

## Docker

Build and run with Docker:

```bash
# Build image
docker build -t checkmaite .

# Run container
docker run -p 3000:3000 checkmaite
```

## API Reference

### POST /api/analysis

Analyze a chess position.

**Request:**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "depth": 20
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bestMove": { "from": "e2", "to": "e4", "san": "e4" },
    "evaluation": 30,
    "depth": 20,
    "pv": [...]
  },
  "timestamp": "2026-02-17T12:00:00.000Z"
}
```

## Roadmap

- [x] Project setup and structure
- [x] Modern homepage design
- [x] Interactive chess board
- [ ] Stockfish WASM integration
- [ ] Database integration
- [ ] User authentication
- [ ] Game history
- [ ] Opening explorer
- [ ] Multiplayer support

## Contributing

Contributions are welcome! Please read our contributing guidelines first.

## License

MIT © checkmAIte
