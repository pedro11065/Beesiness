from flask import Blueprint, Flask, flash, get_flashed_messages, request, render_template, redirect, session, url_for
from flask_login import login_user, logout_user, current_user, login_required
from werkzeug.security import generate_password_hash
from datetime import datetime

from src.model.database.user.search_user import db_search_user
from src.model.database.user.create_user import db_create_user
from src.model.validation.user.validate import validate_cpf_and_email
from src.model.user_model import User

auth_user = Blueprint('auth_user', __name__, template_folder='templates', static_folder='static')

# Aba de logar, tanto com o GET (mostrar a aba), tanto com o POST (para receber os dados).
@auth_user.route('/user-login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['username']
        password = request.form['password']

        # Faltou o visual: Chamar função para verificar e-mail para saber se existe no banco de dados.
                            # - Se não existir: E-mail não existe.
                            # - Se existir mas senha estiver errada: Senha errada.

        user_data = db_search_user(email)

        if(user_data):
            user = User( # Cria uma instância do User a partir do dicionário retornado
            id = user_data['id'],
            fullname = user_data['fullname'],
            cpf = user_data['cpf'],
            email = user_data['email'],
            password_hash = user_data['password_hash']
            )

            login_user(user)
            return redirect('/dashboard');

    return render_template('login.html')

# Aba de registrar, tanto com o GET (mostrar a aba), tanto com o POST (para receber os dados).
@auth_user.route('/user-register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['fullName']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirmPassword']
        cpf = request.form['cpf']
        birth_date = request.form['birthDate']

        # Transformando a data de 2006-04-29 para 29/04/2006
        data_nascimento = datetime.strptime(birth_date, '%Y-%m-%d') # Converte a string para um objeto datetime
        birth_date = data_nascimento.strftime('%d/%m/%Y') # Converte o objeto datetime para o formato 'DD/MM/YYYY'

        errors = validate_cpf_and_email(cpf, email)

        if errors:  # Se houver erros, adicione-os ao flash e redirecione
            for error in errors:
                flash(error, 'error')
            return redirect(url_for('auth_user.register'))  # Redireciona para a página de registro
        else:
            hashed_password = generate_password_hash(password)
        
            db_create_user(name, cpf, email, hashed_password, birth_date)
            return redirect('/user-login')

    # Recuperar mensagens de erro
    messages = get_flashed_messages()
    return render_template('register.html', messages=messages)

@auth_user.route('/user-forget-password')
def forget_password():
    return render_template("password.html")

@auth_user.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth_user.login'))  


