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
      console.log("Enviando token:", token);
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Erro ao configurar requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Erro na resposta:", error.response?.status, error.response?.data);
    
    // Se receber um erro 401 ou 422 (não autorizado), redireciona para login
    if (error.response && (error.response.status === 401 || error.response.status === 422)) {
      console.log("Token inválido ou expirado, redirecionando para login");
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

// Serviços de transações
export const transactionService = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  getTransactions: async (filters = {}) => {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  },
  
  createTransaction: async (transactionData: any) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },
  
  updateTransaction: async (id: number, transactionData: any) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },
  
  deleteTransaction: async (id: number) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
  
  getSummary: async (period: string = 'all') => {
    const response = await api.get('/summary', { params: { period } });
    return response.data;
  }
};

// Adicionar ao arquivo frontend/src/services/api.ts:

// Serviços relacionados a XP, desafios e conquistas
export const userService = {
  getUserXP: async () => {
    const response = await api.get('/user/xp');
    return response.data;
  },
  
  grantDailyXP: async () => {
    const response = await api.post('/user/daily-xp');
    return response.data;
  },
  
  getAchievements: async () => {
    const response = await api.get('/user/achievements');
    return response.data;
  },
  
  getChallenges: async () => {
    const response = await api.get('/challenges');
    return response.data;
  },

  recalculateLevel: async () => {
  const response = await api.post('/user/recalculate-level');
  return response.data;
  },
  
  getRankings: async () => {
    const response = await api.get('/rankings');
    return response.data;
  }
};



export default api;