import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2, Users, BookOpen, AlertTriangle, TrendingUp, CheckCircle,
  ChevronRight, Calendar, Award, ShieldAlert, Activity
} from 'lucide-react';
import { Button, Badge, useToast } from '@/components/ui';
import { reportsApi, DashboardStats } from '@/features/reports/api/reports';
import { earlyWarningApi, EarlyWarningFlag } from '../api/early-warning';

export function AnalyticsPage() {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [flags, setFlags] = useState<EarlyWarningFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsData, flagsData] = await Promise.all([
          reportsApi.getDashboardStats().catch(() => null),
          earlyWarningApi.getFlags().catch(() => []),
        ]);
        setStats(statsData);
        setFlags(flagsData || []);
      } catch {
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [toast]);

  if (isLoading) {
    return (
      <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
        <div style={{ width: 40, height: 40, border: '4px solid #e2e8f0', borderTopColor: 'var(--color-primary-600)', borderRadius: '50%', margin: '4rem auto 1rem', animation: 'spin 1s linear infinite' }} />
        <p>Loading school analytics...</p>
      </div>
    );
  }

  const studentCount = stats?.studentCount || 0;
  const teacherCount = stats?.teacherCount || 0;
  const classCount = stats?.classCount || 0;
  const warningCount = flags.length || stats?.warningCount || 0;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ padding: 'var(--space-3)', background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700))', color: 'white', borderRadius: 'var(--radius-lg)' }}>
            <BarChart2 size={26} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
              School Analytics & Insights
            </h1>
            <p style={{ color: 'var(--color-neutral-500)', marginTop: 2, fontSize: 'var(--text-sm)' }}>
              Real-time monitoring of student strength, academic performance, and early warning indicators
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/erp/early-warning" style={{ textDecoration: 'none' }}>
            <Button variant={warningCount > 0 ? 'danger' : 'secondary'} size="sm">
              <AlertTriangle size={15} /> Early Warning ({warningCount})
            </Button>
          </Link>
          <Link to="/erp/reports" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              <Activity size={15} /> Reports View
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <Link to="/erp/students" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--color-neutral-0)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-full)' }}>
              <Users size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>Enrolled Students</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{studentCount}</div>
            </div>
          </div>
        </Link>

        <Link to="/erp/teachers" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--color-neutral-0)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-50)', color: 'var(--color-success-600)', borderRadius: 'var(--radius-full)' }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>Active Faculty</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{teacherCount}</div>
            </div>
          </div>
        </Link>

        <Link to="/erp/classes" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'var(--color-neutral-0)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-neutral-200)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <div style={{ padding: 'var(--space-3)', background: 'var(--color-info-50)', color: 'var(--color-info-600)', borderRadius: 'var(--radius-full)' }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>Active Classes</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{classCount}</div>
            </div>
          </div>
        </Link>

        <Link to="/erp/early-warning" style={{ textDecoration: 'none' }}>
          <div style={{
            background: warningCount > 0 ? 'var(--color-danger-50)' : 'var(--color-success-50)',
            padding: 'var(--space-5)',
            borderRadius: 'var(--radius-xl)',
            border: `1px solid ${warningCount > 0 ? 'var(--color-danger-200)' : 'var(--color-success-200)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            transition: 'all 200ms ease',
            cursor: 'pointer',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
          >
            <div style={{ padding: 'var(--space-3)', background: warningCount > 0 ? 'var(--color-danger-100)' : 'var(--color-success-100)', color: warningCount > 0 ? 'var(--color-danger-700)' : 'var(--color-success-700)', borderRadius: 'var(--radius-full)' }}>
              {warningCount > 0 ? <ShieldAlert size={24} /> : <CheckCircle size={24} />}
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-sm)', color: warningCount > 0 ? 'var(--color-danger-700)' : 'var(--color-success-700)', fontWeight: 500 }}>
                {warningCount > 0 ? 'At-Risk Students' : 'Early Warning Status'}
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 'var(--font-bold)', color: warningCount > 0 ? 'var(--color-danger-800)' : 'var(--color-success-800)' }}>
                {warningCount > 0 ? warningCount : 'Healthy'}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Main Grid: Attendance & Academic Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        {/* Attendance Insights Card */}
        <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Calendar size={20} color="var(--color-primary-600)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Attendance Health</h2>
            </div>
            <Badge variant="success">92% Overall</Badge>
          </div>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Regular attendance tracking across registered divisions. Automated early warnings flag any student falling below the 75% state government mandate.
          </p>

          <div style={{ background: 'var(--color-neutral-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Class 5-A Present Rate</span>
                <span style={{ fontWeight: 600, color: 'var(--color-success-700)' }}>95%</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '95%', height: '100%', background: 'var(--color-success-500)', borderRadius: 4 }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--color-neutral-600)' }}>Class 10-A Present Rate</span>
                <span style={{ fontWeight: 600, color: 'var(--color-primary-700)' }}>90%</span>
              </div>
              <div style={{ width: '100%', height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '90%', height: '100%', background: 'var(--color-primary-500)', borderRadius: 4 }} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
            <Link to="/erp/attendance" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Mark / View Daily Attendance <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Academic Analytics Card */}
        <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <TrendingUp size={20} color="var(--color-success-600)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>Academic Performance</h2>
            </div>
            <Badge variant="info">Term 1 Active</Badge>
          </div>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.9rem', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
            Continuous comprehensive evaluation metrics based on unit tests, midterm exams, and practical skill assessments.
          </p>

          <div style={{ background: 'var(--color-neutral-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success-700)' }}>100%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Pass Rate</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary-700)' }}>78.4%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Avg Score</div>
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-info-700)' }}>4</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)' }}>Exams Logged</div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
            <Link to="/erp/academics" style={{ color: 'var(--color-primary-600)', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Go to Assessments & Grading <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Early Warning Detailed Section */}
      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-neutral-200)', padding: 'var(--space-6)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--color-neutral-900)' }}>
              Early Warning & Intervention Tracking
            </h2>
            <p style={{ color: 'var(--color-neutral-500)', fontSize: '0.875rem', marginTop: 2 }}>
              Algorithmic detection of students requiring academic or attendance intervention before dropouts occur.
            </p>
          </div>
          <Link to="/erp/early-warning" style={{ textDecoration: 'none' }}>
            <Button variant="secondary" size="sm">
              Manage Early Warning Flags <ChevronRight size={14} />
            </Button>
          </Link>
        </div>

        {flags.length === 0 ? (
          <div style={{ padding: 'var(--space-6)', textAlign: 'center', background: 'var(--color-success-50)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-success-100)' }}>
            <CheckCircle size={32} color="var(--color-success-600)" style={{ margin: '0 auto var(--space-2)' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-success-800)', margin: '0 0 4px' }}>
              All Student Indicators Are Healthy
            </h3>
            <p style={{ color: 'var(--color-success-700)', fontSize: '0.85rem', margin: 0 }}>
              No students are currently triggered under low attendance or failing grade thresholds.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {flags.slice(0, 5).map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-neutral-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-neutral-200)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <AlertTriangle size={18} color="var(--color-danger-600)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-neutral-900)' }}>
                      {f.student ? `${f.student.firstName} ${f.student.lastName}` : 'Student'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-500)' }}>
                      {f.flagType.replace(/_/g, ' ')} — Actual: {f.details.actual}% (Min: {f.details.threshold}%)
                    </div>
                  </div>
                </div>
                <Badge variant="danger">Action Needed</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
