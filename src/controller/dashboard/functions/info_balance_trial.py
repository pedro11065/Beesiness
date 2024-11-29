from flask_login import current_user
from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_balance_trial(company_id, cnpj):
    info = db_search_historic(company_id)
    print(f'Info do balance_trial:\n{info}')
    
    if info is False:
        return jsonify({'message': 'Erro ao pesquisar no banco de dados, tente mais tarde.'}), 500

    if info is None:
        return jsonify({'message': 'Nenhum dado registrado no banco de dados.'})

    # Busca todos os dados, filtra pelos que estão com 'creation_date' e formata pelo horário correto.
    for record in info:
        if 'creation_date' in record:
            record['creation_date'] = datetime.fromisoformat(record['creation_date'])

    return jsonify({
        'historic': info
    })


    

