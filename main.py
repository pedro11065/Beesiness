from src import create_app
from flask_cors import CORS
from flask import render_template
import os

app = create_app()

CORS(app)  # Ativa CORS na aplicação
app.app_context().push()

@app.errorhandler(404)  # Manipulador para erro 404
def page_not_found(e):
    return render_template('errors/404.html'), 404

@app.errorhandler(403)  # Manipulador para erro 403
def page_permission(e):
    return render_template('errors/403.html'), 403

if __name__ == '__main__':
    # Se a variável DOCKER_ENV existir, roda no Docker; senão, roda localmente.
    host = "0.0.0.0" if os.getenv("DOCKER_ENV") else "127.0.0.1"
    port = int(os.getenv("PORT", 5000))  # Permite definir a porta via variável de ambiente
    debug = not os.getenv("DOCKER_ENV")  # Desativa debug automaticamente no Docker
    
    app.run(host=host, port=port, debug=debug)
