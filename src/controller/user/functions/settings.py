from flask import jsonify
from flask_login import current_user
from src import cache
from colorama import Fore, Style

from werkzeug.security import check_password_hash, generate_password_hash
from src.model.database.user.search import db_search_user
from src.model.database.user.update import db_update_user
from src.model.validation.user.validate import validate_cpf_and_email


def process_settings(data):
    password = (data or {}).get('password') or ''
    name = ((data or {}).get('name') or '').strip()
    cpf = ((data or {}).get('cpf') or '').strip()
    email = ((data or {}).get('email') or '').strip()
    new_password = (data or {}).get('new_password') or ''

    user_db = db_search_user(current_user.id)
    if not user_db:
        return jsonify({'success': False, 'message': 'Usuário não encontrado.'}), 404

    password_hash = user_db['password_hash']

    if not check_password_hash(password_hash, password):
        return jsonify({'success': False, 'password_error': 'Senha atual incorreta.'}), 200

    errors, cpf_error, email_error = validate_cpf_and_email(cpf, email)
    if errors:
        print(Fore.GREEN + '\n[Atualização de dados] ' + Fore.RED + f'Erro(s): {errors}' + Style.RESET_ALL)
        return jsonify({'success': False, 'cpf_error': cpf_error, 'email_error': email_error}), 200

    hashed_password = generate_password_hash(new_password) if new_password else password_hash

    updated = db_update_user(current_user.id, name, cpf, email, hashed_password)
    if updated is False:
        return jsonify({'success': False, 'message': 'Erro ao atualizar os dados no banco.'}), 500

    current_user.fullname = name
    current_user.cpf = cpf
    current_user.email = email
    cache.delete(f'user_{current_user.id}')

    return jsonify({
        'success': True,
        'name': name,
        'email': email,
        'cpf': cpf,
    }), 200
