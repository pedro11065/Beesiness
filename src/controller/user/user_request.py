from flask import Blueprint, Flask, flash, get_flashed_messages, request, render_template, redirect, session, url_for
from flask_login import login_user, logout_user, current_user, login_required

from src.controller.user.functions.login import process_login
from src.controller.user.functions.register import process_registration

#tudo aqui é: /user...

user_request = Blueprint('auth_user', __name__, template_folder='templates', static_folder='static')

# -------------------------------------------------------------------------------------

@user_request.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        return process_login()
    messages = get_flashed_messages()
    return render_template('user/login.html', messages=messages)

# -------------------------------------------------------------------------------------

@user_request.route('/register', methods=['GET', 'POST'])
def register():
    print("Entrou no register")
    if request.method == 'POST':
        return process_registration()
    messages = get_flashed_messages()
    return render_template('user/user_register.html', messages=messages)

# -------------------------------------------------------------------------------------

@user_request.route('/forget-password')
def forget_password():
    return render_template("user/forget_password.html")

# -------------------------------------------------------------------------------------

@user_request.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth_user.login'))  


