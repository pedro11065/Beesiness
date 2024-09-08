from flask import Blueprint, request, redirect, render_template
from flask_login import login_user, current_user

from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.user_model import User
from src.model.database.company.companies.create_company import db_create_company
from src.model.validation.company.new_account  import verify_all

def process_registration(data):

    nome = data.get('nomeEmpresa')
    email = data.get('email')
    cnpj = data.get('cnpj')
    senha = data.get('password')

    print(Fore.GREEN + '\n[API Empresa - Registro] ' + Style.RESET_ALL +
           f'\nOs dados recebidos foram:\nNome: {nome}\nE-mail: {email}\nCnpj: {cnpj}\nSenha: {senha}\n')

    verified, errors, errors_classes = verify_all(email, cnpj, senha) # Retorna true ou false, e os erros que ocorreram, por exemplo email e cnpj já existente.

    if verified == True:

        hashed_password = generate_password_hash(senha)
        user_id = current_user.get_id()

        db_create_company(nome, user_id, email, cnpj, hashed_password)

        return redirect('company/dashboard')
    
    return redirect('company/company-register')
    


