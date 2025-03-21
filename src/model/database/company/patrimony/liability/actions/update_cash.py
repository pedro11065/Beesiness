import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

import datetime
import uuid

from .....connect import connect_database

def db_update_cash(company_id, new_value, settle):
    db_login = connect_database() 
    
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    

    print(Fore.GREEN + '[Alteração de dados] ' + Style.RESET_ALL + f'Alterando cash')

    new_value = float(new_value)

    if settle == True:
            cur.execute(f"""
        UPDATE table_assets 
        SET value = value - {new_value}
        WHERE name = '#!@cash@!#' and company_id = '{company_id}';
    """)
    
    else:
        cur.execute(f"""
            UPDATE table_liabilities 
            SET value = value - {new_value}
            WHERE name = '#!@cash@!#' and company_id = '{company_id}';
        """)
    
    conn.commit()
    cur.close()
    conn.close()
