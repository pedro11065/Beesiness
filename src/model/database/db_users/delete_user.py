import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log

def db_delete_user(delete_data):
    from colorama import Fore, Style
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'deletando usuário - delete_user')

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

    data = delete_data

    # Deleta os dados encontrados naquele e-mail.
    cur.execute(f"DELETE FROM table_companies WHERE user_cpf = '{data}'")
    
    # Atualiza as informações.
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Usuário deletado com sucesso!')