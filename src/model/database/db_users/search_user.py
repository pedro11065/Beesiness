import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log
from colorama import Fore, Style

def db_search_user(search_data):
        
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário - search_user')

    db_login = json_db_read()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL

    data = search_data
    if len(data) == 11 and (data.isdigit()) : # CPF

        cur.execute(f"SELECT user_id, user_cpf, user_email, user_password from table_users WHERE user_cpf = '{data}' or user_email = '{data}';")
        db_data = cur.fetchall()
    
    elif data.isdigit() == False and '@' in data: # Email

        cur.execute(f"SELECT user_id, user_cpf, user_email, user_password from table_users WHERE user_email = '{data}';")
        db_data = cur.fetchall()
    
    else: #user_id

        cur.execute(f"SELECT user_id, user_cpf, user_email, user_password from table_users WHERE user_id = '{data}';")
        db_data = cur.fetchall()
        
    conn.commit();cur.close();conn.close()

    try:
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados do usuário encotrados com sucesso!')

        return {
        "id": db_data[0][0],
        "cpf": db_data[0][1],
        "email": db_data[0][2],
        "password_hash": db_data[0][3]
    }
        
    except:
            print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados do usuário não encotrados')
            
            return False

