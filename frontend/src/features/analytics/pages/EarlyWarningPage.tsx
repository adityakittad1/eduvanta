import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingDown, RefreshCw, ChevronRight, UserX } from 'lucide-react';
import { Button, Badge, TableSkeleton, useToast } from '@/components/ui';
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
    } catch {
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
          icon: <UserX size={14} />,
          title: 'Low Attendance',
          description: `Attendance is at ${flag.details?.actual || 0}%, below minimum ${flag.details?.threshold || 75}% threshold.`,
          color: 'danger' as const
        };
      case 'LOW_ACADEMIC_PERFORMANCE':
        return {
          icon: <TrendingDown size={14} />,
          title: 'Low Academic Performance',
          description: `Score average is at ${flag.details?.actual || 0}%, below minimum ${flag.details?.threshold || 40}% threshold.`,
          color: 'warning' as const
        };
      default:
        return {
          icon: <AlertTriangle size={14} />,
          title: flag.flagType.replace(/_/g, ' '),
          description: (flag.details as any)?.reason || 'Requires academic or attendance intervention.',
          color: 'neutral' as const
        };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
            Early Warning System
          </h1>
          <p style={{ color: 'var(--color-neutral-500)', fontSize: 'var(--text-sm)', marginTop: 2 }}>
            Automated monitoring identifies at-risk students requiring academic or attendance intervention ({flags.length} active alerts)
          </p>
        </div>
        <Button onClick={handleRunEvaluation} disabled={isEvaluating} variant="primary">
          <RefreshCw size={15} className={isEvaluating ? 'spin' : ''} />
          {isEvaluating ? 'Evaluating...' : 'Run Analysis'}
        </Button>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div style={{ padding: 'var(--space-4)' }}>
            <TableSkeleton rows={5} cols={4} />
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th className="table-th">Student</th>
                <th className="table-th">Class</th>
                <th className="table-th">Alert Category</th>
                <th className="table-th">Intervention Diagnostic</th>
                <th className="table-th text-right" style={{ width: 60 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {flags.length === 0 ? (
                <tr>
                  <td colSpan={5} className="table-empty">
                    <AlertTriangle size={36} style={{ margin: '0 auto var(--space-3)', color: 'var(--color-neutral-300)' }} />
                    <p style={{ fontWeight: 500 }}>No students currently flagged by the Early Warning System.</p>
                  </td>
                </tr>
              ) : (
                flags.map(flag => {
                  const info = getFlagDetails(flag);
                  const student = flag.student;
                  return (
                    <tr 
                      key={flag.id} 
                      className="table-tr table-tr-clickable"
                      onClick={() => student && navigate(`/erp/students/${student.id}`)}
                    >
                      <td className="table-td">
                        <div style={{ fontWeight: 600, color: 'var(--color-neutral-900)' }}>
                          {student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-family-mono)', color: 'var(--color-neutral-400)' }}>
                          {student?.admissionNumber || '-'}
                        </div>
                      </td>
                      <td className="table-td" style={{ color: 'var(--color-neutral-700)', fontSize: 'var(--text-xs)' }}>
                        {student?.class ? `${student.class.name} ${student.class.division || ''}` : 'Unassigned'}
                      </td>
                      <td className="table-td">
                        <Badge variant={info.color}>
                          {info.icon}
                          {info.title}
                        </Badge>
                      </td>
                      <td className="table-td" style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--text-xs)' }}>
                        {info.description}
                      </td>
                      <td className="table-td text-right">
                        <Button variant="ghost" size="sm">
                          <ChevronRight size={15} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default EarlyWarningPage;
