from flask import Blueprint, Flask, flash, get_flashed_messages, request, render_template, redirect, session, url_for
from flask_login import login_user, logout_user, current_user, login_required

from src.controller.user.login import process_login
from src.controller.user.register import process_registration

user_request = Blueprint('auth_user', __name__, template_folder='templates', static_folder='static')

# Aba de logar, tanto com o GET (mostrar a aba), tanto com o POST (para receber os dados).
@user_request.route('/user-login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        return process_login()
    return render_template('login.html')


# Aba de registrar, tanto com o GET (mostrar a aba), tanto com o POST (para receber os dados).
@user_request.route('/user-register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        return process_registration()
    messages = get_flashed_messages()
    return render_template('user_register.html', messages=messages)


#esqueci minha senha

@user_request.route('/user-forget-password')
def forget_password():
    return render_template("password.html")

#logout

@user_request.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth_user.login'))  


