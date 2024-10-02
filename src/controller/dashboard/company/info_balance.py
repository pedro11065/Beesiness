from flask_login import current_user
from flask import jsonify

from src.model.database.company.patrimony.historic.search import db_search_historic
from src.model.database.company.patrimony.search_all import db_search_liabilities_and_assets

def info_balance(company_id, cnpj):

    info = db_search_liabilities_and_assets(company_id)

    return jsonify({'funcionando!':f'{info}'}),200


    

