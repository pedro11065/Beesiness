from src.model.database.user.search import db_search_user
from flask_login import current_user

def validate_cpf_and_email(cpf, email):
    errors = [] 
    cpf_error = False
    email_error = False
    
   # Verifica se o CPF já existe no banco e compara com o CPF do usuário atual
    existing_cpf = db_search_user(cpf)
    if existing_cpf and existing_cpf['cpf'] != current_user.cpf:
        errors.append('CPF já cadastrado.')
        cpf_error = True

    # Verifica se o e-mail já existe no banco e compara com o e-mail do usuário atual
    existing_email = db_search_user(email)
    if existing_email and existing_email['email'] != current_user.email:
        errors.append('E-mail já cadastrado.')
        email_error = True

    if errors == []:
        errors == False
    else: 
        errors == True
    
    return errors, cpf_error, email_error