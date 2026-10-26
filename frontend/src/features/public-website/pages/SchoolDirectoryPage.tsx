import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { School, MapPin, ExternalLink, Search } from 'lucide-react';
import { publicWebsiteApi, PublicSchoolSummary } from '../api/publicWebsite';
import '../styles/publicWebsite.css';

export function SchoolDirectoryPage() {
  const [schools, setSchools] = useState<PublicSchoolSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'ZP School ERP — School Directory';
    publicWebsiteApi.listSchools()
      .then(setSchools)
      .catch(err => setError(err.message || 'Failed to load schools'))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.address || '').toLowerCase().includes(search.toLowerCase())
  );

  function getInitials(name: string) {
    return name.split(' ').filter(w => w.length > 1).slice(0, 2).map(w => w[0].toUpperCase()).join('');
  }

  return (
    <div className="public-site" style={{ minHeight: '100vh' }}>
      {/* Header */}
      <header className="public-header">
        <div className="public-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <div className="public-header-logo-placeholder" style={{ background: 'var(--color-primary-600)', fontSize: '0.875rem' }}>ZP</div>
            <div>
              <div className="public-header-school-name">ZP School ERP</div>
              <div className="public-header-tagline">Zilla Parishad Schools — Maharashtra</div>
            </div>
          </div>
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
      </header>

      {/* Hero */}
      <section className="public-hero" style={{ padding: 'var(--space-16) var(--space-6)' }}>
        <div className="public-hero-inner">
          <div className="public-hero-badge">
            <School size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Zilla Parishad School ERP
          </div>
          <h1 className="public-hero-title">ZP School Directory</h1>
          <p className="public-hero-tagline">
            Discover Zilla Parishad schools in your area
          </p>
        </div>
      </section>

      {/* Directory */}
      <section className="public-section">
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
            <div className="public-error">
              <h1>Unable to load</h1>
              <p>{error}</p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
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
                      padding: 'var(--space-6)',
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
      <footer className="public-footer">
        <div className="public-footer-inner">
          <div className="public-footer-attr">ZP School ERP — Digital Education Platform</div>
          <Link to="/erp/login" style={{ color: 'var(--color-neutral-400)', fontSize: 'var(--text-sm)' }}>Staff Login</Link>
        </div>
      </footer>
    </div>
  );
}
