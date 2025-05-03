import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/css/auth.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirm_password: '',
    email: '',
    phone: '',
    full_name: '',
    birth_date: ''
  });
  
  const [passwordStrength, setPasswordStrength] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);

  // Validar senha quando mudar
  useEffect(() => {
    const password = formData.password;
    setPasswordStrength({
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
    });
  }, [formData.password]);

  // Validar email quando mudar
  useEffect(() => {
    setEmailValid(formData.email === '' || formData.email.includes('@'));
  }, [formData.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Formatação especial para telefone
    if (name === 'phone') {
      // Remove tudo que não é número
      let phoneDigits = value.replace(/\D/g, '');
      
      // Limitar a 11 dígitos (DDD + 9 dígitos)
      phoneDigits = phoneDigits.slice(0, 11);
      
      // Formatar o número
      let formattedPhone = phoneDigits;
      
      if (phoneDigits.length > 0) {
        // Aplicar formatação conforme o usuário digita
        if (phoneDigits.length <= 2) {
          // Apenas DDD
          formattedPhone = `(${phoneDigits}`;
        } else if (phoneDigits.length <= 7) {
          // DDD + primeiros dígitos
          formattedPhone = `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2)}`;
        } else {
          // Formato completo
          formattedPhone = `(${phoneDigits.slice(0, 2)}) ${phoneDigits.slice(2, 7)}-${phoneDigits.slice(7)}`;
        }
      }
      
      setFormData({ ...formData, phone: formattedPhone });
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const isPasswordValid = () => {
    return Object.values(passwordStrength).every(value => value === true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validar senhas
    if (formData.password !== formData.confirm_password) {
      setError('As senhas não coincidem');
      return;
    }
    
    // Validar força da senha
    if (!isPasswordValid()) {
      setError('A senha não atende aos requisitos de segurança');
      return;
    }
    
    // Validar email
    if (!formData.email.includes('@')) {
      setError('Email inválido. Deve conter @');
      return;
    }

    setLoading(true);

    try {
      // Remover o campo confirm_password antes de enviar
      const { confirm_password, ...dataToSend } = formData;
      
      await axios.post('http://localhost:5000/api/register', dataToSend);
      
      // Após o registro bem-sucedido, mostrar mensagem de sucesso
      setSuccess('Registro realizado com sucesso! Redirecionando para o login...');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao fazer cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <h1>Pac-Poupança</h1>
          <div className="auth-image-container">
            <img src="/assets/images/pac-man.gif" alt="Pac-Poupança Animation" />
          </div>
        </div>
        
        <h2>Cadastro</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Nome de Usuário</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="full_name">Nome Completo</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={!emailValid ? 'invalid' : ''}
            />
            {!emailValid && <small style={{color: 'red'}}>Email deve conter @</small>}
          </div>
          
          {/* Layout de duas colunas para telefone e data de nascimento */}
          <div className="two-columns">
            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <div className="phone-input-container">
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="birth_date">Data de Nascimento</label>
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <div className="password-requirements">
              <small>A senha deve conter:</small>
              <ul>
                <li className={passwordStrength.minLength ? 'valid' : 'invalid'}>
                  No mínimo 8 caracteres
                </li>
                <li className={passwordStrength.hasUpperCase ? 'valid' : 'invalid'}>
                  Pelo menos uma letra maiúscula
                </li>
                <li className={passwordStrength.hasLowerCase ? 'valid' : 'invalid'}>
                  Pelo menos uma letra minúscula
                </li>
                <li className={passwordStrength.hasNumber ? 'valid' : 'invalid'}>
                  Pelo menos um número
                </li>
                <li className={passwordStrength.hasSpecialChar ? 'valid' : 'invalid'}>
                  Pelo menos um caractere especial
                </li>
              </ul>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm_password">Confirmar Senha</label>
            <input
              type="password"
              id="confirm_password"
              name="confirm_password"
              value={formData.confirm_password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn" 
            disabled={loading || !isPasswordValid() || !emailValid}
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Já tem uma conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;