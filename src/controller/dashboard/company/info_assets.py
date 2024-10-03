from flask import jsonify
from flask_login import current_user
from colorama import Fore, Style
from src.model.database.company.patrimony.asset.search import db_search_asset

from src import cache

@cache.cached(timeout=30)  # Guarda as informações por 30 segundos
def info_assets(company_id):

    data = db_search_asset(company_id)
    print(data)
    
    return jsonify({"value": data}), 200
