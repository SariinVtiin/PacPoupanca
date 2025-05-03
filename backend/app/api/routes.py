from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db
import datetime
import logging

api = Blueprint('api', __name__)

# Configurar logging no início do arquivo
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Rota de teste
@api.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API está funcionando!'}), 200

# -- CRUD DE USUÁRIOS --

# Create (Cadastrar)
@api.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        logger.debug(f"Dados recebidos no registro: {data}")
        
        # Verifica se todos os campos necessários estão presentes
        required_fields = ['username', 'password', 'email', 'phone', 'full_name', 'birth_date']
        for field in required_fields:
            if field not in data:
                logger.error(f"Campo obrigatório ausente: {field}")
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Verificar se usuário ou email já existem
        if User.query.filter_by(username=data['username']).first():
            logger.warning(f"Tentativa de registro com nome de usuário já existente: {data['username']}")
            return jsonify({'error': 'Nome de usuário já existe'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            logger.warning(f"Tentativa de registro com email já existente: {data['email']}")
            return jsonify({'error': 'Email já está em uso'}), 400
        
        # Formatar a data de nascimento
        try:
            birth_date = datetime.datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
        except ValueError as e:
            logger.error(f"Erro ao converter data de nascimento: {e}")
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
        
        # Criar novo usuário
        new_user = User(
            username=data['username'],
            email=data['email'],
            phone=data['phone'],
            full_name=data['full_name'],
            birth_date=birth_date
        )
        new_user.set_password(data['password'])
        
        db.session.add(new_user)
        db.session.commit()
        
        logger.info(f"Usuário registrado com sucesso: {data['username']}")
        return jsonify({'message': 'Usuário registrado com sucesso', 'user_id': new_user.id}), 201
    
    except Exception as e:
        logger.error(f"Erro ao registrar usuário: {str(e)}")
        db.session.rollback()
        return jsonify({'error': 'Erro interno do servidor. Por favor, tente novamente.'}), 500

# Login (Autenticação)
@api.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Verificar se username e password foram fornecidos
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Nome de usuário e senha são obrigatórios'}), 400
    
    # Buscar usuário
    user = User.query.filter_by(username=data['username']).first()
    
    # Verificar se usuário existe e senha está correta
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Nome de usuário ou senha inválidos'}), 401
    
    # Atualizar último login
    user.update_last_login()
    
    # Criar token JWT
    access_token = create_access_token(
        identity=user.id,
        expires_delta=datetime.timedelta(days=1)
    )
    
    return jsonify({
        'message': 'Login bem-sucedido',
        'access_token': access_token,
        'user_id': user.id,
        'username': user.username
    }), 200

# Read (Obter perfil do usuário)
@api.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    # Obter ID do usuário a partir do token JWT
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Retornar dados do usuário
    return jsonify(user.to_dict()), 200

# Update (Atualizar perfil do usuário)
@api.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    # Obter ID do usuário a partir do token JWT
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    data = request.get_json()
    
    # Campos que podem ser atualizados
    updatable_fields = {
        'email': str,
        'phone': str,
        'full_name': str
    }
    
    # Verificar e atualizar cada campo
    for field, field_type in updatable_fields.items():
        if field in data:
            # Verificar se o valor é do tipo correto
            if not isinstance(data[field], field_type):
                return jsonify({'error': f'Campo {field} deve ser do tipo {field_type.__name__}'}), 400
            
            # Verificar se o email já está em uso (se for diferente do atual)
            if field == 'email' and data[field] != user.email:
                if User.query.filter_by(email=data[field]).first():
                    return jsonify({'error': 'Email já está em uso'}), 400
            
            # Atualizar o campo
            setattr(user, field, data[field])
    
    # Tratar senha separadamente
    if 'current_password' in data and 'new_password' in data:
        # Verificar se a senha atual está correta
        if not user.check_password(data['current_password']):
            return jsonify({'error': 'Senha atual incorreta'}), 400
        
        # Atualizar a senha
        user.set_password(data['new_password'])
    
    # Salvar as alterações
    db.session.commit()
    
    return jsonify({'message': 'Perfil atualizado com sucesso'}), 200

# Delete (Excluir conta de usuário)
@api.route('/profile', methods=['DELETE'])
@jwt_required()
def delete_profile():
    # Obter ID do usuário a partir do token JWT
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    data = request.get_json()
    
    # Verificar se a senha foi fornecida e está correta
    if not data or not data.get('password') or not user.check_password(data['password']):
        return jsonify({'error': 'Senha incorreta. Confirme sua senha para excluir a conta'}), 400
    
    # Excluir o usuário
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({'message': 'Conta excluída com sucesso'}), 200