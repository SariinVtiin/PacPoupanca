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
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
    
    # Configuração do banco de dados SQLite
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pacpoupanca.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
    
    # Inicializar extensões
    db.init_app(app)
    JWTManager(app)
    CORS(app)
    
    # Importação de rotas
    with app.app_context():
        # Registrar blueprints
        from app.api.routes import api as api_blueprint
        app.register_blueprint(api_blueprint, url_prefix='/api')
        
        # Criar tabelas
        db.create_all()
    
    return app