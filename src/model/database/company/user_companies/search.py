#Pesquisa um valor na tabela "table_user_companies" que registra as relações entre os demais usuários de uma empresa, além do criador

# Responsável por retornar a linha onde o email foi inserido.

import psycopg2
from colorama import Fore, Style
from ...connect import connect_database

def db_search_user_company(user_id, company_id):
        db_login = connect_database() # Coleta os dados para conexão

        #Conecta ao banco de dados.
        conn = psycopg2.connect(
            host=db_login[0],
            database=db_login[1],
            user=db_login[2],
            password=db_login[3]
        )
        cur = conn.cursor() # Cria um cursor no PostGreSQL

        if company_id is None:
            # Se company_id for None, busque todas as empresas para o user_id
            query = "SELECT * FROM table_user_companies WHERE user_id = %s"
            cur.execute(query, (user_id,))
        else:
            # Se company_id for fornecido, busque a relação específica
            print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando relação do usuário com a empresa com o id de usuário: {user_id} e company_id: {company_id}')
            query = "SELECT * FROM table_user_companies WHERE user_id = %s AND company_id = %s"
            cur.execute(query, (user_id, company_id))
        
        #---------------------------------------------------------------INDICES---------------------
                                                        #0         1             2     
        db_data = cur.fetchall() #valores da linha: #company_id, user_id, user_access_level

        conn.commit()
        cur.close() # Fecha o cursor
        conn.close() # Fecha a conexão geral

        if not db_data:
            return False
        else:
            return db_data