import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log # Importação da função que lê os dados que armazenam as informações do servidor.
from colorama import Fore, Style

def db_search_user(search_data):
    
    print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + 'Buscando dados...')
    db_login = json_db_read()

    # Conecta ao banco de dados.
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor() # Cria um cursor no PostGreSQL
    
    cur.execute(f"SELECT * FROM table_users WHERE user_cpf = '{search_data}' or user_email = '{search_data}';")
       
    message = f"Pesquisa em table_users por '{search_data}'" 
    db_create_log(message)
    
    db_data = cur.fetchall() # Pega todos os resultados da consulta

    conn.commit()
    cur.close() # Fecha o cursor
    conn.close() # Fecha a conexão geral

    if db_data:
        print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + 'Dados encontrados: \n')
        for i in range(len(db_data[0])):
            print(f'//{db_data[0][i]}//')
    else:
        print(Fore.BLUE + '[Banco de dados] ' + Style.RESET_ALL + 'Nenhum dado encontrado.')

    return db_data # Retorna o resultado para a função login_verify
