import React from 'react';
import { useAuth } from '@/store/AuthContext';
import { PageHeader, Card, Badge } from '@/components/ui';
import {
  Users, GraduationCap, CalendarCheck, AlertTriangle,
  TrendingUp, Bell, School
} from 'lucide-react';
import { attendanceApi, StudentAttendanceStats } from '@/features/attendance/api/attendance';
import { academicsApi, StudentAcademicResponse } from '@/features/academics/api/academics';
import { earlyWarningApi, EarlyWarningFlag } from '@/features/analytics/api/early-warning';
import { quizzesApi, Quiz } from '@/features/quizzes/api/quizzes';
import { Navigate, useNavigate } from 'react-router-dom';
import './Dashboard.css';

function getGreeting(name: string | null | undefined, email: string): string {
  const hour = new Date().getHours();
  let timeOfDay = 'Evening';
  if (hour < 12) timeOfDay = 'Morning';
  else if (hour < 17) timeOfDay = 'Afternoon';
  
  const displayName = name || email.split('@')[0];
  return `Good ${timeOfDay}, ${displayName} 👋`;
}

export function PrincipalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flags, setFlags] = React.useState<EarlyWarningFlag[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    earlyWarningApi.getFlags().then(data => {
      setFlags(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <PageHeader
        title={getGreeting(user?.name, user?.email || '')}
        subtitle={user?.school?.name ? `Welcome to ${user.school.name} Digital Campus.` : "Here's an overview of your school today."}
      />

      {/* Stats Row */}
      <div className="dashboard-stats">
        <StatCard icon={<GraduationCap size={22} />} label="Total Students" value="—" color="primary" />
        <StatCard icon={<Users size={22} />} label="Total Teachers" value="—" color="success" />
        <StatCard icon={<CalendarCheck size={22} />} label="Today's Attendance" value="—%" color="info" />
        <StatCard icon={<AlertTriangle size={22} />} label="Needs Attention" value={isLoading ? '...' : flags.length.toString()} color={flags.length > 0 ? 'warning' : 'neutral'} />
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h3 className="dashboard-card-title">
            <TrendingUp size={16} /> Attendance Trends
          </h3>
          <div className="dashboard-placeholder">
            <p>Attendance analytics chart will appear here in Phase 7.</p>
          </div>
        </Card>

        <Card className="dashboard-card">
          <h3 className="dashboard-card-title">
            <Bell size={16} /> Recent Notices
          </h3>
          <div className="dashboard-placeholder">
            <p>Recent school notices will appear here in Phase 12.</p>
          </div>
        </Card>

        <Card className="dashboard-card">
          <h3 className="dashboard-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={16} /> Early Warning — Needs Attention
            </div>
            <a href="/erp/early-warning" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)' }}>View all</a>
          </h3>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading...</p></div>
          ) : flags.length === 0 ? (
            <div className="dashboard-placeholder"><p>No students currently require attention.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {flags.slice(0, 4).map(flag => (
                <div key={flag.id} onClick={() => navigate(`/erp/students/${flag.studentId}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{flag.student?.firstName} {flag.student?.lastName}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{flag.student?.class?.name}</div>
                  </div>
                  <Badge variant={flag.flagType === 'LOW_ATTENDANCE' ? 'danger' : 'warning'}>
                    {flag.flagType === 'LOW_ATTENDANCE' ? 'Attendance' : 'Academics'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="dashboard-card">
          <h3 className="dashboard-card-title">
            <School size={16} /> Quick Actions
          </h3>
          <div className="dashboard-quick-actions">
            <a href="/erp/students" className="quick-action-btn">Add Student</a>
            <a href="/erp/attendance" className="quick-action-btn">Mark Attendance</a>
            <a href="/erp/notices" className="quick-action-btn">Post Notice</a>
            <a href="/erp/tc" className="quick-action-btn">Transfer Certificate</a>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flags, setFlags] = React.useState<EarlyWarningFlag[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Teachers usually see only their assigned classes, but for now we fetch all flags
    // Ideally, we'd pass classIds here once we load teacher's classes.
    earlyWarningApi.getFlags().then(data => {
      setFlags(data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="dashboard">
      <PageHeader
        title={getGreeting(user?.name, user?.email || '')}
        subtitle={user?.school?.name ? `Welcome to ${user.school.name} Digital Campus.` : "Manage your classes and students."}
      />

      <div className="dashboard-stats">
        <StatCard icon={<School size={22} />} label="Assigned Classes" value="—" color="primary" />
        <StatCard icon={<GraduationCap size={22} />} label="My Students" value="—" color="success" />
        <StatCard icon={<CalendarCheck size={22} />} label="Attendance Today" value="—" color="info" />
        <StatCard icon={<AlertTriangle size={22} />} label="Needs Attention" value={isLoading ? '...' : flags.length.toString()} color={flags.length > 0 ? 'warning' : 'neutral'} />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h3 className="dashboard-card-title"><CalendarCheck size={16} /> Today's Attendance</h3>
          <div className="dashboard-placeholder">
            <p>Mark today's attendance — available in Phase 7.</p>
          </div>
        </Card>

        <Card className="dashboard-card">
          <h3 className="dashboard-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <AlertTriangle size={16} /> Needs Attention
            </div>
            <a href="/erp/early-warning" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)' }}>View all</a>
          </h3>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading...</p></div>
          ) : flags.length === 0 ? (
            <div className="dashboard-placeholder"><p>No students currently require attention.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              {flags.slice(0, 4).map(flag => (
                <div key={flag.id} onClick={() => navigate(`/erp/students/${flag.studentId}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{flag.student?.firstName} {flag.student?.lastName}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{flag.student?.class?.name}</div>
                  </div>
                  <Badge variant={flag.flagType === 'LOW_ATTENDANCE' ? 'danger' : 'warning'}>
                    {flag.flagType === 'LOW_ATTENDANCE' ? 'Attendance' : 'Academics'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const studentId = user?.student?.id;

  const [attendance, setAttendance] = React.useState<StudentAttendanceStats | null>(null);
  const [academics, setAcademics] = React.useState<StudentAcademicResponse | null>(null);
  const [quizzes, setQuizzes] = React.useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!studentId) {
      setIsLoading(false);
      return;
    }
    Promise.all([
      attendanceApi.getStudentAttendance(studentId).catch(() => null),
      academicsApi.getStudentAcademics(studentId).catch(() => null),
      quizzesApi.getQuizzes().catch(() => [])
    ]).then(([att, aca, qz]) => {
      if (att) setAttendance(att.stats);
      if (aca) setAcademics(aca);
      if (qz) setQuizzes(qz as Quiz[]);
      setIsLoading(false);
    });
  }, [studentId]);

  return (
    <div className="dashboard">
      <PageHeader
        title={getGreeting(user?.name, user?.email || '')}
        subtitle={user?.school?.name ? `Welcome to your digital campus at ${user.school.name}.` : "Check your attendance, marks, and learning resources."}
      />

      <div className="dashboard-stats">
        <StatCard 
          icon={<CalendarCheck size={22} />} 
          label="My Attendance" 
          value={isLoading ? '...' : (attendance?.percentage != null ? `${attendance.percentage.toFixed(1)}%` : '—%')} 
          color={attendance && attendance.percentage < 75 ? 'warning' : 'primary'} 
        />
        <StatCard 
          icon={<TrendingUp size={22} />} 
          label="Average Marks" 
          value={isLoading ? '...' : (academics?.averagePercentage != null ? `${academics.averagePercentage.toFixed(1)}%` : '—%')} 
          color={academics && academics.averagePercentage != null && academics.averagePercentage < 40 ? 'warning' : 'success'} 
        />
        <div onClick={() => navigate('/erp/quizzes')} style={{ cursor: 'pointer', display: 'contents' }}>
          <StatCard icon={<School size={22} />} label="Active Quizzes" value={isLoading ? '...' : quizzes.filter(q => !q.studentAttempt).length.toString()} color="info" />
        </div>
        <StatCard icon={<Bell size={22} />} label="Notices" value="—" color="neutral" />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h3 className="dashboard-card-title"><TrendingUp size={16} /> My Academic Performance</h3>
          {isLoading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-neutral-500)' }}>Loading...</div>
          ) : academics?.records && academics.records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
              {academics.records.slice(0, 5).map(record => (
                <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{record.assessment.name}</div>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>
                      {record.assessment.subject?.name} • {record.assessment.type.replace('_', ' ')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'var(--font-bold)', color: (record.marksObtained / record.assessment.maxMarks) < 0.4 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}>
                      {record.marksObtained} / {record.assessment.maxMarks}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                      {((record.marksObtained / record.assessment.maxMarks) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-placeholder">
              <p>No academic records found yet.</p>
            </div>
          )}
        </Card>

        <Card className="dashboard-card">
          <h3 className="dashboard-card-title"><Bell size={16} /> Notices</h3>
          <div className="dashboard-placeholder">
            <p>School notices will appear here in Phase 12.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Shared: Role-aware Dashboard ───────────────────────────────
export function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') return <Navigate to="/erp/super-admin/dashboard" replace />;
  if (user?.role === 'PRINCIPAL')   return <PrincipalDashboard />;
  if (user?.role === 'TEACHER')     return <TeacherDashboard />;
  if (user?.role === 'STUDENT')     return <StudentDashboard />;
  return <PrincipalDashboard />;
}

// ── Shared: Stat Card ──────────────────────────────────────────
function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'neutral';
}) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
      </div>
    </div>
  );
}
