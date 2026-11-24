from datetime import datetime
from flask import jsonify

from src.model.database.company.patrimony.asset.search import db_search_asset
from src.model.database.company.patrimony.asset.search_cash_value import db_search_cash
from src.model.database.company.patrimony.historic.search import db_search_historic
from src.model.database.company.patrimony.liability.search import db_search_liability


def info_balance_sheet(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id) or []
        assets_table = db_search_asset(company_id) or []
        liabilities_table = db_search_liability(company_id) or []
        cash_rows = db_search_cash(company_id)
        cash_now = float(cash_rows[0][0]) if cash_rows and len(cash_rows) > 0 else 0.0

        assets = {'circulante': {}, 'nao_circulante': {}}
        liabilities = {'circulante': {}, 'nao_circulante': {}}
        patrimony = {'circulante': {'Capital Social': [], 'Lucros acumulados': []}}
        datas = set()

        for item in historic_data:
            if item.get('name') == '#!@cash@!#' or item.get('ignore') is True:
                continue

            raw_date = str(item.get('date') or '')
            try:
                transaction_date = datetime.strptime(raw_date[:10], '%Y-%m-%d')
            except ValueError:
                continue

            datas.add(transaction_date.date())
            category = 'circulante' if item.get('floating') is True else 'nao_circulante'
            entry = {
                'date': transaction_date.strftime('%Y-%m-%d'),
                'value': float(item.get('value') or 0),
            }

            if item.get('type') == 'asset':
                assets[category].setdefault(item['name'], []).append(entry)
            elif item.get('type') == 'liability':
                if item.get('name') in ('Capital Social', 'Lucros acumulados') or item.get('event') in ('Capital Social', 'Lucro'):
                    key = item['name'] if item.get('name') in ('Capital Social', 'Lucros acumulados') else 'Capital Social'
                    patrimony['circulante'].setdefault(key, []).append(entry)
                else:
                    liabilities[category].setdefault(item['name'], []).append(entry)

        # Posição patrimonial ativa consolidada (baseada nos registros vigentes + caixa)
        current_position = {
            'cash_now': round(cash_now, 2),
            'assets_circulante': [],
            'assets_nao_circulante': [],
            'liabilities_circulante': [],
            'liabilities_nao_circulante': [],
            'equity': [],
        }

        if cash_now != 0:
            current_position['assets_circulante'].append({'name': 'Caixa e equivalentes', 'value': round(cash_now, 2)})

        asset_groups = {'circulante': {}, 'nao_circulante': {}}
        for a in assets_table:
            if a.get('name') == '#!@cash@!#':
                continue
            cat = 'circulante' if a.get('floating') is True else 'nao_circulante'
            asset_groups[cat][a['name']] = asset_groups[cat].get(a['name'], 0.0) + float(a.get('value') or 0)

        for name, val in sorted(asset_groups['circulante'].items(), key=lambda x: x[1], reverse=True):
            current_position['assets_circulante'].append({'name': name, 'value': round(val, 2)})
        for name, val in sorted(asset_groups['nao_circulante'].items(), key=lambda x: x[1], reverse=True):
            current_position['assets_nao_circulante'].append({'name': name, 'value': round(val, 2)})

        liab_groups = {'circulante': {}, 'nao_circulante': {}}
        equity_groups = {}
        for l in liabilities_table:
            val = float(l.get('value') or 0)
            if l.get('name') in ('Capital Social', 'Lucros acumulados') or l.get('event') in ('Capital Social', 'Lucro'):
                k = l.get('name') or 'Capital Social'
                equity_groups[k] = equity_groups.get(k, 0.0) + val
            else:
                cat = 'circulante' if l.get('floating') is True else 'nao_circulante'
                liab_groups[cat][l['name']] = liab_groups[cat].get(l['name'], 0.0) + val

        for name, val in sorted(liab_groups['circulante'].items(), key=lambda x: x[1], reverse=True):
            current_position['liabilities_circulante'].append({'name': name, 'value': round(val, 2)})
        for name, val in sorted(liab_groups['nao_circulante'].items(), key=lambda x: x[1], reverse=True):
            current_position['liabilities_nao_circulante'].append({'name': name, 'value': round(val, 2)})
        for name, val in sorted(equity_groups.items(), key=lambda x: x[1], reverse=True):
            current_position['equity'].append({'name': name, 'value': round(val, 2)})

        # Resultado acumulado para fechar Ativo = Passivo + Patrimônio Líquido
        total_curr_assets = sum(x['value'] for x in current_position['assets_circulante']) + sum(
            x['value'] for x in current_position['assets_nao_circulante']
        )
        total_curr_liabs = sum(x['value'] for x in current_position['liabilities_circulante']) + sum(
            x['value'] for x in current_position['liabilities_nao_circulante']
        )
        total_registered_equity = sum(x['value'] for x in current_position['equity'])
        retained_result = round(total_curr_assets - total_curr_liabs - total_registered_equity, 2)
        if abs(retained_result) >= 0.01:
            current_position['equity'].append({
                'name': 'Lucros / resultados acumulados',
                'value': retained_result,
            })

        sorted_dates_str = [d.strftime('%Y-%m-%d') for d in sorted(datas)]

        return jsonify({
            'dates': sorted_dates_str,
            'assets': assets,
            'liabilities': liabilities,
            'patrimony': patrimony,
            'current_position': current_position,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
