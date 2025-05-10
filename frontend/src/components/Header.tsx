import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleMenu: () => void;
  darkTheme: boolean;
  toggleTheme: () => void;
  userXP: {
    xp: number;
    level: number;
    next_level_xp: number;
    last_xp_grant: string | null;
  } | null;
  setUserXP: React.Dispatch<React.SetStateAction<{
    xp: number;
    level: number;
    next_level_xp: number;
    last_xp_grant: string | null;
  } | null>>;
  onRecalculateLevel: () => void;
}

const Header: React.FC<HeaderProps> = ({
  toggleMenu,
  darkTheme,
  toggleTheme,
  userXP,
  setUserXP,
  onRecalculateLevel
}) => {
  const navigate = useNavigate();
  const [recalculatingLevel, setRecalculatingLevel] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleRecalculateLevel = async () => {
    setRecalculatingLevel(true);
    await onRecalculateLevel();
    setRecalculatingLevel(false);
  };

  return (
    <header className="dashboard-header">
      <div className="menu-toggle" onClick={toggleMenu}>
        ☰
      </div>
      <div className="logo">
        <h1>Pac Poupança</h1>
      </div>
      <div className="user-menu">
        <div className="theme-toggle" onClick={toggleTheme}>
          {darkTheme ? '☀️' : '🌙'}
        </div>
        <div className="user-level-indicator">
          {userXP ? (
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
          ) : (
            <div className="level-badge">Carregando...</div>
          )}
        </div>
        <span className="username">Olá, {localStorage.getItem('username') || 'Usuário'}!</span>
        <button onClick={handleLogout} className="logout-btn">
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;