# ZP School ERP

**Data-Driven Student Monitoring and Academic Assistance System for Zilla Parishad Schools**

> B.Tech Final Year Major Project | Multi-School ERP Platform | Initial deployment: 6 ZP Schools

---

## Overview

ZP School ERP is a production-quality, multi-tenant Education Resource Planning platform that digitizes core school operations and transforms student data into actionable academic insights for Zilla Parishad schools.

### Key Features

- Multi-school management with complete data isolation
- Role-based access control (SUPER_ADMIN, PRINCIPAL, TEACHER, STUDENT)
- Student 360° profiles
- Digital attendance with analytics
- Academic performance tracking and analysis
- Early Warning System for at-risk students
- Digital Learning Resource Hub
- Topic-wise quiz system
- Transfer Certificate workflow
- AI-powered School Assistant
- Notices and announcements
- School gallery and profile management
- Reports and dashboards

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Vanilla CSS (custom design system) |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Reverse Proxy | Nginx |

---

## Project Structure

```
/
├── frontend/          # React + TypeScript + Vite SPA
├── backend/           # Node.js + Express + TypeScript API
├── database/          # Seeds and DB utilities
├── docker/            # Dockerfiles and Nginx config
├── .github/           # GitHub Actions workflows
├── docs/              # Additional documentation
├── PRD.md             # Product Requirements Document
├── AGENTS.md          # AI Agent coding rules
├── ARCHITECTURE.md    # Technical architecture
├── DESIGN_SYSTEM.md   # Visual design system
├── docker-compose.yml
└── .env.example
```

---

## Quick Start (Development)

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15 (or Docker)
- npm

### 1. Clone and Configure

```bash
git clone <repo-url>
cd "Major Project - ERP"
cp .env.example .env
# Edit .env with your values
```

### 2. Start Database (Docker)

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
Backend API: http://localhost:3000

### Default Login (Seed Data)

| Role | Email | Password |
|---|---|---|
| SUPER_ADMIN | admin@zperp.in | Admin@123456 |
| PRINCIPAL | principal@zpschool1.in | Principal@123 |
| TEACHER | teacher@zpschool1.in | Teacher@123 |
| STUDENT | student@zpschool1.in | Student@123 |

---

## Full Stack Docker (Production-like)

```bash
cp .env.example .env
# Edit .env
docker-compose up --build
```

Application: http://localhost

---

## Context Documents

Before contributing, read these in order:

1. [AGENTS.md](./AGENTS.md) — Coding rules for AI agents and developers
2. [PRD.md](./PRD.md) — Product requirements
3. [ARCHITECTURE.md](./ARCHITECTURE.md) — Technical architecture
4. [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — Visual design system

---

## Phase Status

| Phase | Description | Status |
|---|---|---|
| 0 | Project inspection and planning | ✅ Complete |
| 1 | Repository foundation | 🔄 In Progress |
| 2–20 | See implementation plan | ⬜ Pending |

---

## Deployment (Vercel + Supabase)

EduVanta is designed for edge deployment on Vercel with Supabase as the PostgreSQL and Storage layer.

### 1. Database (Supabase)
- Create a Supabase project.
- Obtain your `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_KEY`.
- Run migrations: `npx prisma migrate deploy`.

### 2. Wildcard Domains (Vercel)
EduVanta uses Subdomain-based Multi-Tenancy.
1. In your Vercel project, go to Settings > Domains.
2. Add your base domain (e.g. `eduvanta.com`).
3. Add the wildcard domain `*.eduvanta.com`.
4. Ensure your DNS provider (e.g. Cloudflare or Route53) has a CNAME record mapping `*` to `cname.vercel-dns.com`.
5. Vercel will automatically provision SSL certificates for tenant subdomains as they are accessed.

### 3. Environment Variables
Configure the following in Vercel:
```
DATABASE_URL="postgres://..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
SUPABASE_URL="https://..."
SUPABASE_SERVICE_KEY="..."
FRONTEND_URL="https://eduvanta.com"
ROOT_DOMAIN="eduvanta.com"
```

---

## License

Academic project. Not for public distribution.
