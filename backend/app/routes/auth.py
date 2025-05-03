from flask import Blueprint, request, jsonify

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    # Será implementado depois
    return jsonify({"message": "Registro não implementado ainda"}), 200

@auth_bp.route('/login', methods=['POST'])
def login():
    # Será implementado depois
    return jsonify({"message": "Login não implementado ainda"}), 200