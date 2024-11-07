import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from .....connect import connect_database

def db_update_historic(patrimony_id, company_id, field, value):
    db_login = connect_database() 
    
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    

    print(Fore.GREEN + '[Atualização de historic] ' + Style.RESET_ALL + f'Atualizando o campo {field} do patrimony {patrimony_id}')
    try:
        query = sql.SQL("UPDATE table_historic SET {field} = %s WHERE patrimony_id = %s AND company_id = %s").format(
            field=sql.Identifier(field)
        )
        
        cur.execute(query, (value, patrimony_id, company_id))
   
    except Exception as error:
        print(Fore.RED + '[Atualização de historic] ' + Style.RESET_ALL + f'Erro ao atualizar o historic: {error}')
        return False
    
    finally:
        conn.commit();
        cur.close();
        conn.close();

    print(Fore.GREEN + '[Atualização de historic] ' + Style.RESET_ALL + 'Historic atualizado com sucesso!')
    return True
        
    