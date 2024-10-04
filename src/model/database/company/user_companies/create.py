import psycopg2

from ...connect import connect_database

def db_create_user_company(company_id, user_id, user_access_level):
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

    try:
        cur.execute("""INSERT INTO table_user_companies (company_id, user_id, user_access_level) VALUES (%s, %s, %s);""", (company_id, user_id, user_access_level))

        conn.commit()
        print(f'Usuário {user_id} adicionado à empresa {company_id} com permissão {user_access_level}.')
    
    except Exception as e:
        print(f"Erro ao inserir dados no banco de dados: {e}")
    
    finally:
        cur.close()
        conn.close()
