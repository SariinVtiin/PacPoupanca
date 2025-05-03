import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/dashboard.css'; // Vamos criar este CSS em seguida

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  phone: string;
  birth_date: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:5000/api/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setUserProfile(response.data);
      } catch (error: any) {
        console.error('Erro ao carregar perfil:', error);
        setError('Erro ao carregar informações do usuário');
        
        // Se for erro de autenticação, redirecionar para login
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Carregando...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <h1>Pac-Poupança</h1>
        </div>
        <div className="user-menu">
          <span>Olá, {userProfile?.username}!</span>
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
          
          <div className="maze-placeholder">
            <h3>Seu labirinto financeiro será exibido aqui</h3>
            <p>Em breve você poderá visualizar todos os seus dados de forma gamificada!</p>
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
          
          <div className="upcoming-challenges">
            <h3>Desafios do Dia</h3>
            <div className="challenge-card">
              <div className="challenge-icon">🎮</div>
              <div className="challenge-details">
                <h4>Registre todas as suas despesas hoje</h4>
                <p>Complete para ganhar uma medalha de "Organização Financeira"</p>
              </div>
              <button className="complete-btn">Completar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;