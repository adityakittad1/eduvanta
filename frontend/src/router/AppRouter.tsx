import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import { ToastProvider } from '@/components/ui';
import { ProtectedRoute, PublicRoute } from './RouteGuards';
import { AppShell } from '@/components/layout/AppShell';
import { LoginPage } from '@/pages/Login/LoginPage';
import { Dashboard } from '@/pages/Dashboard/Dashboard';
import { StudentsListPage } from '@/features/students/pages/StudentsListPage';
import { StudentProfilePage } from '@/features/students/pages/StudentProfilePage';
import { TeachersListPage } from '@/features/teachers/pages/TeachersListPage';
import { TeacherProfilePage } from '@/features/teachers/pages/TeacherProfilePage';
import { ClassesListPage } from '@/features/classes/pages/ClassesListPage';
import { ClassDetailsPage } from '@/features/classes/pages/ClassDetailsPage';
import { AttendanceMarkingPage } from '@/features/attendance/pages/AttendanceMarkingPage';
import { AssessmentsListPage } from '@/features/academics/pages/AssessmentsListPage';
import { AssessmentGradingPage } from '@/features/academics/pages/AssessmentGradingPage';
import { EarlyWarningPage } from '@/features/analytics/pages/EarlyWarningPage';
import { QuizzesListPage } from '@/features/quizzes/pages/QuizzesListPage';
import { QuizBuilderPage } from '@/features/quizzes/pages/QuizBuilderPage';
import { QuizAttemptPage } from '@/features/quizzes/pages/QuizAttemptPage';
import { ResourcesListPage } from '@/features/resources/pages/ResourcesListPage';
import { NoticesListPage } from '@/features/notices/pages/NoticesListPage';
import { TcListPage } from '@/features/tc/pages/TcListPage';
import { GalleryPage } from '@/features/gallery/pages/GalleryPage';
import { SchoolProfilePage } from '@/features/school-profile/pages/SchoolProfilePage';
import { AiAssistantPage } from '@/features/ai/pages/AiAssistantPage';
import { ReportsPage } from '@/features/reports/pages/ReportsPage';
import { SuperAdminDashboard } from '@/features/super-admin/pages/SuperAdminDashboard';
import { ManageSchoolsPage } from '@/features/super-admin/pages/ManageSchoolsPage';
import { ManageUsersPage } from '@/features/super-admin/pages/ManageUsersPage';
import { SchoolPublicHome } from '@/features/public-website/pages/SchoolPublicHome';
import { SchoolDirectoryPage } from '@/features/public-website/pages/SchoolDirectoryPage';
import { PublicWebsiteManagePage } from '@/features/school-profile/pages/PublicWebsiteManagePage';
import { TenantProvider } from '@/context/TenantContext';
import { getTenantSlug } from '@/utils/tenant';
import { useDynamicDocumentTitle } from '@/hooks/useDynamicDocumentTitle';
import '@/styles/global.css';

// ── Dynamic Title Helper ─────────────────────────────────────
function AppDocumentTitle() {
  useDynamicDocumentTitle();
  return null;
}

// ── 404 Page ─────────────────────────────────────────────────
function NotFoundPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--color-neutral-300)' }}>404</h1>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-neutral-700)' }}>Page not found</h2>
      <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>The page you're looking for doesn't exist.</p>
      <a href="/erp/dashboard" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem' }}>Go to Dashboard</a>
    </div>
  );
}

// ── Unauthorized Page ─────────────────────────────────────────
function UnauthorizedPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger-400)' }}>Access Denied</h1>
      <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>You don't have permission to view this page.</p>
      <a href="/erp/dashboard" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem' }}>Go to Dashboard</a>
    </div>
  );
}

