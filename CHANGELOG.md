# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Multi-Tenant Architecture Implementation**
  - Added `TenantContext` to the frontend to resolve tenant information based on the subdomain.
  - Implemented dynamic routing for the public website on the root domain (`/`) when a tenant subdomain is detected.
  - Added a global `/erp` prefix to all protected routes in the `AppRouter` to isolate the Digital Campus from the public school sites.
  - Configured Vite with `host: true` and `VITE_ROOT_DOMAIN` to support local subdomain testing (e.g., `school.localhost:5173`).
  - Implemented safe absolute link routing for sidebar and nested components by rewriting absolute paths to include the `/erp` prefix.
  - Added `getTenantSlug` utility to parse tenant slugs securely from the browser URL hostname.

### Fixed
- Fixed strict null-check TypeScript errors in the backend controllers by safely resolving `req.tenant` properties.
- Removed duplicated and orphaned code in `api.ts`.
- Migrated legacy `globals: { 'ts-jest': { ... } }` syntax to `transform` array syntax in `jest.config.js`.

### Changed
- Shifted the public school page to operate as the root landing page for tenant subdomains instead of relying exclusively on `/school/:slug`.
- Updated all API calls in the frontend to correctly send requests under the authenticated ERP session without mixing tenant origins.
