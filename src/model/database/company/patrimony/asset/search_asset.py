import psycopg2
from colorama import Fore, Style
from datetime import date, time
from ....connect import connect_database

def db_search_specific_asset(asset_id, company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostGreSQL

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando asset com asset_id: {asset_id} e company_id: {company_id}')

    # Busca com base no asset_id e company_id
    cur.execute("""
        SELECT * FROM table_assets 
        WHERE asset_id = %s AND company_id = %s
        ORDER BY creation_date DESC, creation_time DESC;
    """, (asset_id, company_id))
    
    db_data = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    if not db_data:
        return None  # Retorna None se não houver dados

    return {
        'asset_id': db_data[0],
        'company_id': db_data[1],
        'user_id': db_data[2],
        'name': db_data[3],
        'event': db_data[4],
        'class': db_data[5],
        'value': db_data[6],
        'location': db_data[7],
        'acquisition_date': db_data[8].strftime("%d/%m/%Y") if isinstance(db_data[8], date) else db_data[8],
        'description': db_data[9],
        'status': db_data[10],
        'creation_date': db_data[11].strftime("%d/%m/%Y") if isinstance(db_data[11], date) else db_data[11],
        'creation_time': db_data[12].strftime('%H:%M:%S') if isinstance(db_data[12], time) else db_data[12],
        'installment': db_data[15]
    }
