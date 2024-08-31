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

    # Busca o usuário no banco de dados
    user_data = db_search_user(email_cpf)
    #print(f"User_data: {user_data}")

    if not user_data:
        print(f"Email/CPF não foi encontrado")
        return jsonify({'error': 'Email/CPF não encontrado'}), 400

    # Verifica se o usuário foi encontrado e se a senha está correta
    if user_data and check_password_hash(user_data['password_hash'], password):
        user = User( # Cria uma instância do User a partir do dicionário retornado
            id=user_data['id'],
            email=user_data['email'],
            cpf=user_data['cpf'],
            password_hash=user_data['password_hash']
        )
        login_user(user)
        return redirect(url_for('views.dashboard'))
        
    # Se o login falhar, redireciona para a página de login novamente
    jsonify({'error': 'Senha incorreta'}), 400
    return redirect(url_for('auth.login'))
