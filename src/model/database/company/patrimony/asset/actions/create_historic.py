import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

import datetime
import uuid

from .....connect import connect_database

def db_create_historic(asset_id, company_id, data, value):
    db_login = connect_database() 
    
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL

    new_historic_id = str(uuid.uuid4())
    user_id = data.get('user_id')
    #patrimony_id = asset_id 
    patrimony_id = str(uuid.uuid4())
    name = data.get('name')
    event = data.get('event')
    class_type = data.get('class')

    acquisition_date = data.get('acquisition_date')
    acquisition_date_obj = datetime.datetime.strptime(acquisition_date, "%d/%m/%Y")
    acquisition_date_formatted = acquisition_date_obj.strftime("%Y-%m-%d")
    
    creation_date = datetime.datetime.now().strftime('%Y-%m-%d')  # Data atual no formato YYYY-MM-DD
    creation_time = datetime.datetime.now().strftime('%H:%M:%S')  # Hora atual no formato HH:MM:SS
    debit = 0
    credit = value
    installment = data.get('installment')

    print(Fore.GREEN + '[Criando histórico de asset] ' + Style.RESET_ALL + f'Utilizando dados do {asset_id}...')
    try:
        cur.execute("""
            INSERT INTO table_historic (
                historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, creation_date, creation_time, debit, credit, installment
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
            );
        """, (
            new_historic_id,
            company_id,
            user_id,
            patrimony_id,
            name,
            event,
            class_type,
            value,
            acquisition_date_formatted,
            'asset',
            creation_date,
            creation_time,
            debit if debit is not None else None,
            credit if credit is not None else None,
            installment
        ))

   
    except Exception as error:
        print(Fore.RED + '[Criando histórico de asset] ' + Style.RESET_ALL + f'Erro ao criar: {error}')
        return False
    
    finally:
        conn.commit();
        cur.close();
        conn.close();

    print(Fore.GREEN + '[Criando histórico de asset] ' + Style.RESET_ALL + 'Registrado com sucesso!')
    return True
        
    