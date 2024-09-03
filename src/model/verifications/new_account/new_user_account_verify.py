import re
from datetime import datetime
from colorama import Fore, Style

#Primeiro adicionar as verificações no front depois remove-las do back

def birthday_verify(data_nascimento): #Verifica nascimento // front
    try:
        birth_date = datetime.strptime(data_nascimento, "%d/%m/%Y").date()
        today = datetime.now().date()
        age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        if age < 16:
            return False, "Idade mínima é 16 anos."
    except ValueError:
        return False, "Data de nascimento inválida."
    return True, None

def cpf_verify(cpf): #Ve se o cpf é valido // front
    if len(cpf) != 11 or not cpf.isdigit():
        return False, "CPF inválido."

    def cpf_x1(cpf):
        try:  
            multiplied = [int(cpf[i]) * (10 - i) for i in range(9)]
            return (sum(multiplied) * 10 % 11) == int(cpf[9])
        except:
            return False

    def cpf_x2(cpf):
        try:
            multiplied = [int(cpf[i]) * (11 - i) for i in range(10)]
            return (sum(multiplied) * 10 % 11) == int(cpf[10])
        except:
            return False

    if cpf_x1(cpf) and cpf_x2(cpf):
        return True, None
    return False, "CPF inválido."

def email_verify(email, cpf):  #Ve se o email já é utilizado // back
    from src.model.database.db_users.search_user import db_search_user

    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Email inválido."

    if db_search_user(cpf):
        return False, "CPF já cadastrado."
    
    if db_search_user(email):
        return False, "E-mail já cadastrado."

    return True, None

def password_verify(password): #Verifica senha // Front
    if len(password) < 8:
        return False, "A senha deve ter um mínimo de 8 dígitos."
    if not re.search(r'[A-Z]', password):
        return False, "A senha deve conter ao menos uma letra maiúscula."
    if not re.search(r'[a-z]', password):
        return False, "A senha deve conter ao menos uma letra minúscula."
    if not re.search(r'[0-9]', password):
        return False, "A senha deve conter ao menos um número."
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "A senha deve conter ao menos um caractere especial."
    if password.isspace():
        return False, "A senha não pode conter espaços."
    return True, None

#Já que algumas verificações vão ser realizadas no front, vou remover a verificação de senha, email e data de nascimento

def verify_all(cpf, email, senha, data_nascimento):
    print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + f'Iniciando verificação dos dados!')

    email_valid, email_error = email_verify(email, cpf)
    cpf_valid, cpf_error = cpf_verify(cpf)
    senha_valid, senha_error = password_verify(senha)
    data_valid, data_error = birthday_verify(data_nascimento)

    errors = []; errors_classes = [] # o errors_classes serve para saber qual foi o tipo do erro, criar um if para cada possivel mensagem de erro não dá, sabendo que o erro se trata de um erro de email por exemplo, eu posso ir lá no campo do email e mostrar o erro enviado pela API
    if not email_valid:
        errors.append(email_error)
        errors_classes.append("email")
    if not cpf_valid:
        errors.append(cpf_error)
        errors_classes.append("cpf")
    if not senha_valid:
        errors.append(senha_error)
        errors_classes.append("senha")
    if not data_valid:
        errors.append(data_error)
        errors_classes.append("data")

    if errors:
        return False, errors, errors_classes

    print('Verificação finalizada com sucesso.')
    return True, None