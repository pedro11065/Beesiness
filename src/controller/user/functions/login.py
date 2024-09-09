from werkzeug.security import check_password_hash
from flask_login import login_user
from flask_login import login_user, current_user
from flask import request, redirect, render_template,jsonify

from src.model.database.user.search_user import db_search_user
from src.model.database.company.user_companies.search_user_company import db_search_user_company
from src.model.user_model import User

from colorama import Fore, Style

def process_login():

    data = request.get_json()

    email = data.get('email')
    password = data.get('senha')

    user_data = db_search_user(email)

    print(Fore.GREEN + '\n[API Usuário - Registro] ' + Style.RESET_ALL + f'Dados recebidos: \nEmail_cpf: {email}\nSenha: {password}')
    print(Fore.GREEN + '\n[API Login] ' + Style.RESET_ALL + f'Pesquisa iniciada')

    if user_data and check_password_hash(user_data['password_hash'], password):
        user = User(
            id=user_data['id'],
            fullname=user_data['fullname'],
            cpf=user_data['cpf'],
            email=user_data['email'],
            password_hash=user_data['password_hash']           
        )

        id = current_user.get_id()

        if db_search_user_company(id):

            print(Fore.GREEN + '\n[API Login] ' + Style.RESET_ALL + f'Usuário está relacionado a uma empresa!')
            return jsonify({'login':True, 'company':True}), 200
        
        print(Fore.GREEN + '\n[API Login] ' + Style.RESET_ALL + f'Usuário não está relacionado a uma empresa!')
        return jsonify({'login':True, 'company':False}), 200        

    
    print(Fore.GREEN + '\n[API Login] ' + Style.RESET_ALL + f'Login mal sucedido, senha incorreta ou email/cpf incorreto.')
    return jsonify({'login':False}), 502 