from flask import Flask
from flask_login import LoginManager
from colorama import Fore, Style

from src.model.database.user.search_user import db_search_user
from src.model.user_model import User

# Criação do LoginManager fora da função create_app
login_manager = LoginManager()
login_manager.login_view = 'auth_user.login' # A rota de login.

@login_manager.user_loader
def load_user(user_id):
    user_data = db_search_user(user_id) 
    if(user_data):
        return User(
        id = user_data['id'],
        fullname = user_data['fullname'],
        cpf = user_data['cpf'],
        email = user_data['email'],
        password_hash = user_data['password_hash']
        )
    return None

def create_app():
    app = Flask(__name__, static_folder='views/static', template_folder='views/templates')
    app.config['SECRET_KEY'] = 'chave_secreta_nome' # Responsável por encriptar os cookies e session data (Ainda não utilizado)

    login_manager.init_app(app)  # Inicializa o LoginManager com a aplicação Flask

    from .controller.views import views
    from .controller.errors.errors_request import errors
    from .controller.user.user_request import user_request
    from .controller.company.company_request import company_request

    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(errors, url_prefix='/')
    app.register_blueprint(user_request, url_prefix='/')
    app.register_blueprint(company_request, url_prefix='/')

    return app;

