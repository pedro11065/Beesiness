# Analisa se há informações de login para o banco de dados no json_db.json.
# Se houver, o banco de dados será conectado, se não, irá retornar False.
import json
import os

def connect_database():
    base_dir = os.path.dirname(os.path.abspath(__file__))  # Diretório do script em execução
    file_path = os.path.join(base_dir, 'information.json') 

    try:
        with open(file_path, "r") as file:
            config = json.load(file)

        db_config = config['db']

        host = db_config['host']
        database = db_config['database']
        user = db_config['user']
        password = db_config['password']

        return host, database, user, password
    except FileNotFoundError:
        print(f"Arquivo {file_path} não encontrado.")
        return False
    except KeyError as e:
        print(f"Chave {e} não encontrada no arquivo JSON.")
        return False
