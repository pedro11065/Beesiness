import sys
import re
import time

# Em breve, o sistema de verificação de aniversários será substituido por um mais eficiente e curto.


#create_data[0] # fullname, email, password, birthday

#fullname = create_data[0]
#email = create_data[1] 
#password = create_data[2] 
#birthday = create_data[3]

def birthday_verify(create_data): #birthday
    from .birthday_dates import dates

    error = "Data de nascimento inválida."
    year_now = int(time.strftime("%Y"))

    birthday_original = create_data[3] #data de nascimento escrita pelo usuário

    dates = dates() #conjunto de valores que vão ser utilizados na verificação da data de nascimento

    day = 0
    month_31 = dates[0] #meses com 31 dias
    leap_year = dates[1] #anos bissextos

    if len(birthday_original) != 10:
            return False, error
    try:
        birthday_splited = birthday_original.split("-")  #vai dividir o que dia, mes e ano, a partir da barra. (13 / 03 / 2006)   

        birthday_test = birthday_splited[0]+birthday_splited[1]+birthday_splited[2] #vai juntar tudo
        birthday_test = int(birthday_test) #transfora em int para ver se tudo é numero mesmo

        day_int = int(birthday_splited[0])#separa certinho
        mouth_int = int(birthday_splited[1])
        year_int = int(birthday_splited[2])       

    except:
        return False, error


    if day > 29 and mouth_int == 2 and year_int in leap_year: #fevereiro bissesto
        return False, error

    elif day > 28 and mouth_int == 2 and year_int not in leap_year: #feveireiro não bissesto
        return False, error

    elif day == 31 and mouth_int not in month_31: #meses com 31 dias
        return False, error

    elif day > 31 or mouth_int > 12 or year_now - year_int <= 16: #dia do mes, mes e idade
        return False, error

    return True

def email_verify(create_data): #email 

    from src.model.database.db_users.search_user import db_search_user

    email = create_data[1]
    search_data = email

    padrao = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' #não sei explicar, mas funciona
    
    if re.match(padrao, email):
        None
    else:
        return False, "Email inválido."    
     
    data_db = db_search_user(search_data)
  
    if data_db != []:
        return False, "Email já cadastrado."

    return True
    
def password_verify(create_data): #password

    sys.path.append("C:/github/Beesiness/src")
    from model.verifications.special_characters import special_characters

    password = create_data[2]
    sp_ch = special_characters()           

    if len(password) < 8: #Se a senha for menor que 8 digitos
        return False, "Minimo de 8 digitos."
    
    elif password.isalnum() == True: #Se contem somente caracteres alfanumericos, não caracteres como ".","_" ou "@", logo, inválido.
        return False, "No minimo 1 caracter especial."
    
    elif password.isspace() == True: #Se contem somente espaços tá inválido também
        return False, "Não pode conter espaços."

    #!!!!!!!!! #elif password in sp_ch: #Verifica se a senha contém algum dos caracteres especiais
     #    return False, "Não pode conter caracteres especiais."
    
    return True

def verify_all(create_data):

    email_verify_answer = email_verify(create_data)
    password_verify_answer = password_verify(create_data)
    birthday_verify_answer = birthday_verify(create_data)

    errors = [] #lista de mensagens de erro
    count_errors = 0
#---------------------------------------------#email

    if email_verify_answer == True:
        None 
    else:
        errors.append(email_verify_answer[1])
        count_errors = count_errors + 1

#---------------------------------------------#senha
#    
    if password_verify_answer == True:
        None
    else:
        errors.append(password_verify_answer[1])
        count_errors = count_errors + 1

#---------------------------------------------#data de nascimento

    if birthday_verify_answer == True:
        None
    else:
        errors.append(birthday_verify_answer[1])
        count_errors = count_errors + 1

#---------------------------------------------#O que a API vai retornar

    if count_errors == 0:
        return True
    return errors, count_errors