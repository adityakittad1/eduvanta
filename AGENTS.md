# AGENTS.md — Coding Agent Rules

**Version:** 1.0

**Last Updated:** 2026-09-24

This file defines binding rules for all AI coding agents working on the ZP School ERP project.
Every agent MUST read this file at the start of every session before writing any code.

---

## 1. Source-of-Truth Hierarchy

Follow this hierarchy when resolving conflicts or ambiguity:

1. Explicit instruction in the current conversation
2. This file (AGENTS.md)
3. PRD.md
4. ARCHITECTURE.md
5. DESIGN_SYSTEM.md
6. Existing working project code
7. General engineering best practices

**If a new request conflicts with an existing documented requirement that affects architecture, security, database design, or project scope — STOP. Explain the conflict. Ask for confirmation before proceeding.**

---

## 2. Mandatory First Steps (Every Session)

Before writing any application code:

1. Read AGENTS.md (this file)
2. Read PRD.md
3. Read ARCHITECTURE.md
4. Read DESIGN_SYSTEM.md
5. Inspect existing source code structure
6. Inspect existing package files and dependencies
7. Inspect existing database migrations/schema
8. Identify what has already been implemented
9. Identify what is currently in progress

Do NOT skip this step.
Do NOT assume the project is in the same state as a previous session.

---

## 3. No Hallucination / No Assumption Policy

Do NOT invent or fabricate:

- Database fields that have no purpose in PRD.md
- API endpoints not required by a current feature
- User roles not defined in PRD.md
- School policies or academic rules
- Government regulations or integration capabilities
- Fake statistics, fake school data, fake student data
- AI capabilities that have not been implemented
- Technologies, services, or microservices not in ARCHITECTURE.md
- Unnecessary infrastructure

When information is missing:

1. Check PRD.md
2. Check ARCHITECTURE.md
3. Check existing implementation
4. If the decision is **low-risk and reversible**: choose the simplest reasonable implementation and document it
5. If the decision **affects architecture, security, data model, or scope**: ask before proceeding

---

## 4. Phase-by-Phase Implementation Rule

**DO NOT build everything in one step.**

Follow the phase plan defined in PRD.md / this project's implementation plan.
Complete and test each phase before moving to the next.
Do not jump ahead to implement modules that depend on incomplete foundations.

Current phase status is tracked in `task.md` and the implementation plan artifact.

---

## 5. Database Rules

- All database changes go through migrations (never raw schema dumps applied manually)
- Every school-owned entity MUST have a `school_id` foreign key
- Every query on school-owned entities MUST include a `school_id` filter derived from the authenticated session
- Never trust `school_id` sent by an untrusted client as the sole authorization check
- Use meaningful column names; avoid abbreviations
- Add indexes for all foreign keys and common filter columns
- Never store binary file content directly in PostgreSQL (use file storage references)

---

## 6. Backend Rules

- Business logic belongs in the backend — NEVER only in the frontend
- Every protected endpoint MUST verify: authentication → role → school scope
- Input validation on every API endpoint (use Zod)
- No stack traces or sensitive data in API error responses
- Structured error responses: `{ success: false, message: "...", code: "..." }`
- Structured success responses: `{ success: true, data: {...} }`
- Paginate all list endpoints — never return unbounded lists to the browser
- Environment variables for ALL secrets — never hardcode
- Use `dotenv` for local; use proper secret injection for production

---

## 7. Frontend Rules

- Frontend authorization (protected routes, UI hiding) is for UX convenience only — NOT security
- Every API call must handle: loading, success, empty, error states
- Never leave a blank/broken screen on load failure
- Use the design system defined in DESIGN_SYSTEM.md — do not invent new styles
- Do not use inline styles for structural/thematic styling
- Do not create a new button/input/card style on every page — use shared components
- All forms must show validation errors clearly
- Use TypeScript strictly — no `any` unless genuinely necessary and commented

---

## 8. Security Rules

- AI API keys MUST live in backend environment variables ONLY — never in frontend code
- AI requests MUST go through the backend — never directly from browser to LLM
- LLM must NEVER execute arbitrary SQL — all data retrieval goes through authorized service functions
- Passwords hashed with bcrypt — never stored plain or with weak hashing
- JWT secrets in environment variables only
- File uploads: validate MIME type, file extension, and size on the backend
- CORS: allow only known origins in production
- Audit log: all TC issuances, role changes, school onboardings must be logged

---

## 9. File Storage Rules

- Large binary files (PDFs, images, videos) must NOT be stored as blobs in PostgreSQL
- Use a file storage solution (local filesystem with path reference OR object storage)
- Store only the file path / URL reference in the database
- Validate file type and size before accepting uploads
- Serve files through authenticated routes where content is sensitive

---

## 10. AI Assistant Rules

- The AI assistant operates within strict authorization boundaries
- The data passed to the LLM must be pre-fetched by the backend using authorized queries
- The LLM receives context — not database credentials or raw SQL execution ability
- Never pass a student's data to the LLM in a query made by another student
- Never pass school data across school boundaries

---

## 11. Documentation Maintenance

At the end of every major phase:

- Update PRD.md if requirements changed
- Update ARCHITECTURE.md if architecture changed
- Update DESIGN_SYSTEM.md if visual design changed
- Update AGENTS.md if agent rules changed
- Update the task.md / implementation_plan.md to reflect phase completion
- Create CHANGELOG.md entry for the completed phase

Do not let documentation drift from implementation.

---

## 12. Code Quality Standards

- ESLint and Prettier must pass on all committed code
- TypeScript strict mode: no unresolved type errors
- No commented-out dead code committed to main
- No `console.log` left in production paths (use structured logger)
- All async operations properly error-handled (try/catch or `.catch()`)
- React components must not fetch data directly — use service/hook abstraction

---

## 13. What NOT to Do

- Do NOT delete working code without explicit instruction
- Do NOT replace the established tech stack without strong justification and user approval
- Do NOT initialize a new framework if one is already correctly configured
- Do NOT introduce Kubernetes or microservices for complexity's sake
- Do NOT make architecture decisions silently that affect scope, security, or data model
- Do NOT build features not in scope for the current phase
- Do NOT fabricate that a feature works when it has not been tested
- Do NOT place secrets in frontend code

---

## 14. Established Technology Stack (DO NOT CHANGE WITHOUT APPROVAL)

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Vanilla CSS (custom design system per DESIGN_SYSTEM.md) |
| Backend | Node.js, TypeScript, Express |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod |
| File Storage | Local filesystem (Phase 1); Object storage path designed for later migration |
| AI | LLM API (backend only, provider TBD) |
| Reverse Proxy | Nginx |
| Containers | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Linux |

Do not introduce new technologies (Redis, GraphQL, tRPC, Prisma alternatives, etc.) without explicit approval and a documented rationale.

---

## 15. Completed Phases Log

*(Updated as phases are completed)*

| Phase | Description | Status |
|---|---|---|
| 0 | Project inspection and planning | ✅ Complete |
| 1 | Repository foundation | ⬜ Pending |
| 2 | Authentication + RBAC | ⬜ Pending |
| 3 | Multi-school architecture | ⬜ Pending |
| ... | ... | ... |

---

*This file is binding. Do not override it without updating it and documenting the reason.*
