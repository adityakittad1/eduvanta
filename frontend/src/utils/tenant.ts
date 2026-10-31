/**
 * Extracts the tenant slug from the current hostname based on the ROOT_DOMAIN.
 */
export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  
  const host = window.location.hostname.toLowerCase();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'localhost').toLowerCase();

  // Root platform domains and Vercel domains: no tenant in hostname
  if (
    host === rootDomain ||
    host === `www.${rootDomain}` ||
    host === `admin.${rootDomain}` ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.vercel.app')
  ) {
    return null;
  }

  // Support *.localhost subdomains (e.g. rajmata-jijau-kolhapur.localhost)
  if (host.endsWith('.localhost')) {
    const slug = host.replace(/\.localhost$/, '');
    if (slug && slug !== 'www' && slug !== 'admin') {
      return slug;
    }
  }

  // Support custom root domain subdomains (e.g. school.eduvanta.com)
  if (rootDomain && rootDomain !== 'localhost' && host.endsWith(rootDomain)) {
    const slug = host.replace(new RegExp(`\\.?${rootDomain}$`), '');
    if (slug && slug !== 'www' && slug !== 'admin') {
      return slug;
    }
  }

  return null;
}

export function isPlatformHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'localhost').toLowerCase();
  return (
    host === rootDomain ||
    host === `www.${rootDomain}` ||
    host === `admin.${rootDomain}` ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.vercel.app')
  );
}

export function getPlatformUrl(): string {
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN;
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  const host = window.location.hostname;

  if (!rootDomain || host.endsWith('.vercel.app') || host === 'localhost' || host === '127.0.0.1') {
    return `${protocol}//${host}${port}`;
  }

  const targetHost = host === `admin.${rootDomain}` ? `admin.${rootDomain}` : rootDomain;
  return `${protocol}//${targetHost}${port}`;
}

export function getTenantUrl(slug: string): string {
  if (typeof window === 'undefined') return `/school/${slug}`;

  const host = window.location.hostname.toLowerCase();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || '').toLowerCase();

  // If in local development, on Vercel preview/free domain, or without a custom root domain:
  // use path-based routing (/school/:slug) so it works reliably everywhere without DNS/port issues.
  if (
    !rootDomain ||
    rootDomain === 'localhost' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.vercel.app')
  ) {
    return `/school/${slug}`;
  }

  // Production with a dedicated custom root domain (e.g. eduvanta.com with wildcard DNS)
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  return `${protocol}//${slug}.${rootDomain}${port}`;
}
