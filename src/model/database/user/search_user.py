import psycopg2
from psycopg2 import sql
from colorama import Fore, Style

from ..connect import connect_database

def db_search_user(search_data):
    db_login = connect_database() # Coleta os dados para conexão

    try:
        # O 'with' garante que a conexão seja fechada automaticamente, mesmo que ocorra um erro durante a execução
        with psycopg2.connect( # Conecta ao banco de dados
            host=db_login[0],
            database=db_login[1],
            user=db_login[2],
            password=db_login[3]
        ) as conn: 
            with conn.cursor() as cur: # Cria um cursor usando 'with' para garantir que o cursor seja fechado automaticamente, mesmo em caso de erro
                if len(search_data) == 11 and search_data.isdigit():  # CPF
                    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário com cpf ou email: {search_data}')

                    query = """
                        SELECT user_id, user_fullname, user_cpf, user_email, user_password 
                        FROM table_users 
                        WHERE user_cpf = %s OR user_email = %s;
                    """

                    parametros = (search_data, search_data)
                
                elif '@' in search_data and not search_data.isdigit():  # Email
                    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário via e-mail: {search_data}')

                    query = """
                        SELECT user_id, user_fullname, user_cpf, user_email, user_password 
                        FROM table_users 
                        WHERE user_email = %s;
                    """
                    parametros = (search_data,) # Tupla com um elemento pois o psycopg2 pede dessa forma quando só tem um parâmetro.
                
                else:  # user_id
                    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando dados do usuário com user_id: {search_data}')

                    query = """
                        SELECT user_id, user_fullname, user_cpf, user_email, user_password 
                        FROM table_users 
                        WHERE user_id = %s;
                    """
                    parametros = (search_data,) # Tupla com um elemento pois o psycopg2 pede dessa forma quando só tem um parâmetro.
                
                # Executa a consulta
                cur.execute(query, parametros)
                db_data = cur.fetchall()

    except Exception as e:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Erro ao pesquisar dados do usuário: {e}')
        return False


    if db_data:
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Dados do usuário encontrados com sucesso!')
        return {
            "id": db_data[0][0],
            "fullname": db_data[0][1],
            "cpf": db_data[0][2],
            "email": db_data[0][3],
            "password_hash": db_data[0][4]
        }
    else:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + 'Dados do usuário não encontrados')
        return False