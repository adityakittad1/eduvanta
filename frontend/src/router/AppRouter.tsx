import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/store/AuthContext';
import { ToastProvider } from '@/components/ui';
import { ProtectedRoute, PublicRoute } from './RouteGuards';
import { AppShell } from '@/components/layout/AppShell';
import { PageSkeleton } from '@/components/layout/PageSkeleton';
import { TenantProvider } from '@/context/TenantContext';
import { getTenantSlug } from '@/utils/tenant';
import { useDynamicDocumentTitle } from '@/hooks/useDynamicDocumentTitle';
import '@/styles/global.css';

// ── Lazy-Loaded Modules for Instant Initial Load & Code-Splitting ──
const LoginPage = lazy(() => import('@/pages/Login/LoginPage').then(m => ({ default: m.LoginPage })));
const Dashboard = lazy(() => import('@/pages/Dashboard/Dashboard').then(m => ({ default: m.Dashboard })));
const StudentsListPage = lazy(() => import('@/features/students/pages/StudentsListPage').then(m => ({ default: m.StudentsListPage })));
const StudentProfilePage = lazy(() => import('@/features/students/pages/StudentProfilePage').then(m => ({ default: m.StudentProfilePage })));
const TeachersListPage = lazy(() => import('@/features/teachers/pages/TeachersListPage').then(m => ({ default: m.TeachersListPage })));
const TeacherProfilePage = lazy(() => import('@/features/teachers/pages/TeacherProfilePage').then(m => ({ default: m.TeacherProfilePage })));
const ClassesListPage = lazy(() => import('@/features/classes/pages/ClassesListPage').then(m => ({ default: m.ClassesListPage })));
const ClassDetailsPage = lazy(() => import('@/features/classes/pages/ClassDetailsPage').then(m => ({ default: m.ClassDetailsPage })));
const AttendanceMarkingPage = lazy(() => import('@/features/attendance/pages/AttendanceMarkingPage').then(m => ({ default: m.AttendanceMarkingPage })));
const AssessmentsListPage = lazy(() => import('@/features/academics/pages/AssessmentsListPage').then(m => ({ default: m.AssessmentsListPage })));
const AssessmentGradingPage = lazy(() => import('@/features/academics/pages/AssessmentGradingPage').then(m => ({ default: m.AssessmentGradingPage })));
const EarlyWarningPage = lazy(() => import('@/features/analytics/pages/EarlyWarningPage').then(m => ({ default: m.EarlyWarningPage })));
const AnalyticsPage = lazy(() => import('@/features/analytics/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const QuizzesListPage = lazy(() => import('@/features/quizzes/pages/QuizzesListPage').then(m => ({ default: m.QuizzesListPage })));
const QuizBuilderPage = lazy(() => import('@/features/quizzes/pages/QuizBuilderPage').then(m => ({ default: m.QuizBuilderPage })));
const QuizAttemptPage = lazy(() => import('@/features/quizzes/pages/QuizAttemptPage').then(m => ({ default: m.QuizAttemptPage })));
const ResourcesListPage = lazy(() => import('@/features/resources/pages/ResourcesListPage').then(m => ({ default: m.ResourcesListPage })));
const NoticesListPage = lazy(() => import('@/features/notices/pages/NoticesListPage').then(m => ({ default: m.NoticesListPage })));
const TcListPage = lazy(() => import('@/features/tc/pages/TcListPage').then(m => ({ default: m.TcListPage })));
const GalleryPage = lazy(() => import('@/features/gallery/pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const SchoolProfilePage = lazy(() => import('@/features/school-profile/pages/SchoolProfilePage').then(m => ({ default: m.SchoolProfilePage })));
const AiAssistantPage = lazy(() => import('@/features/ai/pages/AiAssistantPage').then(m => ({ default: m.AiAssistantPage })));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SuperAdminDashboard = lazy(() => import('@/features/super-admin/pages/SuperAdminDashboard').then(m => ({ default: m.SuperAdminDashboard })));
const ManageSchoolsPage = lazy(() => import('@/features/super-admin/pages/ManageSchoolsPage').then(m => ({ default: m.ManageSchoolsPage })));
const ManageUsersPage = lazy(() => import('@/features/super-admin/pages/ManageUsersPage').then(m => ({ default: m.ManageUsersPage })));
const SchoolPublicHome = lazy(() => import('@/features/public-website/pages/SchoolPublicHome').then(m => ({ default: m.SchoolPublicHome })));
const SchoolDirectoryPage = lazy(() => import('@/features/public-website/pages/SchoolDirectoryPage').then(m => ({ default: m.SchoolDirectoryPage })));
const EduVantaHome = lazy(() => import('@/features/public-website/pages/EduVantaHome').then(m => ({ default: m.EduVantaHome })));
const PublicWebsiteManagePage = lazy(() => import('@/features/school-profile/pages/PublicWebsiteManagePage').then(m => ({ default: m.PublicWebsiteManagePage })));

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
      <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>The page you are looking for does not exist.</p>
      <a href="/erp/dashboard" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem' }}>Go to Dashboard</a>
    </div>
  );
}

// ── Unauthorized Page ─────────────────────────────────────────
function UnauthorizedPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-danger-400)' }}>Access Denied</h1>
      <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem' }}>You do not have permission to view this page.</p>
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
  return <EduVantaHome />;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <AppDocumentTitle />
          <ToastProvider>
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                {/* ── Public routes: No auth required ──────── */}
                <Route path="/" element={<TenantHomeRouter />} />
                <Route path="/schools" element={<SchoolDirectoryPage />} />
                <Route path="/school/:slug" element={<SchoolPublicHome />} />
                <Route path="/schools/:slug" element={<SchoolPublicHome />} />

                {/* ── ERP public auth routes ─────────────────── */}
                <Route path="/login" element={<Navigate to="/erp/login" replace />} />
                <Route path="/erp/login" element={
                  <PublicRoute><LoginPage /></PublicRoute>
                } />

                {/* Protected routes: App Shell */}
                <Route path="/erp" element={
                  <ProtectedRoute><AppShell /></ProtectedRoute>
                }>
                  {/* Role-aware dashboard */}
                  <Route path="dashboard" element={<Dashboard />} />

                  {/* School Profile */}
                  <Route path="school-profile" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                      <SchoolProfilePage />
                    </ProtectedRoute>
                  } />
                  {/* Students */}
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
                  {/* Teachers */}
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
                  {/* Classes */}
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
                  {/* Attendance */}
                  <Route path="attendance" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                      <AttendanceMarkingPage />
                    </ProtectedRoute>
                  } />
                  {/* Academics */}
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
                  {/* Analytics & Early Warning */}
                  <Route path="analytics" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                      <AnalyticsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="early-warning" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                      <EarlyWarningPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Quizzes */}
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

                  {/* Resources & Notices */}
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

                  {/* TC System */}
                  <Route path="tc" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                      <TcListPage />
                    </ProtectedRoute>
                  } />

                  {/* AI Assistant */}
                  <Route path="ai" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                      <AiAssistantPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Reports */}
                  <Route path="reports" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* Gallery */}
                  <Route path="gallery" element={
                    <ProtectedRoute allowedRoles={['PRINCIPAL', 'TEACHER', 'STUDENT']}>
                      <GalleryPage />
                    </ProtectedRoute>
                  } />

                  {/* Public Website Management: PRINCIPAL only */}
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
            </Suspense>
          </ToastProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
