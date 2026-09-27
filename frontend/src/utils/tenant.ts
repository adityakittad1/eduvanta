/**
 * Extracts the tenant slug from the current hostname based on the ROOT_DOMAIN.
 */
export function getTenantSlug(): string | null {
  if (typeof window === 'undefined') return null;
  
  const host = window.location.hostname;
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';

  if (host === rootDomain || host === `www.${rootDomain}` || host === `admin.${rootDomain}`) {
    return null; // Root domain, no tenant
  }

  if (host.endsWith(rootDomain)) {
    const slug = host.replace(new RegExp(`\\.?${rootDomain}$`), '');
    return slug || null;
  }

  return null;
}

export function isPlatformHost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
  return host === rootDomain || host === `www.${rootDomain}` || host === `admin.${rootDomain}`;
}

export function getPlatformUrl(): string {
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  // Fallback to admin if it's the admin domain in local dev, else root
  const host = window.location.hostname === `admin.${rootDomain}` ? `admin.${rootDomain}` : rootDomain;
  return `${protocol}//${host}${port}`;
}

export function getTenantUrl(slug: string): string {
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN || 'localhost';
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;
  return `${protocol}//${slug}.${rootDomain}${port}`;
}
