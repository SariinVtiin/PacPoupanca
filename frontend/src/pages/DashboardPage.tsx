import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, transactionService } from '../services/api';
import '../assets/css/dashboard.css';
import axios from 'axios';

import { 
  MenuIcon, DashboardIcon, TransactionIcon, TrophyIcon,
  UserIcon, SettingsIcon, LogoutIcon, SunIcon, MoonIcon
} from '../components/icons';

// Definir a interface para o resumo financeiro
interface FinancialSummary {
  period: string;
  income: number;
  expenses: number;
  balance: number;
  income_by_category: Record<string, number>;
  expense_by_category: Record<string, number>;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  birth_date: string;
  created_at: string;
  last_login: string | null;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  // Adicionar o estado para o resumo financeiro
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  useEffect(() => {
    // Buscar dados do perfil do usuário e resumo financeiro
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Buscar perfil
        const profileData = await authService.getProfile();
        setUserProfile(profileData);
        
        // Buscar resumo financeiro (mensal)
        const summaryData = await transactionService.getSummary('month');
        setFinancialSummary(summaryData);

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar informações do usuário');
        setLoading(false);
        
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    // Verificar preferência de tema no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkTheme(savedTheme === 'dark');
    }

    // Verificar estado do menu no localStorage
    const savedMenuState = localStorage.getItem('menuCollapsed');
    if (savedMenuState) {
      setMenuCollapsed(savedMenuState === 'true');
    }

    fetchData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  const toggleMenu = () => {
    const newState = !menuCollapsed;
    setMenuCollapsed(newState);
    localStorage.setItem('menuCollapsed', newState.toString());
  };

  const toggleTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Carregando seu dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${darkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Fantasmas animados de fundo */}
      <div className="ghost-background">
        <div className="ghost"></div>
        <div className="ghost"></div>
        <div className="ghost"></div>
        <div className="ghost"></div>
      </div>
      
      {/* Cabeçalho do dashboard */}
      <header className="dashboard-header">
        <div className="menu-toggle" onClick={toggleMenu}>
          <MenuIcon /> 
        </div>
        <div className="logo">
          <h1>Pac Poupança</h1>
        </div>
        <div className="user-menu">
          <div className="theme-toggle" onClick={toggleTheme}>
            {darkTheme ? <SunIcon /> : <MoonIcon />}
          </div>
          <span>Olá, {userProfile?.username || 'Usuário'}!</span>
          <button onClick={handleLogout} className="logout-btn">
            <LogoutIcon /> Sair
          </button>
        </div>
      </header>
          
      {/* Conteúdo principal do dashboard */}
      <div className="dashboard-main">
        <div className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`}>
          <nav>
            <ul>
              <li className="active" onClick={() => navigate('/dashboard')}>
                <span className="menu-icon"><DashboardIcon /></span>
                <span className="menu-text">Dashboard</span>
              </li>
              <li onClick={() => navigate('/transactions')}>
                <span className="menu-icon"><TransactionIcon /></span>
                <span className="menu-text">Transações</span>
              </li>
              <li>
                <span className="menu-icon"><TrophyIcon /></span>
                <span className="menu-text">Desafios</span>
              </li>
              <li>
                <span className="menu-icon"><UserIcon /></span>
                <span className="menu-text">Perfil</span>
              </li>
              <li>
                <span className="menu-icon"><SettingsIcon /></span>
                <span className="menu-text">Configurações</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className={`main-content ${menuCollapsed ? 'expanded' : ''}`}>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="welcome-card">
            <h2>Bem-vindo ao seu labirinto financeiro, {userProfile?.full_name}!</h2>
            <p>Aqui você poderá visualizar seus gastos, economias e conquistar desafios.</p>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon money-icon"></div>
              <div className="stat-content">
                <h3>Saldo Atual</h3>
                <p className="stat-value">
                  {financialSummary ? formatCurrency(financialSummary.balance) : 'R$ 0,00'}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon savings-icon"></div>
              <div className="stat-content">
                <h3>Receitas</h3>
                <p className="stat-value">
                  {financialSummary ? formatCurrency(financialSummary.income) : 'R$ 0,00'}
                </p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon expenses-icon"></div>
              <div className="stat-content">
                <h3>Despesas</h3>
                <p className="stat-value">
                  {financialSummary ? formatCurrency(financialSummary.expenses) : 'R$ 0,00'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="user-profile-card">
            <h3>Seu Perfil</h3>
            {userProfile && (
              <div className="profile-details">
                <div className="profile-section">
                  <p><strong>Nome:</strong> {userProfile.full_name}</p>
                  <p><strong>Email:</strong> {userProfile.email}</p>
                </div>
                <div className="profile-section">
                  <p><strong>Telefone:</strong> {userProfile.phone}</p>
                  <p><strong>Data de Nascimento:</strong> {userProfile.birth_date}</p>
                </div>
                <div className="profile-section full-width">
                  <p><strong>Conta criada em:</strong> {userProfile.created_at}</p>
                  <p><strong>Último login:</strong> {userProfile.last_login || 'Esta é sua primeira vez'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;