from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from colorama import Fore, Style

from src.model.database.db_log.create_log import db_create_log
from src.model.verifications.login.company_login_verify import company_login_verify

api_company_login = Blueprint('api_company_login', __name__)

@api_company_login.route('/company_login', methods=['POST'])
def login():
    search_data = request.get_json()

    # Tenta obter o email e senha do JSON, caso contrário, usa username e password.
    cnpj = search_data.get('cnpj') ; senha = search_data.get('senha')

    print(Fore.GREEN + '[Empresa - Login] ' + Style.RESET_ALL + f'Os dados recebidos foram:\nCnpj: {cnpj}\nSenha: {senha}')

    #hashed_password = check_password_hash(senha);
    message =  (f'[Chamada/API - company_login] Dados recebidos - Cnpj: {cnpj}');
    db_create_log(message)
    
    # Verifica o login
    login_valid, login_errors = company_login_verify(cnpj, senha) # A mesma coisa que o login do usuário, compara com os valores no banco de dados.

    if login_valid:
        print(Fore.GREEN + '[Empresa - Login] ' + Style.RESET_ALL + f'Logado com sucesso!')
        message =  (f'A empresa ({cnpj}) logou com sucesso!');
        db_create_log(message)

        return jsonify({"login": "True"}), 200
    else:
        print(f'Erros durante o login: {login_errors}') # Log dos erros
        return jsonify({"quant_erros": len(login_errors), "erros": login_errors}), 400
    