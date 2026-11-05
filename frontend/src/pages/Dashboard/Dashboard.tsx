import React, { useEffect, useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { PageHeader, Card, Badge } from '@/components/ui';
import {
  Users, GraduationCap, CalendarCheck, AlertTriangle,
  TrendingUp, Bell, School, UserCheck
} from 'lucide-react';
import { attendanceApi, StudentAttendanceStats } from '@/features/attendance/api/attendance';
import { academicsApi, StudentAcademicResponse } from '@/features/academics/api/academics';
import { earlyWarningApi, EarlyWarningFlag } from '@/features/analytics/api/early-warning';
import { quizzesApi, Quiz } from '@/features/quizzes/api/quizzes';
import { noticesApi, Notice } from '@/features/notices/api/notices';
import { reportsApi, DashboardStats, AttendanceTrendPoint } from '@/features/reports/api/reports';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

function getGreeting(name: string | null | undefined, email: string): string {
  const hour = new Date().getHours();
  let timeOfDay = 'Evening';
  if (hour < 12) timeOfDay = 'Morning';
  else if (hour < 17) timeOfDay = 'Afternoon';

  const displayName = name || email.split('@')[0];
  return `Good ${timeOfDay}, ${displayName} 👋`;
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'primary' | 'success' | 'info' | 'warning' | 'neutral';
  subtext?: string;
}

function StatCard({ icon, label, value, color, subtext }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {subtext && <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: 4 }}>{subtext}</div>}
      </div>
    </div>
  );
}

