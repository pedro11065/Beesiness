from flask import jsonify
from flask_login import current_user
from src import cache
from colorama import Fore, Style

from werkzeug.security import check_password_hash, generate_password_hash
from src.model.database.user.search import db_search_user
from src.model.database.user.update import db_update_user
from src.model.validation.user.validate import validate_cpf_and_email

def process_settings(data):
    password = data['password']

    # Buscar a senha hash do banco de dados
    password_db = db_search_user(current_user.id)
    password_hash = password_db['password_hash']

    # Verificar se a senha informada está correta
    check_status = check_password_hash(password_hash, password)

    if check_status:
        errors, cpf_error, email_error = validate_cpf_and_email(data['cpf'], data['email'])

        if errors:  # Se houver erros, adicione-os ao flash e redirecione
            print(Fore.GREEN + '\n[Atualização de dados] ' + Fore.RED + f'Erro(s): {errors}' + Style.RESET_ALL) 
            return jsonify({"success": False, "cpf_error": cpf_error, "email_error": email_error}), 200
        else:
            if 'new_password' in data and data['new_password']:
                hashed_password = generate_password_hash(data['new_password'])
            else:
                hashed_password = password_hash  # Usa a senha atual

            # Atualiza os dados do usuário no banco de dados
            db_update_user(current_user.id, data['name'], data['cpf'], data['email'], hashed_password)

            cache.delete(f'user_{current_user.id}')
            return jsonify({"success": True}), 200
    else:
        return jsonify({"success": False, "password_error": "Senha incorreta"}), 200
