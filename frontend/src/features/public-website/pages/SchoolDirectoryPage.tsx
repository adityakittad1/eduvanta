import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { School, MapPin, ExternalLink, Search, RefreshCw, Home } from 'lucide-react';
import { publicWebsiteApi, PublicSchoolSummary } from '../api/publicWebsite';
import '../styles/publicWebsite.css';

export function SchoolDirectoryPage() {
  const [schools, setSchools] = useState<PublicSchoolSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadSchools = useCallback(() => {
    setIsLoading(true);
    setError(null);
    publicWebsiteApi
      .listSchools()
      .then(setSchools)
      .catch(err => setError(err.message || 'Failed to load school directory'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    document.title = 'EduVanta — School Directory';
    loadSchools();
  }, [loadSchools]);

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  function getInitials(name: string) {
    return name.split(' ').filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  return (
    <div className="public-site" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="public-header">
        <div className="public-header-inner">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div
              className="public-header-logo-placeholder"
              style={{
                background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
                fontSize: '1rem',
                fontWeight: 800,
                color: 'white',
              }}
            >
              EV
            </div>
            <div>
              <div className="public-header-school-name">EduVanta</div>
              <div className="public-header-tagline">Schools Directory — Maharashtra</div>
            </div>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--color-neutral-700)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                padding: '8px 12px',
              }}
            >
              <Home size={15} />
              <span>Platform Home</span>
            </Link>
            <Link
              to="/erp/login"
              style={{
                padding: '8px 16px',
                background: 'var(--color-primary-600)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
              }}
            >
              <ExternalLink size={14} />
              Staff Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="public-hero" style={{ padding: 'var(--space-12) var(--space-6)' }}>
        <div className="public-hero-inner">
          <div className="public-hero-badge">
            <School size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            EduVanta School Network
          </div>
          <h1 className="public-hero-title">School Directory</h1>
          <p className="public-hero-tagline">
            Discover participating Zilla Parishad and partner schools across Maharashtra
          </p>
        </div>
      </section>

      {/* Directory */}
      <section className="public-section" style={{ flex: 1 }}>
        <div className="public-section-inner">
          {/* Search */}
          <div style={{ maxWidth: 480, margin: '0 auto var(--space-10) auto', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-neutral-400)' }} />
            <input
              type="text"
              placeholder="Search schools by name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: '1px solid var(--color-neutral-300)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontFamily: 'var(--font-family-base)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {isLoading && (
            <div className="public-loading"><div className="public-loading-spinner" /></div>
          )}

          {error && (
            <div
              style={{
                maxWidth: 480,
                margin: '2rem auto',
                padding: '2rem',
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--color-neutral-200)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-neutral-900)', marginBottom: '0.5rem' }}>
                Unable to load school directory
              </h2>
              <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                {error}
              </p>
              <button
                onClick={loadSchools}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 18px',
                  background: 'var(--color-primary-600)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                }}
              >
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                gap: 'var(--space-5)',
              }}>
                {filtered.map(school => (
                  <Link
                    key={school.id}
                    to={`/school/${school.slug || school.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <div style={{
                      background: 'white',
                      border: '1px solid var(--color-neutral-200)',
                      borderRadius: 'var(--radius-xl)',
                      padding: 'clamp(1rem, 3vw, var(--space-6))',
                      display: 'flex',
                      gap: 'var(--space-4)',
                      alignItems: 'flex-start',
                      transition: 'all 200ms ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLDivElement).style.transform = 'none';
                    }}
                    >
                      {school.logoUrl ? (
                        <img src={school.logoUrl} alt={`${school.name} logo`} style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', objectFit: 'contain', border: '1px solid var(--color-neutral-200)', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: 56, height: 56, background: 'var(--color-primary-600)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.125rem', flexShrink: 0 }}>
                          {getInitials(school.name)}
                        </div>
                      )}

                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-semibold)', color: 'var(--color-neutral-900)', marginBottom: 'var(--space-1)' }}>
                          {school.name}
                        </h3>
                        {school.description && (
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)', lineHeight: 1.5, marginBottom: 'var(--space-2)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                            {school.description}
                          </p>
                        )}
                        {school.address && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-xs)', color: 'var(--color-neutral-400)' }}>
                            <MapPin size={12} />
                            {school.address}
                          </div>
                        )}
                        <div style={{ marginTop: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', fontWeight: 'var(--font-medium)' }}>
                          Visit Website <ExternalLink size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {filtered.length === 0 && !isLoading && (
                <div className="public-empty">
                  <School size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }} />
                  <p>No schools found{search ? ` matching "${search}"` : ''}.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="public-footer" style={{ marginTop: 'auto' }}>
        <div className="public-footer-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="public-footer-attr">EduVanta — Multi-Tenant Education ERP</div>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Platform Home</Link>
            <Link to="/erp/login" style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)', textDecoration: 'none' }}>Staff Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
