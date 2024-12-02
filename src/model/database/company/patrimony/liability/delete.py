import psycopg2
from colorama import Fore, Style
from ....connect import connect_database

def db_delete_liability(liability_id, company_id):
    db_login = connect_database()  # Coleta os dados para conexão

    # Conecta ao banco de dados
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3]
    )
    cur = conn.cursor()  # Cria um cursor no PostgreSQL

    print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + f'Deletando liability com ID {liability_id} da empresa {company_id}')

    try:
        cur.execute(
            "DELETE FROM table_liabilities WHERE liability_id = %s AND company_id = %s",
            (liability_id, company_id)
        )
    except Exception as error:
        print(Fore.RED + '[Banco de dados] ' + Style.RESET_ALL + f'Erro ao deletar o liability: {error}')
        conn.rollback()  # Reverte quaisquer mudanças em caso de erro
        return False
    else:
        conn.commit()
        print(Fore.CYAN + '[Banco de dados] ' + Style.RESET_ALL + 'Liability deletado com sucesso!')
    finally:
        cur.close()
        conn.close()

    return True
