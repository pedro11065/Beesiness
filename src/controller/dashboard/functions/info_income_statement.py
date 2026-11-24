from datetime import datetime
from flask import jsonify

from src.model.database.company.patrimony.historic.search import db_search_historic


def process_items(items, events_to_include):
    filtered_items = [
        item for item in items
        if item.get('event') in events_to_include and item.get('name') != '#!@cash@!#'
    ]
    grouped_items = {}

    for item in filtered_items:
        name = item['name']
        val = float(item.get('value') or 0)
        if name in grouped_items:
            grouped_items[name]['value'] += val
        else:
            grouped_items[name] = {
                'name': name,
                'value': val,
                'event': item.get('event'),
                'type': item.get('type'),
                'date': item.get('date'),
            }

    grouped_list = sorted(grouped_items.values(), key=lambda x: x['value'], reverse=True)
    total_value = sum(item['value'] for item in grouped_list)
    return grouped_list, round(total_value, 2)


def info_income_statement(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id) or []

        assets = []
        liabilities = []
        years = set()

        for item in historic_data:
            raw_date = str(item.get('date') or '')
            try:
                transaction_date = datetime.strptime(raw_date[:10], '%Y-%m-%d')
                years.add(transaction_date.year)
            except ValueError:
                continue

            if item.get('ignore') is not True:
                if item.get('type') == 'asset':
                    assets.append(item)
                elif item.get('type') == 'liability':
                    liabilities.append(item)

        sorted_years = sorted(years)

        brute_revenue, brute_revenue_float = process_items(
            assets + liabilities,
            events_to_include=['Lucro', 'Venda', 'Serviço', 'Prestação de serviços'],
        )

        deductions_revenue, deductions_revenue_float = process_items(
            liabilities,
            events_to_include=['Imposto a pagar(Receita)', 'Imposto a pagar', 'Devolução', 'Desconto'],
        )

        result_revenue = round(brute_revenue_float - deductions_revenue_float, 2)

        sell_costs, sell_costs_float = process_items(
            assets + liabilities,
            events_to_include=['Fornecedor', 'Salário a pagar', 'Compra'],
        )

        result_operational_costs = round(result_revenue - sell_costs_float, 2)

        operational_costs, operational_costs_float = process_items(
            liabilities,
            events_to_include=[
                'Conta a pagar',
                'Empréstimo',
                'Financiamento',
                'Imposto a pagar(Operacional)',
                'Multa',
                'Juros',
            ],
        )

        loss_profit = round(result_operational_costs - operational_costs_float, 2)

        return jsonify({
            'years': sorted_years,
            'brute_revenue': brute_revenue,
            'brute_revenue_float': brute_revenue_float,
            'deductions_revenue': deductions_revenue,
            'deductions_revenue_float': deductions_revenue_float,
            'result_revenue': result_revenue,
            'sell_costs': sell_costs,
            'sell_costs_float': sell_costs_float,
            'result_operational_costs': result_operational_costs,
            'operational_costs': operational_costs,
            'operational_costs_float': operational_costs_float,
            'loss_profit': loss_profit,
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
