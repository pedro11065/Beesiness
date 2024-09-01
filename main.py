from src import create_app
from flask_cors import CORS

app = create_app()
CORS(app)  # O CORS é um sistema de segurança das requisições HTTP que verifica o método da API antes de chamá-lo.

app.app_context().push()

if __name__ == '__main__':
    # Apenas irá rodar o aplicativo caso você inicie o arquivo main. 
    # Se não houvesse essa verificação, até mesmo uma importação desse arquivo iria rodar o programa.
    app.run(debug=True)  # Inicia o servidor web. O debug faz com que a cada alteração no código, o servidor seja reiniciado automaticamente.
