from src.model.database.db_users.search_user import db_search_user
from werkzeug.security import check_password_hash

def user_login_verify(email_or_cpf, senha):
    # Buscar dados do usuário
    data_db = db_search_user(email_or_cpf)
    errors = []

    # Verificar se o usuário foi encontrado
    if not data_db:
        errors.append("Email/CPF não encontrado")
        return False, errors

    # Verificar se a senha corresponde ao hash armazenado
    hashed_password = check_password_hash(data_db[0][3], senha)

    if not hashed_password:
        errors.append("Senha incorreta")
        return False, errors # Login mal-sucedido, retorna 'False' porque deu errado e retorna 'errors' que é uma array de erros que ocorreram para o login não ocorrer com sucesso.

    return True, None  # Login bem-sucedido, retorna 'True' porque deu tudo certo e retorna 'None' pois não há erros (já que deu tudo certo.)