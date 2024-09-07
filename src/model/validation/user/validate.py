from src.model.database.user.search_user import db_search_user

# Se mudar as mensagens do append, será necessário mudar em register.html, por exemplo.
def validate_cpf_and_email(cpf, email):
    errors = []  # Lista para armazenar os erros
    
    # Verifica se o CPF já existe no banco
    existing_cpf = db_search_user(cpf)
    if existing_cpf:
        errors.append('CPF já cadastrado.')
    
    # Verifica se o e-mail já existe no banco
    existing_email = db_search_user(email)
    if existing_email:
        errors.append('E-mail já cadastrado.')
    
    return errors if errors else None  # Retorna a lista de erros se houver, ou None se tudo estiver correto.