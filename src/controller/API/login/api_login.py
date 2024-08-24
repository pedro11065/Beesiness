from flask import Blueprint, request, jsonify
from src.model.database.db_users.search_user import db_search_user
from src.model.verifications.login.login_verify import login_verify

api_login = Blueprint('api_login', __name__)

@api_login.route('/login', methods=['POST'])
def login():
    search_data = request.get_json()  # Os dados inseridos pelo usuário - email e senha
    search_data = [search_data['email'], search_data['senha']]

#--------------------------------------------------------------------RETORNO
    login_verify_answer = login_verify(search_data)

    if login_verify_answer == True:
        return jsonify({"login": "True"}), 200
    else:
        return jsonify({"quant_erros": login_verify_answer[0], "erros": login_verify_answer[1]}), 400
