# Product Requirements Document (PRD)

**Project Title:** Data-Driven Student Monitoring and Academic Assistance System for Zilla Parishad Schools

**Product Name:** ZP School ERP

**Version:** 1.0 (Greenfield)

**Last Updated:** 2026-09-24

**Author:** Project Team

---

## 1. Project Overview

### 1.1 Purpose

ZP School ERP is a production-quality, multi-school Education Resource Planning platform built for Zilla Parishad (ZP) schools. It digitizes core school operations and transforms raw student data into actionable academic insights and assistance.

### 1.2 Academic Context

- **Academic Project Title:** Data-Driven Student Monitoring and Academic Assistance System for Zilla Parishad Schools
- **Level:** B.Tech Final Year Major Project
- **Deployment Target:** 6 sponsored Zilla Parishad schools (initial)

### 1.3 Primary Goals

1. Digitize critical school operations (attendance, academics, TC, notices)
2. Provide data-driven student monitoring with Early Warning System
3. Deliver academic assistance through AI and learning resources
4. Provide a professional, simple, rural-first user experience
5. Be scalable and maintainable beyond the 6 initial schools

---

## 2. User Roles

| Role | Description |
|---|---|
| `SUPER_ADMIN` | Platform-level admin. Manages all schools. Onboards new schools. |
| `PRINCIPAL` | School-level admin. Manages own school. Views all school data. |
| `TEACHER` | Manages assigned classes/subjects. Marks attendance, enters marks, creates quizzes and resources. |
| `STUDENT` | Accesses own academic data, resources, quizzes, AI assistant, notices. |

### 2.1 Role Permissions Summary

- **SUPER_ADMIN**: Full platform access. Can create/manage schools and users across all schools.
- **PRINCIPAL**: Full access to own school only. Cannot access other schools.
- **TEACHER**: Access to own school's assigned classes, students, subjects. Cannot access other teachers' data beyond shared school resources.
- **STUDENT**: Access to own profile, own attendance, own academic performance, own school's resources, quizzes for own class, school notices. Cannot access other students' data.

> **Security Rule:** Role permissions are enforced on the backend. Frontend-only hiding is NOT security.

---

## 3. Core Modules

### 3.1 Multi-School Management

- SUPER_ADMIN can onboard a new school without code changes
- Each school has an isolated data boundary
- School context is derived from authenticated session — not trusted from client

### 3.2 Authentication & RBAC

- Secure email + password authentication with JWT
- Role-based access control enforced at API level
- Refresh token rotation
- Password hashing with bcrypt
- Protected routes on frontend (UI convenience only; backend remains authoritative)

### 3.3 School Profile

- School name, logo, address, contact, principal info, description
- Facilities list
- Achievements list
- Gallery (photos by category)
- Logo appears in school-branded areas

### 3.4 Student Management

- Add / edit / deactivate students
- Student 360° Profile:
  - Overview (personal info, enrollment)
  - Attendance history & summary
  - Academic performance by subject / assessment
  - Quiz performance
  - Learning resources (class-level)
  - Attention indicators (Early Warning flags with reasons)
  - TC information

### 3.5 Teacher / Staff Management

- Add / edit / deactivate teachers
- Assign classes and subjects to teachers
- Teacher profile

### 3.6 Classes & Subjects

- Create and manage classes (e.g., Class 5, Class 6 – Division A)
- Create and manage subjects per class
- Assign subjects to teachers

### 3.7 Attendance

- Teacher selects class → date → sees student list → marks present/absent → saves
- View daily attendance records
- View monthly summaries
- View student attendance history
- Class-level attendance analytics
- Attendance percentage per student

> **Out of Scope (Phase 1–10):** Handwritten attendance OCR. Not to be implemented unless explicitly requested.

### 3.8 Academic Performance

- Teachers enter academic results per student per subject per assessment type
- System calculates: student average, subject average, class average, performance trends
- Assessment types: configurable (e.g., Unit Test, Half-Yearly, Annual)
- Grading thresholds: configurable per school or platform-wide

### 3.9 Analytics & Early Warning System

- Rule-based transparent Early Warning flagging
- Flags triggered by:
  - Attendance below configurable threshold (e.g., 75%)
  - Academic average below configurable threshold (e.g., 40%)
  - Declining performance trend
  - Repeated low quiz scores
- System explains WHY a student is flagged (not just that they are)
- Example: "Attendance: 62% | Mathematics average: 41%"
- NO claims of predicting future outcomes

### 3.10 Digital Learning Resource Hub

