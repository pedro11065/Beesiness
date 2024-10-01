from src.model.database.user.search import db_search_user
from flask_login import current_user

def validate_cpf_and_email(cpf, email):
    errors = [] 
    cpf_error = False
    email_error = False
    
   # Verifica se o CPF já existe no banco e compara com o CPF do usuário atual
    existing_cpf = db_search_user(cpf)
    if existing_cpf:
        if current_user.is_authenticated: # Checa se ele já está logado (Visto que este código é usado para registrar ou na tela de configurações)
            if existing_cpf['cpf'] != current_user.cpf:
                errors.append('CPF já cadastrado.')
                cpf_error = True
        else:
            errors.append('CPF já cadastrado.')

    # Verifica se o e-mail já existe no banco e compara com o e-mail do usuário atual
    existing_email = db_search_user(email)
    if existing_email:
        if current_user.is_authenticated:
            if existing_email['email'] != current_user.email:
                errors.append('E-mail já cadastrado.')
                email_error = True
        else:
            errors.append('E-mail já cadastrado.')

    if errors == []:
        errors == False
    else: 
        errors == True
    
    return errors, cpf_error, email_error