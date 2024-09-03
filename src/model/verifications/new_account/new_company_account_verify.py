from colorama import Fore, Style

def email_verify(email): # Verifica se o email já é cadastrado ou não (pode se mesclar com o cnpj) // back
    None

def cnpj_verify(cnpj): # Verifica se o cnpj já está cadastrado // back
    None

def password_verify(senha): #Verifica a senha // front
    None

#Já que algumas verificações vão ser realizadas no front, removi elas daqui por que não há motivo de ter essa redundância toda 


def verify_all(cpf, email, cnpj, senha):
    print(Fore.MAGENTA + '[Banco de dados] ' + Style.RESET_ALL + f'Criação de empresa iniciada, fazendo as verificações!')

    email_valid, email_error = email_verify(email, cpf)
    cnpj_valid, cnpj_error = cnpj_verify(cpf)
    
    errors = []; errors_classes = []
    if not email_valid:
        errors.append(email_error)
        errors_classes.append("email")
    if not cnpj_valid:
        errors.append(cnpj_error)
        errors_classes.append("cnpj")

    if errors:
        return False, errors, errors_classes
    
    print(Fore.MAGENTA + '[Banco de dados] ' + Style.RESET_ALL + f'Verificação finalizada!')
    return True