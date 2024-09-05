import psycopg2
import uuid
from ..json_db import json_db_read
from colorama import Fore, Style

def db_create_company(nome, user_id, email, cnpj, hashed_password): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
    
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Registrando nova empresa - create_company')

    db_login = json_db_read()
    
    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )

    # Cria um cursor
    cur = conn.cursor()

    company_id = uuid.uuid4()#uuid novo para empresa
   
    # Insere os dados principais do usuário para armazenar na tabela
    cur.execute(f"INSERT INTO table_companies (company_id, user_id, company_name, company_email, company_cnpj, company_password) VALUES ('{company_id}','{user_id}','{nome}','{email}','{cnpj}','{hashed_password}');")  

    
    user_access_level = 'creator'#nivel do usuário
    
    # Relação do usuário com a empresa a qual ele criou
    cur.execute(f"INSERT INTO table_user_companies (company_id, user_id, user_access_level) VALUES ('{company_id}', '{user_id}', '{user_access_level}');")

    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Empresa registrados com sucesso!')

