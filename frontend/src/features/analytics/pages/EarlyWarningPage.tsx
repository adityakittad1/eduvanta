import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingDown, RefreshCw, ChevronRight, UserX } from 'lucide-react';
import { Button, Badge, useToast } from '@/components/ui';
import { earlyWarningApi, EarlyWarningFlag } from '../api/early-warning';

export function EarlyWarningPage() {
  const navigate = useNavigate();
  const toast = useToast();
  
  const [flags, setFlags] = useState<EarlyWarningFlag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchFlags = async () => {
    try {
      setIsLoading(true);
      const data = await earlyWarningApi.getFlags();
      setFlags(data);
    } catch (error) {
      toast.error('Failed to load early warning flags');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleRunEvaluation = async () => {
    try {
      setIsEvaluating(true);
      const res = await earlyWarningApi.runEvaluation();
      toast.success(res.message);
      await fetchFlags();
    } catch (error: any) {
      toast.error(error.message || 'Failed to run evaluation');
    } finally {
      setIsEvaluating(false);
    }
  };

  const getFlagDetails = (flag: EarlyWarningFlag) => {
    switch (flag.flagType) {
      case 'LOW_ATTENDANCE':
        return {
          icon: <UserX size={16} className="text-danger-500" />,
          title: 'Low Attendance',
          description: `Attendance is at ${flag.details.actual}%, below the minimum ${flag.details.threshold}% threshold.`,
          color: 'danger' as const
        };
      case 'LOW_ACADEMIC_PERFORMANCE':
        return {
          icon: <TrendingDown size={16} className="text-warning-500" />,
          title: 'Low Academic Performance',
          description: `Average marks are at ${flag.details.actual}%, below the minimum ${flag.details.threshold}% threshold.`,
          color: 'warning' as const
        };
      default:
        return {
          icon: <AlertTriangle size={16} className="text-neutral-500" />,
          title: flag.flagType.replace(/_/g, ' '),
          description: 'Requires attention based on recent data.',
          color: 'neutral' as const
        };
    }
  };

  if (isLoading) return <div style={{ padding: 'var(--space-6)' }}>Loading...</div>;

  return (
    <div style={{ padding: 'var(--space-6)', maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'var(--font-bold)', color: 'var(--color-neutral-900)' }}>Early Warning System</h1>
          <p style={{ color: 'var(--color-neutral-500)', marginTop: 'var(--space-1)' }}>Automatically identifies students requiring academic or attendance intervention.</p>
        </div>
        <Button onClick={handleRunEvaluation} disabled={isEvaluating} variant="primary">
          <RefreshCw size={16} className={isEvaluating ? 'spin' : ''} />
          {isEvaluating ? 'Evaluating...' : 'Run Evaluation'}
        </Button>
      </div>

      <div style={{ background: 'var(--color-neutral-0)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-neutral-200)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-neutral-50)', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Student</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Class</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Warning Type</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)' }}>Details</th>
              <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-600)', width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {flags.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                  <AlertTriangle size={32} style={{ margin: '0 auto var(--space-4)', color: 'var(--color-neutral-300)' }} />
                  <p>No students are currently flagged by the Early Warning System.</p>
                </td>
              </tr>
            ) : (
              flags.map(flag => {
                const info = getFlagDetails(flag);
                const student = flag.student!;
                return (
                  <tr key={flag.id} style={{ borderBottom: '1px solid var(--color-neutral-100)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => navigate(`/erp/students/${student.id}`)} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-neutral-50)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div style={{ fontWeight: 'var(--font-medium)', color: 'var(--color-neutral-900)' }}>{student.firstName} {student.lastName}</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-neutral-500)' }}>{student.admissionNumber}</div>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--color-neutral-700)' }}>
                      {student.class ? `${student.class.name} ${student.class.division || ''}` : 'Unassigned'}
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                        <Badge variant={info.color}>
                          {info.icon}
                          {info.title}
                        </Badge>
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-4)', color: 'var(--color-neutral-600)', fontSize: 'var(--text-sm)' }}>
                      {info.description}
                    </td>
                    <td style={{ padding: 'var(--space-4)' }}>
                      <ChevronRight size={16} className="text-neutral-400" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
