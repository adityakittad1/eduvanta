# ARCHITECTURE.md — Technical Architecture

**Version:** 1.0 (Greenfield Baseline)

**Last Updated:** 2026-09-24

**Project:** ZP School ERP — Data-Driven Student Monitoring and Academic Assistance System

---

## 1. Architecture Overview

ZP School ERP is a multi-tenant, multi-school web application with a REST API backend and a React frontend. The architecture is intentionally straightforward — a clean monolith for the backend and a single-page application for the frontend — containerized with Docker and deployed behind Nginx.

```
┌───────────────────────────────────────────────────────────────┐
│                         Browser                               │
│                    React SPA (Vite)                           │
└────────────────────────┬──────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌───────────────────────────────────────────────────────────────┐
│                        Nginx                                  │
│          Reverse Proxy + Static File Serving                  │
└──────────┬──────────────────────────────────────┬────────────┘
           │ /api/*                               │ /*
           ▼                                      ▼
┌──────────────────────┐                ┌──────────────────────┐
│   Node.js / Express  │                │  React SPA (static)  │
│   TypeScript Backend │                │  served by Nginx      │
│                      │                └──────────────────────┘
│  - Auth              │
│  - RBAC Middleware   │
│  - School Isolation  │
│  - Business Logic    │
│  - File Upload       │
│  - AI Context Builder│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐         ┌──────────────────────┐
│     PostgreSQL        │         │     File Storage      │
│   (via Prisma ORM)   │         │  (Local filesystem    │
│                      │         │   or Object Storage)  │
└──────────────────────┘         └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│     LLM API          │
│  (External — backend │
│   calls only)        │
└──────────────────────┘
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend Framework | React 18 + TypeScript | Industry standard, strong ecosystem |
| Frontend Build Tool | Vite | Fast HMR, lightweight |
| Frontend Styling | Vanilla CSS (custom design system) | Full control, no utility class overhead |
| Backend Runtime | Node.js 20 LTS | Consistent TypeScript stack |
| Backend Framework | Express.js + TypeScript | Lightweight, well-understood |
| ORM | Prisma | Type-safe queries, migration support |
| Database | PostgreSQL 15+ | Relational, proven, supports JSONB |
| Input Validation | Zod | TypeScript-native, composable |
| Auth | JWT (access + refresh), bcrypt | Stateless, scalable |
| File Storage | Local filesystem (Phase 1) | Simple, migratable to object storage |
| AI | External LLM API (backend only) | Provider TBD; Gemini/OpenAI compatible |
| Reverse Proxy | Nginx | Production standard |
| Containerization | Docker + Docker Compose | Portable, repeatable deployments |
| CI/CD | GitHub Actions | Integrated with repository |
| Deployment OS | Linux (Ubuntu/Debian) | Production standard |

---

## 3. Repository Structure

```
/
├── frontend/                   # React + TypeScript + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/             # Primitives: Button, Input, Modal, etc.
│   │   │   └── layout/         # Layout components: Sidebar, Header, etc.
│   │   ├── features/           # Feature modules (auth, students, attendance, etc.)
│   │   │   └── [feature]/
│   │   │       ├── components/
│   │   │       ├── hooks/
│   │   │       ├── services/   # API call functions
│   │   │       └── types.ts
│   │   ├── hooks/              # Shared hooks
│   │   ├── lib/                # Utilities, API client, helpers
│   │   ├── pages/              # Top-level page components
│   │   ├── router/             # React Router config
│   │   ├── store/              # Global state (Zustand or Context)
│   │   ├── styles/             # Global CSS, design tokens, variables
│   │   ├── types/              # Global TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── backend/                    # Node.js + Express + TypeScript
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema (single source of truth for DB)
│   │   └── migrations/         # Auto-generated migration files
│   ├── src/
│   │   ├── config/             # App config, env validation
│   │   ├── middleware/         # Auth, RBAC, error handling, logging
│   │   ├── modules/            # Feature modules
│   │   │   └── [module]/
│   │   │       ├── [module].router.ts
│   │   │       ├── [module].controller.ts
│   │   │       ├── [module].service.ts
│   │   │       └── [module].schema.ts  # Zod validation schemas
│   │   ├── lib/                # Shared utilities (prisma client, logger, etc.)
│   │   ├── types/              # Global TypeScript types
│   │   └── app.ts              # Express app setup
│   ├── index.ts                # Server entry point
│   ├── tsconfig.json
│   └── package.json
│
├── database/                   # DB-related scripts and seeds
│   └── seeds/
│
├── docker/                     # Docker build files
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── nginx.conf
│
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
│
├── docs/                       # Additional documentation
│
├── PRD.md
├── AGENTS.md
├── DESIGN_SYSTEM.md
├── ARCHITECTURE.md
├── README.md
├── docker-compose.yml
├── docker-compose.dev.yml
└── .env.example
```

---

## 4. Multi-School Data Isolation Architecture

This is a critical architectural requirement. **Every school-owned entity carries a `school_id`.**

### 4.1 Tenancy Model

- **Tenancy type:** Shared database, school-scoped rows (logical multi-tenancy)
- Each row in school-owned tables has a `school_id` column with a foreign key to the `schools` table
- No data is ever returned without verifying the authenticated user belongs to the same school

### 4.2 School Context Resolution

```
Request → JWT middleware → decode userId and role
        → If TEACHER/PRINCIPAL/STUDENT: load user's school_id from DB
        → Attach { userId, role, schoolId } to req.user
        → All subsequent queries use req.user.schoolId — never client-supplied schoolId
