import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from ..connect import connect_database

def db_search_user(search_data):
    db_login = connect_database() 

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL

    if len(search_data) == 11 and search_data.isdigit() : # CPF
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário com cpf ou email: {search_data}')

        cur.execute(f"SELECT * from table_users WHERE user_cpf = '{search_data}' or user_email = '{search_data}';")
        db_data = cur.fetchall()
    
    elif '@' in search_data and not search_data.isdigit():  # Email
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário via e-mail: {search_data}')

        cur.execute(f"SELECT * from table_users WHERE user_email = '{search_data}';")
        db_data = cur.fetchall()
    
    else: #user_id
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário com user_id: {search_data}')
        cur.execute(f"SELECT * from table_users WHERE user_id = '{search_data}';")
        db_data = cur.fetchall()
        
    conn.commit();
    cur.close();
    conn.close();

    try:
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados do usuário encontrados com sucesso!')

        return {
        "id": db_data[0][0],
        "fullname": db_data[0][1],
        "cpf": db_data[0][5],
        "email": db_data[0][2],
        "password_hash": db_data[0][3]
    }
        
    except:
            print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados do usuário não encontrados')
            return False