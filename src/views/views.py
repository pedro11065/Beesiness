from flask import Blueprint, render_template
from flask_login import login_required, current_user
# Blueprint é uma maneira de separar a rota do nosso site sem precisar deixar tudo em apenas um arquivo. 

views = Blueprint('views', __name__, template_folder='templates', static_folder='static') #Sempre que declarar uma Blueprint lembre de importar estes arquivos no __init__py.

@views.route('/')
def home():
    return render_template("home.html");

@views.route('/dashboard')
@login_required
def dashboard():
    print(f"Usuário (UUID) acessando o dashboard: {current_user.id}")
    return render_template('dashboard.html', user=current_user)