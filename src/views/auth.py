from flask import Blueprint, render_template, redirect, url_for
from flask_login import login_required, logout_user, current_user
# Blueprint é uma maneira de separar a rota do nosso site sem precisar deixar tudo em apenas um arquivo. 

auth = Blueprint('auth', __name__, template_folder='templates', static_folder='static') #Sempre que declarar uma Blueprint lembre de importar estes arquivos no __init__py.

@auth.route('/user-login')
def login():
    return render_template("login.html");

@auth.route('/user-sign-up')
def sign_up():
    return render_template("registro.html");

@auth.route('/user-forget-password')
def forget_password():
    return render_template("senha.html")

@auth.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('auth.login'))
