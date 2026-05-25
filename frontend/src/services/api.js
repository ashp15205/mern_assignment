import axios from 'axios';
import { API_BASE } from '../utils/constants';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Network error — please check the API server';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  health: () => client.get('/health'),
  getTasks: (params) => client.get('/tasks', { params }),
  createTask: (payload) => client.post('/tasks', payload),
  deleteTask: (id) => client.delete(`/tasks/${id}`),
  updateTask: (id, payload) => client.patch(`/tasks/${id}`, payload),
  generateSchedule: () => client.post('/tasks/schedule'),
};

export default client;
