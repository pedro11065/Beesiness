
""" PEDRO, PRESTE ATENÇÃO!!!

    Este arquivo tem que estar igual ao dos usuários, o redirect tem que ser no javascript e nós devemos apenas retornar o json.
    Caso tenha dúvidas, se baseie nos outros arquivos.

"""

from flask import Blueprint, request, redirect, render_template
from flask_login import login_user, current_user

from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.user_model import User
from src.model.database.company.companies.create import db_create_company
from src.model.validation.company.new_account  import verify_all

def process_registration(data):

    nome = data.get('nomeEmpresa')
    email = data.get('email')
    cnpj = data.get('cnpj')
    senha = data.get('password')

    hashed_password = generate_password_hash(senha)

    print(Fore.GREEN + '\n[API Empresa - Registro] ' + Style.RESET_ALL +
           f'\nOs dados recebidos foram:\nNome: {nome}\nE-mail: {email}\nCnpj: {cnpj}\nSenha em hash: {hashed_password}\n')

    verified, errors, errors_classes = verify_all(email, cnpj, senha) # Retorna true ou false, e os erros que ocorreram, por exemplo email e cnpj já existente.

    if verified:
        user_id = current_user.get_id()

        db_create_company(nome, user_id, email, cnpj, hashed_password)

        return redirect('/dashboard/')
    
    return redirect('/company/register')
    


