import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from ..connect import connect_database

def db_update_user(user_id, fullname, cpf, email, password_hash):
    db_login = connect_database() 

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL

    print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + f'Alterando dados do usuário com user_id: {user_id}')
    try:
        print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + f'Ação realizada com sucesso!') 
        cur.execute("UPDATE table_users SET user_fullname = %s, user_cpf = %s, user_email = %s, user_password = %s WHERE user_id = %s;", (fullname, cpf, email, password_hash, user_id))
    except:
        print(Fore.RED + '[Alteração de dados] ' + Style.RESET_ALL + f'Dados do usuário não encontrados')
        return False
    
    conn.commit();
    cur.close();
    conn.close();

    
        
    