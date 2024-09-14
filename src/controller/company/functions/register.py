
""" PEDRO, PRESTE ATENÇÃO!!!

    Este arquivo tem que estar igual ao dos usuários, o redirect tem que ser no javascript e nós devemos apenas retornar o json.
    Caso tenha dúvidas, se baseie nos outros arquivos.

"""

from flask import Blueprint, request, redirect, render_template, jsonify
from flask_login import login_user, current_user

from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.user_model import User
from src.model.database.company.companies.create import db_create_company
from src.model.validation.company.new_account  import verify_all

def process_registration(data):
    name = data.get('name')
    email = data.get('email')
    cnpj = data.get('cnpj')
    senha = data.get('password')

    hashed_password = generate_password_hash(senha)

    print(Fore.GREEN + '\n[API Empresa - Registro] ' + Style.RESET_ALL +
           f'\nOs dados recebidos foram:\nNome: {name}\nE-mail: {email}\nCnpj: {cnpj}\nSenha em hash: {hashed_password}\n')

    errors, email_error, cnpj_error  = verify_all(cnpj, email) # Retorna se houve erro e o erro específico de cada categoria.

    if errors:
        print(Fore.GREEN + '\n[API Empresa - Registro] ' + Fore.RED + f'Erro(s): Cnpj: {cnpj_error} - E-mail: {email_error}' + Style.RESET_ALL) 
        return jsonify({"register": False, "cnpj_error": cnpj_error, "email_error": email_error}), 200
    else:
        user_id = current_user.get_id()
        db_create_company(name, user_id, email, cnpj, hashed_password)

        return jsonify({"register": True, "cnpj_error": cnpj_error, "email_error": email_error}), 200
    

