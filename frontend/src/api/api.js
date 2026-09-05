import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8080/api' : '/api');

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Users ---
export const createUser = (data) => api.post('/users', data);
export const getUser = (id) => api.get(`/users/${id}`);

// --- Dashboard ---
export const getDashboard = (userId, date) =>
  api.get('/dashboard', { params: { userId, date } });

// --- Routines ---
export const createRoutine = (data) => api.post('/routines', data);
export const getRoutines = (userId, date) =>
  api.get('/routines', { params: { userId, date } });
export const toggleRoutine = (id, date) =>
  api.post(`/routines/${id}/toggle`, null, { params: { date } });
export const deleteRoutine = (id) => api.delete(`/routines/${id}`);

// --- Ad-hoc Tasks ---
export const createAdhocTask = (data) => api.post('/tasks/adhoc', data);
export const getAdhocTasks = (userId, date) =>
  api.get('/tasks/adhoc', { params: { userId, date } });
export const getAdhocTasksInRange = (userId, from, to) =>
  api.get('/tasks/adhoc/range', { params: { userId, from, to } });
export const toggleAdhocTask = (id) => api.put(`/tasks/adhoc/${id}/toggle`);
export const deleteAdhocTask = (id) => api.delete(`/tasks/adhoc/${id}`);

// --- Calendar ---
export const getMonthCalendar = (userId, year, month) =>
  api.get('/calendar', { params: { userId, year, month } });

export default api;
