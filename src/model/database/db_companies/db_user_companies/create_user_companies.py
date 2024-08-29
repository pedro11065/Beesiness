import psycopg2
from ...json_db import json_db_read

def db_create_company(uuid_company, uuid_user, user_access_level): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
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
    cur.execute(f"INSERT INTO table_user_companies (company_id, user_id, user_access_level) VALUES ({uuid_company}, {uuid_user}, {user_access_level});")

    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

