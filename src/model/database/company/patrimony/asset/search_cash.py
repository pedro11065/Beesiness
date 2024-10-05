import psycopg2
from colorama import Fore, Style
from datetime import time
from ....connect import connect_database

def db_search_cash(company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostGreSQL

    cur.execute("SELECT * FROM table_assets WHERE company_id = %s AND name = %s", (company_id, '#!@cash@!#'))
    db_data = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    try:
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados dos assets encontrados com sucesso!')

        return db_data
        
    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados dos assets não encontrados: {error}')
        return False
