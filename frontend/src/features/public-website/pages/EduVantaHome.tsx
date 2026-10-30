import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Shield,
  BarChart3,
  Sparkles,
  BookOpen,
  FileText,
  School,
  Users,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Layers,
  Clock,
  Compass,
} from 'lucide-react';
import '../styles/publicWebsite.css';

export function EduVantaHome() {
  return (
    <div className="public-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ─── Global Platform Header / Navbar ─────────────────────────────── */}
      <header className="public-header">
        <div className="public-header-inner">
          <Link to="/" className="public-header-brand" aria-label="EduVanta Home">
            <div
              className="public-header-logo-placeholder"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                color: 'white',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}
            >
              EV
            </div>
            <div>
              <div className="public-header-school-name" style={{ fontSize: '1.35rem', letterSpacing: '-0.02em' }}>
                EduVanta
              </div>
              <div className="public-header-tagline" style={{ color: 'var(--color-primary-600)', fontWeight: 600 }}>
                Next-Gen Education ERP
              </div>
            </div>
          </Link>

          <nav className="public-nav">
            <a href="#features" className="public-nav-link">
              Platform Features
            </a>
            <a href="#early-warning" className="public-nav-link">
              Early Warning (EWS)
            </a>
            <a href="#ai-assistant" className="public-nav-link">
              AI Assistant
            </a>
            <Link to="/schools" className="public-nav-link" style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>
              School Directory
            </Link>
            <Link to="/erp/login" className="public-header-erp-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>ERP Portal Login</span>
              <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      {/* ─── Hero Section ────────────────────────────────────────────────── */}
      <section className="public-hero" style={{ padding: '6rem 2rem 7rem' }}>
        <div className="public-hero-inner">
          <div className="public-hero-badge" style={{ borderColor: 'rgba(96, 165, 250, 0.4)', background: 'rgba(30, 58, 138, 0.35)' }}>
            <Sparkles size={15} style={{ color: '#93C5FD' }} />
            <span>Multi-Tenant Education ERP & Digital Campus Platform</span>
          </div>

          <h1 className="public-hero-title" style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4.5rem)', marginBottom: '1.25rem' }}>
            Transforming School Operations with Actionable Intelligence
          </h1>

          <p className="public-hero-tagline" style={{ maxWidth: 780, fontSize: 'clamp(1.05rem, 1.8vw, 1.3rem)' }}>
            EduVanta unifies student lifecycle records, automated attendance tracking, rule-based Early Warning analytics,
            and role-governed AI academic assistance into an institutional-grade platform built for modern schools.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link
              to="/schools"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.9rem 1.8rem',
                borderRadius: '99px',
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.45)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.35)';
              }}
            >
              <School size={18} />
              <span>Explore School Directory</span>
            </Link>

            <Link
              to="/erp/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.9rem 1.8rem',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1.05rem',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span>Staff & Student Login</span>
              <ExternalLink size={16} />
            </Link>
          </div>

          {/* Platform Metrics Bar */}
          <div className="public-hero-stats" style={{ marginTop: '2rem', paddingTop: '2.5rem' }}>
            <div>
              <span className="public-hero-stat-value">100%</span>
              <span className="public-hero-stat-label">Isolated Tenancy</span>
            </div>
            <div>
              <span className="public-hero-stat-value">4 Roles</span>
              <span className="public-hero-stat-label">Admin, Principal, Teacher, Student</span>
            </div>
            <div>
              <span className="public-hero-stat-value">Real-Time</span>
              <span className="public-hero-stat-label">Early Warning Flags</span>
            </div>
            <div>
              <span className="public-hero-stat-value">AI-Ready</span>
              <span className="public-hero-stat-label">Strictly Scoped Assistance</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section: Architecture & Capabilities ───────────────────────── */}
      <section id="features" className="public-section alt-bg">
        <div className="public-section-inner">
          <div className="public-section-header">
            <span className="public-section-eyebrow">Platform Architecture</span>
            <h2 className="public-section-title">Built for Education at Scale</h2>
            <p className="public-section-subtitle">
              Every school on EduVanta operates within a dedicated data boundary, offering customized public web portals
              and powerful administrative management.
            </p>
          </div>

          <div className="public-facilities-grid">
            <div className="public-facility-card">
              <div className="public-facility-icon" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                <Layers size={28} />
              </div>
              <h3 className="public-facility-name">Multi-Tenant Isolation</h3>
              <p className="public-facility-desc">
                Subdomain and header-based tenant resolution guarantees complete data separation between schools.
                No cross-tenant data leakage, with dedicated administrative ownership.
              </p>
            </div>

            <div className="public-facility-card">
              <div className="public-facility-icon" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                <BarChart3 size={28} />
              </div>
              <h3 className="public-facility-name">Student 360° Profile</h3>
              <p className="public-facility-desc">
                Holistic view of student performance — tracking daily attendance records, assessment marks, progress
                trajectories, quiz attempts, and teacher feedback in one unified record.
              </p>
            </div>

            <div className="public-facility-card" id="early-warning">
              <div className="public-facility-icon" style={{ background: '#FFFBEB', color: '#D97706' }}>
                <Clock size={28} />
              </div>
              <h3 className="public-facility-name">Early Warning System (EWS)</h3>
              <p className="public-facility-desc">
                Transparent, rule-driven indicators detect low attendance or falling grades early, surfacing clear
                explanations so teachers and principals can intervene before exams.
              </p>
            </div>

            <div className="public-facility-card" id="ai-assistant">
              <div className="public-facility-icon" style={{ background: '#FAF5FF', color: '#9333EA' }}>
                <Sparkles size={28} />
              </div>
              <h3 className="public-facility-name">AI School Assistant</h3>
              <p className="public-facility-desc">
                Role-aware LLM assistance running securely through backend services. Students get curriculum help,
                teachers generate quizzes, and principals review school performance metrics safely.
              </p>
            </div>

            <div className="public-facility-card">
              <div className="public-facility-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                <BookOpen size={28} />
              </div>
              <h3 className="public-facility-name">Learning Resource Hub</h3>
              <p className="public-facility-desc">
                Centralized study material repository organized by class, subject, and topic. Teachers publish worksheets,
                PDF notes, and reference videos accessible directly by assigned students.
              </p>
            </div>

            <div className="public-facility-card">
              <div className="public-facility-icon" style={{ background: '#FDF2F8', color: '#DB2777' }}>
                <FileText size={28} />
              </div>
              <h3 className="public-facility-name">Transfer Certificate (TC) Engine</h3>
              <p className="public-facility-desc">
                End-to-end digital transfer certificate workflow: student verification, customizable DOCX/PDF template
                population, principal digital approval, and archival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Section: Role Experiences ──────────────────────────────────── */}
      <section className="public-section">
        <div className="public-section-inner">
          <div className="public-section-header">
            <span className="public-section-eyebrow">Unified Experience</span>
            <h2 className="public-section-title">Designed for Every School Stakeholder</h2>
            <p className="public-section-subtitle">
              Role-based access control (RBAC) ensures each user gets the right tools and views with zero clutter.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            <div
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#DBEAFE', color: '#1D4ED8' }}>
                  <Shield size={22} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Super Admin</h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Platform-wide governance: onboarding new schools, provisioning tenant administrators, managing global system
                health, and monitoring platform growth.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Onboard schools without code changes
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Global tenant telemetry and user controls
                </li>
              </ul>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D' }}>
                  <School size={22} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Principal</h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                School leadership portal: manage faculty assignments, approve transfer certificates, monitor school-wide attendance,
                and maintain the public digital campus.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> TC digital approval & PDF generation
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Public school website customizer
                </li>
              </ul>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#FEF3C7', color: '#B45309' }}>
                  <Users size={22} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Teacher</h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Classroom command center: quick-tap mobile attendance, grade assessments, upload syllabus resources,
                and create interactive quizzes for assigned classes.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Swift daily attendance with analytics
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Automated Early Warning diagnostic flags
                </li>
              </ul>
            </div>

            <div
              style={{
                background: 'white',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div style={{ padding: '8px', borderRadius: '10px', background: '#F3E8FF', color: '#7E22CE' }}>
                  <GraduationCap size={22} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>Student</h3>
              </div>
              <p style={{ color: '#64748B', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Student self-service portal: view personal attendance history, test scores, download study materials,
                take topic quizzes, and query the AI learning assistant.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Individual academic performance tracking
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#334155' }}>
                  <CheckCircle2 size={16} color="#16A34A" /> Topic-wise interactive practice quizzes
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Callout Banner: Schools Directory ─────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)', color: 'white', padding: '5rem 2rem' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '99px',
              background: 'rgba(255, 255, 255, 0.12)',
              fontSize: '0.85rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}
          >
            <Compass size={15} />
            <span>Discover Participating Schools</span>
          </div>

          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', fontWeight: 800, marginBottom: '1.25rem', color: 'white' }}>
            Explore Our Network of School Campuses
          </h2>

          <p style={{ color: '#CBD5E1', fontSize: '1.15rem', maxWidth: 650, margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
            Browse participating Zilla Parishad and affiliated institutions. Visit individual school public websites to view
            facilities, achievements, faculty details, and public notices.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/schools"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.85rem 1.75rem',
                borderRadius: '99px',
                background: 'white',
                color: '#1E3A8A',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
              }}
            >
              <School size={17} />
              <span>Browse School Directory</span>
            </Link>

            <Link
              to="/erp/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.85rem 1.75rem',
                borderRadius: '99px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.3)',
              }}
            >
              <span>Go to ERP Dashboard</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Platform Footer ────────────────────────────────────────────── */}
      <footer className="public-footer" style={{ marginTop: 'auto' }}>
        <div className="public-footer-inner">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem',
              paddingBottom: '2.5rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'var(--color-primary-600)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1rem',
                }}
              >
                EV
              </div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '1.1rem' }}>EduVanta</div>
                <div style={{ color: '#94A3B8', fontSize: '0.8rem' }}>Data-Driven Education Management Platform</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link to="/schools" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '0.9rem' }}>
                School Directory
              </Link>
              <Link to="/erp/login" style={{ color: '#CBD5E1', textDecoration: 'none', fontSize: '0.9rem' }}>
                Staff & Student Login
              </Link>
            </div>
          </div>

          <div
            style={{
              paddingTop: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.85rem',
              color: '#64748B',
            }}
          >
            <div>© {new Date().getFullYear()} EduVanta Multi-Tenant ERP Platform. All rights reserved.</div>
            <div>B.Tech Final Year Major Project • Initial Deployment: Zilla Parishad Schools</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