// ── Public Home Router ────────────────────────────────────────
function TenantHomeRouter() {
  const slug = getTenantSlug();
  if (slug) {
    return <SchoolPublicHome />;
  }
  return <Navigate to="/schools" replace />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <AppDocumentTitle />
          <ToastProvider>
            <Routes>
              {/* ── Public routes — No auth required ──────── */}
              <Route path="/" element={<TenantHomeRouter />} />
              <Route path="/schools" element={<SchoolDirectoryPage />} />

              {/* ── ERP public auth routes ─────────────────── */}
              <Route path="/erp/login" element={
                <PublicRoute><LoginPage /></PublicRoute>
              } />

              {/* Protected routes — App Shell */}
              <Route path="/erp" element={
                <ProtectedRoute><AppShell /></ProtectedRoute>
              }>
                {/* Role-aware dashboard */}
                <Route path="dashboard" element={<Dashboard />} />

                {/* Phase 4: /school-profile */}
                <Route path="school-profile" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <SchoolProfilePage />
                  </ProtectedRoute>
                } />
                {/* Phase 5: /students, /students/:id */}
                <Route path="students" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <StudentsListPage />
                  </ProtectedRoute>
                } />
                <Route path="students/:id" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <StudentProfilePage />
                  </ProtectedRoute>
                } />
                {/* Phase 6: /teachers, /teachers/:id */}
                <Route path="teachers" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL']}>
                    <TeachersListPage />
                  </ProtectedRoute>
                } />
                <Route path="teachers/:id" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL']}>
                    <TeacherProfilePage />
                  </ProtectedRoute>
                } />
                {/* Phase 7: /classes, /classes/:id */}
                <Route path="classes" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <ClassesListPage />
                  </ProtectedRoute>
                } />
                <Route path="classes/:id" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <ClassDetailsPage />
                  </ProtectedRoute>
                } />
                {/* Phase 8: /attendance */}
                <Route path="attendance" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <AttendanceMarkingPage />
                  </ProtectedRoute>
                } />
                {/* Phase 9: /academics */}
                <Route path="academics" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <AssessmentsListPage />
                  </ProtectedRoute>
                } />
                <Route path="academics/assessments/:id" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <AssessmentGradingPage />
                  </ProtectedRoute>
                } />
                {/* Phase 10: Early Warning System */}
                <Route path="early-warning" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <EarlyWarningPage />
                  </ProtectedRoute>
                } />
                
                {/* Phase 11: Quizzes */}
                <Route path="quizzes" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <QuizzesListPage />
                  </ProtectedRoute>
                } />
                <Route path="quizzes/:id/build" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <QuizBuilderPage />
                  </ProtectedRoute>
                } />
                <Route path="quizzes/:id/attempt" element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <QuizAttemptPage />
                  </ProtectedRoute>
                } />

                {/* Phase 12: Resources & Notices */}
                <Route path="resources" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <ResourcesListPage />
                  </ProtectedRoute>
                } />
                <Route path="notices" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <NoticesListPage />
                  </ProtectedRoute>
                } />

                {/* Phase 13: TC System */}
                <Route path="tc" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <TcListPage />
                  </ProtectedRoute>
                } />

                {/* Phase 14: AI */}
                <Route path="ai" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <AiAssistantPage />
                  </ProtectedRoute>
                } />
                
                {/* Phase 15: Reports */}
                <Route path="reports" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                
                {/* Phase 16: Gallery */}
                <Route path="gallery" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                    <GalleryPage />
                  </ProtectedRoute>
                } />
                
                {/* Phase 17: School Profile */}
                <Route path="school-profile" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                    <SchoolProfilePage />
                  </ProtectedRoute>
                } />

                {/* Public Website Management — PRINCIPAL only */}
                <Route path="public-website" element={
                  <ProtectedRoute allowedRoles={['PRINCIPAL']}>
                    <PublicWebsiteManagePage />
                  </ProtectedRoute>
                } />

                {/* SUPER_ADMIN routes */}
                <Route path="super-admin/dashboard" element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="super-admin/schools" element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <ManageSchoolsPage />
                  </ProtectedRoute>
                } />
                <Route path="super-admin/users" element={
                  <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
                    <ManageUsersPage />
                  </ProtectedRoute>
                } />

                <Route path="unauthorized" element={<UnauthorizedPage />} />
                
                {/* Default redirect inside /erp */}
                <Route index element={<Navigate to="dashboard" replace />} />
              </Route>

              {/* Fallback 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
