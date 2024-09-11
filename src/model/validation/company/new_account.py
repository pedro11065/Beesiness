import re
from colorama import Fore, Style
from src.model.database.company.companies.search import db_search_company
from src.model.database.user.search import db_search_user

# Verificações que são feitas no front: email, senha, cpf, cnpj e nome da empresa
# Por exemplo, gramática, falta de arroba no email, cpf inexistente, etc.

def cnpj_check(cnpj):

    print(Fore.LIGHTMAGENTA_EX+ '[Verificação] ' + Style.RESET_ALL + f'Verificação CNPJ')
    if db_search_company(cnpj):
        return False
    return True

def email_check(email):

    print(Fore.LIGHTMAGENTA_EX+ '[Verificação] ' + Style.RESET_ALL + f'Verificação EMAIL')
    if db_search_company(email):
        return False 
    return True

#Já que algumas verificações vão ser realizadas no front, removi elas daqui por que não há motivo de ter essa redundância toda 
  
def verify_all(cnpj, email, senha):

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Iniciando verificação dos dados!\n')

    email_valid = email_check(email)
    cnpj_valid = cnpj_check(cnpj)
       
    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'verificação finalizada com sucesso!')

# o primeiro True é da verificação em geral. O segundo e terceiro são email e cnpj respectivamente.
    if email_valid and cnpj_valid:
        return True, True, True
    
    elif email_valid == True and cnpj_valid == False:
        return False, True, False
    
    elif email_valid == False and cnpj_valid == True:
        return False, False, True
    
    return False, False,False
    
