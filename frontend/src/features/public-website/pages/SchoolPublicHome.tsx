import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, BookOpen, School, Award,
  Bell, ChevronRight, Menu, X, Laptop, FlaskConical, Trophy,
  Sun, Utensils, Sparkles, UserCheck, ExternalLink
} from 'lucide-react';

import { getTenantSlug } from '@/utils/tenant';
import { publicWebsiteApi } from '@/features/public-website/api/publicWebsite';
import type { PublicHomePageData, PublicGalleryItem } from '@/features/public-website/api/publicWebsite';

import '../styles/publicWebsite.css';

// ─── Helpers ─────────────────────────────────────────────────

function getSchoolInitials(name: string) {
  return name
    .split(' ')
    .filter(w => w.length > 0 && w.toLowerCase() !== 'school')
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

function getFacilityIcon(iconName: string | null) {
  switch (iconName?.toLowerCase()) {
    case 'laptop':
    case 'computer':
      return <Laptop size={28} />;
    case 'flaskconical':
    case 'lab':
      return <FlaskConical size={28} />;
    case 'trophy':
    case 'sports':
      return <Trophy size={28} />;
    case 'sun':
    case 'solar':
      return <Sun size={28} />;
    case 'utensils':
    case 'food':
      return <Utensils size={28} />;
    case 'bookopen':
    case 'library':
    default:
      return <BookOpen size={28} />;
  }
}

function formatDate(dateString: string) {
  const d = new Date(dateString);
  return {
    day: d.getDate(),
    month: d.toLocaleString('default', { month: 'short' }),
    year: d.getFullYear(),
    formatted: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
}

// ─── Main Component ───────────────────────────────────────────

export function SchoolPublicHome() {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const activeSlug = routeSlug || getTenantSlug();

  const [data, setData] = useState<PublicHomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [galleryCategory, setGalleryCategory] = useState<string>('ALL');
  const [lightboxImage, setLightboxImage] = useState<PublicGalleryItem | null>(null);

  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!activeSlug) {
      setError('No school specified. Please choose a school from the directory.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    publicWebsiteApi.getSchoolHomePage(activeSlug)
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'School website is currently not accessible.');
        setIsLoading(false);
      });
  }, [activeSlug]);

  // Dynamic SEO metadata
  useEffect(() => {
    if (!data) return;
    const { profile } = data;
    document.title = `${profile.name} — Official Digital Campus | EduVanta`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      'content',
      profile.description || `${profile.name} - official school website, facilities, achievements, notices and academic portal.`
    );
  }, [data]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isLoading) {
    return (
      <div className="public-site" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', gap: '1rem' }}>
        <div style={{ width: 44, height: 44, border: '4px solid #e2e8f0', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading digital campus...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="public-site" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: 480 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <School size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1rem', fontWeight: 700 }}>School Website Not Found</h1>
          <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>{error || 'The requested digital campus does not exist or is currently offline.'}</p>
          <Link to="/schools" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary-600)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '99px', textDecoration: 'none', fontWeight: 600 }}>
            Browse All Schools <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const { profile, facilities, achievements, gallery, notices, events } = data;
  const initials = getSchoolInitials(profile.name);

  // Gallery categories
  const categories = ['ALL', ...Array.from(new Set(gallery.map(g => g.category)))];
  const filteredGallery = galleryCategory === 'ALL'
    ? gallery
    : gallery.filter(g => g.category === galleryCategory);

  return (
    <div className="public-site">
      {/* ─── Header ────────────────────────────────────────────── */}
      <header className="public-header">
        <div className="public-header-inner">
          <a
            className="public-header-brand"
            href="#hero"
            onClick={e => {
              e.preventDefault();
              heroRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt={`${profile.name} logo`} className="public-header-logo" />
            ) : (
              <div className="public-header-logo-placeholder">{initials}</div>
            )}
            <div>
              <div className="public-header-school-name">{profile.name}</div>
              {profile.tagline && <div className="public-header-tagline">{profile.tagline}</div>}
            </div>
          </a>

          <nav className="public-nav">
            <a href="#about" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('about'); }}>About</a>
            {facilities?.length > 0 && <a href="#facilities" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('facilities'); }}>Facilities</a>}
            {achievements?.length > 0 && <a href="#achievements" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('achievements'); }}>Achievements</a>}
            {notices?.length > 0 && <a href="#announcements" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('announcements'); }}>Announcements</a>}
            {events?.length > 0 && <a href="#events" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('events'); }}>Events</a>}
            {gallery?.length > 0 && <a href="#gallery" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('gallery'); }}>Gallery</a>}
            <a href="#contact" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
            
            <Link to="/erp/login" className="public-header-erp-btn">
              ERP Login
            </Link>
          </nav>

          <button
            className="public-mobile-toggle"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <div className={`public-mobile-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <a href="#about" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('about'); }}>About</a>
          {facilities?.length > 0 && <a href="#facilities" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('facilities'); }}>Facilities</a>}
          {achievements?.length > 0 && <a href="#achievements" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('achievements'); }}>Achievements</a>}
          {notices?.length > 0 && <a href="#announcements" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('announcements'); }}>Announcements</a>}
          {events?.length > 0 && <a href="#events" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('events'); }}>Events</a>}
          {gallery?.length > 0 && <a href="#gallery" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('gallery'); }}>Gallery</a>}
          <a href="#contact" className="public-nav-link" onClick={e => { e.preventDefault(); scrollTo('contact'); }}>Contact</a>
          <Link to="/erp/login" className="public-header-erp-btn" style={{ textAlign: 'center', marginTop: '0.5rem' }}>
            ERP Login
          </Link>
        </div>
      </header>

      {/* ─── Hero Section ───────────────────────────────────────── */}
      <section id="hero" className="public-hero" ref={heroRef}>
        <div className="public-hero-inner">
          <div className="public-hero-badge">
            <School size={16} /> Official Zilla Parishad Digital Campus
          </div>
          <h1 className="public-hero-title">{profile.name}</h1>
          <p className="public-hero-tagline">
            {profile.tagline || 'Excellence in rural education, modern infrastructure, and student holistic development.'}
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button
              onClick={() => scrollTo('facilities')}
              style={{
                background: 'white',
                color: '#0f172a',
                border: 'none',
                padding: '0.85rem 1.75rem',
                borderRadius: '99px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              Explore Campus Facilities <ChevronRight size={18} />
            </button>
            <Link
              to="/erp/login"
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                padding: '0.85rem 1.75rem',
                borderRadius: '99px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Staff & Student ERP Portal <ExternalLink size={16} />
            </Link>
          </div>

          <div className="public-hero-stats">
            <div>
              <span className="public-hero-stat-value">{profile._count.students || 0}+</span>
              <span className="public-hero-stat-label">Enrolled Students</span>
            </div>
            <div>
              <span className="public-hero-stat-value">{profile._count.teachers || 1}</span>
              <span className="public-hero-stat-label">Expert Faculty</span>
            </div>
            <div>
              <span className="public-hero-stat-value">{profile._count.classes || 2}</span>
              <span className="public-hero-stat-label">Active Classes</span>
            </div>
            {profile.establishedYear && (
              <div>
                <span className="public-hero-stat-value">{profile.establishedYear}</span>
                <span className="public-hero-stat-label">Est. Year</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── About Us Section ───────────────────────────────────── */}
      <section id="about" className="public-section alt-bg">
        <div className="public-section-inner">
          <div className="public-about-grid">
            <div>
              <span className="public-section-eyebrow">About Our Institution</span>
              <h2 className="public-section-title" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                Fostering Excellence, Community & Growth
              </h2>
              <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
                {profile.description || `${profile.name} is dedicated to delivering high quality, accessible education. Our teachers provide personalized learning journeys with modern educational resources, digital classrooms, and traditional values.`}
              </p>
              {profile.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.95rem' }}>
                  <MapPin size={20} color="var(--color-primary-600)" style={{ flexShrink: 0 }} />
                  <span>{profile.address}</span>
                </div>
              )}
            </div>

            {/* Principal desk card */}
            <div className="public-principal-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
                <Sparkles size={16} /> From the Principal's Desk
              </div>
              <blockquote className="public-principal-quote">
                "Our mission is to ensure every child receives not only standard academic education, but also the confidence, scientific temperament, and digital skills required to thrive in tomorrow's world."
              </blockquote>
              <div className="public-principal-info">
                <div className="public-principal-avatar">
                  <UserCheck size={26} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '1.05rem' }}>
                    {profile.principalName || 'School Leadership'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Principal, {profile.name}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Facilities Section ─────────────────────────────────── */}
      {facilities?.length > 0 && (
        <section id="facilities" className="public-section">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Campus Infrastructure</span>
              <h2 className="public-section-title">Modern Facilities & Resources</h2>
              <p className="public-section-subtitle">
                Designed to provide our students with an engaging, safe, and technologically advanced learning environment.
              </p>
            </div>
            <div className="public-facilities-grid">
              {facilities.map(fac => (
                <div key={fac.id} className="public-facility-card">
                  <div className="public-facility-icon">
                    {getFacilityIcon(fac.icon)}
                  </div>
                  <h3 className="public-facility-name">{fac.name}</h3>
                  <p className="public-facility-desc">{fac.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Achievements Section ───────────────────────────────── */}
      {achievements?.length > 0 && (
        <section id="achievements" className="public-section alt-bg">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Excellence in Action</span>
              <h2 className="public-section-title">School Achievements & Honors</h2>
              <p className="public-section-subtitle">
                Recognizing the continuous hard work, academic excellence, and sportsmanship of our students and faculty.
              </p>
            </div>
            <div className="public-achievements-grid">
              {achievements.map(ach => (
                <div key={ach.id} className="public-achievement-card">
                  <div className="public-achievement-icon">
                    <Award size={28} />
                  </div>
                  {ach.year && <span className="public-achievement-year">Year {ach.year}</span>}
                  <h3 className="public-achievement-title">{ach.title}</h3>
                  {ach.description && <p className="public-achievement-desc">{ach.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Public Announcements (Notices) ────────────────────── */}
      {notices?.length > 0 && (
        <section id="announcements" className="public-section">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Stay Updated</span>
              <h2 className="public-section-title">Latest Announcements</h2>
              <p className="public-section-subtitle">
                Official notices and updates published directly by the school administration.
              </p>
            </div>
            <div className="public-notices-grid">
              {notices.map(notice => {
                const dateInfo = formatDate(notice.publishedAt || notice.createdAt);
                return (
                  <div key={notice.id} className="public-notice-card">
                    <div className="public-notice-date">
                      <Bell size={14} /> Published on {dateInfo.formatted}
                    </div>
                    <h3 className="public-notice-title">{notice.title}</h3>
                    <p className="public-notice-content">{notice.content}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── School Events ──────────────────────────────────────── */}
      {events?.length > 0 && (
        <section id="events" className="public-section alt-bg">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Calendar</span>
              <h2 className="public-section-title">Upcoming School Events</h2>
              <p className="public-section-subtitle">
                Mark your calendars for upcoming academic, sports, and cultural activities.
              </p>
            </div>
            <div className="public-events-grid">
              {events.map(ev => {
                const dateInfo = formatDate(ev.eventDate);
                return (
                  <div key={ev.id} className="public-event-card">
                    <div className="public-event-date-badge">
                      <div className="public-event-day">{dateInfo.day}</div>
                      <div className="public-event-month">{dateInfo.month}</div>
                    </div>
                    <div>
                      <h3 className="public-event-title">{ev.title}</h3>
                      {ev.description && <p className="public-event-desc">{ev.description}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── Photo Gallery ──────────────────────────────────────── */}
      {gallery?.length > 0 && (
        <section id="gallery" className="public-section">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Moments & Memories</span>
              <h2 className="public-section-title">Campus Life Gallery</h2>
              <p className="public-section-subtitle">
                A glimpse into our classrooms, sports events, science fairs, and campus celebrations.
              </p>
            </div>

            {/* Category filters */}
            {categories.length > 2 && (
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setGalleryCategory(cat)}
                    style={{
                      padding: '0.4rem 1rem',
                      borderRadius: '99px',
                      border: '1px solid #e2e8f0',
                      background: galleryCategory === cat ? 'var(--color-primary-600)' : 'white',
                      color: galleryCategory === cat ? 'white' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            <div className="public-gallery-grid">
              {filteredGallery.map(img => (
                <div
                  key={img.id}
                  className="public-gallery-item"
                  onClick={() => setLightboxImage(img)}
                >
                  <img src={img.fileUrl} alt={img.title} loading="lazy" />
                  <div className="public-gallery-item-overlay">
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.2rem' }}>{img.title}</h4>
                    {img.description && <p style={{ fontSize: '0.9rem', opacity: 0.85 }}>{img.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Lightbox Modal ─────────────────────────────────────── */}
      {lightboxImage && (
        <div className="public-lightbox-backdrop" onClick={() => setLightboxImage(null)}>
          <div className="public-lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="public-lightbox-close" onClick={() => setLightboxImage(null)}>
              ✕
            </button>
            <img src={lightboxImage.fileUrl} alt={lightboxImage.title} className="public-lightbox-img" />
            <div className="public-lightbox-caption">
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>{lightboxImage.title}</h3>
              {lightboxImage.description && <p style={{ opacity: 0.85, marginTop: '0.25rem' }}>{lightboxImage.description}</p>}
            </div>
          </div>
        </div>
      )}

      {/* ─── Contact & Location Footer ──────────────────────────── */}
      <footer className="public-footer" id="contact">
        <div className="public-footer-inner">
          <div className="public-contact-grid">
            <div className="public-contact-card">
              <div className="public-contact-icon"><MapPin size={24} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Campus Address</div>
                <div>{profile.address || 'Address provided upon request'}</div>
              </div>
            </div>
            <div className="public-contact-card">
              <div className="public-contact-icon"><Phone size={24} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Phone & Helpline</div>
                <div>
                  {profile.contactPhone ? (
                    <a href={`tel:${profile.contactPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {profile.contactPhone}
                    </a>
                  ) : 'Not provided'}
                </div>
              </div>
            </div>
            <div className="public-contact-card">
              <div className="public-contact-icon"><Mail size={24} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Official Inquiries</div>
                <div>
                  {profile.contactEmail ? (
                    <a href={`mailto:${profile.contactEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {profile.contactEmail}
                    </a>
                  ) : 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: 'white' }}>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Zilla Parishad Education Department — Government of Maharashtra
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.9rem' }}>
              <Link to="/schools" style={{ color: '#94a3b8', textDecoration: 'none' }}>School Directory</Link>
              <Link to="/erp/login" style={{ color: 'var(--color-primary-400)', textDecoration: 'none', fontWeight: 600 }}>Staff ERP Portal</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
