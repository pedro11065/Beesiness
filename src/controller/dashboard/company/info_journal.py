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
            record['creation_date'] = datetime.fromisoformat(record['creation_date']) 
            

        """            print(f"Depois: {record['creation_date'] , record['installment']}")
            record['creation_date'] = datetime.strptime(record['creation_date'], '%d/%m/%Y') # Formato YYYY-MM-DD
            if record['installment'] != None:
                new_month = record['creation_date'].month + record['installment']
                new_year = record['creation_date'].year + (new_month - 1) // 12
                new_month = (new_month - 1) % 12 + 1

                # Cria um novo objeto datetime com o ano e mês ajustados
                new_date = record['creation_date'].replace(year=new_year, month=new_month)

                # Atualiza o record com a nova data formatada
                record['creation_date'] = new_date.strftime('%Y-%m-%d')
            print(f"Depois: {record['creation_date'] , record['installment']}")
    """
    


    return jsonify({
        'redirect_url': f'/dashboard/daily/{cnpj}',
        'historic': info,
        'assets': assets_info,
        'liabilities': liabilities_info
    })


    

