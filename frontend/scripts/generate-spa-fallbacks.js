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

const staticRoutes = [
  'schools',
  'login',
  'erp',
  'erp/login',
  'erp/dashboard',
  'school',
];

for (const route of staticRoutes) {
  const targetDir = path.join(distDir, route);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), indexContent);
}

fs.writeFileSync(path.join(distDir, '404.html'), indexContent);
console.log('✓ Generated static SPA route fallbacks for Vercel static serving');
