# CineVault — Production AI Movie Platform & Social Film Community

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase)](https://supabase.com/)

**CineVault** is a production-grade, full-stack AI movie platform and social community inspired by Letterboxd, IMDb, and Rotten Tomatoes. Users can discover films, rate on a 0.5–5.0 star scale, author rich reviews with spoiler protection, build custom collections, track watchlists, follow film buffs, receive personalized AI recommendations, and view rich dashboard analytics.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    Client["Next.js 15 Web Client<br/>(React 19 + Tailwind CSS + Framer Motion)"]
    API["Express.js REST API<br/>(TypeScript + Zod Validation)"]
    DB[("PostgreSQL Database<br/>(Supabase + Prisma ORM)")]
    Redis[("Redis Cache<br/>(Session & TMDB Caching)")]
    TMDB["TMDB Third-Party API<br/>(Movie Metadata & Images)"]
    Realtime["Supabase Realtime<br/>(WebSocket Event Bus)"]

    Client -->|REST Requests| API
    Client -->|WebSocket Subscriptions| Realtime
    API -->|Prisma Client Queries| DB
    API -->|Key-Value Caching| Redis
    API -->|Fetch Movie Data| TMDB
    DB -->|Postgres Changes| Realtime
```

---

## ✨ Features Summary

- **Movie Discovery & TMDB Integration**: Trending, popular, top-rated, upcoming, now playing, genre filtering, decade browsing, and search.
- **Rating System**: 0.5 to 5.0 stars with live distribution graphs and history logging.
- **Rich Review Engine**: Title, Markdown body, spoiler warnings, draft status, helpful votes, and nesting comments.
- **Custom Collections & Watchlists**: Categorized watchlists (`planned`, `watching`, `watched`), ranked/unranked custom collections, and cover image support.
- **AI Recommendation Engine**: Algorithmic recommendations grouped by `because_you_watched`, `similar_taste`, `hidden_gems`, `trending_for_you`, `critically_acclaimed`, and `underrated`.
- **Social Network**: User profiles, follow/unfollow streams, real-time notifications, aggregated activity feeds.
- **Gamification & Achievements**: Unlockable badges with progress bars across Bronze, Silver, Gold, and Diamond tiers.
- **Admin & Content Moderation Panel**: Platform statistics dashboard, user suspension/ban controls, review approval/featuring queue, collection featuring, report resolution workflow, and audit logs.
- **User Settings**: Profile editing, private mode toggles, theme switcher (`Dark`, `Light`, `System`), and account security.
- **PWA & Offline Support**: Web App Manifest, Service Worker caching, and offline fallback.
- **SEO & Rich Snippets**: Dynamic sitemap (`sitemap.xml`), crawler control (`robots.txt`), OpenGraph, Twitter Cards, and JSON-LD structured data.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router), React 19, TypeScript |
| **Styling & Components** | Tailwind CSS, shadcn/ui design tokens, Framer Motion |
| **State & Data Fetching**| TanStack React Query v5, Zustand, React Hook Form, Zod |
| **Backend API** | Express.js, Node.js, TypeScript, Helmet, Compression, Rate Limiter |
| **Database & ORM** | PostgreSQL, Prisma ORM v5, Supabase |
| **Caching & Real-time** | Redis, Supabase Realtime WebSockets |
| **External APIs** | TMDB (The Movie Database) API v3 |

---

## 📁 Repository Structure

```
CineVault/
├── apps/
│   ├── api/                    # Express.js REST API server
│   │   ├── prisma/             # Prisma schema & migrations
│   │   ├── src/
│   │   │   ├── config/         # Database, Redis, and Environment setup
│   │   │   ├── integrations/   # TMDB API service layer
│   │   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   │   └── routes/         # REST API routes (16 endpoints)
│   └── web/                    # Next.js 15 Web Application
│       ├── public/             # PWA Manifest, Service Worker, static icons
│       └── src/
│           ├── app/            # Next.js App Router (28 pages & system routes)
│           ├── components/     # UI components (Rating, Reviews, Admin, Modals, SEO)
│           ├── hooks/          # Custom React Query & Real-time hooks
│           ├── lib/            # API client layer & utils
│           └── realtime/       # Supabase Realtime setup
└── packages/
    └── shared-types/           # Shared TypeScript interfaces & DTOs
```

---

## 🚀 Environment Variable Setup

Create `.env` in `apps/api` and `.env.local` in `apps/web`:

### `apps/api/.env`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5432/cinevault?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-jwt-key"
TMDB_API_KEY="your-tmdb-api-key"
CORS_ORIGIN="http://localhost:3000"
```

### `apps/web/.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 🔧 Installation & Local Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/CineVault.git
cd CineVault

# 2. Install workspace dependencies
pnpm install

# 3. Generate Prisma Client
pnpm --filter @cinevault/api exec prisma generate

# 4. Start Development Servers
# Runs both Next.js web app (3000) and API server (5000)
pnpm dev
```

---

## 🧪 Verification & Building

```bash
# Run TypeScript type check across monorepo
pnpm --filter @cinevault/web type-check
pnpm --filter @cinevault/api type-check

# Build web application for production
pnpm --filter @cinevault/web build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
