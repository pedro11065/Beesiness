from flask import Blueprint, request, render_template, redirect, session
from flask_login import logout_user, login_required, current_user
from src import cache

from src.controller.user.functions.login import process_login
from src.controller.user.functions.register import process_registration
from src.controller.user.functions.settings import process_settings

# Tudo aqui é: /user...

user_request = Blueprint('auth_user', __name__, template_folder='templates', static_folder='static')

# -------------------------------------------------------------------------------------

@user_request.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        return process_login(data)
    
    if request.method == 'GET':
        return render_template('user/login.html')

# -------------------------------------------------------------------------------------

@user_request.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        create_data = request.get_json()
        return process_registration(create_data)
    
    if request.method == 'GET':
        return render_template('user/register.html')

# -------------------------------------------------------------------------------------

@user_request.route('/forget-password')
def forget_password():
    return render_template("user/forget_password.html")

# -------------------------------------------------------------------------------------

@user_request.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        settings = request.get_json()
        return process_settings(settings)
        
    if request.method == 'GET':
        cache.delete(f'user_{current_user.id}')
        return render_template("user/settings.html")

# -------------------------------------------------------------------------------------

@user_request.route('/logout')
@login_required
def logout():
    cache.delete(f'user_{current_user.id}') # Deletar as entradas relacionadas ao usuário
    session.clear() # Limpa a sessão
    logout_user()
    return redirect('/')  