```

### 4.3 SUPER_ADMIN Context

- SUPER_ADMIN has no `school_id` in their token
- SUPER_ADMIN must explicitly target a school via route parameter (e.g., `/api/super-admin/schools/:schoolId/...`)
- Backend validates that the target school exists before acting

### 4.4 School-Scoped Entities

All of the following tables MUST have `school_id`:

```
students, teachers, classes, subjects, attendance_records,
academic_records, assessments, quiz_definitions, quiz_attempts,
learning_resources, notices, gallery_items, transfer_certificates,
teacher_class_assignments, early_warning_flags, audit_logs
```

### 4.5 Frontend Tenant Resolution and Routing

- **Tenant Identification:** The frontend extracts the tenant slug from the browser's hostname (e.g., `karmad.zpschoolerp.com` -> `karmad`).
- **Public Website (`/`):** When a tenant is resolved, the root path serves the `SchoolPublicHome` page populated with that school's data.
- **Digital Campus (`/erp/*`):** All private, authenticated ERP routes are nested under the `/erp` path to ensure clean separation between the public marketing site and the secure digital campus.

---

## 5. Authentication Architecture

### 5.1 JWT Strategy

- **Access Token:** Short-lived (15 minutes). Sent in Authorization header.
- **Refresh Token:** Long-lived (7 days). Stored in HTTP-only cookie.
- **Token Rotation:** Refresh endpoint issues new access + refresh token pair and invalidates old refresh token.
- **Refresh Token Storage:** Stored in `refresh_tokens` table (allows revocation).

### 5.2 Auth Flow

```
Login Request
→ Validate credentials
→ Hash compare (bcrypt)
→ Issue access token (JWT, 15m)
→ Issue refresh token (JWT, 7d) → store in DB → set HTTP-only cookie
→ Return access token in response body

Protected Request
→ Bearer token in Authorization header
→ Verify and decode JWT
→ Attach user context to request
→ Continue to route handler

Token Refresh
→ Read refresh token from HTTP-only cookie
→ Verify against DB record
→ Issue new access + refresh tokens
→ Invalidate old refresh token

Logout
→ Delete refresh token from DB
→ Clear HTTP-only cookie
```

### 5.3 Password Policy

- Minimum 8 characters (enforced by Zod)
- Bcrypt rounds: 12

---

## 6. API Design

### 6.1 Base URL

```
/api/v1/
```

### 6.2 Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "total": 100, "limit": 20 }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

### 6.3 Key API Module Groups

| Prefix | Module |
|---|---|
| `/api/v1/auth` | Authentication |
| `/api/v1/schools` | School management |
| `/api/v1/users` | User management |
| `/api/v1/students` | Student management |
| `/api/v1/teachers` | Teacher management |
| `/api/v1/classes` | Class management |
| `/api/v1/subjects` | Subject management |
| `/api/v1/attendance` | Attendance |
| `/api/v1/academics` | Academic records |
| `/api/v1/analytics` | Analytics |
| `/api/v1/early-warning` | Early Warning System |
| `/api/v1/quizzes` | Quiz system |
| `/api/v1/resources` | Learning Resource Hub |
| `/api/v1/notices` | Notices |
| `/api/v1/tc` | Transfer Certificates |
| `/api/v1/ai` | AI Assistant |
| `/api/v1/reports` | Reports |
| `/api/v1/gallery` | Gallery |
| `/api/v1/health` | Health check |

### 6.4 Middleware Stack (per protected route)

```
authenticate → resolveSchool → requireRole([...]) → validate(schema) → controller
```

---

## 7. Database Schema (Core Entities)

> Full schema defined in `backend/prisma/schema.prisma`. This section documents the logical model.

### 7.1 Core Tables

```
schools
  id, name, logo_url, address, contact_phone, contact_email,
  principal_name, description, is_active, created_at, updated_at

users
  id, email, password_hash, role (SUPER_ADMIN|PRINCIPAL|TEACHER|STUDENT),
  school_id (nullable for SUPER_ADMIN), is_active, created_at, updated_at

refresh_tokens
  id, user_id, token_hash, expires_at, created_at, revoked_at

students
  id, school_id, user_id (nullable — for student login), admission_number,
  first_name, last_name, date_of_birth, gender, address,
  class_id, enrollment_date, is_active, created_at, updated_at

teachers
  id, school_id, user_id, employee_id, first_name, last_name,
  qualification, is_active, created_at, updated_at

classes
  id, school_id, name, division, academic_year, is_active, created_at, updated_at

subjects
  id, school_id, class_id, name, code, is_active, created_at, updated_at

teacher_class_subjects
  id, teacher_id, class_id, subject_id, school_id, academic_year

attendance_records
  id, school_id, class_id, student_id, date, status (PRESENT|ABSENT|LATE|HOLIDAY),
  marked_by_teacher_id, created_at

assessments
  id, school_id, class_id, subject_id, name, type (UNIT_TEST|HALF_YEARLY|ANNUAL|OTHER),
  max_marks, conducted_date, academic_year, created_at

academic_records
  id, school_id, student_id, assessment_id, marks_obtained, remarks, created_at

quiz_definitions
  id, school_id, class_id, subject_id, title, topic, created_by_teacher_id,
  is_published, created_at

quiz_questions
  id, quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option

quiz_attempts
  id, school_id, quiz_id, student_id, score, max_score, completed_at

learning_resources
  id, school_id, class_id, subject_id, topic, title, description,
  file_url, file_type, uploaded_by_teacher_id, created_at

notices
  id, school_id, title, content, target_audience (ALL|TEACHERS|STUDENTS|CLASS),
  target_class_id (nullable), status (DRAFT|PUBLISHED), published_at,
  created_by_user_id, created_at

transfer_certificates
  id, school_id, student_id, tc_number, reason, requested_date, approved_date,
  issued_date, status (REQUESTED|APPROVED|ISSUED|CANCELLED),
  approved_by_user_id, file_url, created_at

gallery_items
  id, school_id, title, description, category, file_url, uploaded_by_user_id, created_at

early_warning_flags
  id, school_id, student_id, flag_type, details (JSONB), is_resolved, created_at, resolved_at

audit_logs
  id, school_id, user_id, action, entity_type, entity_id, details (JSONB), created_at

school_facilities
  id, school_id, name, description

school_achievements
  id, school_id, title, description, year
```

---

## 8. File Storage Architecture

### Phase 1 (Current)

- Files stored on local filesystem of backend container
- Path: `/app/uploads/[school_id]/[category]/[uuid].[ext]`
- Database stores relative path or full URL reference
- Served via Express static middleware or dedicated route with auth check

### Future Migration Path

- Storage abstraction layer designed from the start
- When migrating to object storage (e.g., Cloudflare R2, AWS S3, MinIO):
  - Only the storage service module changes
  - Database references update from local paths to object storage URLs
  - No other code changes required

---

## 9. AI Assistant Architecture

```
User message (text)
       │
       ▼
Frontend (sends to backend — authenticated)
       │
       ▼
Backend: /api/v1/ai/chat
  1. Authenticate user (JWT)
  2. Identify role and school
  3. Parse intent from user message
  4. Fetch ONLY authorized data from DB:
       - Student queries own data only
       - Teacher queries own school's assigned students
       - Principal queries own school
  5. Build structured context object
  6. Construct prompt with context + user question
  7. Call LLM API (server-side, API key from env)
  8. Receive response
  9. Post-process (no raw DB data leaked in response)
 10. Return response to user
```

**Constraints:**
- LLM receives context (structured text), NOT database access
- LLM cannot execute queries
- User-supplied prompt is sanitized before being passed to LLM
- AI API key is NEVER sent to or stored on the frontend

---

## 10. DevOps Architecture

### 10.1 Docker Compose (Development)

```yaml
services:
  postgres:     PostgreSQL 15
  backend:      Node.js Express API
  frontend:     Vite dev server (dev) / Nginx (prod)
  nginx:        Reverse proxy (prod only)
```

### 10.2 GitHub Actions CI Pipeline

```
On push to main / PR:
  → Checkout
  → Install dependencies
  → Lint (ESLint + Prettier)
  → Type check (tsc --noEmit)
  → Run tests
  → Build frontend
  → Build backend
  → Build Docker images (on main branch merge)
  → (Future) Deploy
```

### 10.3 Environment Variables

All configuration via environment variables. See `.env.example` for full list.

Key variables:
```
DATABASE_URL
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
AI_API_KEY
AI_PROVIDER
FILE_UPLOAD_DIR
FRONTEND_URL
NODE_ENV
PORT
```

---

## 11. Health Check

```
GET /api/v1/health

Response:
{
  "status": "ok",
  "timestamp": "2026-09-24T...",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## 12. Architecture Decisions Log

| Decision | Rationale | Date |
|---|---|---|
| Shared DB multi-tenancy (school_id per row) | Simpler than schema-per-tenant for initial 6 schools; easier migrations | 2026-09-24 |
| Prisma ORM | Type-safe, migration support, strong TS integration | 2026-09-24 |
| Vanilla CSS (no Tailwind) | Per DESIGN_SYSTEM.md — full visual control, no utility class bloat | 2026-09-24 |
| Local filesystem storage (Phase 1) | Simple, no external dependency; abstraction layer allows future migration | 2026-09-24 |
| Express (not Fastify/Nest) | Lightweight, well-known, appropriate for project complexity | 2026-09-24 |
| Zod validation | TypeScript-native, composable, works well with Express | 2026-09-24 |
| JWT refresh in HTTP-only cookie | Prevents XSS token theft; standard secure approach | 2026-09-24 |

---

*This document is the source of truth for technical architecture. Update when architectural decisions change.*
