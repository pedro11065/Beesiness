import psycopg2
from colorama import Fore, Style
from ...connect import connect_database

def db_search_user_companies_with_company_info(user_id):
    db_login = connect_database()  # Coleta os dados para conexão

    # Conecta ao banco de dados.
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostgreSQL
    
    # Basicamente, as informações do usuário e das empresas é combinada, mostrando quais empresa o usuário trabalha e seu nível de acesso nelas. Tudo baseado no seu user_id (único);
    cur.execute("""
        SELECT user_companies.company_id, user_companies.user_id, user_companies.user_access_level, 
        companies.company_name, companies.company_cnpj
        FROM table_user_companies user_companies
        JOIN table_companies companies ON user_companies.company_id = companies.company_id
        WHERE user_companies.user_id = %s;
        """, (user_id,))
    
    db_data = cur.fetchall()
    
    conn.commit()
    cur.close()  # Fecha o cursor
    conn.close()  # Fecha a conexão geral

    if not db_data:
        print(f'{Fore.CYAN}[Banco de dados]{Fore.RED} Nenhuma empresa encontrada para o usuário {user_id}!{Style.RESET_ALL}')
        return None
    else:
        print(f'{Fore.CYAN}[Banco de dados]{Style.RESET_ALL} Empresas encontradas com sucesso!')
        return db_data
