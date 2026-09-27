import { useEffect, useState } from 'react';
import { School, Users, Building2, TrendingUp } from 'lucide-react';
import { schoolsApi } from '../api/schools';
import { usersApi } from '../api/users';
import './SuperAdminDashboard.css';

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({ schools: 0, users: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [schoolsRes, usersRes] = await Promise.all([
          schoolsApi.getAll({ limit: 1 }),
          usersApi.getAll({ limit: 1 }),
        ]);
        setStats({
          schools: schoolsRes.meta.total,
          users: usersRes.meta.total,
        });
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="sa-dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">EduVanta</h1>
          <p className="page-subtitle">Platform Administration</p>
        </div>
      </div>

      <div className="sa-stats-grid">
        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper bg-primary-100 text-primary-600">
            <School size={24} />
          </div>
          <div className="sa-stat-info">
            <h3 className="sa-stat-label">Total Schools</h3>
            <p className="sa-stat-value">
              {isLoading ? '...' : stats.schools}
            </p>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper bg-success-100 text-success-600">
            <Users size={24} />
          </div>
          <div className="sa-stat-info">
            <h3 className="sa-stat-label">Total Users</h3>
            <p className="sa-stat-value">
              {isLoading ? '...' : stats.users}
            </p>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper bg-warning-100 text-warning-600">
            <Building2 size={24} />
          </div>
          <div className="sa-stat-info">
            <h3 className="sa-stat-label">Active ZP Districts</h3>
            <p className="sa-stat-value">1</p>
          </div>
        </div>

        <div className="sa-stat-card">
          <div className="sa-stat-icon-wrapper bg-danger-100 text-danger-600">
            <TrendingUp size={24} />
          </div>
          <div className="sa-stat-info">
            <h3 className="sa-stat-label">Platform Uptime</h3>
            <p className="sa-stat-value">99.9%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
