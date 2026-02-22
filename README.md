<div align="center">
  <h1>♟️ checkmAIte</h1>
  <p><strong>AI-Powered Chess Analysis Platform</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
    <img src="https://img.shields.io/badge/Stockfish-18-brown?style=for-the-badge" alt="Stockfish" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>

  <p>A modern, full-stack chess platform combining powerful analysis, AI-powered coaching, and intelligent gameplay. Built with cutting-edge web technologies for a seamless experience.</p>
  
  <p>
    <em>🎓 Developed as part of the AI-Assisted Development course final exam <a href="https://softuni.bg/">SoftUni</a></em>
  </p>

  <p>
    <a href="#features">Features</a> •
    <a href="#demo">Demo</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#api">API</a>
  </p>
</div>

---

## ✨ Features

### 🎮 **Game Modes**
- **Play vs Bot** - Challenge Stockfish engine at adjustable difficulty levels (800-2000+ ELO)
- **Analysis Board** - Deep position analysis with move-by-move evaluation
- **Load Game** - Play again and again your favourite positions and games
- **Move History** - Complete game navigation with undo/redo capabilities

### 🤖 **AI-Powered Coaching**
- **Smart Commentary** - Contextual insights powered by Groq LLaMA 3.1
- **Strategic Guidance** - Plain-language explanations of complex positions
- **Learning Assistant** - Pattern recognition and tactical training

### 📊 **Advanced Analysis**
- **Stockfish 18 Integration** - World-class chess engine (3500+ ELO)
- **Configurable Depth** - Adjust analysis from 5 to 25 ply
- **Multi-PV Analysis** - See top 3 best moves with evaluations
- **Position Evaluation** - Real-time centipawn scoring
- **Opening Detection** - Automatic opening name identification

### 💾 **Game Management**
- **Save & Resume** - Persistent game storage with metadata
- **Game Library** - Personal collection of analyzed games
- **Export Options** - FEN notation support

### 🎨 **Customization**
- **Board Themes** - Classic and modern visual styles
- **Piece Sets** - Multiple piece design options
- **User Preferences** - Personalized settings per account

### 🔐 **Authentication & Security**
- **NextAuth.js v5** - Secure session management
- **Credential-based Auth** - Email/password with bcrypt hashing
- **API Key Encryption** - Secure storage of external API keys
- **PostgreSQL** - Robust data persistence with Prisma ORM

---

**Screenshots:**
- Homepage: Modern landing page with feature highlights
- Play Mode: Interactive board with difficulty selection
- Analysis Mode: Deep position analysis with engine evaluation
- AI Chat: Conversational chess insights

---

## 🛠️ Tech Stack

