from flask_login import UserMixin
from werkzeug.security import check_password_hash

class User(UserMixin):
    def __init__(self, id, email, cpf, password_hash):
        self.id = id
        self.email = email
        self.cpf = cpf
        self.password_hash = password_hash

    def get_id(self):
        return (self.id)  # Retorna o UUID como string
    
    def __repr__(self):
        return f"User(id={self.id}, email={self.email}, cpf={self.cpf})"