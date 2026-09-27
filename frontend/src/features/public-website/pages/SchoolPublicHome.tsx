import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, Phone, Mail, BookOpen, School
} from 'lucide-react';

import { getTenantSlug } from '@/utils/tenant';
import { publicWebsiteApi } from '@/features/public-website/api/publicWebsite';

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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  return (
    <a href={href} className="public-nav-link" onClick={handleClick}>
      {children}
    </a>
  );
}

// ─── Main Component ───────────────────────────────────────────

export function SchoolPublicHome() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) {
      setError('No school specified');
      setIsLoading(false);
      return;
    }
    
    publicWebsiteApi.getSchoolHomePage(slug)
      .then(res => {
        setData(res);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err.message || 'School not found');
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data) return;
    document.title = `${data.profile.name} | EduVanta Campus`;
  }, [data]);

  if (isLoading) {
    return (
      <div className="public-site" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: '#0ea5e9', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="public-site" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', textAlign: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '1rem' }}>School Not Found</h1>
          <p style={{ color: '#64748b' }}>The requested digital campus does not exist or is currently offline.</p>
        </div>
      </div>
    );
  }

  const { profile, facilities, gallery } = data;
  const initials = getSchoolInitials(profile.name);

  return (
    <div className="public-site">
      <header className="public-header">
        <div className="public-header-inner">
          <a className="public-header-brand" href="#hero" onClick={e => {
            e.preventDefault();
            heroRef.current?.scrollIntoView({ behavior: 'smooth' });
          }}>
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
            <NavLink href="#about">About</NavLink>
            <NavLink href="#facilities">Facilities</NavLink>
            <NavLink href="#gallery">Gallery</NavLink>
            <Link to="/erp/login" className="public-header-erp-btn">
              ERP Login
            </Link>
          </nav>
        </div>
      </header>

      <section id="hero" className="public-hero" ref={heroRef}>
        <div className="public-hero-inner">
          <div className="public-hero-badge">
            <School size={16} /> Official Digital Campus
          </div>
          <h1 className="public-hero-title">{profile.name}</h1>
          {profile.tagline && <p className="public-hero-tagline">{profile.tagline}</p>}
          
          {(profile._count.students > 0 || profile._count.teachers > 0) && (
            <div className="public-hero-stats">
              {profile._count.students > 0 && (
                <div>
                  <span className="public-hero-stat-value">{profile._count.students}+</span>
                  <span className="public-hero-stat-label">Students</span>
                </div>
              )}
              {profile._count.teachers > 0 && (
                <div>
                  <span className="public-hero-stat-value">{profile._count.teachers}</span>
                  <span className="public-hero-stat-label">Expert Teachers</span>
                </div>
              )}
              {profile.establishedYear && (
                <div>
                  <span className="public-hero-stat-value">{profile.establishedYear}</span>
                  <span className="public-hero-stat-label">Est. Year</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section id="about" className="public-section alt-bg">
        <div className="public-section-inner">
          <div className="public-section-header">
            <span className="public-section-eyebrow">About Us</span>
            <h2 className="public-section-title">Welcome to {profile.name}</h2>
            <p className="public-section-subtitle">{profile.description || 'Dedicated to providing quality education and building a strong foundation for the future leaders of tomorrow.'}</p>
          </div>
        </div>
      </section>

      {facilities?.length > 0 && (
        <section id="facilities" className="public-section">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Infrastructure</span>
              <h2 className="public-section-title">World-Class Facilities</h2>
            </div>
            <div className="public-facilities-grid">
              {facilities.map((fac: any) => (
                <div key={fac.id} className="public-facility-card">
                  <div className="public-facility-icon"><BookOpen size={28} /></div>
                  <h3 className="public-facility-name">{fac.name}</h3>
                  <p className="public-facility-desc">{fac.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {gallery?.length > 0 && (
        <section id="gallery" className="public-section alt-bg">
          <div className="public-section-inner">
            <div className="public-section-header">
              <span className="public-section-eyebrow">Campus Life</span>
              <h2 className="public-section-title">Photo Gallery</h2>
            </div>
            <div className="public-gallery-grid">
              {gallery.map((img: any) => (
                <div key={img.id} className="public-gallery-item">
                  <img src={img.fileUrl} alt={img.title} />
                  <div className="public-gallery-item-overlay">
                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.2rem' }}>{img.title}</h4>
                    {img.description && <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>{img.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <footer className="public-footer" id="contact">
        <div className="public-footer-inner">
          <div className="public-contact-grid">
            <div className="public-contact-card">
              <div className="public-contact-icon"><MapPin size={24} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Address</div>
                <div>{profile.address || 'Address not provided'}</div>
              </div>
            </div>
            <div className="public-contact-card">
              <div className="public-contact-icon"><Phone size={24} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Phone</div>
                <div>{profile.contactPhone || 'Phone not provided'}</div>
              </div>
            </div>
            <div className="public-contact-card">
              <div className="public-contact-icon"><Mail size={24} /></div>
              <div>
                <div style={{ fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Email</div>
                <div>{profile.contactEmail || 'Email not provided'}</div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.6 }}>Powered by EduVanta Digital Campus</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
