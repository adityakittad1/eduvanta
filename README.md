# Eduvanta – Multi-Tenant School ERP & Digital Campus Platform

> **Eduvanta is a multi-tenant School ERP and Digital Campus Platform developed by Aditya Kittad as a B.Tech Final Year Major Project.**

**Live Application:** [https://eduvanta-liard.vercel.app](https://eduvanta-liard.vercel.app)  
**GitHub Repository:** [https://github.com/adityakittad1/eduvanta](https://github.com/adityakittad1/eduvanta)  
**Academic Context:** B.Tech Final Year Major Project | Multi-School Digital Campus Platform

---

## Project Overview

Eduvanta is an enterprise-grade, multi-tenant Education Resource Planning (ERP) and Digital Campus platform. Originally architected to digitize core educational and administrative operations across Zilla Parishad schools and progressive educational institutions in Maharashtra, Eduvanta bridges rural and semi-urban educational governance with modern digital workflows.

The platform provides complete multi-tenant school isolation, role-based access control, academic performance analytics, digital attendance tracking, student 360° profiling, automated Transfer Certificate (TC) generation, digital learning resources, interactive quizzes, and an AI-driven educational assistant.

### Key Features

- **Multi-School Architecture with Strict Tenant Isolation**: Distinct school branding, subdomains, and isolated database contexts with zero cross-tenant data leakage.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for `SUPER_ADMIN`, `PRINCIPAL`, `TEACHER`, and `STUDENT`.
- **Student 360° Profile**: Unified student records including demographics, academic history, daily attendance trends, and early warning interventions.
- **Digital Attendance & Real-Time Analytics**: Daily and subject-wise attendance marking with automated percentage trends, monthly charts, and absenteeism tracking.
- **Academic Performance & Assessment Tracking**: Term examinations, grading curves, subject-wise marks management, and report card generation.
- **Early Warning System (EWS)**: Data-driven risk detection for chronic absenteeism and academic decline with actionable intervention flags.
- **Digital Learning Resource Hub**: Centralized repository for syllabi, study materials, worksheets, and lecture notes organized by class and subject.
- **Topic-Wise Interactive Quizzes**: Assessment builder with multiple-choice questions, timed attempts, automatic grading, and result analytics.
- **Government-Compliant Transfer Certificate (TC) Engine**: End-to-end digital TC requests, verification workflows, and automated PDF issuance with verification numbers.
- **AI-Powered School Assistant**: Context-aware academic assistant operating within school boundaries.
- **Institutional Notices & Announcements**: Real-time school circulars with role targeting (all, teachers, students, or specific classes).
- **School Gallery & Public Website CMS**: Dynamic school landing page with facilities showcase, faculty directory, photo gallery, and achievements.
- **Interactive Dashboards**: Role-specific dashboards featuring live metric aggregations, attendance trend visualizations, and quick actions.

---

## System Architecture

Eduvanta is built with a resilient, modern decoupled architecture:

```
┌────────────────────────────────────────────────────────┐
│               Frontend (SPA)                           │
│   React 18 • TypeScript • Vite • Custom Design System  │
└───────────────────────────┬────────────────────────────┘
                            │ REST / JSON (JWT Auth)
┌───────────────────────────▼────────────────────────────┐
│               Backend API                              │
│   Node.js • Express • TypeScript • Zod Validation      │
├────────────────────────────────────────────────────────┤
│   Tenant Resolver Middleware • School Scoping Middleware│
└───────────────────────────┬────────────────────────────┘
                            │ Prisma ORM / Connection Pooler
┌───────────────────────────▼────────────────────────────┐
│               Database & Storage                       │
│   PostgreSQL 15 (Supabase) • Edge Storage Bucket       │
└────────────────────────────────────────────────────────┘
```

For complete architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, TypeScript, Vite | High-performance SPA with client-side routing |
| **Styling** | Vanilla CSS (Eduvanta Design System) | Cohesive enterprise design without heavy UI libraries |
| **Icons & UI** | Lucide React | Clean, scalable vector iconography |
| **Backend** | Node.js, Express, TypeScript | Scalable REST API with modular architecture |
| **ORM** | Prisma 5.22 | Type-safe database queries and migrations |
| **Database** | PostgreSQL 15 (Supabase) | Multi-tenant relational data store |
| **Authentication** | JWT (Access + Refresh tokens), bcrypt | Secure stateless role-based authentication |
| **Validation** | Zod | Runtime input validation across all endpoints |
| **File Storage** | Supabase Storage (`eduvanta-assets`) | Asset hosting with resilient base64 fallback |
| **AI Assistant** | Gemini API / OpenAI API | Pre-scoped backend LLM assistant |
| **Containers** | Docker, Docker Compose | Consistent local and staging environments |
| **Reverse Proxy** | Nginx | Production request routing and SSL termination |
| **Hosting** | Vercel (Frontend & Serverless Backend) | Global edge deployment with automated CI/CD |

---

## Project Structure

```
/
├── frontend/                 # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/ui/    # Shared Design System UI components
│   │   ├── features/         # Domain feature modules (attendance, tc, etc.)
│   │   ├── pages/            # Role dashboards, login, and error pages
│   │   └── router/           # App router with lazy loading and code-splitting
│   └── scripts/              # SPA fallback generation scripts
├── backend/                  # Node.js + Express + TypeScript API
│   ├── prisma/               # Database schema and migration history
│   ├── src/
│   │   ├── middleware/       # Auth, Tenant Resolver, Error Handling
│   │   └── modules/          # Business logic controllers, routers, and schemas
│   └── scripts/              # Master seed, audit, and verification suites
├── docker/                   # Dockerfiles and Nginx configuration
├── ARCHITECTURE.md           # Detailed system architecture document
├── DESIGN_SYSTEM.md          # Visual design system specifications
├── PRD.md                    # Product Requirements Document
├── AGENTS.md                 # Engineering guidelines and constraints
├── LICENSE                   # Proprietary software license
└── package.json              # Monorepo workspaces definition
```

---

## Installation and Setup

### Prerequisites

- **Node.js**: 20 LTS or higher
- **PostgreSQL**: 15+ (local or Supabase instance)
- **npm**: 9+

### 1. Clone the Repository

```bash
git clone https://github.com/adityakittad1/eduvanta.git
cd eduvanta
```

### 2. Environment Configuration

```bash
cp .env.example .env
cp .env.example backend/.env
```

Configure `backend/.env` with your PostgreSQL database URL, JWT secrets, and Supabase credentials:

```ini
DATABASE_URL="postgresql://user:password@host:5432/eduvanta"
JWT_ACCESS_SECRET="your_secure_access_secret_here"
JWT_REFRESH_SECRET="your_secure_refresh_secret_here"
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_KEY="your-service-key"
```

### 3. Backend Setup & Database Seeding

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
node scripts/master-seed.js
npm run dev
```

The backend server will run at `http://localhost:3000`.

### 4. Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The frontend application will run at `http://localhost:5173`.

---

## Default Demonstration Credentials

All demo accounts use the standard password: `Eduvanta@123`

| Role | Email | School / Context |
|---|---|---|
| **SUPER_ADMIN** | `admin@zpschoolerp.com` | Multi-School System Administration |
| **PRINCIPAL** | `shinde@gmail.com` | ELLORA HIGHSCHOOL (Primary Demo School) |
| **TEACHER** | `ask12@gmail.com` | ELLORA HIGHSCHOOL |
| **STUDENT** | `adityakittad23@gmail.com` | ELLORA HIGHSCHOOL |

---

## Verification & Automated Audits

The project includes automated verification and regression suites:

```bash
# Run backend Jest regression test suite
npm test --prefix backend

# Verify multi-tenant isolation across all 11 schools
node backend/scripts/verify-isolation.js

# Verify sample data record counts
node backend/scripts/verify-all-data.js

# Audit all 20 interactive button & CRUD action handlers
node backend/scripts/audit-actions.js
```

---

## Project Ownership & Copyright

- **Project:** Eduvanta
- **Developed by:** Aditya Kittad
- **Copyright:** © 2026 Aditya Kittad
- **Project Type:** B.Tech Final Year Major Project
- **Repository:** adityakittad1/eduvanta

Eduvanta is an original academic software project developed by Aditya Kittad. Its original source code, design, architecture, and documentation are protected by applicable copyright laws. All rights are reserved unless otherwise stated.

---

## Developer Attribution

Eduvanta was conceptualized, architected, and engineered by **Aditya Kittad** as a final-year B.Tech Major Project in Computer Science and Engineering.

Special appreciation is extended to faculty mentors, educational administrators, and the open-source software community for the foundational tools and frameworks that made this project possible.

---

## License

Copyright (c) 2026 Aditya Kittad. All Rights Reserved.  
See [LICENSE](./LICENSE) for full proprietary license terms.
