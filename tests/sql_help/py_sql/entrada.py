import psycopg2

# Estabelecer a conexão com o banco de dados
try:
    connection = psycopg2.connect(
        user="postgres",
        password="32372403",
        host="localhost",
        port="12504",
        database="EDUCALOG"
    )

    cursor = connection.cursor()

    # Consulta SQL para selecionar todos os dados da tabela alunos
    query = "SELECT * FROM alunos;"
    
    # Executar a consulta SQL
    cursor.execute(query)
    
    # Fetchall para obter todos os resultados
    rows = cursor.fetchall()

    # Criar listas para cada coluna da tabela
    matriculas = []
    cpfs = []
    nomes_completos = []
    telefones = []
    ids_cursos = []
    nomes_cursos = []
    datas_nascimento = []

    # Preencher as listas com os dados
    for row in rows:
        matriculas.append(row[0])
        cpfs.append(row[1])
        nomes_completos.append(row[2])
        telefones.append(row[3])
        ids_cursos.append(row[4])
        nomes_cursos.append(row[5])
        datas_nascimento.append(row[6])

    # Imprimir os resultados
    print("Matriculas:", matriculas)
    print("CPFs:", cpfs)
    print("Nomes Completos:", nomes_completos)
    print("Telefones:", telefones)
    print("IDs dos Cursos:", ids_cursos)
    print("Nomes dos Cursos:", nomes_cursos)
    print("Datas de Nascimento:", datas_nascimento)

except (Exception, psycopg2.Error) as error:
    print("Erro ao conectar ao PostgreSQL ou ao recuperar dados:", error)

finally:
    # Fechar a conexão com o banco de dados
    if connection:
        cursor.close()
        connection.close()
        print("Conexão ao PostgreSQL fechada")
