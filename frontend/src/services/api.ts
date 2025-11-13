import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (student_id: string, password: string) =>
    api.post('/auth/login', { student_id, password }),
  register: (name: string, student_id: string, password: string) =>
    api.post('/auth/register', { name, student_id, password }),
};

// User API
export const userAPI = {
  create: (data: any) => api.post('/users', data),
  importCSV: (csvData: string) => api.post('/users/import', { csvData }),
  getAll: () => api.get('/users'),
  getById: (id: number) => api.get(`/users/${id}`),
  approve: (id: number) => api.put(`/users/${id}/approve`),
  update: (id: number, data: any) => api.put(`/users/${id}`, data),
  delete: (id: number) => api.delete(`/users/${id}`),
};

// Practice API
export const practiceAPI = {
  create: (data: any) => api.post('/practices', data),
  importFromText: (textData: string) => api.post('/practices/import', { textData }),
  getAll: (params?: any) => api.get('/practices', { params }),
  getById: (id: number) => api.get(`/practices/${id}`),
  update: (id: number, data: any) => api.put(`/practices/${id}`, data),
  delete: (id: number) => api.delete(`/practices/${id}`),
};

// Participation API
export const participationAPI = {
  create: (data: any) => api.post('/participations', data),
  getByPractice: (practiceId: number) =>
    api.get(`/participations/practice/${practiceId}`),
  getMy: () => api.get('/participations/my'),
  getStats: (practiceId: number) =>
    api.get(`/participations/stats/${practiceId}`),
  delete: (id: number) => api.delete(`/participations/${id}`),
};

// Ball Bag API
export const ballBagAPI = {
  create: (data: any) => api.post('/ball-bags', data),
  getAll: () => api.get('/ball-bags'),
  recordTakeaway: (data: any) => api.post('/ball-bags/takeaway', data),
  autoAssign: (practice_id: number) => api.post('/ball-bags/auto-assign', { practice_id }),
  getHistory: (ballBagId: number) =>
    api.get(`/ball-bags/${ballBagId}/history`),
  getHolders: (practiceId: number) =>
    api.get(`/ball-bags/holders/${practiceId}`),
  getStats: (year?: number) => api.get('/ball-bags/stats', { params: { year } }),
};

// Court Fee API
export const courtFeeAPI = {
  record: (data: any) => api.post('/court-fees', data),
  getByPractice: (practiceId: number) =>
    api.get(`/court-fees/practice/${practiceId}`),
  getUserStats: (userId: number, year?: number) =>
    api.get(`/court-fees/user/${userId}`, { params: { year } }),
  getAllStats: (year?: number) =>
    api.get('/court-fees/stats', { params: { year } }),
};

// Settings API
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  getByKey: (key: string) => api.get(`/settings/${key}`),
  update: (key: string, value: string) =>
    api.put(`/settings/${key}`, { value }),
};
