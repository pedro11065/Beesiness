from flask import Flask
from flask_login import LoginManager
from .model.user_models import User
from .model.database.db_users.search_user import db_search_user

def create_app():
    app = Flask(__name__, static_folder='views/static', template_folder='views/templates')
    app.config['SECRET_KEY'] = 'chave_secreta_nome' # Responsável por encriptar os cookies e session data (Ainda não utilizado).

    from flask_login import LoginManager

    login_manager = LoginManager()
    login_manager.login_view = 'auth.login' # A rota de login; auth.user_login
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        user_data = db_search_user(user_id) 
        if user_data:
            return User(
            id=user_data['id'],
            email=user_data['email'],
            cpf=user_data['cpf'],
            password_hash=user_data['password_hash']
            )
        return None

    from .views.views import views
    from .views.auth import auth
    from .controller.API.login.user_login import api_user_login
    from .controller.API.new_account.new_user_account import api_new_user_account
    from .controller.API.new_account.new_company_account import api_new_company_account
    
    # Blueprints essenciais para que as rotas funcionem!!
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(api_user_login, url_prefix='/api')
    app.register_blueprint(api_new_user_account, url_prefix='/api')
    app.register_blueprint(api_new_company_account, url_prefix='/api')
    
    return app;