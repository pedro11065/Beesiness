import psycopg2
from colorama import Fore, Style
import datetime
from ....connect import connect_database

def db_search_historic(company_id):
    db_login = connect_database()

    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Pesquisando histórico de entradas e saídas para a empresa com company_id: {company_id}')
    try:                                                                #Para deixar o dado mais recente primeiro
        cur.execute("SELECT * FROM table_historic WHERE company_id = %s ORDER BY creation_date DESC, creation_time DESC;", (company_id,))
        historic_data = cur.fetchall()

        if not historic_data:
            print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Nenhum dado de histórico encontrado.')
            return None

        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Dados do histórico encontrados com sucesso!')

        # ERRO DE BUSCA: a partir de type tá retornando outros valores em posições incorretas
        historic = [{
            "historic_id": data[0],
            "company_id": data[1],
            "user_id": data[2],
            "patrimony_id": data[3],
            "name": data[4],
            "event": data[5],
            "class": data[6],
            "value": data[7],
            "date": data[8],
            "creation_date": data[9].strftime("%Y-%m-%d") if isinstance(data[9], datetime.date) else data[9],
            "creation_time": data[10].strftime('%H:%M:%S') if isinstance(data[10], datetime.time) else data[10],
            "debit": data[11],
            "credit": data[12],
            "installment":data[13],
            "type": data[14],
            "floating": data[15],
            "ignore": data[16]

        } for data in historic_data]

    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Erro ao buscar dados do histórico: {error}')
        return False

    finally:
        cur.close()
        conn.close()

    return historic
