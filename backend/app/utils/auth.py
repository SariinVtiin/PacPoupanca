from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def admin_required(fn):
    """
    Decorador para rotas que exigem privilégios de administrador.
    Deve ser usado após o decorador jwt_required().
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        # Aqui você pode implementar sua lógica para verificar se o usuário é admin
        # Por exemplo, verificar um campo is_admin no modelo User
        if not user or not getattr(user, 'is_admin', False):
            return jsonify({'error': 'Privilégios de administrador requeridos'}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper

def validate_request_data(required_fields):
    """
    Função utilitária para validar se todos os campos obrigatórios estão presentes na requisição.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'Dados da requisição não fornecidos'}), 400
            
            # Verificar campos obrigatórios
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    'error': 'Campos obrigatórios ausentes',
                    'missing_fields': missing_fields
                }), 400
            
            return fn(*args, **kwargs)
        
        return wrapper
    
    return decorator