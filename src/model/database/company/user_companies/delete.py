import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from ...connect import connect_database

def db_delete_user_companies(user_id):
    db_login = connect_database() 
    
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostgreSQL
    
    print(Fore.GREEN + '[Exclusão de Usuário] ' + Style.RESET_ALL + f'Deletando o usuário com id {user_id} do banco de dados...')
    try:
        cur.execute("DELETE FROM table_user_companies WHERE user_id = %s;", (user_id,))
        conn.commit()
        print(Fore.GREEN + '[Exclusão de Usuário] ' + Style.RESET_ALL + f'Usuário com id {user_id} deletado com sucesso!')

    except Exception as e:
        print(Fore.RED + '[Exclusão de Usuário] ' + Style.RESET_ALL + f'Erro ao deletar o usuário: {e}')
        return False
    
    finally:
        cur.close()
        conn.close()
