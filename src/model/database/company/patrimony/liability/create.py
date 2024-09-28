""""cnpj: cnpj,
            event: eventvalue,
            classe: classvalue,
            payment: payment,
            status: status,
            name: name,
            value: value,
            emission_date: emission_date,
            pay_date: pay_date,
            description: description"""

import psycopg2
import uuid
from colorama import Fore, Style
from ....connect import connect_database


def db_create_liability(company_id, user_id, name, event, classe, value, emission_date, expiration_date, payment_method, description, status): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.

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
    liability_id = uuid.uuid4()

    # Insere os dados principais do usuário para armazenar na tabela
    cur.execute(f"INSERT INTO table_liabilities (liability_id, company_id, user_id, name, event, class, value, emission_date, expiration_date, payment_method, description, status) VALUES ('{liability_id}', '{company_id}', '{user_id}', '{name}', '{event}', '{classe}', '{value}', '{emission_date}', '{expiration_date}', '{payment_method}', '{description}', '{status}');")  

    # Confirma as mudanças
    conn.commit()
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Liability registrado com sucesso!')

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
