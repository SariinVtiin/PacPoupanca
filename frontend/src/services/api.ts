import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Criar uma instância do axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token nas requisições
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

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Se receber um erro 401 (não autorizado), redireciona para login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/login', { username, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  
  updateProfile: async (userData: any) => {
    const response = await api.put('/profile', userData);
    return response.data;
  },
  
  deleteAccount: async (password: string) => {
    const response = await api.delete('/profile', {
      data: { password }
    });
    return response.data;
  }
};

export default api;