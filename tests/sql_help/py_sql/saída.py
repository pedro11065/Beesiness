import psycopg2
from psycopg2 import Error

# Estabeleça a conexão com o banco de dados
try:
    connection = psycopg2.connect(
        user="postgres",
        password="32372403",
        host="localhost",
        port="12504",
        database="EDUCALOG"
    )

    cursor = connection.cursor()

    # Query para inserir dados
    insert_query = """INSERT INTO alunos (matricula, cpf, nomecompleto, telefone, idcurso, nomecurso, datanascimento)
                      VALUES (%s, %s, %s, %s, %s, %s, %s)"""

    # Dados a serem inseridos
    record_to_insert = ('00001', '50774811803', 'Pedro Henrique Silva Quixabeira', '13974256075', '2', 'Análise de Desenvolvimento de Sistemas', '2006-03-13')

    cursor.execute(insert_query, record_to_insert)
    connection.commit()
    print("Dados inseridos com sucesso!")

except (Exception, psycopg2.Error) as error:
    print("Erro ao conectar ao PostgreSQL ou inserir dados:", error)

finally:
    # Feche a conexão
    if connection:
        cursor.close()
        connection.close()
        print("Conexão ao PostgreSQL fechada")