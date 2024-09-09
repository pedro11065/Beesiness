from src import create_app
from flask_cors import CORS
from flask import render_template

app = create_app()

CORS(app)  # O CORS é um sistema de segurança das requisições HTTP que verifica o método da API antes de chamá-lo.
app.app_context().push()
 
@app.errorhandler(404) # Manipulador para o erro 404
def page_not_found(e):
    return render_template('errors/404.html'), 404

if __name__ == '__main__':
    # Apenas irá rodar o aplicativo caso você inicie o arquivo main. 
    # Se não houvesse essa verificação, até mesmo uma importação desse arquivo iria rodar o programa.
    app.run(debug=True)  # É oq ativa ou não as 200 msgs de get, post e bla bla bla no terminal
 