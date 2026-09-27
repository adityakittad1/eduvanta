import axios from 'axios';

export const api = (() => {
  // Build base path – API is always under /api/v1, but we may need to include subdomain for future use
  const basePath = '/api/v1';
  // Optionally prepend subdomain as a header or param if backend expects it (currently tenant is resolved from host)
  const instance = axios.create({
    baseURL: basePath,
    withCredentials: true, // Required for refresh token cookie
    headers: {
      // No need to send subdomain in headers; backend resolves via host
    },
  });
  return instance;
})();

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
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
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
