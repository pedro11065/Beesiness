from src.model.database.db_users.search_user import db_search_user

def login_verify(email_or_cpf, senha): #O "username" que tava antes não era porque aceita o nome do usuário, é pq o login.js não queria mudar o .json pra email POR NADA, ai botei o or username lá na API
    data_db = db_search_user(email_or_cpf)
    print(f'Um usuário tentou logar no sistema.')
    print(f'Dados do usuário: {data_db}')

    errors = []

    if not data_db:
        errors.append("Email/CPF não encontrado")
    elif data_db[0][3] != senha:
        errors.append("Senha incorreta")
    else:
        return True, None  # Login bem-sucedido, retorna 'True' porque deu tudo certo e retorna 'None' pois não há erros (já que deu tudo certo.)

    # Retorna False e a lista de erros
    return False, errors # Login mal-sucedido, retorna 'False' porque deu errado e retorna 'errors' que é uma array de erros que ocorreram para o login não ocorrer com sucesso.
