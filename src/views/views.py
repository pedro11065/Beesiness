from flask import Blueprint, render_template
import os
# Blueprint é uma maneira de separar a rota do nosso site sem precisar deixar tudo em apenas um arquivo. 

views = Blueprint('views', __name__, template_folder='templates', static_folder='static') #Sempre que declarar uma Blueprint lembre de importar estes arquivos no __init__py.

@views.route('/')
def home():
    return render_template("home.html");