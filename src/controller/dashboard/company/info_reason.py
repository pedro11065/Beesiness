from flask_login import current_user
from flask import jsonify
from src.model.database.company.patrimony.historic.search import db_search_historic

def info_reason(company_id, cnpj):
    info = db_search_historic(company_id)

    if info is False:
        return jsonify({'message': 'Erro ao pesquisar no banco de dados, tente mais tarde.'}), 500

    if info is None:
        return jsonify({'message': 'Nenhum dado registrado no banco de dados.'})

    # Converte creation_date e creation_time para strings
    print("\nestou em: src/controller/dashboard/company/info_reason.py")
    for record in info:
        print(record)

        if 'creation_date' in record:
            record['creation_date'] = record['creation_date'].strftime('%Y-%m-%d')  # Formato YYYY-MM-DD
        
        if 'creation_time' in record:
            record['creation_time'] = record['creation_time'].strftime('%H:%M:%S')  # Formato HH:MM:SS

    return jsonify({
        'redirect_url': f'/dashboard/reason/{cnpj}',
        'historic': info
    })