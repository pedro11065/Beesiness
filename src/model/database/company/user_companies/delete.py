import psycopg2

from ...connect import connect_database

def db_delete_user_company(delete_data):
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

    # Deleta os dados encontrados naquele e-mail.
    cur.execute("DELETE FROM table_user_companies WHERE company_cnpj = %s", (delete_data,))

    # Atualiza as informações.
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
