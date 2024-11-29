from flask_login import current_user
from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_income_statement(company_id, cnpj):
    try:
        # Obtém os dados históricos do banco de dados
        historic_data = db_search_historic(company_id)
        if not historic_data:
            return jsonify({'error': 'No historical data found'}), 404
        
        # Data de corte (transações dentro dos últimos 12 meses são consideradas circulantes)
        data_corte = datetime.now().replace(year=datetime.now().year - 1)

        # Inicializa listas para ativos e passivos
        assets_circulante = []
        assets_nao_circulante = []
        liabilities_circulante = []
        liabilities_nao_circulante = []

        # Cria um set para garantir que as datas sejam únicas
        datas = set()

        # Itera sobre os dados históricos
        for item in historic_data:
            try:
                transaction_date = datetime.strptime(item['date'], "%Y-%m-%d")  # Converte 'date' para datetime
            except ValueError:
                # Se houver erro na conversão da data, ignora o item
                continue

            # Adiciona a data ao set de datas únicas
            datas.add(transaction_date.date())

            # Classifica os itens como ativos ou passivos
            if item['type'] == 'asset':
                if transaction_date > data_corte:
                    assets_circulante.append(item)  # Transação recente é circulante
                else:
                    assets_nao_circulante.append(item)  # Transação mais antiga é não circulante

            elif item['type'] == 'liability':
                if transaction_date > data_corte:
                    liabilities_circulante.append(item)  # Passivo recente é circulante
                else:
                    liabilities_nao_circulante.append(item)  # Passivo mais antigo é não circulante

        
        sorted_dates = sorted(list(datas)) # Convertendo o set de datas únicas para uma lista ordenada
        sorted_dates_str = [date.strftime("%Y-%m-%d") for date in sorted_dates] # Convertendo para o formato desejado 'YYYY-MM-DD'

        # Retorna a resposta em formato JSON
        return jsonify({
            'dates': sorted_dates_str,  # Datas únicas e ordenadas
            'assets': {
                'circulante': assets_circulante,
                'nao_circulante': assets_nao_circulante
            },
            'liabilities': {
                'circulante': liabilities_circulante,
                'nao_circulante': liabilities_nao_circulante
            }
        })
    
    except Exception as e:
        # Caso ocorra algum erro inesperado, retorna um erro genérico
        return jsonify({'error': str(e)}), 500
