import { useState, useEffect } from 'react';
import { BarChart3, Users, BookOpen, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui';
import { reportsApi, DashboardStats } from '../api/reports';

export function ReportsPage() {
  const toast = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await reportsApi.getDashboardStats();
        setStats(data);
      } catch (error) {
        toast.error('Failed to load reports data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [toast]);

  if (isLoading || !stats) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-md)' }}>
          <BarChart3 size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>
            School Reports & Analytics
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: '4px' }}>
            Overview of school performance and metrics.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <div style={{ background: 'var(--color-neutral-0)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
           <div style={{ padding: 'var(--space-3)', background: 'var(--color-primary-50)', color: 'var(--color-primary-600)', borderRadius: 'var(--radius-full)' }}>
             <Users size={24} />
           </div>
           <div>
             <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>Total Students</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{stats.studentCount}</div>
           </div>
        </div>

        <div style={{ background: 'var(--color-neutral-0)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
           <div style={{ padding: 'var(--space-3)', background: 'var(--color-success-50)', color: 'var(--color-success-600)', borderRadius: 'var(--radius-full)' }}>
             <Users size={24} />
           </div>
           <div>
             <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>Total Teachers</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{stats.teacherCount}</div>
           </div>
        </div>

        <div style={{ background: 'var(--color-neutral-0)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
           <div style={{ padding: 'var(--space-3)', background: 'var(--color-info-50)', color: 'var(--color-info-600)', borderRadius: 'var(--radius-full)' }}>
             <BookOpen size={24} />
           </div>
           <div>
             <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>Active Classes</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>{stats.classCount}</div>
           </div>
        </div>

        <div style={{ background: 'var(--color-neutral-0)', padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-danger-300)', display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
           <div style={{ padding: 'var(--space-3)', background: 'var(--color-danger-50)', color: 'var(--color-danger-600)', borderRadius: 'var(--radius-full)' }}>
             <AlertTriangle size={24} />
           </div>
           <div>
             <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-danger-600)' }}>Active Warnings</div>
             <div style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-danger-700)' }}>{stats.warningCount}</div>
           </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-neutral-0)', padding: 'var(--space-8)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-neutral-300)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-neutral-500)' }}>More detailed visual reports (charts/graphs) will be available here in the future.</p>
      </div>
    </div>
  );
}
