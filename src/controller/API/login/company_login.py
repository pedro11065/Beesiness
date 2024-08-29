import os
from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash

from src.model.database.db_log.create_log import db_create_log
from src.model.verifications.login.company_login_verify import company_login_verify

api_company_login = Blueprint('api_company_login', __name__)

@api_company_login.route('/company_login', methods=['POST'])
def login():
    search_data = request.get_json()

    # Tenta obter o email e senha do JSON, caso contrário, usa username e password.
    cnpj = search_data.get('cnpj') ; senha = search_data.get('senha')

    os.system('cls' if os.name == 'nt' else 'clear')#limpar terminal
    print("*******************************************************************")
    print("\n----- login empresa -----\n")
    print(f'Dados recebidos: \n\n//{cnpj}//\n{senha}//')

    #hashed_password = check_password_hash(senha);

    # Verifica o login

    message =  (f'Chamada APi company_login --- Dados recebidos: // cnpj:{cnpj} // senha:{senha} //') ; db_create_log(message)
    
    login_valid, login_errors = company_login_verify(cnpj, senha) #mesma coisa que o login do usuário, puxa no banco de dados e compara

    if login_valid:
        print("Login realizado com sucesso!"); message =  ('Login de empresa realizado com sucesso!') ; db_create_log(message)
        return jsonify({"login": "True"}), 200
    else:
        print(f'Erros durante o login: {login_errors}') # Log dos erros
        return jsonify({"quant_erros": len(login_errors), "erros": login_errors}), 400
    