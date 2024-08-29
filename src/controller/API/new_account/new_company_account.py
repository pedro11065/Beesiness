# ainda falta adicionar a api no src/__init__.py, criar as verificações e o .js (usar o postman)

import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from src.model.database.db_companies.create_company import db_create_company
from src.model.verifications.new_account.user_new_company_verify import verify_all

api_new_company_account = Blueprint('api_new_company_account', __name__)

@api_new_company_account.route('/create_company_account', methods=['POST'])
def create_company():
    create_data = request.get_json() # {"cpf": "51343079039", "nome": "beesiness", "email": "pedrohenriquesilvaquixabeira@gmail.com", "cnpj": "71572904000130", "senha": "PedroPy13."}
    cpf = create_data.get('cpf')
    nome = create_data.get('nome')
    email = create_data.get('email')
    cnpj = create_data.get('cnpj')
    senha = create_data.get('senha')

    os.system('cls')#limpar terminal
    print("*******************************************************************")
    print("\n----- Registro empresa -----\n")
    print(f'Dados recebidos:\n\n//{nome}//\n{cpf}//\n{email}//\n{cnpj}//\n{senha}//')

    verified = verify_all(cpf, email, cnpj, senha) 

    # CPF - Verifica se esse CPF está no banco de dados, e se estiver, pegar o id do dono desse cpf
    # Email - Usa o mesmo verificador de mail do registro de usuário
    # cnpj - Vamo ter que criar (emoji chorando)
    # senha - Mesma validação 

    #ideia - Modular todas validações para que elas possam ser reutilizadas para que não tenha que compiar a validação da senha por exemplo.
    # senha_verify.py; cnpj_verify.py...assim por diante. Nem é mto dificil, só copiar o pronto e tacalhe import no verify_all

    if verified == True:
        #hashed_password = generate_password_hash(senha)
        db_create_company(nome, cpf, email, cnpj, senha); print("Empresa criada com sucesso!")
        return jsonify({"verify": "True"}), 200
    else:
        return jsonify({"quant_erros": verified[1], "erros": verified[0]}), 400