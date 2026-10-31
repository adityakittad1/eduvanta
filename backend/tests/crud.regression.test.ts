import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import * as dataDb from '../src/lib/dataDb';
import * as authDb from '../src/lib/authDb';
import { env } from '../src/config/env';

describe('EduVanta Comprehensive CRUD, Tenancy & Security Regression Tests', () => {
  const app = createApp();

  const mockSchoolId = 'school-alpha-id';
  const superAdminToken = jwt.sign(
    { userId: 'super-admin-id', role: 'SUPER_ADMIN', schoolId: null },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const principalToken = jwt.sign(
    { userId: 'principal-alpha-id', role: 'PRINCIPAL', schoolId: mockSchoolId },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  const studentToken = jwt.sign(
    { userId: 'student-alpha-id', role: 'STUDENT', schoolId: mockSchoolId },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' }
  );

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─── 1. Health Endpoints ─────────────────────────────────────
  describe('System Health & Readiness Endpoints', () => {
    it('GET /api/v1/health/live returns process status ok', async () => {
      const res = await request(app).get('/api/v1/health/live');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.status).toBe('ok');
    });

    it('GET /api/v1/health returns database health metadata', async () => {
      const res = await request(app).get('/api/v1/health');
      expect([200, 503]).toContain(res.status);
      expect(res.body.database).toBeDefined();
      expect(res.body.envCheck).toBeDefined();
    });
  });

  // ─── 2. School Management (Super Admin) ───────────────────────
  describe('School Management CRUD', () => {
    it('creates a new school with unique slug as Super Admin', async () => {
      const mockSchool = {
        id: 'new-school-cuid-1',
        name: 'Chhatrapati Shivaji High School',
        slug: 'chhatrapati-shivaji-high-school',
        address: 'Pune, Maharashtra',
        contactPhone: '+91 20 12345678',
        contactEmail: 'info@shivajischool.org',
        principalName: 'Dr. More',
        isActive: true,
        _count: { students: 0, teachers: 0 },
      };

      jest.spyOn(dataDb, 'dbFindSchoolBySlug').mockResolvedValue(null);
      jest.spyOn(dataDb, 'dbCreateSchool').mockResolvedValue(mockSchool);
      jest.spyOn(dataDb, 'dbCreateAuditLog').mockResolvedValue();

      const res = await request(app)
        .post('/api/v1/schools')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Chhatrapati Shivaji High School',
          address: 'Pune, Maharashtra',
          contactPhone: '+91 20 12345678',
          contactEmail: 'info@shivajischool.org',
          principalName: 'Dr. More',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('chhatrapati-shivaji-high-school');
    });

    it('rejects school creation by non-Super Admin (PRINCIPAL)', async () => {
      const res = await request(app)
        .post('/api/v1/schools')
        .set('Authorization', `Bearer ${principalToken}`)
        .send({ name: 'Unauthorized School' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });

    it('lists schools with student and teacher counts', async () => {
      jest.spyOn(dataDb, 'dbGetAllSchools').mockResolvedValue({
        schools: [
          {
            id: mockSchoolId,
            name: 'School Alpha',
            slug: 'school-alpha',
            isActive: true,
            _count: { students: 13, teachers: 3 },
          },
        ],
        total: 1,
      });

      const res = await request(app)
        .get('/api/v1/schools')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0]._count.students).toBe(13);
    });
  });

  // ─── 3. User & Principal Management ──────────────────────────
  describe('User & Principal Management', () => {
    it('lists users filtered by role for Super Admin', async () => {
      jest.spyOn(dataDb, 'dbGetAllUsers').mockResolvedValue({
        users: [
          {
            id: 'user-p1',
            email: 'principal@school-alpha.org',
            name: 'Sangita Shinde',
            role: 'PRINCIPAL',
            schoolId: mockSchoolId,
            isActive: true,
            school: { name: 'School Alpha' },
          },
        ],
        total: 1,
      });

      const res = await request(app)
        .get('/api/v1/users?role=PRINCIPAL')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].role).toBe('PRINCIPAL');
      expect(res.body.data[0].name).toBe('Sangita Shinde');
    });

    it('creates a Principal and assigns to school', async () => {
      jest.spyOn(dataDb, 'dbFindUserByEmail').mockResolvedValue(null);
      jest.spyOn(dataDb, 'dbCreateUser').mockResolvedValue({
        id: 'new-principal-id',
        email: 'principal.new@eduvanta.local',
        name: 'Suresh Deshmukh',
        role: 'PRINCIPAL',
        schoolId: mockSchoolId,
        isActive: true,
      });

      const res = await request(app)
        .post('/api/v1/users')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          email: 'principal.new@eduvanta.local',
          name: 'Suresh Deshmukh',
          role: 'PRINCIPAL',
          schoolId: mockSchoolId,
          password: 'Principal@123',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('PRINCIPAL');
    });
  });

  // ─── 4. Student Management & Validation ───────────────────────
  describe('Student Management & Validation', () => {
    it('registers a student with optional fields omitted or empty string', async () => {
      jest.spyOn(dataDb, 'dbFindStudentByAdmission').mockResolvedValue(null);
      jest.spyOn(dataDb, 'dbGetSchoolById').mockResolvedValue({ id: mockSchoolId, slug: 'school-alpha' });
      jest.spyOn(dataDb, 'dbFindUserByEmail').mockResolvedValue(null);
      jest.spyOn(dataDb, 'dbCreateUser').mockResolvedValue({ id: 'user-st-1' });
      jest.spyOn(dataDb, 'dbCreateStudent').mockResolvedValue({
        id: 'student-cuid-1',
        schoolId: mockSchoolId,
        admissionNumber: 'GP-2026-001',
        firstName: 'Aarav',
        lastName: 'Deshmukh',
        gender: null,
        academicYear: '2026-2027',
      });

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${principalToken}`)
        .send({
          admissionNumber: 'GP-2026-001',
          firstName: 'Aarav',
          lastName: 'Deshmukh',
          gender: '', // Empty string from UI select
          academicYear: '2026-2027',
          classId: '',
          dateOfBirth: '',
          email: 'aarav.deshmukh@eduvanta.student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.admissionNumber).toBe('GP-2026-001');
    });

    it('rejects duplicate admission number in the same school', async () => {
      jest.spyOn(dataDb, 'dbFindStudentByAdmission').mockResolvedValue({ id: 'existing-st-id' });

      const res = await request(app)
        .post('/api/v1/students')
        .set('Authorization', `Bearer ${principalToken}`)
        .send({
          admissionNumber: 'GP-2026-001',
          firstName: 'Another',
          lastName: 'Student',
          academicYear: '2026-2027',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Admission number already in use');
    });
  });

  // ─── 5. Tenant Isolation & Security ──────────────────────────
  describe('Tenant Isolation & Cross-School Boundary Enforcement', () => {
    it('returns 404 when Principal tries to access a student from another school', async () => {
      // Student belongs to a different school, dbGetStudentById enforces schoolId filter
      jest.spyOn(dataDb, 'dbGetStudentById').mockResolvedValue(null);

      const res = await request(app)
        .get('/api/v1/students/student-from-other-school')
        .set('Authorization', `Bearer ${principalToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('forbids Student role from creating teachers or classes', async () => {
      const res = await request(app)
        .post('/api/v1/teachers')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          firstName: 'Unauthorized',
          lastName: 'Teacher',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN');
    });
  });
});
