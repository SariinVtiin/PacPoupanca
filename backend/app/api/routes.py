from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db
import datetime

api = Blueprint('api', __name__)

@api.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'API está funcionando!'})

@api.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Verificar se todos os campos necessários estão presentes
    required_fields = ['username', 'password', 'email', 'phone', 'full_name', 'birth_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400
    
    # Verificar se usuário ou email já existem
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Nome de usuário já existe'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email já está em uso'}), 400
    
    # Formatar a data de nascimento
    try:
        birth_date = datetime.datetime.strptime(data['birth_date'], '%Y-%m-%d').date()
    except ValueError:
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
    
    return jsonify({'message': 'Usuário registrado com sucesso'}), 201

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

@api.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    # Obter ID do usuário a partir do token JWT
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Retornar dados do usuário (exceto senha)
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'phone': user.phone,
        'full_name': user.full_name,
        'birth_date': user.birth_date.strftime('%Y-%m-%d'),
        'created_at': user.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }), 200