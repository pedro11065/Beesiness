import re
from datetime import datetime

def birthday_verify(data_nascimento):
    try:
        birth_date = datetime.strptime(data_nascimento, "%d/%m/%Y").date()
        today = datetime.now().date()

        # Calcula a idade
        
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        #print(age)
        # Verifica se a idade é válida (mínimo 16 anos)
        if age < 16:
            return False, "Data de nascimento inválida. Usuário deve ter no mínimo 16 anos."

    except ValueError:
        print('Erro: Data de nascimento no formato inválido.')
        return False, "Data de nascimento inválida."  # Retorna um valor booleano False e uma lista de erros quando o aniversário não condiz.

    return True, None  # Retorna um valor booleano True e None para indicar que o login foi bem-sucedido e que não há erros.

def email_verify(email):
    from src.model.database.db_users.search_user import db_search_user

    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' # Regex para o padrão teste@email.com
    if not re.match(email_pattern, email):
        return False, "Email inválido."

    if db_search_user(email):
        return False, "Email já cadastrado."

    return True, None  # Retorna um valor booleano True e None para indicar que o login foi bem-sucedido e que não há erros.

def password_verify(password):
    if len(password) < 8:
        return False, "A senha deve ter um mínimo de 8 dígitos."
    if password.isalnum():
        return False, "A senha deve ter no mínimo 1 caracter especial."
    if password.isspace():
        return False, "A senha não pode conter espaços."

    return True, None  # Retorna um valor booleano True e None para indicar que o login foi bem-sucedido e que não há erros.

def verify_all(email, senha, data_nascimento):
    print('Criação de conta iniciada, fazendo as verificações!')
    email_valid, email_error = email_verify(email)
    senha_valid, senha_error = password_verify(senha)
    data_valid, data_error = birthday_verify(data_nascimento)

    errors = []
    if not email_valid:
        errors.append(email_error)
    if not senha_valid:
        errors.append(senha_error)
    if not data_valid:
        errors.append(data_error)

    if errors:
        print(f'Retorno dos errors: {errors}')
        return errors, len(errors)
    
    print('Verificação finalizada, saindo da função.')
    return True
