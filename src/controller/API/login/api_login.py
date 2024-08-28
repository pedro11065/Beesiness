from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash

from src.model.verifications.login.login_verify import login_verify

api_login = Blueprint('api_login', __name__)

@api_login.route('/login', methods=['POST'])
def login():
    search_data = request.get_json()

    # Tenta obter o email e senha do JSON, caso contrário, usa username e password.
    email_cpf = search_data.get('email_cpf') or search_data.get('username')
    senha = search_data.get('senha') or search_data.get('password')

    #hashed_password = check_password_hash(senha);

    # Verifica o login
    login_valid, login_errors = login_verify(email_cpf, senha)

    if login_valid:
        return jsonify({"login": "True"}), 200
    else:
        print(f'Erros durante o login: {login_errors}') # Log dos erros
        return jsonify({"quant_erros": len(login_errors), "erros": login_errors}), 400
    