### **Frontend**
| Technology | Purpose | Version |
|------------|---------|---------|
| [Next.js](https://nextjs.org/) | React framework with App Router | 16.1.6 |
| [React](https://react.dev/) | UI library | 19.2.3 |
| [TypeScript](https://www.typescriptlang.org/) | Type safety | 5.x |
| [TailwindCSS](https://tailwindcss.com/) | Utility-first styling | 4.x |
| [react-chessboard](https://www.npmjs.com/package/react-chessboard) | Chess board component | 5.10.0 |
| [chess.js](https://github.com/jhlywa/chess.js) | Chess logic & validation | 1.4.0 |

### **Backend**
| Technology | Purpose | Version |
|------------|---------|---------|
| [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers) | RESTful API endpoints | 16.x |
| [Prisma](https://www.prisma.io/) | Database ORM & migrations | 6.19.2 |
| [PostgreSQL](https://www.postgresql.org/) | Relational database | 16+ |
| [NextAuth.js](https://next-auth.js.org/) | Authentication | 5.0.0-beta |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | Password hashing | 6.0.0 |
| [Zod](https://zod.dev/) | Runtime validation | 4.3.6 |

### **Chess Engine**
| Technology | Purpose | Version |
|------------|---------|---------|
| [Stockfish](https://stockfishchess.org/) | Chess engine via WASM/JS | 18.0.5 |

### **AI & LLMs**
| Service | Purpose | Model |
|---------|---------|-------|
| [Groq](https://groq.com/) | Fast LLM inference | LLaMA 3.1 8B |

### **DevOps & Deployment**
| Technology | Purpose |
|------------|---------|
| [Docker](https://www.docker.com/) | Containerization |
| [Docker Compose](https://docs.docker.com/compose/) | Multi-container orchestration |
| [ESLint](https://eslint.org/) | Code linting |
| [Turbopack](https://turbo.build/pack) | Fast development builds |

---

## 🚀 Getting Started

### **Prerequisites**

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 16+ ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn**

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/checkmAIte.git
   cd checkmAIte
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   
   This will automatically:
   - Download Stockfish chess engine
   - Create `.env.local` and `.env` from `.env.example`

3. **Configure environment variables**
   
   Edit `.env.local` with your credentials:
   ```env
   # Database
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/checkmaite"

   # Authentication
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # API Key Encryption (32 characters minimum)
   API_KEYS_ENCRYPTION_SECRET="your-encryption-key-32-chars-min!"

   # Optional: AI Chat Features
   GROQ_API_KEY="your-groq-api-key"  # Get free at https://console.groq.com
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   **Important:** Make sure Docker Desktop is running and port **5432** is available.
   
   This command will automatically:
   - Start PostgreSQL container
   - Run database migrations
   - Seed the database
   - Launch the Next.js development server

5. **Open browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

### **System Design**

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI[React UI]
        Chess[Chess Board]
        Worker[Stockfish Worker]
    end
    
    subgraph Server["Next.js Server"]
        API[API Routes]
        Auth[NextAuth]
        SSR[Server Components]
    end
    
    subgraph External["External Services"]
        Groq[Groq AI]
    end
    
    subgraph Database["PostgreSQL"]
        Users[(Users)]
        Games[(Games)]
        Keys[(API Keys)]
    end
    
    UI --> Chess
    Chess --> Worker
    UI --> API
    API --> Auth
    API --> Database
    API --> Groq
    SSR --> Database
```

### **Key Architectural Decisions**

#### **1. Next.js App Router**
- **Server Components** for static content and data fetching
- **Client Components** for interactive chess board and real-time analysis
- **API Routes** for backend logic and external service integration

#### **2. Stockfish Integration**
- **Web Worker** - Runs in separate thread to avoid blocking UI
- **WASM Build** - High-performance chess calculations
- **Configurable Depth** - User can balance speed vs accuracy (5-25 ply)

#### **3. Database Design**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  chessTheme    ChessTheme @default(ORIGINAL)
  savedGames    SavedGame[]
  apiKeys       ApiKey[]
}

model SavedGame {
  id              String   @id
  userId          String
  name            String
  fen             String      // Board position
  moveHistory     String      // JSON array
  gameType        String      // 'analysis' | 'vsBot'
  difficulty      String?     // Bot difficulty
  playerColor     String?     // User's color
  evaluationScore Float
  topMoves        String?     // JSON multi-PV lines
}

model ApiKey {
  id           String   @id
  userId       String
  provider     String   // 'groq', 'openai', etc.
  encryptedKey String   // AES-256 encrypted
}
```

#### **4. Security Practices**
- **Password Hashing** - bcrypt with 10 rounds
- **API Key Encryption** - AES-256-GCM for external API keys
- **Session Management** - HTTP-only cookies with NextAuth
- **SQL Injection Prevention** - Prisma parameterized queries
- **XSS Protection** - React's built-in escaping

#### **5. Performance Optimizations**
- **Code Splitting** - Dynamic imports for heavy components
- **Image Optimization** - Next.js Image component
- **Caching** - React Query for client-side caching
- **Worker Threads** - Stockfish runs without blocking UI
- **Lazy Loading** - Deferred Stockfish initialization

---

## 🐳 Docker Deployment

### **Development with Docker Compose**

Start all services (database + app):
```bash
docker-compose up
```

Start only database:
```bash
npm run db:start
```

---

## 📚 Key Technologies Explained

### **Why Next.js 16?**
- **App Router** - Modern file-based routing with nested layouts
- **Server Components** - Reduced client-side JavaScript
- **API Routes** - Built-in backend without separate server
- **Turbopack** - Lightning-fast development builds
- **Image Optimization** - Automatic lazy loading and WebP conversion

### **Why Stockfish via JavaScript?**
- **WASM Performance** - Near-native speed in browser
- **No Server Load** - Chess calculations run on client
- **Offline Capable** - Works without internet connection
- **Instant Analysis** - No API latency

### **Why Groq for AI?**
- **Speed** - Up to 300 tokens/second with LLaMA
- **Free Tier** - Generous limits for hobby projects
- **Easy Integration** - OpenAI-compatible API

### **Why Prisma?**
- **Type Safety** - Auto-generated TypeScript types
- **Migration System** - Version-controlled schema changes
- **Developer Experience** - Intuitive query builder
- **Prisma Studio** - Visual database browser

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Code Standards**
- Follow existing TypeScript conventions
- Run `npm run lint` before committing
- Add tests for new features
- Update documentation as needed

---

## 🗺️ Roadmap

### **Phase 1: Core Features** ✅
- [x] Chess board UI with drag-and-drop
- [x] Stockfish 18 integration
- [x] Play vs Bot mode
- [x] Analysis mode with position evaluation
- [x] User authentication (email/password)
- [x] Game save/load functionality
- [x] AI chat assistant
- [x] Customizable board themes
- [x] Adjustable analysis depth

### **Future features to add** 📋

- [ ] Improve authentication mechanism
- [ ] Implement Oauth2 with Chess.com and Gmail
- [ ] Multiplayer chess (real-time)
- [ ] Tournament system
- [ ] Rating system (ELO)

---

## 👏 Acknowledgments

- **Stockfish Team** - For the amazing open-source chess engine
- **chess.js** - For robust chess logic and move validation
- **react-chessboard** - For the beautiful, accessible chess board component
- **Groq** - For lightning-fast LLM inference
- **Vercel** - For Next.js and excellent deployment platform

---

## 📧 Contact

**Project Maintainer:** Svetoslav Yavorov

- GitHub: [@Svetliox](https://github.com/svetliox)

---
