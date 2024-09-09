from src.model.database.user.search_user import db_search_user

def validate_cpf_and_email(cpf, email):
    errors = [] 
    cpf_error = False
    email_error = False
    
    # Verifica se o CPF já existe no banco
    existing_cpf = db_search_user(cpf)
    if existing_cpf:
        errors.append('CPF já cadastrado.')
        email_error = True
    
    # Verifica se o e-mail já existe no banco
    existing_email = db_search_user(email)
    if existing_email:
        errors.append('E-mail já cadastrado.')
        cpf_error = True

    if errors == []:
        errors == False
    
    else: 
        errors == True
    
    return errors, cpf_error, email_error