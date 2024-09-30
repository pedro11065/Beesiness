from flask import jsonify
from flask_login import current_user
from src import cache

from werkzeug.security import check_password_hash, generate_password_hash
from src.model.database.user.search import db_search_user
from src.model.database.user.update import db_update_user

def process_settings(data):
    password = data['password']

    password_db = db_search_user(current_user.id)
    password_hash = password_db['password_hash']

    check_status = check_password_hash(password_hash, password)

    if check_status:
        db_update_user(current_user.id, data['name'], data['cpf'], data['email'], generate_password_hash(data['new_password']))

        cache.delete(f'user_{current_user.id}')

        return jsonify({"success": True, "message": "Dados atualizados com sucesso."}), 200
    else:
        return jsonify({"success": False, "message": "Senha incorreta"}), 200