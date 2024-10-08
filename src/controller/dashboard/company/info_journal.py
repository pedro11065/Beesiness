from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic
from src.model.database.company.patrimony.asset.search import db_search_asset
from src.model.database.company.patrimony.liability.search import db_search_liability

def info_journal(company_id, cnpj):

    info = db_search_historic(company_id)

    if info is False:
        return jsonify({'message': 'Erro ao pesquisar no banco de dados, tente mais tarde.'}), 500

    if info is None:
        return jsonify({'message': 'Nenhum dado registrado no banco de dados.'})
    
    assets_info = db_search_asset(company_id)
    liabilities_info = db_search_liability(company_id)

    # Busca todos os dados, filtra pelos que estão com 'creation_date' e formata pelo horário correto.
    for record in info:
        if 'creation_date' in record:
            # Converte a string no formato DD/MM/YYYY para um objeto datetime
            record['creation_date'] = datetime.strptime(record['creation_date'], '%d/%m/%Y').strftime('%Y-%m-%d')  # Formato YYYY-MM-DD
        


    return jsonify({
        'redirect_url': f'/dashboard/daily/{cnpj}',
        'historic': info,
        'assets': assets_info,
        'liabilities': liabilities_info
    })


    

