from flask import jsonify
from flask_login import current_user
from colorama import Fore, Style
from src.model.database.company.user_companies.search_all import db_search_user_companies_with_company_info

from src import cache

@cache.cached(timeout=30)  # Guarda as informações por 30 segundos
def info_user_companies():
    data = db_search_user_companies_with_company_info(current_user.id)
    
    if data:
        qnt_relation = len(data)  # Quantidade de relações (linhas)
        
        access_levels = []
        names = []
        cnpjs = []

        for row in data:
            access_level = row[2]  # Nível de acesso do usuário
            company_name = row[3]  # Nome da empresa
            company_cnpj = row[4]  # CNPJ da empresa

            access_levels.append(access_level)
            names.append(company_name)
            cnpjs.append(company_cnpj)
        
        if names and cnpjs:
            return jsonify({
                "relação": True,
                "Quantidade": qnt_relation,
                "nivel de acesso": access_levels,
                "nomes": names,
                "cnpjs": cnpjs
            }), 200
        else:
            return jsonify({
                "relação": False,
            }), 200
    else:
        print(f'{Fore.RED}Nenhuma relação encontrada!{Style.RESET_ALL}')
        return jsonify({"relação": False}), 200
