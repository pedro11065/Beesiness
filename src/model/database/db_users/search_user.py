import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log
from colorama import Fore, Style

def db_search_user(search_data):
    """Função principal para buscar dados de um usuário no banco de dados."""
    print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + 'Buscando dados...')
    
    db_login = json_db_read()  # Obtém as credenciais de acesso ao banco de dados
    conn = create_db_connection(db_login)
    
    if not conn:
        return None

    db_data = query_user_data(conn, search_data)
    conn.close()  # Fecha a conexão

    if db_data:
        print_user_data(db_data)
        return format_user_data(db_data)
    else:
        print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + 'Nenhum dado encontrado.')
        return None

def create_db_connection(db_login):
    """Estabelece a conexão com o banco de dados usando as credenciais fornecidas."""
    try:
        conn = psycopg2.connect(
            host=db_login[0],
            database=db_login[1],
            user=db_login[2],
            password=db_login[3]
        )
        return conn
    except Exception as e:
        print(Fore.RED + '[Banco de dados - Erro] ' + Style.RESET_ALL + str(e))
        db_create_log(f"Erro ao conectar ao banco de dados: {e}")
        return None

def query_user_data(conn, search_data):
    """Executa a consulta SQL para buscar os dados do usuário com base no CPF ou e-mail."""
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT user_id, user_cpf, user_email, user_password FROM table_users WHERE user_cpf = %s OR user_email = %s", 
                        (search_data, search_data))
            return cur.fetchone()
    except Exception as e:
        print(Fore.RED + '[Banco de dados - Erro] ' + Style.RESET_ALL + str(e))
        db_create_log(f"Erro ao buscar dados do usuário: {e}")
        return None

def print_user_data(db_data):
    """Imprime os dados do usuário retornados pela consulta."""
    print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + 'Dados encontrados:')
    for idx, value in enumerate(db_data):
        print(f'[{idx + 1}] - {value}')

def format_user_data(db_data):
    """Formata os dados do usuário em um dicionário para fácil manipulação posterior."""
    return {
        "id": db_data[0],
        "cpf": db_data[1],
        "email": db_data[2],
        "password_hash": db_data[3]
    }
