import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import axios from 'axios';
import '../assets/css/dashboard.css';

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

  useEffect(() => {
    // Buscar dados do perfil do usuário ao carregar o componente
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const data = await authService.getProfile();
        setUserProfile(data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar perfil:', error);
        setError('Erro ao carregar informações do usuário');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
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
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <h1>Pac-Poupança</h1>
        </div>
        <div className="user-menu">
          <span>Olá, {userProfile?.username || 'Usuário'}!</span>
          <button onClick={handleLogout} className="logout-btn">Sair</button>
        </div>
      </header>

      <div className="dashboard-main">
        <div className="sidebar">
          <nav>
            <ul>
              <li className="active">Dashboard</li>
              <li>Transações</li>
              <li>Desafios</li>
              <li>Perfil</li>
            </ul>
          </nav>
        </div>

        <div className="main-content">
          <h1>Dashboard</h1>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="welcome-card">
            <h2>Bem-vindo ao seu labirinto financeiro, {userProfile?.full_name}!</h2>
            <p>Aqui você poderá visualizar seus gastos, economias e conquistar desafios.</p>
          </div>
          
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Saldo Atual</h3>
              <p className="stat-value">R$ 0,00</p>
            </div>
            
            <div className="stat-card">
              <h3>Economias</h3>
              <p className="stat-value">R$ 0,00</p>
            </div>
            
            <div className="stat-card">
              <h3>Gastos</h3>
              <p className="stat-value">R$ 0,00</p>
            </div>
          </div>
          
          <div className="user-profile-card">
            <h3>Seu Perfil</h3>
            {userProfile && (
              <div className="profile-details">
                <p><strong>Nome:</strong> {userProfile.full_name}</p>
                <p><strong>Email:</strong> {userProfile.email}</p>
                <p><strong>Telefone:</strong> {userProfile.phone}</p>
                <p><strong>Data de Nascimento:</strong> {userProfile.birth_date}</p>
                <p><strong>Conta criada em:</strong> {userProfile.created_at}</p>
                <p><strong>Último login:</strong> {userProfile.last_login || 'Esta é sua primeira vez'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;