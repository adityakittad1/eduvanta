import request from 'supertest';
import { createApp } from '../src/app';

describe('Tenant Resolution & Login Regression Tests', () => {
  const app = createApp();

  it('allows school users to log in from root domain and adopts school context', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Host', 'localhost:3000')
      .send({
        email: 'principal@zpschool1.in',
        password: 'Principal@123'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('PRINCIPAL');
    expect(res.body.data.user.school).toBeDefined();
    expect(res.body.data.user.school.slug).toBe('ellora-highschool');
    expect(res.body.data.accessToken).toBeDefined();
  });

  it('rejects cross-tenant login with TENANT_MISMATCH (403)', async () => {
    // Principal belongs to ellora-highschool, but attempts to log into wardha school
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('X-Tenant-Slug', 'zp-school-wardha')
      .send({
        email: 'principal@zpschool1.in',
        password: 'Principal@123'
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TENANT_MISMATCH');
  });

  it('rejects unknown tenant subdomain with TENANT_NOT_FOUND (404)', async () => {
    const res = await request(app)
      .get('/api/v1/public/home')
      .set('X-Tenant-Slug', 'nonexistent-school-slug-12345');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('TENANT_NOT_FOUND');
  });

  it('rejects unauthenticated requests to protected endpoints (401)', async () => {
    const res = await request(app)
      .get('/api/v1/students')
      .set('Host', 'localhost:3000');

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns structured JSON for unknown routes (404)', async () => {
    const res = await request(app)
      .get('/api/v1/unknown-route-that-does-not-exist')
      .set('Host', 'localhost:3000');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});
