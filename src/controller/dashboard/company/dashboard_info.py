from flask import jsonify
from flask_login import current_user
from colorama import Fore, Style
from src.model.database.company.patrimony.asset.search_cash import db_search_cash

from src import cache

@cache.cached(timeout=30)  # Guarda as informações por 30 segundos
def dashboard_info(company_id):

    data = db_search_cash(company_id)
    print(data)
    
    return jsonify({"value": data}), 200
