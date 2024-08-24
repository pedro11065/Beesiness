from flask import Blueprint, render_template
# Blueprint é uma maneira de separar a rota do nosso site sem precisar deixar tudo em apenas um arquivo. 

auth = Blueprint('auth', __name__, template_folder='templates', static_folder='static') #Sempre que declarar uma Blueprint lembre de importar estes arquivos no __init__py.

@auth.route('/login')
def login():
    return render_template("login.html");

@auth.route('/sign-up')
def sign_up():
    return render_template("registro.html");

@auth.route('/forget-password')
def forget_password():
    return render_template("senha.html")

@auth.route('/logout')
def logout():
    return "<p>Logout</p>"

