import React, { JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Importaremos o Dashboard quando o criarmos
// import DashboardPage from './pages/DashboardPage';

function App() {
  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
  };

  // Componente para rotas privadas (será usado quando tivermos o DashboardPage)
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return isAuthenticated() ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Adicionaremos a rota do Dashboard posteriormente
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        /> */}
      </Routes>
    </Router>
  );
}

export default App;