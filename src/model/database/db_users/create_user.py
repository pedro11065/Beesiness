# **Aviso de Segurança e Recomendações**

"""
O código atualmente não está seguro o suficiente, a inserção de dados diretamente no banco de dados é perigoso, visto que os dados são armazenados "cru" no banco.
Recomendações para melhorar o código:

1. Hashing de Senhas: Antes de armazenar as senhas, é interessante usar uma função de hash segura (como bcrypt, Argon2 ou PBKDF2). Isso evita que caso o banco de dados seja vazado, as senhas dos usuários não sejam diretamente acessíveis. 
2. Validação e Sanitização de Dados: É necessário verificar todos os dados recebidos para evitar injeções SQL e outros ataques. 
    Imagine que alguém foi colocar a senha e coloque dentro da caixa de escrever: DELETE FROM table_users
    O banco de dados simplesmente será apagado.

3. Segurança de Conexão:  Utilize SSL/TLS no seu banco de dados, isso protege os dados no seu "trajeto" até chegar no banco de dados.
4. Armazenamento: Os dados sensíveis devem usar criptografia, para evitar, novamente, vazamento de senhas.
"""

import psycopg2
from ..json_db import json_db_read
from ..db_log.create_log import db_create_log

def db_create_user(fullname, cpf, email, password, birthday): # Cria um usuário usando as informações do user_info como parametro, todos os dados são temporários.
    
    print("\nRegistrando novo usuário no banco de dados...")
    
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

    print(fullname, cpf, email, password, birthday)
    
    # Insere os dados principais do usuário para armazenar na tabela
    cur.execute(f"INSERT INTO table_users (user_fullname, user_email, user_password, user_birthday, user_cpf) VALUES({fullname}, {email}, {password}, {birthday}, {cpf});")

    message = (f"Usuário registrado.);") 
    db_create_log(message)

    # Confirma as mudanças
    conn.commit()

    # Fecha o cursor e encerra a conexão.
    cur.close()
    conn.close()

    print("\nDados registrados com sucesso!")
