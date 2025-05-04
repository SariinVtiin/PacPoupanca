from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.transaction import Transaction, TransactionCategory
from app.models.user import User
from app import db
import datetime
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

transaction_api = Blueprint('transaction_api', __name__)

# Obter todas as categorias
@transaction_api.route('/categories', methods=['GET'])
@jwt_required()
def get_categories():
    categories = TransactionCategory.query.all()
    return jsonify([category.to_dict() for category in categories]), 200

# Obter todas as transações do usuário
@transaction_api.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    
    # Parâmetros de filtro opcionais
    type_filter = request.args.get('type')
    category_id = request.args.get('category_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', 50, type=int)
    
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Aplicar filtros se fornecidos
    if type_filter:
        query = query.filter_by(type=type_filter)
    
    if category_id:
        query = query.filter_by(category_id=category_id)
    
    if start_date:
        try:
            start = datetime.datetime.strptime(start_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date >= start)
        except ValueError:
            return jsonify({'error': 'Formato de data inválido para start_date. Use YYYY-MM-DD'}), 400
    
    if end_date:
        try:
            end = datetime.datetime.strptime(end_date, '%Y-%m-%d').date()
            query = query.filter(Transaction.date <= end)
        except ValueError:
            return jsonify({'error': 'Formato de data inválido para end_date. Use YYYY-MM-DD'}), 400
    
    # Ordenar por data (mais recente primeiro) e limitar resultados
    transactions = query.order_by(Transaction.date.desc()).limit(limit).all()
    
    return jsonify([transaction.to_dict() for transaction in transactions]), 200

# Criar uma nova transação
@transaction_api.route('/transactions', methods=['POST'])
@jwt_required()
def create_transaction():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validar dados recebidos
    required_fields = ['description', 'amount', 'type', 'category_id']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Campo {field} é obrigatório'}), 400
    
    # Validar tipo de transação
    if data['type'] not in ['income', 'expense']:
        return jsonify({'error': 'Tipo de transação deve ser "income" ou "expense"'}), 400
    
    # Validar categoria
    category = TransactionCategory.query.get(data['category_id'])
    if not category:
        return jsonify({'error': 'Categoria não encontrada'}), 404
    
    # Validar compatibilidade entre tipo de transação e categoria
    if data['type'] != category.type:
        return jsonify({'error': f'Categoria incompatível com o tipo de transação. A categoria é do tipo {category.type}'}), 400
    
    # Validar e converter a data
    transaction_date = datetime.datetime.utcnow().date()
    if 'date' in data:
        try:
            transaction_date = datetime.datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
    
    # Criar e salvar a transação
    try:
        new_transaction = Transaction(
            description=data['description'],
            amount=float(data['amount']),
            type=data['type'],
            date=transaction_date,
            user_id=user_id,
            category_id=data['category_id']
        )
        
        db.session.add(new_transaction)
        db.session.commit()
        
        logger.info(f"Transação criada: {new_transaction.description} - {new_transaction.amount}")
        return jsonify({'message': 'Transação criada com sucesso', 'transaction': new_transaction.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao criar transação: {str(e)}")
        return jsonify({'error': 'Erro ao criar transação. Por favor, tente novamente.'}), 500

# Obter uma transação específica
@transaction_api.route('/transactions/<int:transaction_id>', methods=['GET'])
@jwt_required()
def get_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transação não encontrada'}), 404
    
    return jsonify(transaction.to_dict()), 200

# Atualizar uma transação
@transaction_api.route('/transactions/<int:transaction_id>', methods=['PUT'])
@jwt_required()
def update_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transação não encontrada'}), 404
    
    data = request.get_json()
    
    # Atualizar campos se fornecidos
    if 'description' in data:
        transaction.description = data['description']
    
    if 'amount' in data:
        transaction.amount = float(data['amount'])
    
    if 'type' in data:
        if data['type'] not in ['income', 'expense']:
            return jsonify({'error': 'Tipo de transação deve ser "income" ou "expense"'}), 400
        transaction.type = data['type']
    
    if 'category_id' in data:
        category = TransactionCategory.query.get(data['category_id'])
        if not category:
            return jsonify({'error': 'Categoria não encontrada'}), 404
        
        # Verificar compatibilidade entre tipo de transação e categoria
        if transaction.type != category.type:
            return jsonify({'error': f'Categoria incompatível com o tipo de transação. A categoria é do tipo {category.type}'}), 400
        
        transaction.category_id = data['category_id']
    
    if 'date' in data:
        try:
            transaction.date = datetime.datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Formato de data inválido. Use YYYY-MM-DD'}), 400
    
    try:
        db.session.commit()
        logger.info(f"Transação atualizada: {transaction.id}")
        return jsonify({'message': 'Transação atualizada com sucesso', 'transaction': transaction.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao atualizar transação: {str(e)}")
        return jsonify({'error': 'Erro ao atualizar transação. Por favor, tente novamente.'}), 500

# Excluir uma transação
@transaction_api.route('/transactions/<int:transaction_id>', methods=['DELETE'])
@jwt_required()
def delete_transaction(transaction_id):
    user_id = get_jwt_identity()
    transaction = Transaction.query.filter_by(id=transaction_id, user_id=user_id).first()
    
    if not transaction:
        return jsonify({'error': 'Transação não encontrada'}), 404
    
    try:
        db.session.delete(transaction)
        db.session.commit()
        logger.info(f"Transação excluída: {transaction_id}")
        return jsonify({'message': 'Transação excluída com sucesso'}), 200
    except Exception as e:
        db.session.rollback()
        logger.error(f"Erro ao excluir transação: {str(e)}")
        return jsonify({'error': 'Erro ao excluir transação. Por favor, tente novamente.'}), 500

# Obter resumo financeiro
@transaction_api.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'error': 'Usuário não encontrado'}), 404
    
    # Período do resumo (opcional)
    period = request.args.get('period', 'all')  # 'all', 'month', 'week'
    
    # Consulta base
    query = Transaction.query.filter_by(user_id=user_id)
    
    # Filtrar por período
    if period == 'month':
        first_day = datetime.datetime.utcnow().replace(day=1).date()
        query = query.filter(Transaction.date >= first_day)
    elif period == 'week':
        today = datetime.datetime.utcnow().date()
        start_of_week = today - datetime.timedelta(days=today.weekday())
        query = query.filter(Transaction.date >= start_of_week)
    
    # Calcular totais
    transactions = query.all()
    income = sum(t.amount for t in transactions if t.type == 'income')
    expenses = sum(t.amount for t in transactions if t.type == 'expense')
    balance = income - expenses
    
    # Calcular por categoria
    income_by_category = {}
    expense_by_category = {}
    
    for t in transactions:
        category_name = t.category.name
        
        if t.type == 'income':
            if category_name not in income_by_category:
                income_by_category[category_name] = 0
            income_by_category[category_name] += t.amount
        else:
            if category_name not in expense_by_category:
                expense_by_category[category_name] = 0
            expense_by_category[category_name] += t.amount
    
    return jsonify({
        'period': period,
        'income': income,
        'expenses': expenses,
        'balance': balance,
        'income_by_category': income_by_category,
        'expense_by_category': expense_by_category
    }), 200