import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import type { Role } from '@/store/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="route-loading">
        <div className="route-loading-spinner" aria-label="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/erp/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/erp/unauthorized" replace />;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="route-loading">
        <div className="route-loading-spinner" aria-label="Loading..." />
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  if (isAuthenticated && user) {
    if (user.role === 'SUPER_ADMIN') {
      import('@/utils/tenant').then(({ isPlatformHost, getPlatformUrl }) => {
        if (!isPlatformHost()) {
          window.location.href = `${getPlatformUrl()}/erp/super-admin/dashboard`;
        }
      });
    }
    
    const dashboardPath = getDashboardPath(user.role);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
}

function getDashboardPath(role: Role): string {
  switch (role) {
    case 'SUPER_ADMIN': return '/erp/super-admin/dashboard';
    case 'PRINCIPAL':   return '/erp/dashboard';
    case 'TEACHER':     return '/erp/dashboard';
    case 'STUDENT':     return '/erp/dashboard';
    default:            return '/erp/dashboard';
  }
}
