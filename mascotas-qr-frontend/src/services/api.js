import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_API_URL}/api` : 'http://localhost:3000/api',
});

// Interceptor para adjuntar automáticamente el token en las peticiones
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

// Mantenemos solo el rechazo del error SIN forzar la redirección a /login
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default api;