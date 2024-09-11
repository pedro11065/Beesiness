import psycopg2

from ...connect import connect_database

def db_create_user_company(company_id, user_id, user_access_level): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
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
    
    # Insere os dados principais do usuário para armazenar na tabela
    cur.execute(
    f"INSERT INTO table_user_companies (uuid_company, uuid_user, user_access_level) VALUES ('{company_id}', {user_id}, {user_access_level});")
    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

