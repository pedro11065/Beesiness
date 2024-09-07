# Arquivo responsável pelo LoginManager que é utilizado no arquivo __init__.py, esses são os dados do usuário.

from flask_login import UserMixin
from werkzeug.security import check_password_hash

class User(UserMixin):
    def __init__(self, id, fullname, email, cpf, password_hash):
        self.id = id
        self.fullname = fullname
        self.email = email
        self.cpf = cpf
        self.password_hash = password_hash

    def get_id(self):
        return str(self.id)  # Retorna o ID como string

    def check_password(self, password):
        """Verifica se a senha fornecida corresponde ao hash armazenado."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"User(id={self.id}, fullname={self.fullname}, email={self.email}, cpf={self.cpf})"
