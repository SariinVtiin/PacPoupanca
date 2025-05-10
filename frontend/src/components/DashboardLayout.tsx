import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import { userService } from '../services/api';

interface UserXP {
  xp: number;
  level: number;
  next_level_xp: number;
  last_xp_grant: string | null;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [error, setError] = useState('');
  const [xpMessage, setXpMessage] = useState<string | null>(null);
  const [levelMessage, setLevelMessage] = useState<string | null>(null);

  // Função para receber mensagens de nível de outros componentes
  const updateLevelMessage = (message: string) => {
    setLevelMessage(message);
    
    // Limpar a mensagem após 5 segundos
    setTimeout(() => {
      setLevelMessage(null);
    }, 5000);
  };

  useEffect(() => {
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
    
    // Buscar informações de XP do usuário
    const fetchUserXP = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        console.log("Buscando informações de XP...");
        const xpData = await userService.getUserXP();
        console.log("Dados de XP obtidos:", xpData);
        setUserXP(xpData);
        
        // Verificar se ganha XP por login diário
        const dailyXpResponse = await userService.grantDailyXP();
        if (dailyXpResponse.xp_granted) {
          setXpMessage(`Parabéns! Você ganhou ${dailyXpResponse.xp_granted} XP pelo login diário!`);
          // Atualizar os dados de XP com os valores mais recentes
          setUserXP({
            xp: dailyXpResponse.total_xp,
            level: dailyXpResponse.level,
            next_level_xp: dailyXpResponse.next_level_xp,
            last_xp_grant: new Date().toISOString().split('T')[0]
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados de XP:", error);
        
        // Se o erro for de autenticação, redirecionar para login
        if (error instanceof Error && error.message.includes('401')) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchUserXP();
  }, [navigate]);

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

  // Função para recalcular nível
  const handleRecalculateLevel = async () => {
    try {
      const result = await userService.recalculateLevel();
      
      if (result.level_changed) {
        setLevelMessage(`Nível atualizado com sucesso! Você subiu para o nível ${result.new_level}!`);
        
        // Atualizar o userXP com os novos dados
        setUserXP({
          xp: result.xp,
          level: result.new_level,
          next_level_xp: result.next_level_xp,
          last_xp_grant: userXP?.last_xp_grant || null
        });
      } else {
        setLevelMessage('Seu nível já está atualizado!');
      }
    } catch (error) {
      console.error('Erro ao recalcular nível:', error);
      setError('Erro ao recalcular nível. Por favor, tente novamente.');
    }
  };

  return (
    <div className={`dashboard-container ${darkTheme ? 'dark-theme' : 'light-theme'}`}>
      {/* Fantasmas animados de fundo */}
      <div className="ghost-background">
        <div className="ghost ghost-red"></div>
        <div className="ghost ghost-blue"></div>
        <div className="ghost ghost-pink"></div>
        <div className="ghost ghost-orange"></div>
      </div>
      
      {/* Cabeçalho do dashboard */}
      <Header 
        toggleMenu={toggleMenu}
        darkTheme={darkTheme}
        toggleTheme={toggleTheme}
        userXP={userXP}
        setUserXP={setUserXP}
        onRecalculateLevel={handleRecalculateLevel}
      />
          
      {/* Conteúdo principal do dashboard */}
      <div className="dashboard-main">
        <Sidebar menuCollapsed={menuCollapsed} />

        <div className={`main-content ${menuCollapsed ? 'expanded' : ''}`}>
          {error && <div className="error-message">{error}</div>}
          
          {/* Exibir mensagem de XP, se houver */}
          {xpMessage && (
            <div className="xp-notification">
              <div className="xp-icon">⭐</div>
              <p>{xpMessage}</p>
            </div>
          )}
          
          {/* Exibir mensagem de nível, se houver */}
          {levelMessage && (
            <div className="level-notification">
              <div className="level-icon">🏆</div>
              <p>{levelMessage}</p>
            </div>
          )}
          
          {/* Conteúdo específico da página */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;