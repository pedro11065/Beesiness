import psycopg2
from colorama import Fore, Style
from datetime import date
import datetime
from ....connect import connect_database

def db_search_asset(company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostGreSQL

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando assets para a empresa com company_id: {company_id}')

    cur.execute(f"SELECT * FROM table_assets WHERE company_id = '{company_id}' ORDER BY creation_date DESC, creation_time DESC;")
    db_data = cur.fetchall()

    conn.commit()
    cur.close()
    conn.close()

    return [{
        'asset_id': data[0],
        'company_id': data[1],
        'user_id': data[2],
        'name': data[3],
        'event': data[4],
        'class': data[5],
        'value': data[6],
        'location': data[7],
        'acquisition_date': data[8].strftime("%d/%m/%Y") if isinstance(data[8], datetime.date) else data[8],
        'description': data[9],
        'status': data[10],
        'creation_date': data[11].strftime("%d/%m/%Y") if isinstance(data[11], datetime.date) else data[11],
        'creation_time': data[12].strftime('%H:%M:%S') if isinstance(data[12], datetime.time) else data[12],
        'installment': data[15],  # Convertendo time para string
        'floating': data[16]
    } for data in db_data]

