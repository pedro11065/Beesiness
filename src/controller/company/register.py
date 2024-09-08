from flask import Blueprint, request, jsonify
from flask_login import login_user, current_user

from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.user_model import User
from src.model.database.company.companies.create_company import db_create_company
from src.model.validation.company.new_account  import verify_all

def process_registration(data):

    nome = data.get('nome')
    email = data.get('email')
    cnpj = data.get('cnpj')
    senha = data.get('senha')

    print(Fore.GREEN + '\n[API Empresa - Registro] ' + Style.RESET_ALL +
           f'\nOs dados recebidos foram:\nNome: {nome}\nE-mail: {email}\nCnpj: {cnpj}\nSenha: {senha}\n')

    verified, errors, errors_classes = verify_all(email, cnpj, senha) 
    #true ou false,quais foram os erros, tipo do erro (email, cnpj, cpf ou senha)

    if verified == True:

        hashed_password = generate_password_hash(senha)
        user_id = current_user.get_id()

        db_create_company(nome, user_id, email, cnpj, hashed_password)

        print(Fore.GREEN + '\n[API Empresa - Registro] ' + Style.RESET_ALL + f'Empresa registrada com sucesso!')        
        return jsonify({"register": "True"}), 200
    
    print(Fore.GREEN + '\n[API Empresa - Registro] ' + Fore.RED + f'Erro(s):{errors}' + Style.RESET_ALL + ".") 
    return jsonify({"count_error":len(errors), "register":False, "error":errors, "class":errors_classes}), 400

    #por enquanto está retornando a os dados em .json, mas depois que o front estiver criado é só mudar para o necessário.