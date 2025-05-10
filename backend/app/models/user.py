from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime, nullable=True)
    
    # Novos campos para sistema de XP
    xp = db.Column(db.Integer, default=0)
    level = db.Column(db.Integer, default=1)
    last_xp_grant = db.Column(db.Date, nullable=True)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    # Nova função para calcular o XP necessário para o próximo nível
    def get_next_level_xp(self):
        # Fórmula para calcular o XP necessário para o próximo nível
        # Cada nível requer mais XP que o anterior (100 * level ao quadrado)
        return 100 * (self.level ** 2)
    
    # Nova função para adicionar XP e atualizar nível se necessário
    def add_xp(self, amount):
        self.xp += amount
        
        # Verificar se é necessário subir de nível
        while self.xp >= self.get_next_level_xp():
            self.level += 1
        
        db.session.commit()
        return self.xp, self.level
    
    # Nova função para conceder XP por login diário
    def grant_daily_login_xp(self):
        today = datetime.utcnow().date()
        
        # Verificar se já recebeu XP hoje
        if self.last_xp_grant == today:
            return False, self.xp, self.level
        
        # Quantidade de XP concedida pelo login diário
        daily_xp = 50
        
        # Atualizar a data do último ganho de XP
        self.last_xp_grant = today
        
        # Adicionar o XP
        self.add_xp(daily_xp)
        
        return True, self.xp, self.level, daily_xp
    
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade="all, delete-orphan")

    # Atualização do método to_dict para incluir dados de XP
    def to_dict(self, include_transactions=False):
        # Verificar e atualizar o nível se necessário
        level_changed = False
        while self.xp >= self.get_next_level_xp():
            self.level += 1
            level_changed = True
        
        # Se o nível mudou, salvar as alterações
        if level_changed:
            db.session.commit()
        
        user_dict = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'full_name': self.full_name,
            'birth_date': self.birth_date.strftime('%Y-%m-%d'),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None,
            'xp': self.xp,
            'level': self.level,
            'next_level_xp': self.get_next_level_xp(),
            'last_xp_grant': self.last_xp_grant.strftime('%Y-%m-%d') if self.last_xp_grant else None
        }
        
        if include_transactions:
            # Cálculo de sumário financeiro
            income = sum(t.amount for t in self.transactions if t.type == 'income')
            expenses = sum(t.amount for t in self.transactions if t.type == 'expense')
            balance = income - expenses
            
            user_dict['financial_summary'] = {
                'income': income,
                'expenses': expenses,
                'balance': balance
            }
        
        return user_dict
        
    def __repr__(self):
        return f'<User {self.username}>'