from flask import Blueprint, request, jsonify
from src.model.database.db_users.create_user import db_create_user
from src.model.verifications.new_account.new_account_verify import verify_all

api_new_account = Blueprint('api_new_account', __name__)
@api_new_account.route('/create_account', methods=['POST'])
def create_account():
    create_data = request.get_json()  # Dados inseridos pelo usuário - nome/email/senha/datadenascimento

    nome = create_data.get('nome')
    print(f'nome: {nome}')
    print(f'Create_data no request do json: {create_data}\n')
    create_data = [create_data['nome'], create_data['email'], create_data['senha'], create_data['datadenascimento']]
    print(f'Create_data depois: {create_data}\n')

    verified = verify_all(create_data)

    # Retorno
    if verified == True:
        db_create_user(create_data)
        return jsonify({"verify": "True"}), 200
    else:
        print(verified)
        return jsonify({"quant_erros": verified[0], "erros": verified[1]}), 400
