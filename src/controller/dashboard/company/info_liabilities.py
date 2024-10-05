from flask import jsonify
from flask_login import current_user
from colorama import Fore, Style
from src.model.database.company.patrimony.liability.search import db_search_liability

from src import cache

import datetime

@cache.cached(timeout=30)  # Guarda as informações por 30 segundos
def info_liabilities(company_id):

    data = db_search_liability(company_id)
    print(data)
    
    return jsonify({'value': data}), 200
