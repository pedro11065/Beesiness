# ainda falta adicionar a api no src/__init__.py, criar as verificações e o .js (usar o postman)

import os
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash

from src.model.database.db_log.create_log import db_create_log
from src.model.verifications.login.user_login_verify import user_login_verify

api_user_login = Blueprint('api_user_login', __name__)

@api_user_login.route('/user_login', methods=['POST'])
def login():
    search_data = request.get_json()

    # Tenta obter o email e senha do JSON, caso contrário, usa username e password.
    email_cpf = search_data.get('email_cpf') or search_data.get('username')
    senha = search_data.get('senha') or search_data.get('password')

    os.system('cls' if os.name == 'nt' else 'clear')#limpar terminal
    print("*******************************************************************")
    print("\n----- login usuário -----\n")
    (f'Dados recebidos: \n\n//{email_cpf}//\n{senha}//')
    #hashed_password = check_password_hash(senha);
    
    message =  (f'Chamada APi user_login --- Dados recebidos: // Email:{email_cpf} // Senha:{senha} //') ; db_create_log(message)

    # Verifica o login
    login_valid, login_errors = user_login_verify(email_cpf, senha)

    if login_valid:
        print("Login realizado com sucesso!") ; message =  ('Login de usuário realizado com sucesso!') ; db_create_log(message)
        return jsonify({"login": "True"}), 200
    else:
        print(f'Erros durante o login: {login_errors}') # Log dos erros
        return jsonify({"quant_erros": len(login_errors), "erros": login_errors}), 400
    