import datetime
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Inicializar SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pacpoupanca.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret_key')
    
    # Inicializar extensões
    db.init_app(app)
    JWTManager(app)
    CORS(app)
    
    # Importação para garantir que os modelos sejam registrados
    with app.app_context():
        from app.models.user import User
        
        # Registrar blueprints
        from app.api.routes import api as api_blueprint
        app.register_blueprint(api_blueprint, url_prefix='/api')
        
        # Criar tabelas
        db.create_all()
        
        # Criar um usuário administrador se não existir
        admin_username = os.getenv('ADMIN_USERNAME', 'admin')
        admin_password = os.getenv('ADMIN_PASSWORD', 'admin123')
        
        if not User.query.filter_by(username=admin_username).first():
            admin_user = User(
                username=admin_username,
                email=os.getenv('ADMIN_EMAIL', 'admin@example.com'),
                phone=os.getenv('ADMIN_PHONE', '(00) 00000-0000'),
                full_name='Administrador do Sistema',
                birth_date=datetime.datetime.strptime('2000-01-01', '%Y-%m-%d').date()
            )
            admin_user.set_password(admin_password)
            db.session.add(admin_user)
            db.session.commit()
            print(f"Usuário administrador criado: {admin_username}")
    
    return app