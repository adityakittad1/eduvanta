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

  if (rootDomain !== 'localhost' && host.endsWith(rootDomain)) {
    const slug = host.replace(new RegExp(`\\.?${rootDomain}$`), '');
    return slug || null;
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
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  return `${protocol}//${slug}.${rootDomain}${port}`;
}
