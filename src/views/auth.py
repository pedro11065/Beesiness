from flask import Blueprint, render_template
# Blueprint é uma maneira de separar a rota do nosso site sem precisar deixar tudo em apenas um arquivo. 

auth = Blueprint('auth', __name__, template_folder='templates', static_folder='static') #Sempre que declarar uma Blueprint lembre de importar estes arquivos no __init__py.

@auth.route('/login')
def login():
    return "<h1>PÁGINA DE LOGIN</h1>" #render_template("login.html");

@auth.route('/logout')
def logout():
    return "<p>Logout</p>"

@auth.route('/sign-up')
def sign_up():
    return "<p>Sign Up</p>"