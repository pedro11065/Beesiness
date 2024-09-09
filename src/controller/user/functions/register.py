from datetime import datetime
from flask import request, jsonify
from werkzeug.security import generate_password_hash
from src.model.database.user.create_user import db_create_user
from src.model.validation.user.validate import validate_cpf_and_email
from colorama import Fore, Style

def process_registration():

    create_data = request.get_json()
     
    name = create_data.get('fullname')
    cpf = create_data.get('cpf')
    email = create_data.get('email')
    password = create_data.get('password')
    data_nascimento = create_data.get('bithDate')

    # Transformando a data de 2006-04-29 para 29/04/2006

    errors = validate_cpf_and_email(cpf, email)

    if errors: # Se houver erros, adicione-os ao flash e redirecione

        print(Fore.GREEN + '\n[API Usuário - Registro] ' + Fore.RED + f'Erro(s):{errors} + Style.RESET_ALL') 
        return jsonify({"count_error":len(errors), "register": False, "error":errors}), 400
    
    else:
        hashed_password = generate_password_hash(password)
        db_create_user(name, cpf, email, hashed_password, data_nascimento)
        print(Fore.GREEN + '[API Usuário - Registro] ' + Style.RESET_ALL + 'Registrado com sucesso!')
        return jsonify({"register": True}), 200