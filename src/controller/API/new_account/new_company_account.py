from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.database.db_log.create_log import db_create_log
from src.model.database.db_companies.create_company import db_create_company
from src.model.verifications.new_account.new_company_account_verify import verify_all

# Ainda falta adicionar a api no src/__init__.py, criar as verificações e o .js (usar o postman)
api_new_company_account = Blueprint('api_new_company_account', __name__)

@api_new_company_account.route('/create_company_account', methods=['POST'])
def create_company():
    create_data = request.get_json() # {"cpf": "51343079039", "nome": "beesiness", "email": "pedrohenriquesilvaquixabeira@gmail.com", "cnpj": "71572904000130", "senha": "PedroPy13."}
    cpf = create_data.get('cpf')
    nome = create_data.get('nome')
    email = create_data.get('email')
    cnpj = create_data.get('cnpj')
    senha = create_data.get('senha')

    print(Fore.GREEN + '[Empresa - Registro] ' + Style.RESET_ALL + f'Os dados recebidos foram:\nNome: {nome}\nCpf: {cpf}\nE-mail: {email}\nCnpj: {cnpj}\nSenha: {senha}')


    message = (f'[Chamada/API - new_company_account] Dados de identificação - Cnpj: {cnpj}, Cpf: {cpf} e Email: {email}');
    db_create_log(message)

    verified = verify_all(cpf, email, cnpj, senha) 

    # CPF - Verifica se esse CPF está no banco de dados, e se estiver, pegar o id do dono desse cpf
    # Email - Usa o mesmo verificador de mail do registro de usuário
    # cnpj - Vamo ter que criar (emoji chorando)
    # senha - Mesma validação 

    #ideia - Modular todas validações para que elas possam ser reutilizadas para que não tenha que compiar a validação da senha por exemplo.
    # senha_verify.py; cnpj_verify.py...assim por diante. Nem é mto dificil, só copiar o pronto e tacalhe import no verify_all

    if verified == True:
        #hashed_password = generate_password_hash(senha)
        db_create_company(nome, cpf, email, cnpj, senha);
        print(Fore.GREEN + '[Empresa - Registro] ' + Style.RESET_ALL + f'Registrada com sucesso!');

        message =  message =  (f'A empresa ({cnpj}) foi registrada com sucesso!');
        db_create_log(message)
        return jsonify({"verify": "True"}), 200
    else:
        return jsonify({"quant_erros": verified[1], "erros": verified[0]}), 400