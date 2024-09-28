import psycopg2
from colorama import Fore, Style
from ...connect import connect_database

def db_search_liabilities_and_assets(company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostGreSQL

    liabilities = []
    assets = []

    # Busca liabilities
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando liabilities para a empresa com company_id: {company_id}')
    try:
        cur.execute(f"SELECT * FROM table_liabilities WHERE company_id = '{company_id}';")
        db_liabilities = cur.fetchall()
        
        liabilities = [{
            "liability_id": data[0],
            "company_id": data[1],
            "user_id": data[2],
            "name": data[3],
            "event": data[4],
            "class": data[5],
            "value": data[6],
            "emission_date": data[7],
            "expiration_date": data[8],
            "payment_method": data[9],
            "description": data[10],
            "status": data[11]
        } for data in db_liabilities]
        
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados das liabilities encontrados com sucesso!')

    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados das liabilities não encontrados: {error}')

    # Busca assets
    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando assets para a empresa com company_id: {company_id}')
    try:
        cur.execute(f"SELECT * FROM table_assets WHERE company_id = '{company_id}';")
        db_assets = cur.fetchall()
        
        assets = [{
            "asset_id": data[0],
            "company_id": data[1],
            "user_id": data[2],
            "name": data[3],
            "event": data[4],
            "class": data[5],
            "value": data[6],
            "location": data[7],
            "acquisition_date": data[8],
            "description": data[9],
            "status": data[10]
        } for data in db_assets]

        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Dados dos assets encontrados com sucesso!')

    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados dos assets não encontrados: {error}')

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

    # Retorna uma lista de liabilities e assets
    return {
        "liabilities": liabilities,
        "assets": assets
    }