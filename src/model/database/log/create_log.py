import psycopg2

from ..connect import connect_database

def db_create_log(message): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
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
    cur.execute("INSERT INTO table_log_all (log_message) VALUES (%s)", (f'{message}',))

    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

