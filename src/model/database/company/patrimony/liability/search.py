import psycopg2
from colorama import Fore, Style
from ....connect import connect_database

def db_search_liability(company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostGreSQL

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando liabilities para a empresa com company_id: {company_id}')

    cur.execute(f"SELECT * FROM table_liabilities WHERE company_id = '{company_id}' ORDER BY creation_date DESC, creation_time DESC;;")
    db_data = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    try:
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados das liabilities encontrados com sucesso!')

        return [{
            "liability_id": data[0],
            "company_id": data[1],
            "user_id": data[2],
            "name": data[3],
            "event": data[4],
            "class": data[5],
            "value": data[6],
            "emission_date": data[7],
            "expiration_date": data[8],
            "payment_method": data[9],
            "description": data[10],
            "status": data[11],
            "creation_date":data[11],
            "creation_time": data[12]
            
        } for data in db_data]
        
    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados das liabilities não encontrados: {error}')
        return False
