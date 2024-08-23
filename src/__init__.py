from flask import Flask

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'chave_secreta_nome' #Responsável por encriptar os cookies e session data (Ainda não utilizado).

    from .views.views import views
    from .views.auth import auth
    
    app.register_blueprint(views, url_prefix='/')
    app.register_blueprint(auth, url_prefix='/')

    return app;