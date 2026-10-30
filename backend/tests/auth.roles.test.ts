import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import * as authDb from '../src/lib/authDb';
import bcrypt from 'bcryptjs';
import { env } from '../src/config/env';

describe('EduVanta Multi-Role Authentication & RBAC Tests', () => {
  const app = createApp();

  const superAdminUser: authDb.AuthDbUser = {
    id: 'user-super-admin-1',
    email: 'admin@test.com',
    name: 'Super Administrator',
    passwordHash: '',
    role: 'SUPER_ADMIN',
    schoolId: null,
    isActive: true,
    school: null,
    student: null,
  };

  const principalUser: authDb.AuthDbUser = {
    id: 'user-principal-1',
    email: 'principal@school-a.com',
    name: 'Principal School A',
    passwordHash: '',
    role: 'PRINCIPAL',
    schoolId: 'school-a-id',
    isActive: true,
    school: {
      id: 'school-a-id',
      name: 'School Alpha',
      logoUrl: null,
      isActive: true,
      slug: 'school-alpha',
    },
    student: null,
  };

  const studentUser: authDb.AuthDbUser = {
    id: 'user-student-1',
    email: 'student@school-a.com',
    name: 'Student One',
    passwordHash: '',
    role: 'STUDENT',
    schoolId: 'school-a-id',
    isActive: true,
    school: {
      id: 'school-a-id',
      name: 'School Alpha',
      logoUrl: null,
      isActive: true,
      slug: 'school-alpha',
    },
    student: {
      id: 'student-profile-1',
    },
  };

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash('SecurePassword@123', 10);
    superAdminUser.passwordHash = passwordHash;
    principalUser.passwordHash = passwordHash;
    studentUser.passwordHash = passwordHash;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── 1. Super Admin Authentication ────────────────────────────
  describe('Super Admin Login & Authorization', () => {
    it('authenticates Super Admin on root domain without requiring a tenant', async () => {
      jest.spyOn(authDb, 'findUserForLogin').mockResolvedValue(superAdminUser);
      jest.spyOn(authDb, 'saveRefreshToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: 'SecurePassword@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('SUPER_ADMIN');
      expect(res.body.data.user.schoolId).toBeNull();
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('rejects Super Admin with invalid password', async () => {
      jest.spyOn(authDb, 'findUserForLogin').mockResolvedValue(superAdminUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@test.com', password: 'WrongPassword' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  // ─── 2. Principal Authentication & Tenant Resolution ─────────
  describe('Principal Login & Tenant Matching', () => {
    it('authenticates Principal and adopts school context on root domain', async () => {
      jest.spyOn(authDb, 'findUserForLogin').mockResolvedValue(principalUser);
      jest.spyOn(authDb, 'saveRefreshToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'principal@school-a.com', password: 'SecurePassword@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('PRINCIPAL');
      expect(res.body.data.user.school.id).toBe('school-a-id');
      expect(res.body.data.user.school.name).toBe('School Alpha');
    });

    it('rejects Principal login if X-Tenant-Slug belongs to another school (TENANT_MISMATCH)', async () => {
      jest.spyOn(authDb, 'resolveSchoolBySlug').mockResolvedValue({
        id: 'school-b-id',
        slug: 'school-beta',
        name: 'School Beta',
      });
      jest.spyOn(authDb, 'findUserForLogin').mockResolvedValue(principalUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('X-Tenant-Slug', 'school-beta')
        .send({ email: 'principal@school-a.com', password: 'SecurePassword@123' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('TENANT_MISMATCH');
    });
  });

  // ─── 3. Student Authentication ────────────────────────────────
  describe('Student Login', () => {
    it('authenticates Student and includes student profile ID and school context', async () => {
      jest.spyOn(authDb, 'findUserForLogin').mockResolvedValue(studentUser);
      jest.spyOn(authDb, 'saveRefreshToken').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@school-a.com', password: 'SecurePassword@123' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.user.student.id).toBe('student-profile-1');
      expect(res.body.data.user.school.id).toBe('school-a-id');
    });
  });

  // ─── 4. RBAC & Route Protection ───────────────────────────────
  describe('Role-Based Access Control', () => {
    it('forbids Student from accessing teacher/principal routes (403)', async () => {
      const studentToken = jwt.sign(
        { userId: studentUser.id, role: 'STUDENT', schoolId: 'school-a-id' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      const res = await request(app)
        .get('/api/v1/teachers')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('rejects expired or invalid JWT tokens (401)', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.or.expired.jwt.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('enforces tenant isolation preventing cross-school token usage (403)', async () => {
      // Principal from school-a tries to query school-b endpoint
      const principalToken = jwt.sign(
        { userId: principalUser.id, role: 'PRINCIPAL', schoolId: 'school-a-id' },
        env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      jest.spyOn(authDb, 'resolveSchoolBySlug').mockResolvedValue({
        id: 'school-b-id',
        slug: 'school-beta',
        name: 'School Beta',
      });

      const res = await request(app)
        .get('/api/v1/students')
        .set('Authorization', `Bearer ${principalToken}`)
        .set('X-Tenant-Slug', 'school-beta');

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('TENANT_MISMATCH');
    });
  });
});