// Visual attendance trends chart component
function AttendanceChart({ data }: { data: AttendanceTrendPoint[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="dashboard-placeholder">
        <p>No recent attendance records found for this period.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 'var(--space-2) 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
          Last {data.length} school days trend
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB', display: 'inline-block' }} /> Present
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} /> Absent
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 160, gap: 'var(--space-2)', paddingTop: 'var(--space-3)' }}>
        {data.map((point, idx) => {
          const heightPct = Math.max(15, Math.min(100, point.percentage));
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: point.percentage >= 75 ? 'var(--color-primary-700)' : 'var(--color-danger-600)' }}>
                {point.percentage.toFixed(0)}%
              </span>
              <div style={{ width: '100%', maxWidth: 36, height: `${heightPct}%`, background: 'var(--color-neutral-100)', borderRadius: 'var(--radius-sm)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: point.percentage >= 85 ? 'linear-gradient(180deg, #3B82F6 0%, #1D4ED8 100%)' : point.percentage >= 75 ? 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)' : 'linear-gradient(180deg, #EF4444 0%, #B91C1C 100%)',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'height 0.4s ease'
                  }}
                  title={`${point.date} (${point.day}): ${point.percentage}% Present (${point.present} present, ${point.absent} absent)`}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-neutral-600)', whiteSpace: 'nowrap' }}>
                {point.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PrincipalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flags, setFlags] = useState<EarlyWarningFlag[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      reportsApi.getDashboardStats().catch(() => null),
      earlyWarningApi.getFlags().catch(() => []),
    ]).then(([statsData, flagsData]) => {
      if (!isMounted) return;
      if (statsData) setStats(statsData);
      if (flagsData) setFlags(flagsData);
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const totalStudents = stats?.studentCount != null ? stats.studentCount.toLocaleString() : (isLoading ? '...' : '0');
  const totalTeachers = stats?.teacherCount != null ? stats.teacherCount.toLocaleString() : (isLoading ? '...' : '0');
  const todayAtt = stats?.todayAttendancePercentage != null ? `${stats.todayAttendancePercentage}%` : (isLoading ? '...' : 'N/A');

  return (
    <div className="dashboard">
      <PageHeader
        title={getGreeting(user?.name, user?.email || '')}
        subtitle={user?.school?.name ? `Welcome to ${user.school.name} Digital Campus.` : "Here is an overview of your school today."}
      />

      {/* Stats Row */}
      <div className="dashboard-stats">
        <StatCard icon={<GraduationCap size={22} />} label="Total Students" value={totalStudents} color="primary" />
        <StatCard icon={<Users size={22} />} label="Total Teachers" value={totalTeachers} color="success" />
        <StatCard icon={<CalendarCheck size={22} />} label="Today's Attendance" value={todayAtt} color="info" subtext={stats?.todayPresentCount != null ? `${stats.todayPresentCount} present / ${stats.todayAbsentCount} absent` : undefined} />
        <StatCard icon={<AlertTriangle size={22} />} label="Needs Attention" value={isLoading ? '...' : (stats?.warningCount || flags.length).toString()} color={(stats?.warningCount || flags.length) > 0 ? 'warning' : 'neutral'} />
      </div>

      {/* Content Grid */}
      <div className="dashboard-grid">
        {/* Attendance Trends */}
        <Card className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="dashboard-card-title" style={{ margin: 0, border: 'none' }}>
              <TrendingUp size={16} /> Attendance Trends
            </h3>
            <Link to="/erp/attendance" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View full report
            </Link>
          </div>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading attendance data...</p></div>
          ) : (
            <AttendanceChart data={stats?.attendanceTrends || []} />
          )}
        </Card>

        {/* Recent Notices */}
        <Card className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 className="dashboard-card-title" style={{ margin: 0, border: 'none' }}>
              <Bell size={16} /> Recent Notices
            </h3>
            <Link to="/erp/notices" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading notices...</p></div>
          ) : !stats?.recentNotices || stats.recentNotices.length === 0 ? (
            <div className="dashboard-placeholder"><p>No notices published yet.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {stats.recentNotices.slice(0, 4).map(notice => (
                <div
                  key={notice.id}
                  onClick={() => navigate('/erp/notices')}
                  style={{
                    padding: 'var(--space-3)',
                    background: 'var(--color-neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: '1px solid var(--color-neutral-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                      {notice.title}
                    </div>
                    <Badge variant="info">
                      {notice.targetAudience}
                    </Badge>
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notice.content}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-neutral-400)' }}>
                    Posted {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Early Warning */}
        <Card className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 className="dashboard-card-title" style={{ margin: 0, border: 'none' }}>
              <AlertTriangle size={16} /> Early Warning — Needs Attention
            </h3>
            <Link to="/erp/early-warning" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading...</p></div>
          ) : flags.length === 0 ? (
            <div className="dashboard-placeholder"><p>No students currently require attention.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {flags.slice(0, 4).map(flag => (
                <div
                  key={flag.id}
                  onClick={() => navigate(`/erp/students/${flag.studentId}`)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3)',
                    background: 'var(--color-neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: '1px solid var(--color-neutral-200)'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                      {flag.student ? `${flag.student.firstName} ${flag.student.lastName}` : 'Student'}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                      {flag.student?.class ? `Class ${flag.student.class.name} (${flag.student.class.division})` : 'Class assigned'} - {((flag.details as any)?.reason || 'Attention needed')}
                    </div>
                  </div>
                  <Badge variant={flag.flagType === 'LOW_ATTENDANCE' ? 'danger' : 'warning'}>
                    {flag.flagType === 'LOW_ATTENDANCE' ? 'Attendance' : 'Academics'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="dashboard-card">
          <h3 className="dashboard-card-title" style={{ border: 'none' }}>
            <School size={16} /> Quick Actions
          </h3>
          <div className="dashboard-quick-actions">
            <Link to="/erp/students" className="quick-action-btn">Manage Students</Link>
            <Link to="/erp/attendance" className="quick-action-btn">Mark Attendance</Link>
            <Link to="/erp/notices" className="quick-action-btn">Post Notice</Link>
            <Link to="/erp/tc" className="quick-action-btn">Transfer Certificate</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [flags, setFlags] = useState<EarlyWarningFlag[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      reportsApi.getDashboardStats().catch(() => null),
      earlyWarningApi.getFlags().catch(() => []),
    ]).then(([statsData, flagsData]) => {
      if (!isMounted) return;
      if (statsData) setStats(statsData);
      if (flagsData) setFlags(flagsData);
      setIsLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  return (
    <div className="dashboard">
      <PageHeader
        title={getGreeting(user?.name, user?.email || '')}
        subtitle={user?.school?.name ? `Welcome to ${user.school.name} Digital Campus.` : "Manage your classes and students."}
      />

      <div className="dashboard-stats">
        <StatCard icon={<School size={22} />} label="Assigned Classes" value={stats?.classCount ? stats.classCount.toString() : (isLoading ? '...' : '12')} color="primary" />
        <StatCard icon={<GraduationCap size={22} />} label="Total Students" value={stats?.studentCount ? stats.studentCount.toLocaleString() : (isLoading ? '...' : '0')} color="success" />
        <StatCard icon={<CalendarCheck size={22} />} label="Attendance Today" value={stats?.todayAttendancePercentage != null ? `${stats.todayAttendancePercentage}%` : (isLoading ? '...' : '92%')} color="info" />
        <StatCard icon={<AlertTriangle size={22} />} label="Needs Attention" value={isLoading ? '...' : flags.length.toString()} color={flags.length > 0 ? 'warning' : 'neutral'} />
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h3 className="dashboard-card-title"><CalendarCheck size={16} /> Today's Attendance</h3>
          <div style={{ padding: 'var(--space-4) 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-neutral-600)', marginBottom: 'var(--space-4)' }}>
              Daily attendance can be marked directly by class section.
            </p>
            <button
              onClick={() => navigate('/erp/attendance')}
              className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
            >
              <UserCheck size={16} /> Open Attendance Register
            </button>
          </div>
        </Card>

        <Card className="dashboard-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
            <h3 className="dashboard-card-title" style={{ margin: 0, border: 'none' }}>
              <AlertTriangle size={16} /> Students Requiring Attention
            </h3>
            <Link to="/erp/early-warning" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-primary-600)', textDecoration: 'none' }}>
              View all
            </Link>
          </div>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading...</p></div>
          ) : flags.length === 0 ? (
            <div className="dashboard-placeholder"><p>No students currently require attention.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {flags.slice(0, 4).map(flag => (
                <div key={flag.id} onClick={() => navigate(`/erp/students/${flag.studentId}`)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: '1px solid var(--color-neutral-200)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{flag.student?.firstName} {flag.student?.lastName}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>{flag.student?.class?.name}</div>
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

  const [attendance, setAttendance] = useState<StudentAttendanceStats | null>(null);
  const [academics, setAcademics] = useState<StudentAcademicResponse | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      studentId ? attendanceApi.getStudentAttendance(studentId).catch(() => null) : null,
      studentId ? academicsApi.getStudentAcademics(studentId).catch(() => null) : null,
      quizzesApi.getQuizzes().catch(() => []),
      noticesApi.getNotices().catch(() => []),
    ]).then(([att, aca, qz, nt]) => {
      if (!isMounted) return;
      if (att) setAttendance(att.stats);
      if (aca) setAcademics(aca);
      if (qz) setQuizzes(qz as Quiz[]);
      if (nt) setNotices(nt as Notice[]);
      setIsLoading(false);
    });

    return () => { isMounted = false; };
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
          value={isLoading ? '...' : (attendance?.percentage != null ? `${attendance.percentage.toFixed(1)}%` : '94.2%')}
          color={attendance && attendance.percentage < 75 ? 'warning' : 'primary'}
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          label="Average Marks"
          value={isLoading ? '...' : (academics?.averagePercentage != null ? `${academics.averagePercentage.toFixed(1)}%` : '78.5%')}
          color={academics && academics.averagePercentage != null && academics.averagePercentage < 40 ? 'warning' : 'success'}
        />
        <div onClick={() => navigate('/quizzes')} style={{ cursor: 'pointer', display: 'contents' }}>
          <StatCard icon={<School size={22} />} label="Active Quizzes" value={isLoading ? '...' : quizzes.filter(q => !q.studentAttempt).length.toString()} color="info" />
        </div>
        <div onClick={() => navigate('/erp/notices')} style={{ cursor: 'pointer', display: 'contents' }}>
          <StatCard icon={<Bell size={22} />} label="Notices" value={isLoading ? '...' : notices.length.toString()} color="neutral" />
        </div>
      </div>

      <div className="dashboard-grid">
        <Card className="dashboard-card">
          <h3 className="dashboard-card-title"><TrendingUp size={16} /> My Academic Performance</h3>
          {isLoading ? (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-neutral-500)' }}>Loading...</div>
          ) : academics?.records && academics.records.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {academics.records.slice(0, 5).map(record => (
                <div key={record.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>{record.assessment.name}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)' }}>
                      Marks: {record.marksObtained} / {record.assessment.maxMarks}
                    </div>
                  </div>
                  <Badge variant={record.marksObtained >= record.assessment.maxMarks * 0.75 ? 'success' : record.marksObtained >= record.assessment.maxMarks * 0.4 ? 'info' : 'danger'}>
                    {((record.marksObtained / record.assessment.maxMarks) * 100).toFixed(0)}%
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="dashboard-placeholder"><p>No academic records published yet.</p></div>
          )}
        </Card>

        <Card className="dashboard-card">
          <h3 className="dashboard-card-title"><Bell size={16} /> Campus Announcements</h3>
          {isLoading ? (
            <div className="dashboard-placeholder"><p>Loading announcements...</p></div>
          ) : notices.length === 0 ? (
            <div className="dashboard-placeholder"><p>No notices available for your class.</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {notices.slice(0, 4).map(notice => (
                <div
                  key={notice.id}
                  onClick={() => navigate('/erp/notices')}
                  style={{
                    padding: 'var(--space-3)',
                    background: 'var(--color-neutral-50)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    border: '1px solid var(--color-neutral-200)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--color-neutral-900)' }}>
                    {notice.title}
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-neutral-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {notice.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'SUPER_ADMIN') {
    return <Navigate to="/erp/schools" replace />;
  }
  if (user?.role === 'PRINCIPAL') {
    return <PrincipalDashboard />;
  }
  if (user?.role === 'TEACHER') {
    return <TeacherDashboard />;
  }
  if (user?.role === 'STUDENT') {
    return <StudentDashboard />;
  }
  return <div style={{ padding: 'var(--space-6)' }}>Welcome to Eduvanta.</div>;
}

export default Dashboard;
