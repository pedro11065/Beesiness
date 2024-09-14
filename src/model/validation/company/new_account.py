from colorama import Fore, Style
from src.model.database.company.companies.search import db_search_company
from src.model.database.user.search import db_search_user

# Verifica o CNPJ no banco de dados
def cnpj_check(cnpj):
    print(Fore.LIGHTMAGENTA_EX + '[Verificação - Empresa] ' + Style.RESET_ALL + 'Verificando CNPJ...')
    if db_search_company(cnpj):
        return True
    return False

# Verifica o e-mail no banco de dados
def email_check(email):
    print(Fore.LIGHTMAGENTA_EX + '[Verificação - Empresa] ' + Style.RESET_ALL + 'Verificando e-mail...')
    if db_search_company(email):
        return True
    return False

def verify_all(cnpj, email):
    print(Fore.MAGENTA + '[Verificação - Empresa] ' + Style.RESET_ALL + 'Iniciando verificação dos dados!\n')

    # Realiza as verificações
    email_error = email_check(email)
    cnpj_error = cnpj_check(cnpj)

    print(Fore.MAGENTA + '[Verificação - Empresa] ' + Style.RESET_ALL + 'A verificação foi finalizada com sucesso!')

    # A presença de qualquer erro resulta em um registro inválido
    has_errors = email_error or cnpj_error
    
    return has_errors, email_error, cnpj_error

