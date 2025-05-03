// Script para animações e interações da página Pac-Poupança

document.addEventListener('DOMContentLoaded', function() {
    // Adiciona classe de animação ao scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            document.querySelector('header').classList.add('scrolled');
        } else {
            document.querySelector('header').classList.remove('scrolled');
        }
    });
    
    // Efeito hover nos cards
    const cards = document.querySelectorAll('.feature-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.borderColor = 'var(--pacman-yellow)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.borderColor = 'transparent';
        });
    });
    
    // Botões de Login e Call-to-Action
    const loginBtn = document.querySelector('.login-btn');
    const ctaBtns = document.querySelectorAll('.cta-btn');
    
    // Adicionar evento de clique ao botão de login
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            // Aqui você pode adicionar a lógica para redirecionar para a página de login
            alert('Redirecionando para a página de login...');
            // window.location.href = 'login.html';
        });
    }
    
    // Adicionar evento de clique aos botões CTA
    if (ctaBtns.length > 0) {
        ctaBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Aqui você pode adicionar a lógica para iniciar o cadastro
                alert('Vamos começar a jornada de economia!');
                // window.location.href = 'cadastro.html';
            });
        });
    }
});