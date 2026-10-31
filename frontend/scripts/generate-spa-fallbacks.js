import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('dist/index.html not found');
  process.exit(1);
}

const indexContent = fs.readFileSync(indexPath, 'utf-8');

const knownSchoolSlugs = [
  'rajmata-jijau-kolhapur',
  'sant-tukaram-vidyalaya',
  'savitribai-phule-madhyamik',
  'shivaji-maharaj-vidyalaya',
  'zp-school-gangapur',
  'ellora-highschool',
  'zp-school-wardha',
];

const staticRoutes = [
  'schools',
  'school',
  'login',
  'erp',
  'erp/login',
  'erp/dashboard',
  'erp/super-admin/dashboard',
  'erp/super-admin/schools',
  'erp/super-admin/users',
  'erp/students',
  'erp/teachers',
  'erp/classes',
  'erp/attendance',
  'erp/academics',
  'erp/analytics',
  'erp/early-warning',
  'erp/quizzes',
  'erp/resources',
  'erp/notices',
  'erp/tc',
  'erp/gallery',
  'erp/ai',
  'erp/reports',
  'erp/school-profile',
  'erp/public-website',
  'erp/unauthorized',
];

// Add school slug routes
for (const slug of knownSchoolSlugs) {
  staticRoutes.push(`school/${slug}`);
  staticRoutes.push(`schools/${slug}`);
}

function writeFallback(route) {
  const cleanRoute = route.replace(/^\/+|\/+$/g, '');
  // Write route.html
  const htmlFile = path.join(distDir, `${cleanRoute}.html`);
  fs.mkdirSync(path.dirname(htmlFile), { recursive: true });
  fs.writeFileSync(htmlFile, indexContent);

  // Write route/index.html
  const dirPath = path.join(distDir, cleanRoute);
  fs.mkdirSync(dirPath, { recursive: true });
  fs.writeFileSync(path.join(dirPath, 'index.html'), indexContent);
}

for (const route of staticRoutes) {
  writeFallback(route);
}

fs.writeFileSync(path.join(distDir, '404.html'), indexContent);
console.log(`✓ Generated static SPA route fallbacks (${staticRoutes.length} routes) for Vercel static serving`);
