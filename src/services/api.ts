import axios from 'axios';

export const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sgv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});