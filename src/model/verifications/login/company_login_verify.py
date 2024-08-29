from src.model.database.db_users.search_user import db_search_user
from src.model.database.db_companies.search_company import db_search_company
from src.model.database.db_companies.db_user_companies.search_user_companies import db_search_user_companies

def comapany_login_verify(cnpj, senha): 
    data_db = db_search_user(cnpj)

    """
    Eu preciso saber quem está acessando, mas eu n posso perguntar o cpf pq a pessoa acabou de fazer login, o certo é aquela coisa de manter logado...
    #quando o sistema de saber quem está logado estiver funcionando, o lógica será:

    uuid_user_logged = ???

    if id uuid_user_logged != data_db[1]  Se o usuário que está logando tive o mesmo id de quem criou a empresa
        return True, None

    elif 
    """

    errors = []

    if not data_db:
        errors.append("Email/CPF não encontrado")
    elif data_db[0][3] != senha:
        errors.append("Senha incorreta")
    else:
        return True, None  # Login bem-sucedido, retorna 'True' porque deu tudo certo e retorna 'None' pois não há erros (já que deu tudo certo.)

    # Retorna False e a lista de erros
    return False, errors # Login mal-sucedido, retorna 'False' porque deu errado e retorna 'errors' que é uma array de erros que ocorreram para o login não ocorrer com sucesso.
