import { useEffect } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { useLocation } from 'react-router-dom';

export function useDynamicDocumentTitle() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const location = useLocation();

  useEffect(() => {
    // Determine the base identity
    const schoolName = user?.school?.name || tenant?.name || 'EduVanta';

    let title = '';

    // Check if we are on the public website vs ERP
    if (location.pathname.startsWith('/erp')) {
      if (user?.role === 'SUPER_ADMIN') {
        title = `EduVanta | Platform Administration`;
      } else if (user?.role === 'PRINCIPAL') {
        title = `Principal Portal | ${schoolName}`;
      } else if (user?.role === 'TEACHER') {
        title = `Teacher Portal | ${schoolName}`;
      } else if (user?.role === 'STUDENT') {
        title = `Student Portal | ${schoolName}`;
      } else {
        title = `${schoolName} Digital Campus | EduVanta`;
      }
    } else {
      // Public pages
      if (tenant) {
        title = `${tenant.name} | EduVanta`;
      } else {
        title = `EduVanta`;
      }
    }

    document.title = title;
  }, [user, tenant, location.pathname]);
}
