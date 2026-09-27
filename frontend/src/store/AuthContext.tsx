import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api } from '@/lib/api';

export type Role = 'SUPER_ADMIN' | 'PRINCIPAL' | 'TEACHER' | 'STUDENT';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  schoolId: string | null;
  school?: { id: string; name: string; logoUrl: string | null; slug?: string | null } | null;
  student?: { id: string } | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // On mount, try to restore session via /auth/me (uses refresh cookie)
  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get<{ success: boolean; data: AuthUser }>('/auth/me')
        .then(({ data }) => {
          setState({
            user: data.data,
            accessToken: token,
            isAuthenticated: true,
            isLoading: false,
          });
        })
        .catch(() => {
          sessionStorage.removeItem('accessToken');
          setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
        });
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post<{
      success: boolean;
      data: { accessToken: string; user: AuthUser };
    }>('/auth/login', { email, password });

    const { accessToken, user } = data.data;
    sessionStorage.setItem('accessToken', accessToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

    setState({
      user,
      accessToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('accessToken');
      delete api.defaults.headers.common['Authorization'];
      setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const setAccessToken = useCallback((token: string) => {
    sessionStorage.setItem('accessToken', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setState((s) => ({ ...s, accessToken: token }));
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
