import re
from colorama import Fore, Style
from src.model.database.db_companies.search_company import db_search_company
from src.model.database.db_users.search_user import db_search_user

#Verificações no front: email, senha, cpf, cnpj e nome da empresa

def cpf_check(cpf):# Verifica se o cpf já está cadastrado // back

    print(Fore.LIGHTMAGENTA_EX+ '[Verificação] ' + Style.RESET_ALL + f'Verificação CPF')
    if db_search_user(cpf):
        return False, "CPF já cadastrado."
    return True, None

def cnpj_check(cnpj): # Verifica se o cnpj já está cadastrado // back

    print(Fore.LIGHTMAGENTA_EX+ '[Verificação] ' + Style.RESET_ALL + f'Verificação CNPJ')
    if db_search_company(cnpj):
        return False, "CNPJ já cadastrado."
    return True, None

def email_check(email): # Verifica se o email já está cadastrado // back

    print(Fore.LIGHTMAGENTA_EX+ '[Verificação] ' + Style.RESET_ALL + f'Verificação EMAIL')
    if db_search_company(email):
        return False, "E-mail já cadastrado."
    
    return True, None

def password_verify(senha): #Verifica a senha // back

    print(Fore.LIGHTMAGENTA_EX+ '[Verificação] ' + Style.RESET_ALL + f'Verificação SENHA')
    
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

#Já que algumas verificações vão ser realizadas no front, removi elas daqui por que não há motivo de ter essa redundância toda 
  
def verify_all(cpf, cnpj, email, senha):

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Iniciando verificação dos dados!')

    cpf_valid, cpf_error = cpf_check(cpf)
    email_valid, email_error = email_check(email)
    cnpj_valid, cnpj_error = cnpj_check(cnpj)
    senha_valid, senha_error = password_verify(senha)
    
    errors = []; errors_classes = []
    
    if not email_valid:
        errors.append(email_error)
        errors_classes.append("email")
    if not cnpj_valid:
        errors.append(cnpj_error)
        errors_classes.append("cnpj")
    if not cpf_valid:
        errors.append(cpf_error)
        errors_classes.append("cpf")
    if not senha_valid:
        errors.append(senha_error)
        errors_classes.append("senha")

    if errors:
        return False, errors, errors_classes
    
    if errors:
        print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Erro durante a finalização, {errors}')
        return False, errors, errors_classes

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'verificação finalizada com sucesso!')
    return True, None, None