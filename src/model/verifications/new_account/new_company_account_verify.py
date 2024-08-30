from colorama import Fore, Style

def cpf_verify(cpf):
    None

def email_verify(email):
    None

def cnpj_verify(cnpj):
    None

def password_verify(senha):
    None




def verify_all(cpf, email, cnpj, senha):
    print(Fore.MAGENTA + '[Banco de dados] ' + Style.RESET_ALL + f'Criação de empresa iniciada, fazendo as verificações!')

    email_valid, email_error = email_verify(email, cpf)
    cpf_valid, cpf_error = cpf_verify(cpf)
    data_valid, cnpj_error = cnpj_verify(cnpj)
    senha_valid, senha_error = password_verify(senha)
    
    errors = []
    if not email_valid:
        errors.append(email_error)
    if not cpf_valid:
        errors.append(cpf_error)
    if not senha_valid:
        errors.append(senha_error)
    if not data_valid:
        errors.append(cnpj_error)

    if errors:
        print(f'Retorno dos erros: {errors}')
        return errors, len(errors)
    
    print(Fore.MAGENTA + '[Banco de dados] ' + Style.RESET_ALL + f'Verificação finalizada!')
    return True