import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Efeito para configurar os comportamentos dos componentes
  useEffect(() => {
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', function(this: HTMLElement) {
        this.style.transform = 'translateY(-10px)';
        this.style.borderColor = 'var(--pacman-yellow)';
      });
      
      card.addEventListener('mouseleave', function(this: HTMLElement) {
        this.style.transform = 'translateY(0)';
        this.style.borderColor = 'transparent';
      });
    });
    
    // Cleanup function para remover event listeners
    return () => {
      cards.forEach(card => {
        card.removeEventListener('mouseenter', function() {});
        card.removeEventListener('mouseleave', function() {});
      });
    };
  }, []);
  
  // Funções de navegação
  const handleLoginClick = () => {
    navigate('/login');
  };
  
  const handleRegisterClick = () => {
    navigate('/register');
  };
  
  return (

    <>
      {/* Header com botão de login no canto superior direito */}
      <header className="dashboard-header">
        <div className="logo">
          <h1>Pac Poupança</h1>
        </div>
        <button className="login-btn" onClick={handleLoginClick}>Entrar</button>
      </header>
      
      {/* Seção Hero */}
      <section className="hero">
        <div className="ghost"></div>
        <div className="ghost"></div>
        <div className="ghost"></div>
        <div className="ghost"></div>
        
        <div className="hero-content">
          <div className="hero-image-container">
            <img src="/assets/images/pac-man.gif" alt="Pac-Poupança Animation" />
          </div>
          <h2>Transforme suas finanças em diversão</h2>
          <p>O Pac-Poupança une o universo dos videogames e a educação financeira. Assuma o papel do herói e "devore" os gastos desnecessários enquanto coleta as preciosas "pílulas da economia". Aprenda a controlar suas finanças de forma divertida e estratégica.</p>
          <button className="cta-btn" onClick={handleRegisterClick}>Comece a poupar agora</button>
        </div>
      </section>
      
      {/* Seção de Recursos */}
      <section className="features">
        <h2 className="section-title">Principais Recursos</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Labirinto das Finanças</h3>
            <p>Visualize seus gastos e economia em um labirinto vibrante, onde cada "pílula" representa uma oportunidade de economia e cada "fantasma" um gasto desnecessário.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎮</div>
            <h3>Desafios e Missões</h3>
            <p>Complete desafios diários e semanais como "Devore 5 Gastos Supérfluos" para desbloquear conquistas, níveis e dicas exclusivas de economia.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Inteligência Financeira</h3>
            <p>Nossa tecnologia analisa seus padrões de consumo para identificar onde você pode economizar, gerando relatórios e alertas personalizados em tempo real.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>Avatar Personalizado</h3>
            <p>Customize seu próprio avatar inspirado no universo dos clássicos dos videogames, criando uma conexão emocional com sua jornada de economia.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Ranking e Competição</h3>
            <p>Compare seu desempenho com outros usuários em rankings e troque dicas de economia, transformando a experiência de economizar em um desafio coletivo.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Conteúdo Educativo</h3>
            <p>Acesse tutoriais, artigos e vídeos sobre educação financeira, transformando a experiência de economizar em um aprendizado contínuo e divertido.</p>
          </div>
        </div>
      </section>
      
      {/* Como Funciona */}
      <section className="how-it-works">
        <h2 className="section-title">Como Funciona</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Cadastro e Personalização</h3>
              <p>Realize um cadastro simples, conecte suas contas bancárias ou insira manualmente suas transações. Personalize seu avatar para começar sua aventura financeira.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Explore o Labirinto</h3>
              <p>Navegue pelo labirinto financeiro, onde cada transação é visualizada como elementos do jogo. Desvie dos "fantasmas" (gastos desnecessários) e colete as "pílulas" (oportunidades de economia).</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Complete Desafios</h3>
              <p>Participe de missões diárias e semanais que estimulam hábitos financeiros saudáveis. A cada conquista, desbloqueie novos níveis e recursos exclusivos.</p>
            </div>
          </div>
          
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Acompanhe seu Progresso</h3>
              <p>Visualize seu crescimento financeiro através de gráficos dinâmicos e animações. Receba feedback imediato sobre suas escolhas e celebre cada pequena vitória.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer>
        <div className="footer-logo">Pac Poupança</div>
        <button className="cta-btn" onClick={handleRegisterClick}>Comece sua jornada financeira</button>
        <p>© 2025 Pac-Poupança. Transformando finanças em diversão.</p>
      </footer>
    </>
  );
};

export default LandingPage;