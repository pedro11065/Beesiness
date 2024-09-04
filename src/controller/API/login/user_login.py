from flask import Blueprint, request, redirect, url_for, jsonify
from flask_login import login_user
from werkzeug.security import check_password_hash
from colorama import Fore, Style

from src.model.database.db_log.create_log import db_create_log
from src.model.database.db_users.search_user import db_search_user
from src.model.user_models import User

api_user_login = Blueprint('api_user_login', __name__)

@api_user_login.route('/user_login', methods=['POST'])
def login_post():
    login_data = request.get_json()

    email_cpf = login_data.get('email_cpf')
    password = login_data.get('senha')

    print(Fore.BLUE + '[API Login] ' + Style.RESET_ALL + f'Pesquisa iniciada')

    user_data = db_search_user(email_cpf)
    if not user_data:
        print(Fore.BLUE + '[API Login] ' + Style.RESET_ALL + f'Email ou CPF nã encotrado')       
        return jsonify({'error': 'Email ou CPF não encontrado'}), 400

    if user_data and check_password_hash(user_data['password_hash'], password) == True:
        user = User( # Cria uma instância do User a partir do dicionário retornado
            id=user_data['id'],
            email=user_data['email'],
            cpf=user_data['cpf'],
            password_hash=user_data['password_hash']
        )
        login_user(user)
        print(Fore.BLUE + '[API Login] ' + Style.RESET_ALL + f'Usuário logado com sucesso!')
        return jsonify({'login':True}), 200
    
    print(Fore.BLUE + '[API Login] ' + Style.RESET_ALL + f'Login mal sucedido, senha incorreta')
    return jsonify({'error': 'Senha incorreta'}), 400 

    
