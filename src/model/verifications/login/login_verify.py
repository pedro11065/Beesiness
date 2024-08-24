
import sys
def login_verify(search_data):

    sys.path.append("C:/github/Beesiness/src")
    from model.database.db_users.search_user import db_search_user
    
    data_db = db_search_user(search_data)

    errors = [] #lista de mensagens de erro
    count_errors = 0

    if (data_db == []) == True:
        errors.append("Email não encontrado")
        count_errors = count_errors + 1

    elif (data_db[0][3] != search_data[1]) == True:
        errors.append("Senha incorreta")
        count_errors = count_errors + 1

    else:
        return True
    
    return errors, count_errors

