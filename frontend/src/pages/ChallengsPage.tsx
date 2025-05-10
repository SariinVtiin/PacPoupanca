import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/api';
import '../assets/css/challenges.css';
import axios from 'axios';



interface UserXP {
  xp: number;
  level: number;
  next_level_xp: number;
  last_xp_grant: string | null;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  achieved_at?: string;
  progress?: number;
  icon: string;
}

interface Challenge {
  id: number;
  title: string;
  description: string;
  xp_reward: number;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed';
  icon: string;
}

interface RankingUser {
  username: string;
  level: number;
  xp: number;
  position?: number;
  is_current_user: boolean;
}


const ChallengesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuCollapsed, setMenuCollapsed] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'rankings'>('challenges');
  
  // Estados para dados
  const [userXP, setUserXP] = useState<UserXP | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rankings, setRankings] = useState<RankingUser[]>([]);
  const [recalculatingLevel, setRecalculatingLevel] = useState(false);
  const [levelMessage, setLevelMessage] = useState<string | null>(null);

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
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // Buscar informações de XP do usuário
        const xpData = await userService.getUserXP();
        setUserXP(xpData);
        
        // Buscar desafios disponíveis
        const challengesData = await userService.getChallenges();
        setChallenges(challengesData);
        
        // Buscar conquistas do usuário
        const achievementsData = await userService.getAchievements();
        setAchievements(achievementsData);
        
        // Buscar rankings
        const rankingsData = await userService.getRankings();
        setRankings(rankingsData);
        
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar informações. Por favor, tente novamente.');
        setLoading(false);
        
        // Se o erro for de autenticação, redirecionar para login
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    fetchData();
  }, [navigate]);

  const toggleMenu = () => {
    const newState = !menuCollapsed;
    setMenuCollapsed(newState);
    localStorage.setItem('menuCollapsed', newState.toString());
  };

  // Adicionar esta função:
    const handleRecalculateLevel = async () => {
    try {
        setRecalculatingLevel(true);
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
        
        // Limpar a mensagem após 5 segundos
        setTimeout(() => {
        setLevelMessage(null);
        }, 5000);
    } catch (error) {
        console.error('Erro ao recalcular nível:', error);
        setError('Erro ao recalcular nível. Por favor, tente novamente.');
    } finally {
        setRecalculatingLevel(false);
    }
    };

  const toggleTheme = () => {
    const newTheme = !darkTheme;
    setDarkTheme(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

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
        <p>Carregando desafios...</p>
      </div>
    );
  }

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
      <header className="dashboard-header">
            <div className="user-menu">
            <div className="theme-toggle" onClick={toggleTheme}>
                {darkTheme ? '☀️' : '🌙'}
            </div>
            <div className="user-level-indicator">
                {userXP && (
                <>
                    <div className="level-badge">Nv {userXP.level}</div>
                    <div className="xp-bar-container">
                    <div 
                        className="xp-bar"
                        style={{ 
                        width: `${(userXP.xp / userXP.next_level_xp) * 100}%` 
                        }}
                    ></div>
                    </div>
                    <span className="xp-text">{userXP.xp}/{userXP.next_level_xp} XP</span>
                    <button 
                    className="recalculate-level-btn" 
                    onClick={handleRecalculateLevel}
                    disabled={recalculatingLevel}
                    title="Recalcular nível"
                    >
                    🔄
                    </button>
                </>
                )}
            </div>
            <span className="username">Olá, {localStorage.getItem('username') || 'Usuário'}!</span>
            <button onClick={handleLogout} className="logout-btn">
                Sair
            </button>
            </div>
        {/* Exibir mensagem de nível, se houver */}
        {levelMessage && (
        <div className="level-notification">
            <div className="level-icon">🏆</div>
            <p>{levelMessage}</p>
        </div>
        )}
      </header>
          
      {/* Conteúdo principal do dashboard */}
      <div className="dashboard-main">
        <div className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`}>
          <nav>
            <ul>
              <li onClick={() => navigate('/dashboard')}>
                <span className="menu-icon">📊</span>
                <span className="menu-text">Dashboard</span>
              </li>
              <li onClick={() => navigate('/transactions')}>
                <span className="menu-icon">💰</span>
                <span className="menu-text">Transações</span>
              </li>
              <li className="active">
                <span className="menu-icon">🏆</span>
                <span className="menu-text">Desafios</span>
              </li>
              <li onClick={() => navigate('/profile')}>
                <span className="menu-icon">👤</span>
                <span className="menu-text">Perfil</span>
              </li>
              <li onClick={() => navigate('/settings')}>
                <span className="menu-icon">⚙️</span>
                <span className="menu-text">Configurações</span>
              </li>
            </ul>
          </nav>
        </div>

        <div className={`main-content ${menuCollapsed ? 'expanded' : ''}`}>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Seção de cabeçalho da página */}
          <div className="challenges-header">
            <h1>Desafios e Conquistas</h1>
            <p>Complete desafios para ganhar XP e subir de nível!</p>
          </div>
          
          {/* Abas de navegação */}
          <div className="challenges-tabs">
            <div 
              className={`tab ${activeTab === 'challenges' ? 'active' : ''}`}
              onClick={() => setActiveTab('challenges')}
            >
              <span className="tab-icon">🎮</span>
              <span>Desafios</span>
            </div>
            <div 
              className={`tab ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              <span className="tab-icon">🏆</span>
              <span>Conquistas</span>
            </div>
            <div 
              className={`tab ${activeTab === 'rankings' ? 'active' : ''}`}
              onClick={() => setActiveTab('rankings')}
            >
              <span className="tab-icon">🥇</span>
              <span>Ranking</span>
            </div>
          </div>
          
          {/* Conteúdo da aba selecionada */}
          <div className="tab-content">
            {/* Aba de Desafios */}
            {activeTab === 'challenges' && (
              <div className="challenges-container">
                <div className="challenges-grid">
                  {challenges.map(challenge => (
                    <div key={challenge.id} className="challenge-card">
                      <div className="challenge-icon">{challenge.icon}</div>
                      <div className="challenge-content">
                        <h3>{challenge.title}</h3>
                        <p>{challenge.description}</p>
                        <div className="challenge-progress-container">
                          <div className="challenge-progress-bar">
                            <div 
                              className="challenge-progress-fill"
                              style={{ width: `${challenge.progress * 100}%` }}
                            ></div>
                          </div>
                          <div className="challenge-progress-text">
                            {Math.round(challenge.progress * 100)}% concluído
                          </div>
                        </div>
                        <div className="challenge-reward">
                          <span className="xp-icon">⭐</span>
                          <span>{challenge.xp_reward} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Aba de Conquistas */}
            {activeTab === 'achievements' && (
              <div className="achievements-container">
                <div className="achievements-grid">
                  {achievements.map(achievement => (
                    <div 
                      key={achievement.id} 
                      className={`achievement-card ${achievement.achieved_at ? 'achieved' : ''}`}
                    >
                      <div className="achievement-icon">{achievement.icon}</div>
                      <div className="achievement-content">
                        <h3>{achievement.title}</h3>
                        <p>{achievement.description}</p>
                        
                        {achievement.achieved_at ? (
                          <div className="achievement-date">
                            Conquistado em: {new Date(achievement.achieved_at).toLocaleDateString('pt-BR')}
                          </div>
                        ) : achievement.progress !== undefined ? (
                          <div className="achievement-progress-container">
                            <div className="achievement-progress-bar">
                              <div 
                                className="achievement-progress-fill"
                                style={{ width: `${achievement.progress * 100}%` }}
                              ></div>
                            </div>
                            <div className="achievement-progress-text">
                              {Math.round(achievement.progress * 100)}% concluído
                            </div>
                          </div>
                        ) : null}
                        
                        <div className="achievement-reward">
                          <span className="xp-icon">⭐</span>
                          <span>{achievement.xp_reward} XP</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Aba de Rankings */}
            {activeTab === 'rankings' && (
              <div className="rankings-container">
                <h2>Ranking de Usuários</h2>
                <div className="rankings-list">
                  <div className="ranking-header">
                    <div className="ranking-position">Posição</div>
                    <div className="ranking-user">Usuário</div>
                    <div className="ranking-level">Nível</div>
                    <div className="ranking-xp">XP</div>
                  </div>
                  
                  {rankings.map((user, index) => (
                    <div 
                      key={index} 
                      className={`ranking-item ${user.is_current_user ? 'current-user' : ''}`}
                    >
                      <div className="ranking-position">
                        {user.position || index + 1}
                        {(user.position === 1 || index === 0) && "🥇"}
                        {(user.position === 2 || index === 1) && "🥈"}
                        {(user.position === 3 || index === 2) && "🥉"}
                      </div>
                      <div className="ranking-user">{user.username}</div>
                      <div className="ranking-level">Nível {user.level}</div>
                      <div className="ranking-xp">{user.xp} XP</div>
                    </div>
                  ))}
                </div>
                
                <div className="ranking-info">
                  <p>Complete desafios e faça login diariamente para subir no ranking!</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Dicas para ganhar XP */}
          <div className="xp-tips-container">
            <h2>Como Ganhar XP</h2>
            <div className="xp-tips-grid">
              <div className="xp-tip-card">
                <div className="xp-tip-icon">📅</div>
                <h3>Login Diário</h3>
                <p>Faça login todos os dias para ganhar 50 XP. Quanto mais consistente, mais recompensas!</p>
              </div>
              
              <div className="xp-tip-card">
                <div className="xp-tip-icon">🎯</div>
                <h3>Complete Desafios</h3>
                <p>Cumpra os desafios disponíveis para ganhar XP e desbloquear novos níveis.</p>
              </div>
              
              <div className="xp-tip-card">
                <div className="xp-tip-icon">💰</div>
                <h3>Registre Transações</h3>
                <p>Em breve: ganhe XP a cada transação registrada. Mantenha suas finanças atualizadas!</p>
              </div>
              
              <div className="xp-tip-card">
                <div className="xp-tip-icon">📊</div>
                <h3>Alcance Metas Financeiras</h3>
                <p>Em breve: defina e alcance metas financeiras para ganhar grandes quantidades de XP.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesPage;