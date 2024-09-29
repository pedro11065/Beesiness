import psycopg2
from colorama import Fore, Style
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
    try:
        cur.execute("SELECT * FROM table_historic WHERE company_id = %s;", (company_id,))
        historic_data = cur.fetchall()

        if not historic_data:
            print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Nenhum dado de histórico encontrado.')
            return None

        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Dados do histórico encontrados com sucesso!')

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
            "type": data[9],
            "creation_date": data[10],
            "creation_time": data[11]
        } for data in historic_data]

    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Dados do histórico não encontrados: {error}')
        return None

    finally:
        cur.close()
        conn.close()

    # Retorna uma lista de liabilities e assets
    
    if historic_data == []:
        return False
    
    else:
        historic_id = [] ; company_id = [] ; user_id = [] ; patrimony_id = []
        name = []; event = [] ; class_ = [] ; value = [] ; date = [] ; type = []
        creation_date = [] ; creation_time = []

        for data in historic_data:
            historic_id.append(data[0]) 
            company_id.append(data[1])
            user_id.append(data[2])
            patrimony_id.append(data[3])
            name.append(data[4])
            event.append(data[5])
            class_.append(data[6])
            value.append(data[7])
            date.append(data[8])
            type.append(data[9])
            creation_date.append(data[10])
            creation_time.append(data[11])

    return {
        'historic_id': historic_id,
        'company_id': company_id,
        'user_id': user_id,
        'patrimony_id': patrimony_id,
        'name': name,
        'event': event,
        'class_': class_,
        'value': value,
        'date': date,
        'type': type,
        'creation_date': creation_date,
        'creation_time': creation_time
    }
