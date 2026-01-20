import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Resume API
export const resumeAPI = {
  create: (data) => api.post('/resumes', data),
  getAll: () => api.get('/resumes'),
  getOne: (id) => api.get(`/resumes/${id}`),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  delete: (id) => api.delete(`/resumes/${id}`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  getATSScore: (id) => api.get(`/resumes/${id}/ats-score`),
  exportPDF: (id) => api.get(`/resumes/${id}/export/pdf`, { responseType: 'blob' }),
};

// Template API
export const templateAPI = {
  getAll: () => api.get('/templates'),
};

export default api;
