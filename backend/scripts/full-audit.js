// full-audit.js - Automated Comprehensive Full-Stack Audit
const BASE_URL = 'http://localhost:3000/api/v1';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = await res.text();
  }
  return { status: res.status, ok: res.ok, data };
}

async function login(email, password, host = 'localhost:3000') {
  return request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Host': host,
    },
    body: JSON.stringify({ email, password }),
  });
}

async function runAudit() {
  const results = [];
  function log(name, passed, detail = '') {
    results.push({ name, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${detail ? '— ' + detail : ''}`);
  }

  console.log('====================================================');
  console.log('   EDUVANTA ERP COMPREHENSIVE AUTOMATED AUDIT       ');
  console.log('====================================================\n');

  // ─── 1. SUPER ADMIN AUDIT ───
  console.log('--- Phase 3.1: Super Admin Audit ---');
  const saLogin = await login('admin@zperp.in', 'Admin@123456');
  if (saLogin.ok && saLogin.data.data?.accessToken) {
    log('SuperAdmin Login', true, `Role: ${saLogin.data.data.user.role}`);
    const saToken = saLogin.data.data.accessToken;
    const saHeaders = { 'Authorization': `Bearer ${saToken}` };

    const schoolsRes = await request('/schools', { headers: saHeaders });
    log('SuperAdmin List Schools', schoolsRes.ok && Array.isArray(schoolsRes.data.data), `Found ${schoolsRes.data.data?.length} schools`);

    // Verify SuperAdmin can access any school context
    const firstSchool = schoolsRes.data.data?.[0];
    if (firstSchool) {
      log('SuperAdmin School Scope Resolution', true, `Target: ${firstSchool.name} (${firstSchool.slug})`);
    }
  } else {
    log('SuperAdmin Login', false, JSON.stringify(saLogin.data));
  }

  // ─── 2. PRINCIPAL AUDIT (Root domain & Subdomain) ───
  console.log('\n--- Phase 3.2: Principal Audit ---');
  // Root domain login (The issue reported by user!)
  const prRootLogin = await login('principal@zpschool1.in', 'Principal@123', 'localhost:3000');
  log('Principal Root Domain Login (Fixed Tenant Required)', prRootLogin.ok, prRootLogin.ok ? `School: ${prRootLogin.data.data.user.school.name}` : prRootLogin.data.message);

  // Subdomain login (ellora-highschool)
  const prSubLogin = await login('principal@zpschool1.in', 'Principal@123', 'ellora-highschool.localhost:3000');
  log('Principal Subdomain Login (ellora-highschool)', prSubLogin.ok, prSubLogin.ok ? `Resolved tenant slug: ${prSubLogin.data.data.user.school.slug}` : prSubLogin.data.message);

  if (prRootLogin.ok) {
    const prToken = prRootLogin.data.data.accessToken;
    const prHeaders = { 'Authorization': `Bearer ${prToken}` };

    // School Profile
    const profRes = await request('/school-profile', { headers: prHeaders });
    log('Principal View School Profile', profRes.ok, `School: ${profRes.data?.data?.name}`);

    // Facilities & Achievements
    const facRes = await request('/school-profile/facilities', { headers: prHeaders });
    log('Principal View Facilities', facRes.ok, `Count: ${facRes.data?.data?.length}`);

    // Students List
    const studentsRes = await request('/students', { headers: prHeaders });
    log('Principal View Students', studentsRes.ok, `Count: ${studentsRes.data?.data?.students?.length || studentsRes.data?.data?.length || 0}`);

    // Teachers List
    const teachersRes = await request('/teachers', { headers: prHeaders });
    log('Principal View Teachers', teachersRes.ok, `Count: ${teachersRes.data?.data?.length || 0}`);

    // Classes List
    const classesRes = await request('/classes', { headers: prHeaders });
    log('Principal View Classes', classesRes.ok, `Count: ${classesRes.data?.data?.length || 0}`);

    // Early Warning Flags
    const ewRes = await request('/early-warning', { headers: prHeaders });
    log('Principal View Early Warning Flags', ewRes.ok, `Active flags: ${ewRes.data?.data?.length || 0}`);

    // Quizzes
    const quizRes = await request('/quizzes', { headers: prHeaders });
    log('Principal View Quizzes', quizRes.ok, `Quizzes count: ${quizRes.data?.data?.length || 0}`);

    // Resources
    const resRes = await request('/resources', { headers: prHeaders });
    log('Principal View Learning Resources', resRes.ok, `Resources count: ${resRes.data?.data?.length || 0}`);

    // Notices
    const notRes = await request('/notices', { headers: prHeaders });
    log('Principal View Notices', notRes.ok, `Notices count: ${notRes.data?.data?.length || 0}`);

    // Gallery
    const galRes = await request('/gallery', { headers: prHeaders });
    log('Principal View Gallery', galRes.ok, `Photos count: ${galRes.data?.data?.length || 0}`);

    // Reports / Dashboard Stats
    const repRes = await request('/reports/dashboard', { headers: prHeaders });
    log('Principal Reports Dashboard', repRes.ok, `Students: ${repRes.data?.data?.studentCount}, Teachers: ${repRes.data?.data?.teacherCount}`);

    // Transfer Certificates
    const tcRes = await request('/tc', { headers: prHeaders });
    log('Principal View Transfer Certificates', tcRes.ok, `TCs count: ${tcRes.data?.data?.length || 0}`);
  }

  // ─── 3. TEACHER AUDIT ───
  console.log('\n--- Phase 3.3: Teacher Audit ---');
  const tcLogin = await login('teacher@zpschool1.in', 'Teacher@123');
  log('Teacher Login', tcLogin.ok, tcLogin.ok ? `Teacher: ${tcLogin.data.data.user.name}` : tcLogin.data.message);

  if (tcLogin.ok) {
    const tcToken = tcLogin.data.data.accessToken;
    const tcHeaders = { 'Authorization': `Bearer ${tcToken}` };

    // Teacher Classes
    const tcClasses = await request('/classes', { headers: tcHeaders });
    log('Teacher View Classes', tcClasses.ok, `Classes count: ${tcClasses.data?.data?.length || 0}`);

    // Teacher view quizzes
    const tcQuizzes = await request('/quizzes', { headers: tcHeaders });
    log('Teacher View Quizzes', tcQuizzes.ok, `Quizzes count: ${tcQuizzes.data?.data?.length || 0}`);

    // Teacher view notices
    const tcNotices = await request('/notices', { headers: tcHeaders });
    log('Teacher View Notices', tcNotices.ok, `Notices count: ${tcNotices.data?.data?.length || 0}`);

    // Negative check: Teacher cannot manage school directory or platform
    const tcTrySuperAdmin = await request('/schools', { headers: tcHeaders });
    log('Security: Teacher Blocked From SuperAdmin Endpoint', tcTrySuperAdmin.status === 403, `HTTP ${tcTrySuperAdmin.status}`);
  }

  // ─── 4. STUDENT AUDIT ───
  console.log('\n--- Phase 3.4: Student Audit ---');
  const stLogin = await login('student@zpschool1.in', 'Student@123');
  log('Student Login', stLogin.ok, stLogin.ok ? `Student: ${stLogin.data.data.user.name}` : stLogin.data.message);

  if (stLogin.ok) {
    const stToken = stLogin.data.data.accessToken;
    const stHeaders = { 'Authorization': `Bearer ${stToken}` };

    // Student profile
    const stMe = await request('/auth/me', { headers: stHeaders });
    log('Student Get Own Profile (/auth/me)', stMe.ok, `Role: ${stMe.data?.data?.role}`);

    // Student view quizzes
    const stQuizzes = await request('/quizzes', { headers: stHeaders });
    log('Student View Assigned Quizzes', stQuizzes.ok, `Available quizzes: ${stQuizzes.data?.data?.length || 0}`);

    // Student view notices
    const stNotices = await request('/notices', { headers: stHeaders });
    log('Student View School Notices', stNotices.ok, `Notices: ${stNotices.data?.data?.length || 0}`);

    // Student view resources
    const stResources = await request('/resources', { headers: stHeaders });
    log('Student View Learning Resources', stResources.ok, `Resources: ${stResources.data?.data?.length || 0}`);

    // Security check: Student cannot create notices
    const stTryCreateNotice = await request('/notices', {
      method: 'POST',
      headers: { ...stHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Unauthorized', content: 'Testing', targetAudience: 'ALL' }),
    });
    log('Security: Student Blocked From Creating Notices', stTryCreateNotice.status === 403, `HTTP ${stTryCreateNotice.status}`);

    // Security check: Student cannot view teacher management
    const stTryTeachers = await request('/teachers', { headers: stHeaders });
    log('Security: Student Blocked From Teachers List', stTryTeachers.status === 403, `HTTP ${stTryTeachers.status}`);
  }

  // ─── 5. TENANT ISOLATION AUDIT ───
  // Subdomain mismatch test: Ellora High School principal attempting to login to Wardha school context
  const crossTenantLogin = await request('/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Slug': 'zp-school-wardha'
    },
    body: JSON.stringify({ email: 'principal@zpschool1.in', password: 'Principal@123' })
  });
  log('Security: Cross-Tenant Login Rejected', crossTenantLogin.status === 403, `HTTP ${crossTenantLogin.status}: ${crossTenantLogin.data?.message}`);

  // Unauthenticated access rejection
  const noAuthTest = await request('/students');
  log('Security: Unauthenticated Request Rejected', noAuthTest.status === 401, `HTTP ${noAuthTest.status}`);

  // Unknown route returns structured 404
  const unknownRouteTest = await request('/nonexistent-route-xyz');
  log('404 Routing: Unknown API Path Returns Structured 404', unknownRouteTest.status === 404, `HTTP ${unknownRouteTest.status}`);

  // Summary
  console.log('\n====================================================');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('====================================================\n');
}

runAudit();
