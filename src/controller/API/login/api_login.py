from flask import Blueprint, request, jsonify
from src.model.verifications.login.login_verify import login_verify

api_login = Blueprint('api_login', __name__)

@api_login.route('/login', methods=['POST'])
def login():

    search_data = request.get_json() 
    try:
        search_data = [search_data['email'], search_data['senha']]
    except:
        search_data = [search_data['username'], search_data['password']] #tava dando um bug fudido que não mudava username para email POR NADA, entao fiz isso ai q dá no mesmo


#--------------------------------------------------------------------RETORNO
    login_verify_answer = login_verify(search_data)

    if login_verify_answer == True:
        return jsonify({"login": "True"}), 200
    else:
        print(login_verify_answer)
        return jsonify({"quant_erros": login_verify_answer[0], "erros": login_verify_answer[1]}), 400
