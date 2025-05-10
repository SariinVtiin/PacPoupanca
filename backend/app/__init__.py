from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import datetime

# Importar extensões do novo arquivo
from app.extensions import db, jwt

# Carregar variáveis de ambiente
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configurações
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev_secret_key')
    
    # Configuração do banco de dados MySQL
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST')
    db_name = os.getenv('DB_NAME')
    
    # Construir a URI do banco de dados MySQL
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev_jwt_secret_key')
    
    # Inicializar extensões
    db.init_app(app)
    jwt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    
    # Adicione manipuladores de erro JWT
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            'message': 'Token inválido',
            'error': error_string
        }), 422

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'message': 'Token expirado',
            'error': 'token_expired'
        }), 401

    @jwt.unauthorized_loader
    def unauthorized_callback(error_string):
        return jsonify({
            'message': 'Token ausente',
            'error': error_string
        }), 401

    # Importação para garantir que os modelos sejam registrados
    with app.app_context():
        # Importar modelos aqui para evitar importação circular
        from app.models.user import User
        from app.models.transaction import Transaction, TransactionCategory
        
        # Registrar blueprints
        from app.api.routes import api as api_blueprint
        from app.api.transaction_routes import transaction_api as transaction_api_blueprint
        from app.api.xp_routes import xp_api as xp_api_blueprint
        
        app.register_blueprint(api_blueprint, url_prefix='/api')
        app.register_blueprint(transaction_api_blueprint, url_prefix='/api')
        app.register_blueprint(xp_api_blueprint, url_prefix='/api')

        try:
            # Criar tabelas se não existirem
            db.create_all()
            print("Tabelas criadas com sucesso!")
            
            default_categories = [
                {'name': 'Salário', 'type': 'income', 'description': 'Rendimentos do trabalho', 'icon': 'money-bill', 'color': '#4CAF50'},
                {'name': 'Investimentos', 'type': 'income', 'description': 'Rendimentos de investimentos', 'icon': 'chart-line', 'color': '#2196F3'},
                {'name': 'Presentes', 'type': 'income', 'description': 'Dinheiro recebido como presente', 'icon': 'gift', 'color': '#9C27B0'},
                {'name': 'Outros (Receita)', 'type': 'income', 'description': 'Outras fontes de receita', 'icon': 'plus-circle', 'color': '#607D8B'},
                
                {'name': 'Alimentação', 'type': 'expense', 'description': 'Mercado, restaurantes e delivery', 'icon': 'utensils', 'color': '#F44336'},
                {'name': 'Moradia', 'type': 'expense', 'description': 'Aluguel, contas e manutenção', 'icon': 'home', 'color': '#FF9800'},
                {'name': 'Transporte', 'type': 'expense', 'description': 'Combustível, passagens e manutenção', 'icon': 'car', 'color': '#795548'},
                {'name': 'Lazer', 'type': 'expense', 'description': 'Entretenimento e hobbies', 'icon': 'gamepad', 'color': '#E91E63'},
                {'name': 'Saúde', 'type': 'expense', 'description': 'Medicamentos, consultas e planos', 'icon': 'heartbeat', 'color': '#00BCD4'},
                {'name': 'Educação', 'type': 'expense', 'description': 'Cursos, livros e materiais', 'icon': 'graduation-cap', 'color': '#3F51B5'},
                {'name': 'Compras', 'type': 'expense', 'description': 'Roupas, eletrônicos e outros', 'icon': 'shopping-bag', 'color': '#9E9E9E'},
                {'name': 'Assinaturas', 'type': 'expense', 'description': 'Serviços recorrentes', 'icon': 'calendar-check', 'color': '#8BC34A'},
                {'name': 'Outros (Despesa)', 'type': 'expense', 'description': 'Gastos diversos', 'icon': 'minus-circle', 'color': '#607D8B'}
            ]

            for category_data in default_categories:
                existing = TransactionCategory.query.filter_by(name=category_data['name']).first()
                if not existing:
                    category = TransactionCategory(**category_data)
                    db.session.add(category)
            
            db.session.commit()
            print("Categorias padrão criadas!")

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
        except Exception as e:
            print(f"Erro ao configurar banco de dados: {str(e)}")
    
    return app