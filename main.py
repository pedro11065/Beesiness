from src import create_app
from flask_cors import CORS

app = create_app();
CORS(app) #O CORS é um sistema de segurança das requisiçoes http, que verifica o metodo da API que vai ser chamada, antes de chamar, sem isso, não funciona.
app.app_context().push()
if __name__ == '__main__': #Apenas irá rodar o aplicativo caso você inicie o arquivo main. Caso não houvesse essa verificação, até mesmo uma importação desse arquivo iria rodar o programa.
    app.run(debug=True); #Responsável por inciiar o servidor web. O debug faz com que a cada alteração no código, o servidor web irá automaticamente reiniciar.