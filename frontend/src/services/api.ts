import axios from 'axios';

const AUTH_API_URL = 'http://localhost:3001';
const USER_API_URL = 'http://localhost:3000';
const DASHBOARD_API_URL = 'http://localhost:3003';
const IMPORT_API_URL = 'http://localhost:3002';

export const authApi = axios.create({
  baseURL: AUTH_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const dashboardApi = axios.create({
  baseURL: DASHBOARD_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const userApi = axios.create({
  baseURL: USER_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const importApi = axios.create({
  baseURL: IMPORT_API_URL,
});

dashboardApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('optiflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

importApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('optiflow_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
