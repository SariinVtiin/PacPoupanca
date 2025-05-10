"""
Este arquivo contém as extensões usadas pela aplicação.
Isso resolve problemas de importação circular.
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager

# Inicializar SQLAlchemy
db = SQLAlchemy()

# Inicializar JWTManager (será configurado posteriormente)
jwt = JWTManager()