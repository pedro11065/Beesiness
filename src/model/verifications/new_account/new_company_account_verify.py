from colorama import Fore, Style

#Verificações no front: email, senha, cpf, cnpj e nome da empresa

def cnpj_check(cnpj): # Verifica se o cnpj já está cadastrado // back
    None

def email_check(email): # Verifica se o email já está cadastrado // back
    None

def password_verify(senha): #Verifica a senha // back
    None

#Já que algumas verificações vão ser realizadas no front, removi elas daqui por que não há motivo de ter essa redundância toda 

def verify_all(cpf, email):

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Criação de empresa iniciada, fazendo as verificações!')

    email_valid, email_error = email_check(email, cpf)
    cnpj_valid, cnpj_error = cnpj_check(cpf)
    
    errors = []; errors_classes = []
    
    if not email_valid:
        errors.append(email_error)
        errors_classes.append("email")
    if not cnpj_valid:
        errors.append(cnpj_error)
        errors_classes.append("cnpj")

    if errors:
        return False, errors, errors_classes
    
    if errors:
        print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'Erro durante a finalização, {errors}')
        return False, errors, errors_classes

    print(Fore.MAGENTA + '[Verificação] ' + Style.RESET_ALL + f'verificação finalizada com sucesso!')
    return True, None, None