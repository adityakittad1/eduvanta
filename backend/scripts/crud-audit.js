// crud-audit.js - Comprehensive End-to-End Functional CRUD Testing
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

async function login(email, password) {
  const res = await request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.data?.data?.accessToken;
}

async function runCrudAudit() {
  const results = [];
  function log(name, passed, detail = '') {
    results.push({ name, passed, detail });
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name} ${detail ? '— ' + detail : ''}`);
  }

  console.log('====================================================');
  console.log('       EDUVANTA END-TO-END FUNCTIONAL CRUD AUDIT    ');
  console.log('====================================================\n');

  const prToken = await login('principal@zpschool1.in', 'Principal@123');
  const tcToken = await login('teacher@zpschool1.in', 'Teacher@123');
  const stToken = await login('student@zpschool1.in', 'Student@123');

  if (!prToken || !tcToken || !stToken) {
    console.error('Failed to obtain authentication tokens for testing roles');
    return;
  }

  // ─── 1. NOTICES CRUD ───
  console.log('--- 1. Notices CRUD Flow ---');
  const testNoticeTitle = `Audit Test Notice ${Date.now()}`;
  const createNoticeRes = await request('/notices', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${prToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: testNoticeTitle,
      content: 'This is an automated functional verification notice.',
      targetAudience: 'ALL',
      isPinned: false
    })
  });
  const createdNotice = createNoticeRes.data?.data;
  log('Create Notice (Principal)', createNoticeRes.ok, `ID: ${createdNotice?.id}`);

  // Read Notice as Student
  const readNoticeRes = await request('/notices', {
    headers: { 'Authorization': `Bearer ${stToken}` }
  });
  const foundNotice = readNoticeRes.data?.data?.find(n => n.id === createdNotice?.id);
  log('Read Notice (Student)', !!foundNotice, `Title: ${foundNotice?.title}`);

  // Delete Notice as Principal
  if (createdNotice?.id) {
    const delNoticeRes = await request(`/notices/${createdNotice.id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${prToken}` }
    });
    log('Delete Notice (Principal Cleanup)', delNoticeRes.ok, `Status: ${delNoticeRes.status}`);
  }

  // ─── 2. ATTENDANCE CRUD ───
  console.log('\n--- 2. Attendance Recording Flow ---');
  const studentsRes = await request('/students', { headers: { 'Authorization': `Bearer ${prToken}` } });
  const studentsList = studentsRes.data?.data?.students || studentsRes.data?.data || [];
  const testStudent = studentsList[0];
  const classesRes = await request('/classes', { headers: { 'Authorization': `Bearer ${prToken}` } });
  const testClass = classesRes.data?.data?.[0];

  if (testStudent && testClass) {
    const today = new Date().toISOString().split('T')[0];
    const markAttRes = await request('/attendance', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tcToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        classId: testClass.id,
        records: [
          { studentId: testStudent.id, status: 'PRESENT', remarks: 'Verified by audit' }
        ]
      })
    });
    log('Mark Daily Attendance (Teacher)', markAttRes.ok, `Date: ${today}, Records: 1`);

    // Fetch Attendance Stats via getDailyAttendance
    const attStatsRes = await request(`/attendance?classId=${testClass.id}&date=${today}`, {
      headers: { 'Authorization': `Bearer ${tcToken}` }
    });
    log('Read Class Attendance (Teacher)', attStatsRes.ok, `Status: ${attStatsRes.status}`);

    // Fetch Individual Student Attendance
    const studentAttRes = await request(`/attendance/student/${testStudent.id}`, {
      headers: { 'Authorization': `Bearer ${stToken}` }
    });
    log('Read Student Attendance History (Student)', studentAttRes.ok, `Present: ${studentAttRes.data?.data?.stats?.presentDays || 0}`);
  }

  // ─── 3. QUIZZES CRUD ───
  console.log('\n--- 3. Quiz Creation & Publishing Flow ---');
  if (testClass) {
    // Check or create Subject for class
    const classDetailRes = await request(`/classes/${testClass.id}`, {
      headers: { 'Authorization': `Bearer ${prToken}` }
    });
    let subjectId = classDetailRes.data?.data?.subjects?.[0]?.id;
    if (!subjectId) {
      const createSubRes = await request(`/classes/${testClass.id}/subjects`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${prToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'General Science', code: 'SCI' })
      });
      subjectId = createSubRes.data?.data?.id;
    }

    if (subjectId) {
      const quizTitle = `Audit Science Quiz ${Date.now()}`;
      const createQuizRes = await request('/quizzes', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tcToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: testClass.id,
          subjectId,
          title: quizTitle,
          topic: 'Physics and Nature'
        })
      });
      const createdQuiz = createQuizRes.data?.data;
      log('Create Quiz (Teacher)', createQuizRes.ok, `ID: ${createdQuiz?.id}, Title: ${createdQuiz?.title}`);

      if (createdQuiz?.id) {
        // Add Question
        const addQRes = await request(`/quizzes/${createdQuiz.id}/questions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${tcToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText: 'What is the chemical formula for pure water?',
            optionA: 'CO2',
            optionB: 'H2O',
            optionC: 'O2',
            optionD: 'NaCl',
            correctOption: 'B',
            order: 1
          })
        });
        const createdQuestion = addQRes.data?.data;
        log('Add Quiz Question (Teacher)', addQRes.ok, `Question: ${createdQuestion?.questionText}`);

        // Publish Quiz
        const pubRes = await request(`/quizzes/${createdQuiz.id}/publish`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${tcToken}` }
        });
        log('Publish Quiz (Teacher)', pubRes.ok, `Published: ${pubRes.data?.data?.isPublished}`);

        // Student Views Published Quiz
        const stQuizzesRes = await request('/quizzes', {
          headers: { 'Authorization': `Bearer ${stToken}` }
        });
        const foundQuiz = stQuizzesRes.data?.data?.find(q => q.id === createdQuiz.id);
        log('Student Discovers Published Quiz', !!foundQuiz, `Quiz: ${foundQuiz?.title}`);

        // Student Submits Quiz Attempt
        if (createdQuestion?.id) {
          const submitQuizRes = await request(`/quizzes/${createdQuiz.id}/submit`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${stToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: [
                { questionId: createdQuestion.id, selectedOption: 'B' }
              ]
            })
          });
          log('Student Submits Quiz (Auto-Grading)', submitQuizRes.ok, `Score: ${submitQuizRes.data?.data?.score}/${submitQuizRes.data?.data?.totalQuestions}`);
        }
      }
    }
  }

  // ─── 4. EARLY WARNING ENGINE ───
  console.log('\n--- 4. Early Warning Evaluation Engine ---');
  const runEwRes = await request('/early-warning/evaluate', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${prToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ classId: testClass?.id })
  });
  log('Run Early Warning Evaluation (Principal)', runEwRes.ok, `Evaluated students`);

  // Summary
  console.log('\n====================================================');
  const passedCount = results.filter(r => r.passed).length;
  console.log(`CRUD TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${results.length - passedCount}`);
  console.log('====================================================\n');
}

runCrudAudit();
