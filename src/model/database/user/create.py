import psycopg2
import uuid
from colorama import Fore, Style

from ..connect import connect_database

def db_create_user(fullname, cpf, email, password, birthday): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Registrando novo usuário...')
    
    db_login = connect_database() # Coleta os dados para conexão
    
    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host = db_login[0],
        database = db_login[1],
        user = db_login[2],
        password = db_login[3]
    )

    # Cria um cursor
    cur = conn.cursor()

    user_id = str(uuid.uuid4()) # Gera um UUID e o converte para string
    
    # Insere os dados principais do usuário para armazenar na tabela
   
    cur.execute(f"INSERT INTO table_users (user_id, user_fullname, user_email, user_password, user_birthday, user_cpf) VALUES ('{user_id}', '{fullname}', '{email}', '{password}', '{birthday}', '{cpf}');")

    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()
