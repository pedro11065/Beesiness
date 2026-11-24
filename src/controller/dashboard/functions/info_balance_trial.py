from datetime import datetime
from flask import jsonify

from src.model.database.company.patrimony.historic.search import db_search_historic


def info_balance_trial(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id)
        if historic_data is False:
            return jsonify({'message': 'Erro ao pesquisar no banco de dados, tente mais tarde.'}), 500

        if not historic_data:
            return jsonify({'assets': {}, 'liabilities': {}, 'entries': []}), 200

        assets = {}
        liabilities = {}
        entries = []

        for item in historic_data:
            if item.get('name') == '#!@cash@!#' or item.get('ignore') is True:
                continue

            raw_date = str(item.get('date') or '')
            try:
                clean_date = datetime.fromisoformat(raw_date[:10]).strftime('%Y-%m-%d')
            except ValueError:
                clean_date = None

            val = float(item.get('value') or 0)
            entry_obj = {
                'date': clean_date,
                'value': val,
                'event': item.get('event') or '',
                'class': item.get('class') or '',
            }

            if item.get('type') == 'asset':
                assets.setdefault(item['name'], []).append(entry_obj)
                entries.append({**entry_obj, 'name': item['name'], 'side': 'debit'})
            elif item.get('type') == 'liability':
                liabilities.setdefault(item['name'], []).append(entry_obj)
                entries.append({**entry_obj, 'name': item['name'], 'side': 'credit'})

        return jsonify({
            'assets': assets,
            'liabilities': liabilities,
            'entries': entries,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
