import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash

from src.model.database.db_users.create_user import db_create_user
from src.model.verifications.new_account.new_user_account_verify import verify_all

api_new_user_account = Blueprint('api_new_user_account', __name__)

@api_new_user_account.route('/create_user_account', methods=['POST'])
def create_account():
    create_data = request.get_json() # Dados retornam como {'nome': 'thiago', "cpf": "50774811803", 'email': 'teste@email.com', 'senha': '12345678', 'data_de_nascimento': '1990-05-30'}

    nome = create_data.get('nome')
    cpf = create_data.get('cpf')
    email = create_data.get('email')
    senha = create_data.get('senha')
    data_nascimento = create_data.get('data_de_nascimento')

    os.system('cls')#limpar terminal
    print("*******************************************************************")
    print("\n----- Registro usuário -----\n")
    print(f'Dados recebidos:\n\n//{nome}//\n{cpf}//\n{email}//\n{senha}//\n{data_nascimento}//')

    verified = verify_all(cpf, email, senha, data_nascimento)

    if verified == True:
        #hashed_password = generate_password_hash(senha)
        db_create_user(nome, cpf, email, senha, data_nascimento); print("Usuário criado com sucesso!")
        return jsonify({"verify": "True"}), 200
    else:
        return jsonify({"quant_erros": verified[1], "erros": verified[0]}), 400