# Responsável por retornar a linha onde o email foi inserido.

import psycopg2
from ..json_db import json_db_read # Importação da função que lê os dados que armazenam as informações do servidor.

def db_search_company(search_data):

    try:
        db_login = json_db_read()

        #Conecta ao banco de dados.
        conn = psycopg2.connect(
            host=db_login[0],
            database=db_login[1],
            user=db_login[2],
            password=db_login[3]
        )
        cur = conn.cursor() # Cria um cursor no PostGreSQL
        
        cur.execute(f"SELECT * FROM table_companies WHERE company_cpf = '{search_data}' or company_email = '{search_data}' or company_id = '{search_data}' or company_cnpj = '{search_data}';")   
        
        #---------------------------------------------------------------INDICES---------------------
                                                    #0         1          2      3         4
        db_data = cur.fetchall() #valores da linha: #_company_id , user_id, nome, cnpj, senha

        conn.commit()
        cur.close() # Fecha o cursor
        conn.close() # Fecha a conexão geral
        
        return {
            "id_empresa": db_data[0][0],
            "id_usuário": db_data[0][1], #criador da empresa
            "nome": db_data[0][2],
            "email": db_data[0][3],
            "cnpj": db_data[0][4],
            "senha": db_data[0][5]
        }
    except:
        return False