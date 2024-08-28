from flask import Flask

def create_app():
    app = Flask(__name__, static_folder='views/static', template_folder='views/templates')
    app.config['SECRET_KEY'] = 'chave_secreta_nome' # Responsável por encriptar os cookies e session data (Ainda não utilizado).

    from .views.views import views
    from .views.auth import auth
    from .controller.API.login.api_login import api_login
    from .controller.API.new_account.api_new_account import api_new_account
    
    # Blueprints essenciais para que as rotas funcionem!!
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')
    app.register_blueprint(api_login, url_prefix='/api')
    app.register_blueprint(api_new_account, url_prefix='/api')
    
    return app;