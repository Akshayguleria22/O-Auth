import api from './axios';

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
  initiateOAuth: (provider, redirectPath) => 
    api.get(`/auth/oauth/${provider}`, { params: { redirectPath } }),
  linkProvider: (provider) => api.post(`/auth/link/${provider}`),
  unlinkProvider: (provider) => api.delete(`/auth/unlink/${provider}`),
};

// User endpoints
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getLinkedProviders: () => api.get('/users/providers'),
  getAuthLogs: (params) => api.get('/users/auth-logs', { params }),
  deleteAccount: () => api.delete('/users/account'),
  getAllUsers: (params) => api.get('/users/all', { params }),
  updateUserRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
};
