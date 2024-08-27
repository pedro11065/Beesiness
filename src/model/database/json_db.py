# Analisa se há informações de login para o banco de dados no json_db.json.
# Se houver, o banco de dados será conectado, se não, irá retornar False.
import json
import os

def json_db_read():
    # Define o caminho relativo a partir da localização atual do script
    base_dir = os.path.dirname(os.path.abspath(__file__))  # Diretório do script em execução
    file_path = os.path.join(base_dir, 'json_db.json')  # Ajuste o caminho para evitar duplicação

    try:
        with open(file_path, "r") as file:
            data = json.load(file)

        host = data['db']['host']
        database = data['db']['database']
        user = data['db']['user']
        password = data['db']['password']

        return host, database, user, password
    except FileNotFoundError:
        print(f"Arquivo {file_path} não encontrado.")
        return False
    except KeyError as e:
        print(f"Chave {e} não encontrada no arquivo JSON.")
        return False
