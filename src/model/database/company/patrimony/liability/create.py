import psycopg2
import uuid
from datetime import datetime
from colorama import Fore, Style
from ....connect import connect_database
from ..asset.search_cash import db_search_cash


def db_create_liability(company_id, user_id, name, event, classe, value, emission_date, expiration_date, payment_method, description, status, update_cash, liability_debit, liability_credit, cash_debit, cash_credit,installment):
    db_login = connect_database()  # Coleta os dados para conexão

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
    liability_id = uuid.uuid4()
    creation_time = datetime.now().strftime("%H:%M:%S")
    creation_date = datetime.now().strftime("%Y-%m-%d")
    type = "liability"
    

    # Guarda os dados na tabela de liabilities
    cur.execute(f"""
        INSERT INTO table_liabilities (liability_id, company_id, user_id, name, event, class, value, emission_date, expiration_date, payment_method, description, status, installment) 
        VALUES ('{liability_id}', '{company_id}', '{user_id}', '{name}', '{event}', '{classe}', {value}, '{emission_date}', '{expiration_date}', '{payment_method}', '{description}', '{status}' ,'{installment}');
    """)

    # Guarda os dados no histórico de ativos e passivos
    installment_record = 0
    for i in range(installment): #vai registrar a quantidade de parcelas
        historic_id =  uuid.uuid4()
        installment_record = installment_record + 1
        
        cur.execute(f"""
            INSERT INTO table_historic (historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, creation_date, creation_time, debit, credit, installment) 
            VALUES ('{historic_id}', '{company_id}', '{user_id}', '{liability_id}', '{name}', '{event}', '{classe}', {value/installment}, '{emission_date}', '{type}', '{creation_date}', '{creation_time}', {liability_debit/installment}, {liability_credit/installment} ,'{installment_record}');
        """)

    # Busca os dados de caixa
    cash_data = db_search_cash(company_id)
    cash_id = cash_data[0][0]  # ID do caixa
    date = cash_data[0][11]     # Data do registro de caixa

    # Atualiza o caixa de acordo com o evento
    if update_cash == 'more':
        cur.execute(f"""
            UPDATE table_assets 
            SET value = value + {value}, 
                debit = debit , 
                credit = credit + {cash_credit}
            WHERE name = '#!@cash@!#';
        """)
        

    elif update_cash == 'less':
        cur.execute(f"""
            UPDATE table_assets 
            SET value = value - {value}, 
                debit = debit + {cash_debit}, 
                credit = credit 
            WHERE name = '#!@cash@!#';
        """)

    new_historic_id = uuid.uuid4()

    # Adiciona o caixa inicial automaticamente (Pretendemos mudar isso para colocar na hora da criação da empresa)
    cur.execute(f"INSERT INTO table_historic (historic_id, company_id, user_id, patrimony_id, name, event, class, value, date, type, creation_date, creation_time, debit, credit) VALUES ('{new_historic_id}', '{company_id}', '{user_id}', '{cash_id}', '#!@cash@!#', 'Entrada de caixa', 'Caixa','{value}', '{date}', 'asset','{creation_date}', '{creation_time}', {cash_debit}, {cash_credit});")

    # Confirma as mudanças
    conn.commit()
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Liability registrado com sucesso!')

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
