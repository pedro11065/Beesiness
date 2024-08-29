# Responsável por retornar a linha onde o email foi inserido.

import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log # Importação da função que lê os dados que armazenam as informações do servidor.

#O parametro data tem 2 valores, email(login_data[0]) e senha(login_data[1]), enviados na hora do login.
def db_search_user(search_data):
    
    print("------------------------------------------------------------")
    print("\nBuscando dados...")
    db_login = json_db_read()

    #Conecta ao banco de dados.
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    
    cur.execute(f"SELECT * FROM table_users WHERE user_cpf = '{search_data}' or user_email = '{search_data}';")
       
    message = (f"Pesquisa em table_users por '{search_data}'") ; db_create_log(message)
    #---------------------------------------------------------------INDICES---------------------
                                                #0         1          2      3         4
    db_data = cur.fetchall() #valores da linha: #id , nomecompleto, email, senha, datanascimento

    conn.commit()
    cur.close() # Fecha o cursor
    conn.close() # Fecha a conexão geral

    print("\nDados encotrados:\n")
    for i in range(len(db_data[0])):
        print(f'//{db_data[0][i]}//')
    print("\n")
    
    return db_data #Retorna o resultado para a função login_verify