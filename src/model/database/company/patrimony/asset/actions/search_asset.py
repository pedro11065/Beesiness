import psycopg2
from colorama import Fore, Style
from datetime import date, time
from .....connect import connect_database

def db_search_specific_asset(asset_id, company_id):
    db_login = connect_database()

    try:
        conn = psycopg2.connect(
            host=db_login[0],
            database=db_login[1],
            user=db_login[2],
            password=db_login[3]
        )
        cur = conn.cursor()

        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando asset com asset_id: {asset_id} e company_id: {company_id}')

        cur.execute("""
            SELECT asset_id, company_id, user_id, name, event, class, value, location, 
                   acquisition_date, description, status, creation_date, creation_time, 
                   debit, credit, installment 
            FROM table_assets 
            WHERE asset_id = %s AND company_id = %s
            ORDER BY creation_date DESC, creation_time DESC;
        """, (asset_id, company_id))

        db_data = cur.fetchone()

        if not db_data:
            return None 

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
            'debit': db_data[13],
            'credit': db_data[14],
            'installment': db_data[15]
        }
    
    except Exception as e:
        print(Fore.RED + f'[Erro de banco de dados] {e}' + Style.RESET_ALL)
        return None  # Retorna None se houver erro

    finally:
        if conn:
            conn.commit()
            cur.close()
            conn.close()
