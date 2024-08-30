from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from colorama import Fore, Style

from src.model.database.db_log.create_log import db_create_log
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

    hashed_password = generate_password_hash(senha);

    print(Fore.GREEN + '[Usuário - Registro] ' + Style.RESET_ALL + f'Os dados recebidos foram:\nNome: {nome}\nCpf: {cpf}\nEmail: {email}\nSenha com hash: {hashed_password}\nData de nascimento: {data_nascimento}\n')

    message = "[Chamada/API - new_user_account]";
    db_create_log(message);

    verified = verify_all(cpf, email, senha, data_nascimento)

    if verified == True:
        db_create_user(nome, cpf, email, hashed_password, data_nascimento); 

        print(Fore.GREEN + '[Usuário - Registro] ' + Style.RESET_ALL + f'Registrado com sucesso!')
        message = (f'O usuário ({cpf}) foi criado com sucesso!');
        db_create_log(message)
        return jsonify({"verify": "True"}), 200
    else:
        return jsonify({"quant_erros": verified[1], "erros": verified[0]}), 400