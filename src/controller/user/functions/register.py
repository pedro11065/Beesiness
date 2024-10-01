from datetime import datetime
from flask import request, jsonify
from werkzeug.security import generate_password_hash
from src.model.database.user.create import db_create_user
from src.model.validation.user.validate import validate_cpf_and_email
from colorama import Fore, Style

def process_registration(create_data):
     
    name = create_data.get('fullName')
    cpf = create_data.get('cpf')
    email = create_data.get('email')
    password = create_data.get('password')
    data_nascimento = create_data.get('birthDate')

    errors, cpf_error, email_error = validate_cpf_and_email(cpf, email)

    if errors: # Se houver erros, adicione-os ao flash e redirecione
        print(Fore.GREEN + '\n[API Usuário - Registro] ' + Fore.RED + f'Erro(s): {errors}' + Style.RESET_ALL) 
        return jsonify({"register": False, "cpf_error": cpf_error, "email_error": email_error}), 200
    
    else:
        hashed_password = generate_password_hash(password)
        db_create_user(name, cpf, email, hashed_password, data_nascimento)
        print(Fore.GREEN + '[API Usuário - Registro] ' + Style.RESET_ALL + 'Registrado com sucesso!')
        return jsonify({"register": True}), 200