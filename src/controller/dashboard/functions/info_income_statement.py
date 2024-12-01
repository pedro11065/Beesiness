from flask_login import current_user
from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_income_statement(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id)
        if not historic_data:
            return jsonify({'error': 'No historical data found'}), 404

        assets = []
        liabilities = []

        years = set() # Conjunto para armazenar os anos de forma única

        for item in historic_data:
            try:
                transaction_date = datetime.strptime(item['date'], "%Y-%m-%d")
            except ValueError:
                continue

            # Adiciona o ano ao conjunto de anos únicos
            years.add(transaction_date.year)

            # Classifica os itens como ativos ou passivos
            if item['type'] == 'asset':
                assets.append(item)
            elif item['type'] == 'liability':
                liabilities.append(item)

        sorted_years = sorted(list(years)) # Convertendo o set de anos únicos para uma lista ordenada

        return jsonify({
            'dates': sorted_years,  # Anos únicos e ordenados
            'assets': assets,       # Lista de ativos
            'liabilities': liabilities  # Lista de passivos
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500