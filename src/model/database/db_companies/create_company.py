import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log

def db_create_company(user_uuid, nome, email, cnpj, senha): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
    db_login = json_db_read()
    
    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )

    # Cria um cursor
    cur = conn.cursor()
    
    # Insere os dados principais do usuário para armazenar na tabela
    cur.execute(f"INSERT INTO table_companies (user_id, company_name, company_email, company_cnpj, company_password) VALUES ({user_uuid}, {nome}, {email}, {cnpj}, {senha});")

    message = (f"Empresa registrada.")
    db_create_log(message)

    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

