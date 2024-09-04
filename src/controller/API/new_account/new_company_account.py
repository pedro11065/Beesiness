from flask import Blueprint, request, jsonify
from flask_login import login_user, current_user

from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.user_models import User
from src.model.database.db_companies.create_company import db_create_company
from src.model.verifications.new_account.new_company_account_verify import verify_all

api_new_company_account = Blueprint('api_new_company_account', __name__)

@api_new_company_account.route('/create_company_account', methods=['POST'])
def create_company():
    create_data = request.get_json()

    cpf = create_data.get('cpf')
    nome = create_data.get('nome')
    email = create_data.get('email')
    cnpj = create_data.get('cnpj')
    senha = create_data.get('senha')

    print(Fore.GREEN + '[API Empresa - Registro] ' + Style.RESET_ALL +
           f'\nOs dados recebidos foram:\nNome: {nome}\nCpf: {cpf}\nE-mail: {email}\nCnpj: {cnpj}\nSenha: {senha}\n')

    verified, errors, errors_classes = verify_all(cpf, email, cnpj, senha) 
    #true ou false,quais foram os erros, tipo do erro (email, cnpj, cpf ou senha)

    if verified == True:

        hashed_password = generate_password_hash(senha)
        user_id = current_user.get_id()

        db_create_company(nome, user_id, email, cnpj, hashed_password)

        print(Fore.GREEN + '[API Empresa - Registro] ' + Style.RESET_ALL + f'Registrada com sucesso!') 
        
        return jsonify({"register": "True"}), 200
    
    return jsonify({"register": False, "error":errors, "classe":errors_classes}), 400