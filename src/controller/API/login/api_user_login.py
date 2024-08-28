from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash

from src.model.verifications.login.user_login_verify import user_login_verify

api_user_login = Blueprint('api_user_login', __name__)

@api_user_login.route('/user_login', methods=['POST'])
def login():
    search_data = request.get_json()

    # Tenta obter o email e senha do JSON, caso contrário, usa username e password.
    email_cpf = search_data.get('email_cpf') or search_data.get('username')
    senha = search_data.get('senha') or search_data.get('password')

    #hashed_password = check_password_hash(senha);

    # Verifica o login
    login_valid, login_errors = user_login_verify(email_cpf, senha)

    if login_valid:
        return jsonify({"login": "True"}), 200
    else:
        print(f'Erros durante o login: {login_errors}') # Log dos erros
        return jsonify({"quant_erros": len(login_errors), "erros": login_errors}), 400
    