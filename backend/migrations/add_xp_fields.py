"""
Script de migração para adicionar campos de XP à tabela de usuários.
Execute este script para atualizar o banco de dados existente.
"""

from app import create_app, db
from sqlalchemy import text

def run_migration():
    app = create_app()
    with app.app_context():
        print("Iniciando migração para adicionar campos de XP...")
        
        # Verificar se as colunas já existem
        try:
            # Adicionar coluna xp
            db.session.execute(text('ALTER TABLE users ADD COLUMN xp INT DEFAULT 0'))
            print("Coluna 'xp' adicionada com sucesso.")
        except Exception as e:
            print(f"Coluna 'xp' já existe ou erro: {str(e)}")
        
        try:
            # Adicionar coluna level
            db.session.execute(text('ALTER TABLE users ADD COLUMN level INT DEFAULT 1'))
            print("Coluna 'level' adicionada com sucesso.")
        except Exception as e:
            print(f"Coluna 'level' já existe ou erro: {str(e)}")
        
        try:
            # Adicionar coluna last_xp_grant
            db.session.execute(text('ALTER TABLE users ADD COLUMN last_xp_grant DATE DEFAULT NULL'))
            print("Coluna 'last_xp_grant' adicionada com sucesso.")
        except Exception as e:
            print(f"Coluna 'last_xp_grant' já existe ou erro: {str(e)}")
        
        db.session.commit()
        print("Migração concluída com sucesso!")

if __name__ == "__main__":
    run_migration()