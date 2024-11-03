import psycopg2
import uuid
from datetime import datetime
from colorama import Fore, Style
from ....connect import connect_database
from ..asset.search_cash import db_search_cash



def db_create_asset(company_id, user_id, name, event, classe, value, cash_debit, cash_credit,  asset_debit, asset_credit, location, acquisition_date, description, status, update_cash, installment): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.

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
    asset_id = str(uuid.uuid4())
    creation_time = datetime.now().strftime("%H:%M:%S")
    creation_date = datetime.now().strftime("%Y-%m-%d")
    type =  "asset"

    if event not in ['Entrada de Caixa','Venda']:
        # Guarda os dados na tabela de assets:
        cur.execute("""
        INSERT INTO table_assets (
            asset_id, company_id, user_id, name, event, class, value, location, acquisition_date, description, status, debit, credit, installment
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """, (asset_id, company_id, user_id, name, event, classe, value, location, acquisition_date, description, status, asset_debit, asset_credit, installment))
    
    # Guarda os dados no histórico de ativos e passivos (para evitar que informações sejam escondidas no futuro).
    installment_record = 0; new_month_add = 0 #01-11-2024
    for i in range(installment): #vai registrar a quantidade de parcelas 
        historic_id =  uuid.uuid4()
        installment_record = installment_record + 1
        print(i)
        if i > 0:

            current_day = datetime.now().strftime("%d")
            current_month = datetime.now().strftime("%m")
            current_year = datetime.now().strftime("%Y")

         
            
            next_month = new_month_add + 1 + int(current_month)
            new_month_add = new_month_add + 1

            creation_date = (f"{current_year}-{next_month}-{current_day}")
            
            if next_month>12:
                next_month = next_month - 12
                next_year = int(current_year) + 1
                creation_date = (f"{next_year}-{next_month}-{current_day}")

        cur.execute(f"INSERT INTO table_historic (historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, creation_date, creation_time, debit, credit, installment)  VALUES ('{historic_id}', '{company_id}', '{user_id}', '{asset_id}', '{name}', '{event}', '{classe}', {value/installment}, '{acquisition_date}', '{type}', '{creation_date}', '{creation_time}', '{asset_debit/installment}', '{asset_credit/installment}','{installment_record}');")  
    
    cash_data = db_search_cash(company_id)
    cash_id = cash_data[0][0]
    date = cash_data[0][11]
    cash_now = cash_data[0][6]

    if update_cash == 'more':
        cur.execute(f"""
            UPDATE table_assets 
            SET value = value + {value}, 
                debit = debit + {cash_debit}, 
                credit = credit + {cash_credit} 
            WHERE name = '#!@cash@!#';
        """)

        cash_now = cash_now + value

    elif update_cash == 'less':
        cur.execute(f"""
            UPDATE table_assets 
            SET value = value - {value}, 
                debit = debit + {cash_debit}, 
                credit = credit - {cash_credit} 
            WHERE name = '#!@cash@!#';
        """)

        cash_now = cash_now - value
        
    new_historic_id =  uuid.uuid4()

    # Adiciona o caixa inicial automaticamente (Pretendemos mudar isso para colocar na hora da criação da empresa)
    cur.execute(f"""
        INSERT INTO table_historic (
            historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, creation_date, creation_time, debit, credit
        ) VALUES (
            '{new_historic_id}', 
            '{company_id}', 
            '{user_id}', 
            '{cash_id}', 
            '#!@cash@!#', 
            'Entrada de caixa', 
            'Caixa',
            '{cash_now}', 
            '{date}', 
            'asset', 
            '{creation_date}', 
            '{creation_time}', 
            {cash_debit if cash_debit is not None else 'NULL'}, 
            {cash_credit if cash_credit is not None else 'NULL'}
        );
    """)
    # Confirma as mudanças
    conn.commit()
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Asset registrado com sucesso!')

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
