# Responsável por retornar a linha onde o email foi inserido.

import psycopg2
from ..json_db import json_db_read # Importação da função que lê os dados que armazenam as informações do servidor.

def db_search_company(search_data):

    db_login = json_db_read()

    #Conecta ao banco de dados.
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    
    cur.execute(f"SELECT * FROM table_companies WHERE company_cpf = '{search_data}' or company_email = '{search_data}' or company_id = '{search_data}';")   
    #---------------------------------------------------------------INDICES---------------------
                                                #0         1          2      3         4
    db_data = cur.fetchall() #valores da linha: #id , nomecompleto, email, senha, datanascimento

    conn.commit()
    cur.close() # Fecha o cursor
    conn.close() # Fecha a conexão geral
    
    return db_data #Retorna o resultado para a função login_verify