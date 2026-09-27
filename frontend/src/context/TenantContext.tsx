import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { getTenantSlug } from '@/utils/tenant';

export interface PublicTenantInfo {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  address: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  principalName: string | null;
  description: string | null;
  tagline: string | null;
  establishedYear: number | null;
  _count: { students: number; teachers: number; classes: number };
}

interface TenantState {
  tenant: PublicTenantInfo | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantState | null>(null);

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider');
  return ctx;
}

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TenantState>({
    tenant: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const slug = getTenantSlug();
    if (!slug) {
      setState({ tenant: null, isLoading: false, error: 'No tenant found' });
      return;
    }

    // Fetch public school profile for the given slug
    api.get<{ success: boolean; data: PublicTenantInfo }>(`/public/schools/${slug}/profile`)
      .then(({ data }) => {
        setState({ tenant: data.data, isLoading: false, error: null });
      })
      .catch((error) => {
        setState({ 
          tenant: null, 
          isLoading: false, 
          error: error.response?.data?.message || 'Failed to load school information'
        });
      });
  }, []);

  return (
    <TenantContext.Provider value={state}>
      {children}
    </TenantContext.Provider>
  );
}