- Teachers upload: PDF notes, worksheets, question papers, images, educational videos, reference material
- Organized hierarchy: Class → Subject → Chapter/Topic → Resource
- Students access resources relevant to their class only
- Secure file storage (not binary in PostgreSQL)

### 3.11 Quiz System

- Teachers create topic-wise MCQ quizzes per class/subject/topic
- Students attempt, submit, view scores
- Track quiz progress per student
- NOT a full examination engine in Phase 1

### 3.12 Notices & Announcements

- Authorized users publish notices
- Target audience: whole school, specific class, teachers, all students
- Fields: title, content, publish date, target audience, status (draft/published)

### 3.13 Transfer Certificate (TC) Management

- Workflow: Request → Verify student data → Principal approval → Generate TC PDF → Issue → Archive
- TC number auto-generated
- Printable professional PDF layout
- TC history maintained per student and per school

### 3.14 AI School Assistant

- Role-aware AI assistant backed by LLM API (accessed only from backend)
- Student: ask about own attendance, own marks, practice questions, topic explanations
- Teacher: query students' performance, generate quiz questions
- Principal: school-level stats queries
- Architecture: User → Backend (auth + role check + school check + data retrieval + context builder) → LLM → Response
- LLM cannot execute arbitrary SQL. No direct DB access.
- AI API keys stored only in backend environment variables

### 3.15 Reports

- Attendance reports (student, class, school)
- Academic performance reports
- Early warning reports
- Quiz performance reports
- TC records report
- Printable / PDF-exportable

### 3.16 Gallery

- Authorized users upload school photos
- Categories: Infrastructure, Events, Activities, Sports, Achievements, Cultural, Educational
- Upload progress and preview
- Optimized images

### 3.17 Dashboards

**Principal Dashboard:**
- Student count, teacher count, today's attendance
- Attendance trends chart
- Academic performance summary
- Students requiring attention (Early Warning)
- Recent notices
- Quick actions

**Teacher Dashboard:**
- Assigned classes
- Today's attendance status
- Students overview
- Academic activity feed
- Learning resources quick access
- Students requiring attention

**Student Dashboard:**
- Own attendance summary
- Academic performance snapshot
- Quiz progress
- Learning resources
- Recent notices
- AI assistant quick access

---

## 4. Non-Functional Requirements

### 4.1 Security

- Authentication: JWT (access + refresh tokens), bcrypt passwords
- Authorization: server-side role and school checks on every protected endpoint
- Input validation: all API inputs validated (Zod or equivalent)
- File security: file type and size validation, no executable uploads
- Secret management: environment variables, never in code
- Error handling: no stack traces or sensitive data in API error responses
- Audit logging: important administrative actions logged

### 4.2 Performance

- Pagination on all list endpoints
- Lazy loading and code splitting on frontend
- Optimized database queries with proper indexes
- Debounced search
- Image optimization for gallery/uploads
- Caching where appropriate

### 4.3 Responsiveness

- Fully responsive: desktop, laptop, tablet, mobile
- Mobile-first consideration for teacher attendance marking and student views

### 4.4 Reliability

- Health check endpoint
- Graceful error handling
- Structured logging (backend)

### 4.5 Scalability

- Multi-school isolated data model
- Onboarding a new school requires no code changes
- Stateless backend (JWT-based)

### 4.6 Maintainability

- TypeScript throughout
- Consistent code style (ESLint + Prettier)
- Database migrations (not raw schema dumps)
- Modular folder structure

---

## 5. Out of Scope (Current Version)

- Handwritten attendance OCR
- Parent portal
- Fee management
- Library management
- Timetable/scheduling engine
- SMS/email notifications
- Biometric integration
- Government portal API integration
- Mobile native app (Android/iOS)
- Kubernetes orchestration

---

## 6. Success Criteria

The platform is considered successful when:

1. All 6 ZP schools can be independently onboarded
2. SUPER_ADMIN, PRINCIPAL, TEACHER, STUDENT roles operate correctly with full data isolation
3. Core modules (attendance, academics, TC, notices, resources, quizzes) are fully functional
4. Early Warning System correctly identifies and explains at-risk students
5. AI Assistant operates within role and school boundaries
6. Application is containerized and deployable via Docker Compose
7. CI/CD pipeline runs on GitHub Actions
8. The application passes a basic security review
9. The application looks and behaves like a professional education platform

---

## 7. Deployment

- **Target OS:** Linux (Ubuntu/Debian)
- **Containers:** Docker + Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions
- **Environment:** Production-ready configuration via `.env` files

---

*This document is the source of truth for product requirements. Update when requirements change.*
