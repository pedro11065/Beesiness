# Atualmente, o código não parece estar seguro, afinal, é so fazer uma requisição de e-mail que você consegue a senha de alguém.
# Recomendo antes de usar esse código, procurar novas maneiras de fazê-lo.

import psycopg2
from json_db import json_db_read

def search_user_by_email(email):
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

    # Procura o usuário pelo e-mail
    cur.execute("""
        SELECT * FROM table_users WHERE email = %s
    """, (email,))

    # Pega os dados do usuário
    user_data = cur.fetchall()

    # Fecha o cursor e a conexão
    cur.close()
    conn.close()

    return user_data

# Exemplo de uso
#user_info = search_user_by_email("nome_do_email@example.com")
#print(user_info)