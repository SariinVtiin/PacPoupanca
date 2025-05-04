import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import { Transaction, Category } from '../types/transaction.types';
import '../assets/css/transactions.css';
import { RiAddLine, RiDeleteBin6Line, RiEdit2Line, RiFilterLine } from 'react-icons/ri';

const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<Partial<Transaction>>({
    description: '',
    amount: 0,
    type: 'expense',
    date: new Date().toISOString().split('T')[0],
    category_id: 0
  });
  const [error, setError] = useState('');
  const [filter, setFilter] = useState({
    type: '',
    category_id: '',
    period: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  // Carregar categorias e transações
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar categorias
        const categoriesData = await transactionService.getCategories();
        setCategories(categoriesData);
        
        // Buscar transações
        await fetchTransactions();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        setError('Erro ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Buscar transações com filtros
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      const filterParams: any = {};
      if (filter.type) filterParams.type = filter.type;
      if (filter.category_id) filterParams.category_id = filter.category_id;
      
      if (filter.period === 'month') {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        filterParams.start_date = firstDay.toISOString().split('T')[0];
      } else if (filter.period === 'week') {
        const today = new Date();
        const firstDay = new Date(today);
        const day = today.getDay() || 7; // Converte 0 (domingo) para 7
        firstDay.setDate(today.getDate() - day + 1); // Ajusta para segunda-feira
        filterParams.start_date = firstDay.toISOString().split('T')[0];
      }
      
      const transactionsData = await transactionService.getTransactions(filterParams);
      setTransactions(transactionsData);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      setError('Erro ao carregar transações. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const applyFilters = () => {
    fetchTransactions();
    setShowFilters(false);
  };

  // Gerenciamento do formulário
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Se for campo de categoria e alterou o tipo, precisa resetar a categoria
    if (name === 'type' && formData.type !== value) {
      setFormData({
        ...formData,
        [name]: value as 'income' | 'expense' | undefined,
        category_id: 0
      });
      return;
    }
    
    // Converte o valor para número nos campos numéricos
    if (name === 'amount' || name === 'category_id') {
      processedValue = name === 'amount' ? parseFloat(value).toString() : parseInt(value, 10).toString();
      
      // Validação para números
      if (isNaN(Number(processedValue))) {
        return;
      }
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.category_id) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    try {
      setLoading(true);
      
      if (formMode === 'create') {
        await transactionService.createTransaction(formData);
      } else if (currentTransaction?.id) {
        await transactionService.updateTransaction(currentTransaction.id, formData);
      }
      
      // Resetar formulário e buscar transações atualizadas
      resetForm();
      await fetchTransactions();
      
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      setError('Erro ao salvar transação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const editTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      date: transaction.date,
      category_id: transaction.category_id
    });
    setFormMode('edit');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteTransaction = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta transação?')) {
      return;
    }
    
    try {
      setLoading(true);
      await transactionService.deleteTransaction(id);
      await fetchTransactions();
    } catch (error) {
      console.error("Erro ao excluir transação:", error);
      setError('Erro ao excluir transação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category_id: 0
    });
    setCurrentTransaction(null);
    setFormMode('create');
    setShowForm(false);
    setError('');
  };

  // Formatação de valores
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getCategoryById = (id: number) => {
    return categories.find(cat => cat.id === id);
  };

  // Filtrar categorias por tipo (receita/despesa)
  const getFilteredCategories = (type: 'income' | 'expense') => {
    return categories.filter(cat => cat.type === type);
  };

  return (
    <div className="transactions-container">
      <h1>Suas Transações</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="transactions-header">
        <button 
          className="add-transaction-btn" 
          onClick={() => { setShowForm(!showForm); setFormMode('create'); }}
        >
          {showForm ? 'Cancelar' : 'Nova Transação'} <RiAddLine />
        </button>
        
        <button 
          className="filter-btn" 
          onClick={() => setShowFilters(!showFilters)}
        >
          Filtros <RiFilterLine />
        </button>
      </div>
      
      {showFilters && (
        <div className="filter-container">
          <div className="filter-row">
            <div className="filter-group">
              <label htmlFor="period">Período:</label>
              <select 
                id="period" 
                name="period" 
                value={filter.period} 
                onChange={handleFilterChange}
              >
                <option value="all">Todos</option>
                <option value="month">Este mês</option>
                <option value="week">Esta semana</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="type">Tipo:</label>
              <select 
                id="type" 
                name="type" 
                value={filter.type} 
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="category_id">Categoria:</label>
              <select 
                id="category_id" 
                name="category_id" 
                value={filter.category_id} 
                onChange={handleFilterChange}
              >
                <option value="">Todas</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button className="apply-filter-btn" onClick={applyFilters}>
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
      
      {showForm && (
        <div className="transaction-form-container">
          <h2>{formMode === 'create' ? 'Nova Transação' : 'Editar Transação'}</h2>
          
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Tipo:</label>
                <div className="radio-group">
                  <label className={`radio-label ${formData.type === 'income' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="income" 
                      checked={formData.type === 'income'}
                      onChange={handleFormChange} 
                    />
                    Receita
                  </label>
                  <label className={`radio-label ${formData.type === 'expense' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="expense" 
                      checked={formData.type === 'expense'}
                      onChange={handleFormChange} 
                    />
                    Despesa
                  </label>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Data:</label>
                <input 
                  type="date" 
                  id="date" 
                  name="date" 
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="description">Descrição:</label>
                <input 
                  type="text" 
                  id="description" 
                  name="description" 
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                  placeholder="Ex: Mercado, Salário, etc."
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Valor:</label>
                <input 
                  type="number" 
                  id="amount" 
                  name="amount" 
                  value={formData.amount}
                  onChange={handleFormChange}
                  step="0.01"
                  min="0"
                  required
                  placeholder="0,00"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Categoria:</label>
                <select 
                  id="category_id" 
                  name="category_id" 
                  value={formData.category_id}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {getFilteredCategories(formData.type as 'income' | 'expense').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancelar
              </button>
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? 'Salvando...' : formMode === 'create' ? 'Adicionar' : 'Atualizar'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="transactions-list">
        <h2>Histórico de Transações</h2>
        
        {loading && !transactions.length ? (
          <div className="loading-message">Carregando transações...</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não tem transações registradas.</p>
            <button 
              className="add-transaction-btn" 
              onClick={() => { setShowForm(true); setFormMode('create'); }}
            >
              Adicionar Primeira Transação <RiAddLine />
            </button>
          </div>
        ) : (
          <div className="transaction-items">
            {transactions.map(transaction => {
              const category = getCategoryById(transaction.category_id);
              
              return (
                <div 
                  key={transaction.id} 
                  className={`transaction-item ${transaction.type}`}
                >
                  <div className="transaction-date">
                    {formatDate(transaction.date)}
                  </div>
                  
                  <div className="transaction-category" style={{ backgroundColor: category?.color }}>
                    {category?.name}
                  </div>
                  
                  <div className="transaction-description">
                    {transaction.description}
                  </div>
                  
                  <div className="transaction-amount">
                    {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                  </div>
                  
                  <div className="transaction-actions">
                    <button 
                      className="edit-btn" 
                      onClick={() => editTransaction(transaction)}
                    >
                      <RiEdit2Line />
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={() => transaction.id && deleteTransaction(transaction.id)}
                    >
                      <RiDeleteBin6Line />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;