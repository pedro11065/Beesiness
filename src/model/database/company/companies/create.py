import psycopg2
import uuid
from colorama import Fore, Style

from ...connect import connect_database

def db_create_company(nome, user_id, email, cnpj, hashed_password): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
    
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Registrando a empresa no banco de dados...')

    db_login = connect_database() # Coleta os dados para conexão
    
    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )

    # Cria um cursor
    cur = conn.cursor()

    company_id = uuid.uuid4() # Uuid novo para empresa
   
    # Insere os dados principais do usuário para armazenar na tabela
    cur.execute(f"INSERT INTO table_companies (company_id, user_id, company_name, company_email, company_cnpj, company_password) VALUES ('{company_id}','{user_id}','{nome}','{email}','{cnpj}','{hashed_password}');")  
    
    asset_id = uuid.uuid4()

    cur.execute(f"INSERT INTO table_assets (asset_id, company_id, user_id, name, event, class, value, location, acquisition_date, description, status) VALUES ('{asset_id}', '{company_id}', '{user_id}', '#!@cash@!#', 'entrada de caixa', 'caixa', '0', '----', '01-01-2024', '----', 'Em uso');")
    
    user_access_level = 'creator' # Nivel do usuário
    
    # Relação do usuário com a empresa a qual ele criou
    cur.execute(f"INSERT INTO table_user_companies (company_id, user_id, user_access_level) VALUES ('{company_id}', '{user_id}', '{user_access_level}');")

    # Confirma as mudanças
    conn.commit()
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Empresa registrada com sucesso!')

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

