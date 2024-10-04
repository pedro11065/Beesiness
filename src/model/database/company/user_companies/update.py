import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from ...connect import connect_database

def db_update_user_companies(permission, user_id):
    db_login = connect_database() 
    
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    

    print(Fore.GREEN + '[Atualização de permissão] ' + Style.RESET_ALL + f'Mudando permissão de usuário no banco de dados...')
    try:
        cur.execute("UPDATE table_user_companies SET user_access_level = %s WHERE user_id = %s;", (permission, user_id))
        print(Fore.GREEN + '[Atualização de permissão] ' + Style.RESET_ALL + f'Dados alterados com sucesso!')
    except:
        print(Fore.RED + '[Atualização de permissão] ' + Style.RESET_ALL + f'Dados do usuário não encontrados.')
        return False
    finally:
        conn.commit();
        cur.close();
        conn.close();

    
        
    