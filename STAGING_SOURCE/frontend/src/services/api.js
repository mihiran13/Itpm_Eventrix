import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add auth token
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        toast.error('Session expired. Please login again.');
        window.location.href = '/login';
      }
    }

    if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action');
    }

    if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    }

    if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.put(`/auth/reset-password/${token}`, data),
  refreshToken: () => api.post('/auth/refresh-token')
};

// Events API
export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.events || [],
      pagination: res.data.pagination || {
        page: res.data.currentPage || 1,
        pages: res.data.totalPages || 1,
        total: res.data.total || res.data.count || 0
      }
    }
  })),
  getFeatured: () => api.get('/events/featured').then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.events || []
    }
  })),
  getById: (id) => api.get(`/events/${id}`).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.event || null
    }
  })),
  create: (data) => api.post('/events', data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.event || null
    }
  })),
  update: (id, data) => api.put(`/events/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.event || null
    }
  })),
  delete: (id) => api.delete(`/events/${id}`),
  cancel: (id, reason) => api.patch(`/events/${id}/cancel`, { reason }),
  getMyEvents: (params) => api.get('/events/user/my-events', { params }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.events || []
    }
  })),
  getSaved: () => api.get('/events/user/saved').then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.events || []
    }
  })),
  toggleSave: (id) => api.patch(`/events/${id}/save`).then((res) => ({
    ...res,
    data: {
      ...res.data,
      saved: res.data.saved !== undefined ? res.data.saved : res.data.isSaved
    }
  })),
  getFeed: (params) => api.get('/events/feed', { params }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.events || [],
      pagination: {
        page: res.data.currentPage || 1,
        pages: res.data.totalPages || 1,
        total: res.data.total || 0
      }
    }
  })),
  exportCalendar: (id) => {
    window.open(`${API_BASE_URL}/events/${id}/calendar`, '_blank');
  },
  deleteEvent: (id) => api.delete(`/events/${id}`)
};

// Registrations API
export const registrationsAPI = {
  register: (eventId, data) => api.post(`/registrations/${eventId}`, data),
  cancel: (id, reason) => api.patch(`/registrations/${id}/cancel`, { reason }),
  getMyRegistrations: (params) => api.get('/registrations/my-registrations', { params }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.registrations || []
    }
  })),
  getMine: (params) => api.get('/registrations/my-registrations', { params }).then((res) => ({
    ...res,
    data: {
      ...res.data,
      data: res.data.data || res.data.registrations || []
    }
  })),
  getEventRegistrations: (eventId, params) => api.get(`/registrations/event/${eventId}`, { params }),
  checkIn: (id) => api.patch(`/registrations/${id}/check-in`),
  confirm: (id) => api.patch(`/registrations/${id}/confirm`),
  issueCertificate: (id) => api.patch(`/registrations/${id}/issue-certificate`),
  submitFeedback: (id, data) => api.post(`/registrations/${id}/feedback`, data),
  getETicket: (id) => api.get(`/registrations/${id}/e-ticket`),
  simulatePayment: (id, data) => api.post(`/registrations/${id}/payment`, data),
  getEventFeedback: (eventId) => api.get(`/registrations/event/${eventId}/feedback`)
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  changePassword: (data) => api.put('/users/change-password', data),
  getPublicProfile: (id) => api.get(`/users/${id}`),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
  getAll: (params) => api.get('/users', { params }),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  createOrganizer: (data) => api.post('/users/organizers', data),
  deleteOrganizer: (id) => api.delete(`/users/${id}/organizer`)
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/categories', { params }),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

// Dashboard API
export const dashboardAPI = {
  getUser: () => api.get('/dashboard/user'),
  getOrganizer: () => api.get('/dashboard/organizer'),
  getAdmin: () => api.get('/dashboard/admin')
};

// Interactions API
export const interactionsAPI = {
  getEventInteractions: (eventId) => api.get(`/interactions/${eventId}`),
  toggleLike: (eventId) => api.post(`/interactions/${eventId}/like`),
  toggleInterested: (eventId) => api.post(`/interactions/${eventId}/interested`),
  toggleGoing: (eventId) => api.post(`/interactions/${eventId}/going`),
  addReaction: (eventId, reaction) => api.post(`/interactions/${eventId}/reaction`, { reaction }),
  removeReaction: (eventId) => api.delete(`/interactions/${eventId}/reaction`)
};

// Sessions API
export const sessionsAPI = {
  getSessions: (eventId) => api.get(`/sessions/${eventId}`),
  getSession: (id) => api.get(`/sessions/detail/${id}`),
  createSession: (eventId, data) => api.post(`/sessions/${eventId}`, data),
  updateSession: (id, data) => api.put(`/sessions/detail/${id}`, data),
  deleteSession: (id) => api.delete(`/sessions/detail/${id}`),
  addToSchedule: (id) => api.post(`/sessions/detail/${id}/schedule`),
  removeFromSchedule: (id) => api.delete(`/sessions/detail/${id}/schedule`),
  getMySchedule: () => api.get('/sessions/my-schedule')
};

// Surveys API
export const surveysAPI = {
  getSurveys: (eventId) => api.get(`/surveys/${eventId}`),
  getSurvey: (id) => api.get(`/surveys/detail/${id}`),
  createSurvey: (eventId, data) => api.post(`/surveys/${eventId}`, data),
  submitResponse: (id, data) => api.post(`/surveys/detail/${id}/respond`, data),
  getResults: (id) => api.get(`/surveys/detail/${id}/results`),
  deleteSurvey: (id) => api.delete(`/surveys/detail/${id}`)
};

// Announcements API
export const announcementsAPI = {
  getAnnouncements: (eventId) => api.get(`/announcements/${eventId}`),
  createAnnouncement: (eventId, data) => api.post(`/announcements/${eventId}`, data),
  deleteAnnouncement: (id) => api.delete(`/announcements/detail/${id}`)
};

export default api;
