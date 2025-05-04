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
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def update_last_login(self):
        self.last_login = datetime.utcnow()
        db.session.commit()
    
    transactions = db.relationship('Transaction', backref='user', lazy=True, cascade="all, delete-orphan")

    # E atualize o método to_dict para incluir um resumo de transações:
    def to_dict(self, include_transactions=False):
        user_dict = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'phone': self.phone,
            'full_name': self.full_name,
            'birth_date': self.birth_date.strftime('%Y-%m-%d'),
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'last_login': self.last_login.strftime('%Y-%m-%d %H:%M:%S') if self.last_login else None
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