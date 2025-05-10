import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, transactionService } from '../services/api';
import '../assets/css/dashboard.css';
import axios from 'axios';
import { Transaction, FinancialSummary, Category } from '../types/transaction.types';
import DashboardLayout from '../components/DashboardLayout';

// Interface para o perfil do usuário
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
  
  // Estados para dados reais
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  
  // Cores para categorias (inspiradas nos fantasmas do Pac-Man)
  const CATEGORY_COLORS = [
    '#FF0000', // vermelho (Blinky)
    '#FFB8FF', // rosa (Pinky)
    '#00FFFF', // ciano (Inky)
    '#FFAA33', // laranja (Clyde)
    '#FFCC00', // amarelo (Pac-Man)
    '#0000FF', // azul (labirinto)
    '#1D6F42', // verde
    '#8B5CF6', // roxo
    '#EC4899', // rosa escuro
  ];

  useEffect(() => {
    // Buscar dados do perfil do usuário e resumo financeiro
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        setLoading(true);

        // Buscar perfil do usuário
        console.log("Buscando perfil do usuário...");
        const profileData = await authService.getProfile();
        console.log("Perfil obtido:", profileData);
        setUserProfile(profileData);
        
        // Buscar categorias
        console.log("Buscando categorias...");
        const categoriesData = await transactionService.getCategories();
        console.log("Categorias obtidas:", categoriesData);
        setCategories(categoriesData);
        
        // Buscar resumo financeiro (mensal)
        console.log("Buscando resumo financeiro mensal...");
        const summaryData = await transactionService.getSummary('month');
        console.log("Resumo obtido:", summaryData);
        setFinancialSummary(summaryData);
        
        // Buscar transações recentes (últimas 5)
        console.log("Buscando transações recentes...");
        const transactionsData = await transactionService.getTransactions({ limit: 5 });
        console.log("Transações obtidas:", transactionsData);
        setRecentTransactions(transactionsData);

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar informações do usuário');
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

  // Função para adicionar nova transação
  const navigateToAddTransaction = () => {
    navigate('/transactions/new');
  };

  // Função para encontrar cor da categoria pelo ID
  const getCategoryColor = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || CATEGORY_COLORS[categoryId % CATEGORY_COLORS.length];
  };

  // Função para encontrar nome da categoria pelo ID
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Categoria';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando seu dashboard...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="welcome-card">
        <h2>Bem-vindo ao seu labirinto financeiro, {userProfile?.full_name}!</h2>
        <p>Aqui você poderá visualizar seus gastos, economias e conquistar desafios.</p>
        <div className="financial-tip">
          <div className="power-pill"></div>
          <p>Dica: Guarde pequenas quantias diariamente. R$ 10 por dia equivalem a R$ 3.650 em um ano!</p>
        </div>
      </div>
      
      {/* Cards de estatísticas financeiras */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon money-icon">💵</div>
          <div className="stat-content">
            <h3>Saldo Atual</h3>
            <p className="stat-value">
              {financialSummary ? formatCurrency(financialSummary.balance) : 'R$ 0,00'}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon income-icon">📈</div>
          <div className="stat-content">
            <h3>Receitas</h3>
            <p className="stat-value">
              {financialSummary ? formatCurrency(financialSummary.income) : 'R$ 0,00'}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon expense-icon">📉</div>
          <div className="stat-content">
            <h3>Despesas</h3>
            <p className="stat-value">
              {financialSummary ? formatCurrency(financialSummary.expenses) : 'R$ 0,00'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Área de gastos por categoria e transações recentes */}
      <div className="charts-transactions-container">
        {/* Gastos por categoria */}
        <div className="expense-chart-container">
          <h3>Seus Gastos por Categoria</h3>
          <div className="category-list">
            {financialSummary && Object.entries(financialSummary.expense_by_category).map(([name, value], index) => (
              <div key={`category-${index}`} className="category-item">
                <div 
                  className="category-color"
                  style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}
                ></div>
                <div className="category-name">{name}</div>
                <div className="category-value">{formatCurrency(value)}</div>
                <div 
                  className="category-bar"
                  style={{ 
                    width: `${(value / financialSummary.expenses) * 100}%`,
                    backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
                  }}
                ></div>
              </div>
            ))}
            
            {(!financialSummary || 
              !financialSummary.expense_by_category || 
              Object.keys(financialSummary.expense_by_category).length === 0) && (
              <div className="no-data-message">
                <p>Sem gastos registrados neste período</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Transações recentes */}
        <div className="recent-transactions-container">
          <div className="section-header">
            <h3>Transações Recentes</h3>
            <button className="view-all-btn" onClick={() => navigate('/transactions')}>
              Ver todas
            </button>
          </div>
          
          <div className="transactions-list">
            {recentTransactions && recentTransactions.length > 0 ? (
              recentTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className={`transaction-icon ${transaction.type}-icon`}>
                    {transaction.type === 'income' ? '⬆️' : '⬇️'}
                  </div>
                  <div className="transaction-details">
                    <div className="transaction-description">
                      <span>{transaction.description}</span>
                      <span className="transaction-category">
                        {transaction.category ? transaction.category.name : getCategoryName(transaction.category_id)}
                      </span>
                    </div>
                    <div className="transaction-amount-date">
                      <span className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </span>
                      <span className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">
                <p>Sem transações recentes para exibir</p>
              </div>
            )}
          </div>
          
          <button className="add-transaction-btn" onClick={navigateToAddTransaction}>
            ➕ Nova Transação
          </button>
        </div>
      </div>
      
      {/* Conteúdo adicional (simplificado - como ainda não há API) */}
      <div className="future-features">
        <div className="future-features-header">
          <h3>Em Desenvolvimento</h3>
        </div>
        
        <div className="future-features-grid">
          <div className="future-feature-card">
            <div className="future-feature-icon">🏆</div>
            <h4>Desafios Financeiros</h4>
            <p>Complete desafios para economizar dinheiro e ganhar recompensas.</p>
            <div className="coming-soon-badge">Em breve</div>
          </div>
          
          <div className="future-feature-card">
            <div className="future-feature-icon">🎯</div>
            <h4>Metas Financeiras</h4>
            <p>Defina metas de economia e acompanhe seu progresso.</p>
            <div className="coming-soon-badge">Em breve</div>
          </div>
          
          <div className="future-feature-card">
            <div className="future-feature-icon">📱</div>
            <h4>Integração com Telegram</h4>
            <p>Registre transações facilmente pelo Telegram.</p>
            <div className="coming-soon-badge">Em breve</div>
          </div>
        </div>
      </div>
      
      {/* Perfil do usuário (com dados reais) */}
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
              <p><strong>Conta criada em:</strong> {new Date(userProfile.created_at).toLocaleDateString('pt-BR')}</p>
              <p><strong>Último login:</strong> {userProfile.last_login ? new Date(userProfile.last_login).toLocaleDateString('pt-BR') : 'Esta é sua primeira vez'}</p>
            </div>
          </div>
        )}
        <button className="edit-profile-btn" onClick={() => navigate('/profile')}>
          ✏️ Editar Perfil
        </button>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;