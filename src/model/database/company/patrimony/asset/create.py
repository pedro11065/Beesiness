import psycopg2
import uuid
from colorama import Fore, Style
from ....connect import connect_database
from ..asset.search_cash import db_search_cash


def db_create_asset(company_id, user_id, name, event, classe, value, cash_debit, cash_credit,  asset_debit, asset_credit, location, acquisition_date, description, status, update_cash): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.

    db_login = connect_database() # Coleta os dados para conexão
    
    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )

    # Cria um cursor
    cur = conn.cursor()

    # Define dados
    asset_id = uuid.uuid4()
    historic_id =  uuid.uuid4()
    type =  "asset"


    # Guarda os dados na tabela de assets:
    cur.execute(f"INSERT INTO table_assets (asset_id, company_id, user_id, name, event, class, value, location, acquisition_date, description, status, debit, credit)  VALUES ('{asset_id}', '{company_id}', '{user_id}', '{name}', '{event}', '{classe}', {value}, '{location}', '{acquisition_date}', '{description}', '{status}', '{asset_debit}', '{asset_credit}');")
   
    # Guarda os dados no histórico de ativos e passivos (para evitar que informações sejam escondidas no futuro).
    cur.execute(f"INSERT INTO table_historic (historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, debit, credit) VALUES ('{historic_id}', '{company_id}', '{user_id}', '{asset_id}', '{name}', '{event}', '{classe}', {value}, '{acquisition_date}', '{type}', '{asset_debit}', '{asset_credit}');")  
    
    cash_data = db_search_cash(company_id)
    cash_id = cash_data[0][0]
    date = cash_data[0][11]


    if update_cash == 'more':
        cur.execute(f"""
            UPDATE table_assets 
            SET value = value + {value}, 
                debit = debit + {cash_debit}, 
                credit = credit + {cash_credit} 
            WHERE name = '#!@cash@!#';
        """)

    elif update_cash == 'less':
        cur.execute(f"""
            UPDATE table_assets 
            SET value = value - {value}, 
                debit = debit + {cash_debit}, 
                credit = credit - {cash_credit} 
            WHERE name = '#!@cash@!#';
        """)
        
    new_historic_id =  uuid.uuid4()
    cur.execute(f"INSERT INTO table_historic (historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, debit, credit) VALUES ('{new_historic_id}', '{company_id}', '{user_id}', '{cash_id}', '#!@cash@!#', 'Entrada de caixa', 'Caixa','{value}', '{date}', 'asset', {cash_debit}, {cash_credit});")

    # Confirma as mudanças
    conn.commit()
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Asset registrado com sucesso!')

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
