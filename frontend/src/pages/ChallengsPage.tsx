import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import '../assets/css/challenges.css';
import DashboardLayout from '../components/DashboardLayout';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'challenges' | 'achievements' | 'rankings'>('challenges');
  
  // Estados para dados
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [rankings, setRankings] = useState<RankingUser[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
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
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando desafios...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
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
    </DashboardLayout>
  );
};

export default ChallengesPage;