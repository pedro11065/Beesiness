import re
from datetime import datetime
from colorama import Fore, Style
from src.model.database.db_users.search_user import db_search_user ###

#Verificações no front: email, senha, cpf e nome

def cpf_verify(cpf): # Por enquanto a verificação de cpf está aqui por que ela não existe no front, faz futuramente vai verificar se cpf já está cadastrado // back

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

def email_verify(email, cpf):  # Verifica se email já está cadastrado // back
    
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Email inválido."

    if db_search_user(cpf):
        return False, "CPF já cadastrado."
    
    if db_search_user(email):
        return False, "E-mail já cadastrado."

    return True, None

def password_verify(senha): #Verifica senha // Back(por ser mais)
    if len(senha) < 8:
        return False, "A senha deve ter um mínimo de 8 dígitos."
    if not re.search(r'[A-Z]', senha):
        return False, "A senha deve conter ao menos uma letra maiúscula."
    if not re.search(r'[a-z]', senha):
        return False, "A senha deve conter ao menos uma letra minúscula."
    if not re.search(r'[0-9]', senha):
        return False, "A senha deve conter ao menos um número."
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', senha):
        return False, "A senha deve conter ao menos um caractere especial."
    if senha.isspace():
        return False, "A senha não pode conter espaços."
    return True, None

#Já que algumas verificações vão ser realizadas no front, vou remover a verificação de senha, email e data de nascimento

def verify_all(cpf, email, senha):

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Iniciando verificação dos dados!')

    email_valid, email_error = email_verify(email, cpf)
    cpf_valid, cpf_error = cpf_verify(cpf)
    senha_valid, senha_error = password_verify(senha)

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

    if errors:
        print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Erro durante a verificação, {errors}')
        return False, errors, errors_classes

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'verificação finalizada com sucesso!')
    return True, None, None