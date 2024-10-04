import psycopg2
from colorama import Fore, Style
from ...connect import connect_database

def db_search_users_in_company(company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()
    
    
    # Caso queira o uuid, troque user_companies.id por user_companies.user_id
    # Busca todos os usuários da empresa específica
    cur.execute(""" 
    SELECT user_companies.id,  
           user_companies.user_access_level, 
           users.user_fullname, 
           users.user_cpf 
    FROM table_user_companies user_companies 
    JOIN table_users users ON user_companies.user_id = users.user_id 
    WHERE user_companies.company_id = %s;
    """, (company_id,))

    
    db_data = cur.fetchall()
    
    conn.commit()
    cur.close()
    conn.close()

    if not db_data:
        print(f'{Fore.CYAN}[Banco de dados]{Fore.RED} Nenhum usuário encontrado para a empresa {company_id}!{Style.RESET_ALL}')
        return None
    else:
        print(f'{Fore.CYAN}[Banco de dados]{Fore.GREEN} Usuários encontrados com sucesso!{Style.RESET_ALL}')
        return db_data
