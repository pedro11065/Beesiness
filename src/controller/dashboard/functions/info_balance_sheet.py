from flask_login import current_user
from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_balance_sheet(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id)
        if not historic_data:
            return jsonify({'error': 'No historical data found'}), 404

        # Data de corte (transações dentro dos últimos 12 meses são consideradas circulantes)
        data_corte = datetime.now().replace(year=datetime.now().year - 1)

        # Inicializa estruturas para ativos, passivos e patrimônio líquido
        assets = {'circulante': {}, 'nao_circulante': {}}
        liabilities = {'circulante': {}, 'nao_circulante': {}}
        patrimony = {}

        datas = set() # Cria um set para garantir que as datas sejam únicas

        for item in historic_data:
            if item['name'] == '#!@cash@!#':
                continue

            try:
                transaction_date = datetime.strptime(item['date'], "%Y-%m-%d")
            except ValueError:
                continue

            # Adiciona a data ao set de datas únicas
            datas.add(transaction_date.date())

            # Classifica os itens como ativos, passivos ou patrimônio líquido
            category = 'circulante' if transaction_date > data_corte else 'nao_circulante'
            if item['type'] == 'asset':
                assets[category][item['name']] = assets[category].get(item['name'], 0) + item['value']
            elif item['type'] == 'liability':
                if item['name'] in ['Capital Social', 'Lucros acumulados']: # Move "Capital Social" e "Lucros acumulados" para o patrimônio líquido
                    patrimony[item['name']] = patrimony.get(item['name'], 0) + item['value']
                else:
                    liabilities[category][item['name']] = liabilities[category].get(item['name'], 0) + item['value']

        # Ordenar as datas por ordem crescente e colocar no formato 'YYYY-MM-DD'
        sorted_dates = sorted(list(datas))
        sorted_dates_str = [date.strftime("%Y-%m-%d") for date in sorted_dates]

        return jsonify({
            'dates': sorted_dates_str,
            'assets': assets,
            'liabilities': liabilities,
            'patrimony': patrimony
        })
    
    except Exception as e:
        # Caso ocorra algum erro inesperado, retorna um erro genérico
        return jsonify({'error': str(e)}), 500
