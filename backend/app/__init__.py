from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from urllib.parse import quote_plus

# Inicialização do SQLAlchemy
db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configuração
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    
    # Credenciais do banco de dados
    db_user = "root"
    db_password = quote_plus("$@r11n")  # Substitua pela sua senha real
    db_host = "localhost"
    db_name = "pac_poupanca"
    
    # Construção da URI do banco de dados
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'jwt-dev-key-change-in-production')
    
    # Inicialização de extensões
    db.init_app(app)
    CORS(app)
    jwt = JWTManager(app)
    
    # Registro de blueprints (rotas)
    with app.app_context():
        # Importando apenas dentro do contexto da aplicação
        from app.routes import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    return app