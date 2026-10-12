# CineVault — Production AI Movie Platform & Social Film Community

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45ba4b?logo=playwright)](https://playwright.dev/)

**CineVault** is a production-grade, full-stack cinema discovery platform and social community inspired by Letterboxd, Netflix, and modern streaming interfaces. Users can discover films, rate on a 0.5–5.0 star scale, author rich reviews with spoiler protection, build custom collections, track watchlists, receive personalized AI recommendations, view dashboard analytics, and explore trending cinema stars.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client["Next.js 15 Web Client<br/>(Vercel Production Edge)"]
    API["Express.js REST API<br/>(Render Production Server)"]
    DB[("PostgreSQL Database<br/>(Supabase + Prisma ORM)")]
    Redis[("Redis Cache<br/>(Upstash Session & TMDB Caching)")]
    TMDB["TMDB Third-Party API<br/>(Movie Metadata & Images)"]

    Client -->|REST API Requests| API
    Client -->|SSG / TMDB Fallbacks| TMDB
    API -->|Prisma ORM Queries| DB
    API -->|Key-Value Caching| Redis
    API -->|Fetch Movie Data| TMDB
```

---

## ✨ Features Summary

- **Cinematic Dark Design System**: Content-first full-width layouts, Spotlight Hero banners, glassmorphic cards, and custom color tokens.
- **Movie & TV Discovery**: Trending, popular, top-rated, upcoming, now playing, genre filtering, decade browsing, and instant autocomplete search.
- **Rating & Review Engine**: 0.5 to 5.0 stars rating system, review authoring, spoiler warnings, helpful votes, and comments.
- **Custom Collections & Watchlists**: Categorized watchlists (`planned`, `watching`, `watched`), ranked/unranked custom collections, and cover image support.
- **AI Recommendation Engine**: Algorithmic recommendations grouped by taste similarity, hidden gems, trending titles, and genre preferences.
- **Social Network & Profile Hubs**: User profiles, activity streams, custom lists, and dashboard metrics (Films Logged, Hours Watched, Active Watchlist).
- **Gamification & Achievements**: Unlockable badges with progress indicators across Bronze, Silver, Gold, and Diamond tiers.
- **Automated E2E Testing**: Comprehensive Playwright smoke, regression, visual screenshot, and interaction test suite.
- **SEO & Social Sharing**: Dynamic metadata (`layout.tsx`), sitemap (`sitemap.xml`), robots policies (`robots.txt`), OpenGraph, and Twitter Cards.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling & Design System** | Vanilla CSS Tokens, Tailwind CSS, Framer Motion, Lucide Icons |
| **State & Data Fetching** | TanStack React Query v5, Zustand, React Hook Form, Zod |
| **Backend API** | Express.js, Node.js, TypeScript, Helmet, Compression, Rate Limiter |
| **Database & ORM** | PostgreSQL, Prisma ORM v5, Supabase |
| **Caching & Storage** | Redis (Upstash), Session Cookies |
| **External APIs** | TMDB (The Movie Database) API v3 |
| **Testing & CI/CD** | Playwright E2E, GitHub Actions CI/CD |

---

## 📁 Repository Structure

```
CineVault/
├── .github/
│   └── workflows/
│       ├── ci.yml              # GitHub Actions CI (Type-check, Build, Playwright E2E)
│       └── prod-smoke.yml      # Manual production smoke test workflow
├── apps/
│   ├── api/                    # Express.js REST API server
│   │   ├── prisma/             # Prisma schema & migrations
│   │   └── src/
│   │       ├── config/         # Database, Redis, and Environment setup
│   │       ├── middleware/     # Auth, CORS, Helmet, Rate Limiter
│   │       └── routes/         # REST API routes
│   └── web/                    # Next.js 15 Web Application
│       ├── e2e/                # Playwright E2E test suites (Smoke, Interactions, Visual)
│       ├── playwright.config.ts # Playwright E2E configuration
│       └── src/
│           ├── app/            # Next.js App Router pages & metadata
│           ├── components/     # Reusable design system components
│           ├── hooks/          # React Query & UI hooks
│           └── lib/            # API client & TMDB service layer
└── packages/
    └── shared-types/           # Shared TypeScript interfaces & DTOs
```

---

## 🚀 Environment Variable Reference

Configure `.env` in `apps/api` and `.env.local` in `apps/web`:

### `apps/api/.env`
```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/cinevault?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-32-character-secret-key-here"
TMDB_API_KEY="your-tmdb-api-key"
CORS_ORIGIN="http://localhost:3000"
APP_URL="http://localhost:3000"
API_URL="http://localhost:4000"
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🔧 Local Development & Building

```bash
# 1. Install workspace dependencies
pnpm install

# 2. Generate Prisma Client
pnpm --filter @cinevault/api exec prisma generate

# 3. Start Development Mode
pnpm dev

# 4. Type Check
pnpm --filter @cinevault/web type-check

# 5. Production Build
pnpm --filter @cinevault/web build

# 6. Run Playwright E2E Tests
pnpm --filter @cinevault/web test:e2e
```

---

## 🌐 Production Deployment Architecture

- **Web Application**: Deployed on Vercel at `https://cine-vault-gules.vercel.app`
- **Backend REST API**: Deployed on Render at `https://cinevault-api-r05f.onrender.com`
- **Database**: PostgreSQL hosted on Supabase
- **Redis Cache**: Upstash Redis

---

## 📜 TMDB Data & Legal Attribution

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie metadata, poster artwork, backdrops, and cast/crew details are provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
