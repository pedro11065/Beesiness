from flask import Blueprint, request, jsonify
from src.model.database.db_users.create_user import db_create_user
from src.model.verifications.new_account.new_account_verify import verify_all

api_new_account = Blueprint('api_new_account', __name__)

@api_new_account.route('/create_account', methods=['POST'])
def create_account():
    create_data = request.get_json() # Dados retornam como {'nome': 'thiago', 'email': 'teste@email.com', 'senha': '12345678', 'datadenascimento': '1990-05-30'}

    nome = create_data.get('nome')
    email = create_data.get('email')
    senha = create_data.get('senha')
    data_nascimento = create_data.get('datadenascimento')

    verified = verify_all(email, senha, data_nascimento)

    if verified == True:
        db_create_user(nome, email, senha, data_nascimento)
        return jsonify({"verify": "True"}), 200
    else:
        return jsonify({"quant_erros": verified[1], "erros": verified[0]}), 400