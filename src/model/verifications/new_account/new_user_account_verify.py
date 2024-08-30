import re
from datetime import datetime
from colorama import Fore, Style

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

def cpf_verify(cpf):

    def cpf_x1(cpf): #Verifica o primeiro digito de verificação do CPF
        try:  
            counting_number = 0 ; multiplier = 10 ; counting = 8 ; multiplied = []

            while counting_number <= counting:

                number_str = cpf[counting_number] ; number_int = (int(number_str))

                value = number_int*multiplier
                multiplied.append(value)

                #proxima letra                         #menos um a ser multiplicado
                counting_number = counting_number + 1  ; multiplier = multiplier - 1 
                continue

            sum_number = 0

            for num in multiplied:
                sum_number += num

            full_result = sum_number * 10 ; full_result_x1 = full_result % 11

            if str(full_result_x1) == cpf[9]:None               
            else: return False
        except: return False

        return True # None //é proposital ter somente True como return
  
    def cpf_x2(cpf): #Verifica o segundo digito de verificação do CPF

        try:
            counting_number = 0 ; multiplier = 11 ; counting = 9 ; multiplied = []

            while counting_number <= counting:

                number_str = cpf[counting_number] ; number = (int(number_str))
                value = number*multiplier
                multiplied.append(value)

                #proxima letra             #menos um a ser multiplicado
                counting_number = counting_number + 1  ; multiplier = multiplier - 1 

                continue

            sum_number = 0

            for num in  multiplied:
                sum_number += num

            full_result = sum_number * 10 ; full_result_x2 = full_result % 11

            if str(full_result_x2) == cpf[10]:None               
            else: return False, "CPF inválido."

        except: return False, "CPF inválido."
        return True, None     

    if cpf_x1(cpf): #Se x1 for válido, testar x2...
        return cpf_x2(cpf)  
    return False, "CPF inválido." #Se x1 não for válido, já retorna erro

def email_verify(email, cpf):
    from src.model.database.db_users.search_user import db_search_user

    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' # Regex para o padrão teste@email.com
    if not re.match(email_pattern, email):
        return False, "Email inválido."

    if db_search_user(cpf):
        return False, "CPF já cadastrado."

    return True, None  # Retorna um valor booleano True e None para indicar que o login foi bem-sucedido e que não há erros.

def password_verify(password): #Q codigo bonito pprt
    if len(password) < 8:
        return False, "A senha deve ter um mínimo de 8 dígitos."
    if password.isalnum():
        return False, "A senha deve ter no mínimo 1 caracter especial."
    if password.isspace():
        return False, "A senha não pode conter espaços."

    return True, None  # Retorna um valor booleano True e None para indicar que o login foi bem-sucedido e que não há erros.

def verify_all(cpf,email, senha, data_nascimento):
    
    
    print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + f'Criação de conta iniciada, verificando dados!')


    email_valid, email_error = email_verify(email, cpf)
    cpf_valid, cpf_error = cpf_verify(cpf)
    senha_valid, senha_error = password_verify(senha)
    data_valid, data_error = birthday_verify(data_nascimento)

    errors = []
    if not email_valid:
        errors.append(email_error)
    if not cpf_valid:
        errors.append(cpf_error)
    if not senha_valid:
        errors.append(senha_error)
    if not data_valid:
        errors.append(data_error)

    if errors:
        print(f'Retorno dos erros: {errors}')
        return errors, len(errors)
    
    print('Verificação finalizada, saindo da função.')
    return True
