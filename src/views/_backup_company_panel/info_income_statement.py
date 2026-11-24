from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic


def process_items(items, events_to_include, exclude_name=None):
    """
    Filtra os itens por eventos, agrupa por 'name' e soma os valores.
    
    Args:
        items (list): Lista de itens a processar.
        events_to_include (list): Lista de eventos a incluir no filtro.
        exclude_name (str): Nome a ser excluído do filtro (opcional).
    
    Returns:
        tuple: Lista de itens agrupados e a soma total de valores.
    """
    filtered_items = [
        item for item in items
        if item['event'] in events_to_include and item['name'] != '#!@cash@!#'
    ]
    grouped_items = {}

    for item in filtered_items:
        name = item['name']
        if name in grouped_items:
            grouped_items[name]['value'] += float(item['value'])
        else:
            grouped_items[name] = {
                'name': item['name'],
                'value': float(item['value']),
                'event': item['event'],
                'type': item['type'],
                'date': item['date']
            }
    
    grouped_list = list(grouped_items.values())
    total_value = sum(item['value'] for item in grouped_list)

    return grouped_list, total_value


def info_income_statement(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id)
        if not historic_data:
            return jsonify({'error': 'No historical data found'}), 404

        assets = []
        liabilities = []
        years = set()

        for item in historic_data:
            try:
                transaction_date = datetime.strptime(item['date'], "%Y-%m-%d")
            except ValueError:
                continue

            years.add(transaction_date.year)

            if item['ignore'] != True:
                if item['type'] == 'asset':
                    assets.append(item)
                elif item['type'] == 'liability':
                    liabilities.append(item)

        sorted_years = sorted(list(years))

        # Receita bruta
        brute_revenue, brute_revenue_float = process_items(
            assets + liabilities,
            events_to_include=['Lucro', 'Venda', 'Serviço']
        )

        # Deduções da receita
        deductions_revenue, deductions_revenue_float = process_items(
            liabilities,
            events_to_include=['Imposto a pagar(Receita)', 'Devolução', 'Desconto']
        )

        # Resultado operacional bruto
        result_revenue = brute_revenue_float - deductions_revenue_float

        # Custos das vendas
        sell_costs, sell_costs_float = process_items(
            assets + liabilities,
            events_to_include=['Fornecedor', 'Salário a pagar', 'Serviço', 'Compra', 'Investimento']
        )

        # Resultado operacional líquido
        result_operational_costs = result_revenue - sell_costs_float

        # Custos operacionais
        operational_costs, operational_costs_float = process_items(
            liabilities,
            events_to_include=['Conta a pagar', 'Empréstimo', 'Financiamento', 'Imposto a pagar(Operacional)', 'Multa', 'Serviço']
        )

        # Lucro/prejuízo operacional
        loss_profit = result_operational_costs - operational_costs_float

        return jsonify({
            'brute_revenue': brute_revenue,  # Receita operacional bruta
            'brute_revenue_float': brute_revenue_float,  # Receita operacional bruta(valor)
            'deductions_revenue': deductions_revenue,  # Deduções da receita bruta
            'deductions_revenue_float': deductions_revenue_float,  # Deduções da receita bruta(valor)
            'result_revenue': result_revenue,  # Resultado operacional bruto
            'sell_costs': sell_costs,  # Custos das vendas
            'sell_costs_float': sell_costs_float,  # Custos das vendas(valor)
            'result_operational_costs': result_operational_costs,  # Resultado operacional líquido
            'operational_costs': operational_costs,  # Despesas operacionais
            'operational_costs_float': operational_costs_float,  # Despesas operacionais(valor)
            'loss_profit': loss_profit,  # Lucro/prejuízo operacional
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500
