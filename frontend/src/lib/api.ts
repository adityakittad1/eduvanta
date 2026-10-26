import axios from 'axios';
import { getTenantSlug } from '../utils/tenant';

export const api = (() => {
  // Use VITE_API_URL in production, otherwise default to relative path which Vite proxies
  const basePath = import.meta.env.VITE_API_URL || '/api/v1';
  const tenantSlug = getTenantSlug();
  const instance = axios.create({
    baseURL: basePath,
    withCredentials: true, // Required for refresh token cookie
    headers: {
      ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {})
    },
  });
  return instance;
})();

// Request interceptor — attach token and tenant slug dynamically
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('accessToken');
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const slug = getTenantSlug();
  if (slug) {
    config.headers['X-Tenant-Slug'] = slug;
  }
  return config;
});

// Response interceptor — handle 401 by attempting token refresh
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post<{ success: boolean; data: { accessToken: string } }>(
          '/api/v1/auth/refresh',
          {},
          { withCredentials: true }
        );

        const newToken = data.data.accessToken;
        sessionStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

        // Flush queue
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        // Refresh failed — clear session
        sessionStorage.removeItem('accessToken');
        delete api.defaults.headers.common['Authorization'];
        refreshQueue = [];
        window.location.href = '/erp/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    const customError = new Error(error.response?.data?.message || error.message);
    return Promise.reject(customError);
  }
);

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  
  const { data } = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data.data.url;
}

export default api;
