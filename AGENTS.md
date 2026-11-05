# AI Coding Agent Instructions
## ZP School ERP

**Project:** Eduvanta - Multi-Tenant School ERP Platform  
**Project Owner & Developer:** Aditya Kittad  
**Copyright:** © 2026 Aditya Kittad. All Rights Reserved.  
**Project Type:** B.Tech Final Year Major Project  
**Repository:** https://github.com/adityakittad1/eduvanta  
**Live Application:** https://eduvanta-liard.vercel.app  
You are working on a production-quality B.Tech final-year major project.

This file defines binding rules for all AI coding agents working on the Eduvanta project.
Every agent MUST read this file at the start of every session before writing any code.

---

# 1. Primary Objective

Build a polished, maintainable and scalable multi-school School ERP.

The initial deployment is intended for six sponsored Zilla Parishad schools.

The architecture must support additional schools without rewriting the application.

---

# 2. Development Philosophy

Follow these principles:

1. Do not over-engineer.
2. Do not create unnecessary features.
3. Prefer simple, maintainable solutions.
4. Keep the UI simple even when backend architecture is sophisticated.
5. Never sacrifice security for development speed.
6. Do not duplicate logic.
7. Reuse components.
8. Keep modules loosely coupled.
9. Validate data at boundaries.
10. Never expose secrets.

---

# 3. Before Coding

Before implementing a new feature:

1. Inspect the existing project structure.
2. Identify existing components/services.
3. Reuse existing patterns.
4. Check the database schema.
5. Check authentication and authorization.
6. Avoid creating duplicate functionality.

Do not rewrite working modules without a strong reason.

---

# 4. Multi-School Rule

This is a multi-school platform.

Every school-owned entity must be associated with a school_id or equivalent tenant identifier.

Examples:

- students
- teachers
- classes
- attendance
- marks
- quizzes
- resources
- notices
- gallery
- TCs

Never assume a single school.

Never hard-code school names.

Never use global queries for school-owned data without authorization.

---

# 5. Authorization

Always enforce authorization on the backend.

Frontend hiding is NOT security.

Roles:

- SUPER_ADMIN
- PRINCIPAL
- TEACHER
- STUDENT

Expected access:

SUPER_ADMIN:
All schools

PRINCIPAL:
Own school

TEACHER:
Own school and assigned classes/subjects

STUDENT:
Own student record and permitted resources

---

# 6. Data Privacy

Student information is sensitive.

Never expose:

- student data across schools
- another student's private records
- private teacher information
- internal database identifiers unnecessarily

Do not log passwords, tokens, API keys or sensitive student information.

---

# 7. API Rules

Every protected API endpoint must:

1. Authenticate request.
2. Validate role.
3. Determine school context.
4. Validate resource ownership.
5. Validate request data.
6. Perform operation.
7. Return safe response.

Use consistent error responses.

---

# 8. Database Rules

Use PostgreSQL.

Prefer normalized relational data.

Use foreign keys.

Use indexes for frequently queried fields.

Use timestamps where useful.

Avoid storing structured data as arbitrary JSON when relational fields are more appropriate.

Use transactions for multi-step operations that must remain consistent.

Never delete important records casually.

Prefer soft deletion where historical records matter.

---

# 9. File Upload Rules

Files include:

- school logos
- gallery images
- learning resources
- generated documents

Validate:

- file type
- file size
- ownership
- upload permissions

Do not trust filename extensions alone.

Do not expose private files publicly unless intended.

Do not store large binary files directly inside PostgreSQL unless there is a specific reason.

Use object/file storage.

---

# 10. AI Assistant Rules

The AI assistant must never receive unrestricted database access.

Never allow the model to directly execute arbitrary SQL.

Use controlled backend functions.

Example:

User asks:
"What is my attendance?"

Backend:
authenticate → identify student → fetch attendance → provide context → AI response

Never:

User → AI → raw database

The AI should only receive the minimum data required.

---

# 11. UI Rules

Use the shared design system.

Do not invent random colors, spacing or typography.

Every screen must include appropriate:

- loading state
- empty state
- error state
- success feedback

Forms must have clear validation.

Avoid excessive animations.

Keep rural users in mind.

---

# 12. Responsive Design

The application must work on:

- desktop
- tablet
- mobile

Teachers may primarily use phones.

Do not build desktop-only workflows.

---

# 13. Code Quality

Use:

- TypeScript
- meaningful names
- small reusable functions
- reusable components
- clear folder structure

Avoid:

- giant components
- duplicated logic
- unexplained magic numbers
- unnecessary dependencies
- dead code
- temporary hacks in production paths

---

# 14. Error Handling

Never silently fail.

Display useful user-facing messages.

Log useful technical information server-side.

Do not expose stack traces or internal implementation details to users.

---

# 15. Environment Variables

Secrets must never be committed.

Use:

.env.local
.env.example

The `.env.example` file may contain variable names but never real secrets.

Examples:

DATABASE_URL=
AI_API_KEY=
STORAGE_URL=

---

# 16. Git Rules

Use meaningful commits.

Examples:

feat: add student management
feat: implement attendance module
fix: enforce school-level authorization
feat: add learning resource uploads
ci: add docker build workflow

Do not commit:

- secrets
- production credentials
- generated node_modules
- unnecessary binaries

---

# 17. Docker Rules

Each service must have a clear responsibility.

Prefer a small number of containers.

Do not create microservices unnecessarily.

Local development should be easy.

Docker Compose should allow the development stack to start consistently.

---

# 18. CI/CD

GitHub Actions should eventually perform:

1. Install dependencies
2. Lint
3. Test
4. Build
5. Build Docker image
6. Deploy where configured

CI failures should be fixed before adding unrelated features.

---

# 19. Testing

Prioritize tests for:

- authentication
- authorization
- school isolation
- attendance calculations
- academic calculations
- early-warning rules
- TC generation
- important API endpoints

Do not chase arbitrary test coverage numbers.

Test business-critical behavior.

---

# 20. Do Not Add Features Automatically

Do not introduce:

- facial recognition
- handwritten OCR attendance
- payment systems
- parent apps
- Kubernetes
- custom LLM training
- unnecessary AI agents

unless explicitly requested.

---

# 21. Build Strategy

Implement in this order:

1. Project foundation
2. Authentication
3. Multi-school architecture
4. School profile
5. Students
6. Teachers
7. Classes/subjects
8. Attendance
9. Academics
10. Analytics
11. Early Warning
12. Quizzes
13. Learning Resources
14. Notices
15. TC
16. AI Assistant
17. Reports
18. Docker
19. CI/CD
20. Deployment and polish

---

# 22. Important

Do not make the product look like a generic admin dashboard template.

It should feel like a cohesive education platform.

Prioritize:

- clarity
- consistency
- usability
- trust
- accessibility
- professional visual hierarchy

The final result must be appropriate for a B.Tech final-year major project and potentially usable by real schools.