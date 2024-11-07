from flask import jsonify
from flask_login import current_user
from colorama import Fore, Style
from src.model.database.company.patrimony.liability.search import db_search_liability

from src import cache

import datetime

@cache.cached(timeout=30)  # Guarda as informações por 30 segundos
def info_liabilities(company_id):
    info = db_search_liability(company_id)

    if info is False:
        return jsonify({'message': 'Erro ao pesquisar no banco de dados, tente mais tarde.'}), 500

    if info is None:
        return jsonify({'message': 'Nenhum dado registrado no banco de dados.'})
    
    return jsonify({'historic': info}), 200
