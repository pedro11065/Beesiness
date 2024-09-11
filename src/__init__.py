from flask import Flask
from flask_login import LoginManager
from flask_caching import Cache

from colorama import Fore, Style

from src.model.database.user.search import db_search_user
from src.model.user_model import User

# Criação do LoginManager fora da função create_app
login_manager = LoginManager()
login_manager.login_view = 'auth_user.login'  # A rota de login.

# Configuração do cache simples na memória
cache = Cache(config={'CACHE_TYPE': 'simple'})

@login_manager.user_loader
def load_user(user_id):
    # Verifica se o usuário já está em cache
    cached_user = cache.get(f'user_{user_id}')
    if cached_user:
        print(Fore.RED + f"[CACHE] " + Fore.GREEN + f"Usuário {user_id} carregado do cache." + Style.RESET_ALL)
        return cached_user

    # Se o usuário não estiver no cache, busca no banco de dados
    print(Fore.YELLOW + f"Carregando usuário {user_id} do banco de dados." + Style.RESET_ALL)
    user_data = db_search_user(user_id)
    if user_data:
        user = User(
            id=user_data['id'],
            fullname=user_data['fullname'],
            cpf=user_data['cpf'],
            email=user_data['email'],
            password_hash=user_data['password_hash']
        )
        cache.set(f'user_{user_id}', user, timeout=600) # Armazena o usuário no cache por 10 minutos (600 segundos)
        return user
    return None

def create_app():
    app = Flask(__name__, static_folder='views/static', template_folder='views/templates')
    app.config['SECRET_KEY'] = 'chave_secreta_nome'  # Responsável por encriptar os cookies e session data
    app.config['CACHE_TYPE'] = 'simple'  # Configuração de cache para Flask-Caching

    # Inicializa o cache com a aplicação
    cache.init_app(app)

    # Inicializa o LoginManager com a aplicação Flask
    login_manager.init_app(app)

    # Registro dos Blueprints
    from .controller.index import index
    from .controller.user.user_request import user_request
    from .controller.company.company_request import company_request
    from .controller.dashboard.dashboard_request import dashboard_request

    # Registra os Blueprints com os URLs corretamente definidos
    app.register_blueprint(index, url_prefix='/home' and '/')
    app.register_blueprint(user_request, url_prefix='/user')
    app.register_blueprint(company_request, url_prefix='/company')
    app.register_blueprint(dashboard_request, url_prefix='/dashboard')

    return app
