from flask import Blueprint, request, jsonify
from flask_login import login_user
from werkzeug.security import generate_password_hash
from colorama import Fore, Style


from src.model.user_models import User
from src.model.database.db_log.create_log import db_create_log
from src.model.database.db_companies.create_company import db_create_company
from src.model.verifications.new_account.new_company_account_verify import verify_all

# Ainda falta adicionar a api no src/__init__.py, criar as verificações e o .js (usar o postman)
api_new_company_account = Blueprint('api_new_company_account', __name__)

@api_new_company_account.route('/create_company_account', methods=['POST'])
def create_company():
    create_data = request.get_json() # {"cpf": "51343079039", "nome": "beesiness", "email": "pedrohenriquesilvaquixabeira@gmail.com", "cnpj": "71572904000130", "senha": "PedroPy13."}
    cpf = create_data.get('cpf')
    nome = create_data.get('nome')
    email = create_data.get('email')
    cnpj = create_data.get('cnpj')
    senha = create_data.get('senha')

    print(Fore.GREEN + '[Empresa - Registro] ' + Style.RESET_ALL +
           f'Os dados recebidos foram:\nNome: {nome}\nCpf: {cpf}\nE-mail: {email}\nCnpj: {cnpj}\nSenha: {senha}')

    db_create_log(message=f'[Chamada/API - new_company_account] Dados de identificação - Cnpj: {cnpj}, Cpf: {cpf} e Email: {email}')

    verified = verify_all(cpf, email, cnpj, senha) 

    if verified[0] == True:
        hashed_password = generate_password_hash(senha)
        print(login_user)

        user_id = ??????????????? #qual é o user id da sessão?

        db_create_company(nome, user_id, email, cnpj, hashed_password);
        print(Fore.GREEN + '[API Empresa - Registro] ' + Style.RESET_ALL + f'Registrada com sucesso!') 
        db_create_log(message = f'A empresa ({cnpj}) foi registrada com sucesso!')
        
        return jsonify({"register": "True"}), 200
