import axios from 'axios';
import { tokenValido, logout } from '../utils/auth';

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

// Se a API responder 401/403 por causa de token expirado/ausente,
// desloga e manda para o login. Um 403 legítimo (autorização) com token
// ainda válido é repassado para a tela tratar.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !tokenValido()) {
      logout();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);