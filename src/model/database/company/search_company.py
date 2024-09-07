# Responsável por retornar a linha onde o email foi inserido.

import psycopg2
from colorama import Fore, Style

from ..connect import connect_database

def db_search_company(search_data):

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Pesquisando dados das empresas - search_company')

    db_login = connect_database() # Coleta os dados para conexão

    #Conecta ao banco de dados.
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL

    data = search_data
    
    if len(data) == 14 and (data.isdigit()) : # CNPJ

        cur.execute(f"SELECT * from table_companies WHERE company_cnpj = '{data}';")
        db_data = cur.fetchall()
    
    elif data.isdigit() == False and '@' in data: # Email

        cur.execute(f"SELECT * from table_companies WHERE company_email = '{data}';")
        db_data = cur.fetchall()
    
    else: #company_id

        cur.execute(f"SELECT * from table_companies WHERE company_id = '{data}';")
        db_data = cur.fetchall()
        
    conn.commit();cur.close();conn.close()

    try:

        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados da empresa encotrados com sucesso!')
    
        return {
            "id_empresa": db_data[0][0],
            "id_usuário": db_data[0][1], #criador da empresa
            "nome": db_data[0][2],
            "email": db_data[0][3],
            "cnpj": db_data[0][4],
            "senha": db_data[0][5]
            }

    except:
        print(Fore.CYAN + '[Banco de dados] ' + Fore.RED  + f'Erro ao responder dados solicitados.' + Style.RESET_ALL)
        return False
