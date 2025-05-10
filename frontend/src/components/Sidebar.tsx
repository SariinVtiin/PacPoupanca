import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  menuCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ menuCollapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determinar qual item do menu está ativo com base na rota atual
  const getActiveClass = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <div className={`sidebar ${menuCollapsed ? 'collapsed' : ''}`}>
      <nav>
        <ul>
          <li 
            className={getActiveClass('/dashboard')} 
            onClick={() => navigate('/dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span className="menu-text">Dashboard</span>
          </li>
          <li 
            className={getActiveClass('/transactions')} 
            onClick={() => navigate('/transactions')}
          >
            <span className="menu-icon">💰</span>
            <span className="menu-text">Transações</span>
          </li>
          <li 
            className={getActiveClass('/challenges')} 
            onClick={() => navigate('/challenges')}
          >
            <span className="menu-icon">🏆</span>
            <span className="menu-text">Desafios</span>
          </li>
          <li 
            className={getActiveClass('/profile')} 
            onClick={() => navigate('/profile')}
          >
            <span className="menu-icon">👤</span>
            <span className="menu-text">Perfil</span>
          </li>
          <li 
            className={getActiveClass('/settings')} 
            onClick={() => navigate('/settings')}
          >
            <span className="menu-icon">⚙️</span>
            <span className="menu-text">Configurações</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;