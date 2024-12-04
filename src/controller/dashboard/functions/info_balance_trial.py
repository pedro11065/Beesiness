from flask_login import current_user
from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_balance_trial(company_id, cnpj):
    try:
        # Busca os dados históricos do banco de dados
        historic_data = db_search_historic(company_id)
        if historic_data is False:
            return jsonify({'message': 'Erro ao pesquisar no banco de dados, tente mais tarde.'}), 500

        if not historic_data:
            return jsonify({'message': 'Nenhum dado registrado no banco de dados.'}), 404

        # Estruturas para armazenar os dados filtrados
        assets = {}
        liabilities = {}

        # Processa os dados históricos
        for item in historic_data:
            # Ignora itens específicos
            if item['name'] == '#!@cash@!#':
                continue

            # Formata a data de criação, se disponível
            if 'date' in item:
                try:
                    item['date'] = datetime.fromisoformat(item['date']).strftime('%Y-%m-%d')
                except ValueError:
                    item['date'] = None  # Ignora se a data estiver no formato errado

            # Classifica os itens como assets ou liabilities
            if item['type'] == 'asset':
                if item['name'] not in assets:
                    assets[item['name']] = []  # Inicializa a lista se não existir
                assets[item['name']].append({
                    "date": item.get('date'),
                    "value": item['value']
                })

            elif item['type'] == 'liability':
                if item['name'] not in liabilities:
                    liabilities[item['name']] = []  # Inicializa a lista se não existir
                liabilities[item['name']].append({
                    "date": item.get('date'),
                    "value": item['value']
                })

        # Retorna os dados como JSON
        return jsonify({
            'assets': assets,
            'liabilities': liabilities
        })

    except Exception as e:
        # Retorna um erro genérico em caso de exceção
        return jsonify({'error': str(e)}), 500
