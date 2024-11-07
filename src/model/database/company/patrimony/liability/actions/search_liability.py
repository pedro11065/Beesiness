import psycopg2
from colorama import Fore, Style
from datetime import date, time
from .....connect import connect_database

def db_search_specific_liability(asset_id, company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostGreSQL

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando liability com liability_id: {asset_id} e company_id: {company_id}')

    # Busca com base no asset_id e company_id
    cur.execute("""
            SELECT liability_id, company_id, user_id, name, event, class, value, emission_date, 
                   expiration_date, payment_method, description, status, creation_date, creation_time, debit, credit, installment 
            FROM table_liabilities 
            WHERE liability_id = %s AND company_id = %s
            ORDER BY creation_date DESC, creation_time DESC;
    """, (asset_id, company_id))
    
    db_data = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    if not db_data:
        return None  # Retorna None se não houver dados

    return {
        "liability_id": db_data[0],
        "company_id": db_data[1],
        "user_id": db_data[2],
        "name": db_data[3],
        "event": db_data[4],
        "class": db_data[5],
        "value": db_data[6],
        "emission_date": db_data[7].strftime("%d/%m/%Y") if isinstance(db_data[7], date) else db_data[7],
        "expiration_date": db_data[8].strftime("%d/%m/%Y") if isinstance(db_data[8], date) else db_data[8],
        "payment_method": db_data[9],
        "description": db_data[10],
        "status": db_data[11],
        "creation_date": db_data[12].strftime("%d/%m/%Y") if isinstance(db_data[12], date) else db_data[12],
        "creation_time": db_data[13].strftime('%H:%M:%S') if isinstance(db_data[13], time) else db_data[13],
        'debit': db_data[13] if db_data[13] is not None else 0,
        'credit': db_data[14] if db_data[14] is not None else 0,
        'installment': db_data[15]
    }
