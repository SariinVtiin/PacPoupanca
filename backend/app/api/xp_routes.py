from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.extensions import db  # Importar db do arquivo extensions
import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

xp_api = Blueprint('xp_api', __name__)

# Obter informações de XP do usuário
@xp_api.route('/user/xp', methods=['GET'])
@jwt_required()
def get_user_xp():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'xp': user.xp,
        'level': user.level,
        'next_level_xp': user.get_next_level_xp(),
        'last_xp_grant': user.last_xp_grant.strftime('%Y-%m-%d') if user.last_xp_grant else None
    }), 200

# Verificar e conceder XP por login diário
@xp_api.route('/user/daily-xp', methods=['POST'])
@jwt_required()
def grant_daily_xp():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Tentar conceder XP por login diário
    success, xp, level, *args = user.grant_daily_login_xp()
    
    if success:
        daily_xp = args[0]
        return jsonify({
            'message': f'Parabéns! Você ganhou {daily_xp} XP pelo login diário!',
            'xp_granted': daily_xp,
            'total_xp': xp,
            'level': level,
            'next_level_xp': user.get_next_level_xp()
        }), 200
    else:
        return jsonify({
            'message': 'Você já recebeu XP hoje. Volte amanhã!',
            'total_xp': xp,
            'level': level,
            'next_level_xp': user.get_next_level_xp()
        }), 200

# Obter histórico de conquistas do usuário (será implementado no futuro)
@xp_api.route('/user/achievements', methods=['GET'])
@jwt_required()
def get_user_achievements():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Por enquanto, retornaremos conquistas mockadas
    # No futuro, isso virá de uma tabela de conquistas no banco de dados
    achievements = [
        {
            'id': 1,
            'title': 'Primeiro Login',
            'description': 'Você fez seu primeiro login no Pac Poupança!',
            'xp_reward': 50,
            'achieved_at': user.created_at.strftime('%Y-%m-%d'),
            'icon': '🏆'
        },
        {
            'id': 2,
            'title': 'Constância é Tudo',
            'description': 'Faça login por 5 dias consecutivos',
            'xp_reward': 100,
            'progress': min(5, user.level) / 5,  # Mockup de progresso
            'icon': '📅'
        },
        {
            'id': 3,
            'title': 'Mestre das Economias',
            'description': 'Registre 10 transações de economia',
            'xp_reward': 200,
            'progress': min(5, len(user.transactions)) / 10,  # Mockup de progresso
            'icon': '💰'
        }
    ]
    
    return jsonify(achievements), 200


# Endpoint para recalcular o nível com base no XP atual
@xp_api.route('/user/recalculate-level', methods=['POST'])
@jwt_required()
def recalculate_level():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Salvar nível antigo para comparação
    old_level = user.level
    
    # Recalcular o nível com base no XP atual
    while user.xp >= user.get_next_level_xp():
        user.level += 1
    
    # Verificar se o nível mudou
    level_changed = old_level != user.level
    
    # Salvar as alterações
    db.session.commit()
    
    return jsonify({
        'message': 'Nível recalculado com sucesso!',
        'xp': user.xp,
        'old_level': old_level,
        'new_level': user.level,
        'level_changed': level_changed,
        'next_level_xp': user.get_next_level_xp()
    }), 200

# Endpoint para obter rankings de usuários (mock por enquanto)
@xp_api.route('/rankings', methods=['GET'])
@jwt_required()
def get_rankings():
    user_id = get_jwt_identity()
    current_user = User.query.get(user_id)
    
    if not current_user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Pegar top 5 usuários ordenados por XP
    top_users = User.query.order_by(User.xp.desc()).limit(5).all()
    
    rankings = [{
        'username': user.username,
        'level': user.level,
        'xp': user.xp,
        'is_current_user': user.id == current_user.id
    } for user in top_users]
    
    # Adicionar a posição do usuário atual se ele não estiver no top 5
    current_user_in_list = any(r['is_current_user'] for r in rankings)
    
    if not current_user_in_list:
        # Calcular a posição do usuário atual
        users_with_more_xp = User.query.filter(User.xp > current_user.xp).count()
        current_user_position = users_with_more_xp + 1
        
        rankings.append({
            'username': current_user.username,
            'level': current_user.level,
            'xp': current_user.xp,
            'position': current_user_position,
            'is_current_user': True
        })
    
    return jsonify(rankings), 200

# Endpoint para obter desafios disponíveis (mock por enquanto)
@xp_api.route('/challenges', methods=['GET'])
@jwt_required()
def get_challenges():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # No futuro, isso virá de uma tabela de desafios no banco de dados
    challenges = [
        {
            'id': 1,
            'title': 'Economista Iniciante',
            'description': 'Registre 5 transações de despesa em categorias diferentes',
            'xp_reward': 100,
            'progress': 0.2,  # Mockup de progresso
            'status': 'in_progress',
            'icon': '📊'
        },
        {
            'id': 2,
            'title': 'Meta de Economia',
            'description': 'Tenha um saldo positivo de R$ 500,00 ao final do mês',
            'xp_reward': 150,
            'progress': 0.3,  # Mockup de progresso
            'status': 'in_progress',
            'icon': '💸'
        },
        {
            'id': 3,
            'title': 'Login Consistente',
            'description': 'Faça login por 7 dias consecutivos',
            'xp_reward': 200,
            'progress': min(user.level / 7, 1.0),  # Mockup de progresso baseado no nível
            'status': 'in_progress',
            'icon': '🗓️'
        }
    ]
    
    return jsonify(challenges), 200