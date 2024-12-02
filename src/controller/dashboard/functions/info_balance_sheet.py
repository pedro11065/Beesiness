from flask_login import current_user
from flask import jsonify
from datetime import datetime
from src.model.database.company.patrimony.historic.search import db_search_historic

def info_balance_sheet(company_id, cnpj):
    try:
        # Buscar os dados históricos do banco de dados
        historic_data = db_search_historic(company_id)
        if not historic_data:
            return jsonify({'error': 'No historical data found'}), 404

        # Data de corte: transações dentro dos últimos 12 meses são consideradas circulantes
        data_corte = datetime.now().replace(year=datetime.now().year - 1)

        # Inicializa as estruturas para ativos, passivos e patrimônio líquido
        assets = {'circulante': {}, 'nao_circulante': {}}
        liabilities = {'circulante': {}, 'nao_circulante': {}}
        patrimony = {'circulante': {'Capital Social': [], 'Lucros acumulados': []}}

        datas = set()  # Para garantir que as datas sejam únicas

        # Processa os dados históricos
        for item in historic_data:
            if item['name'] == '#!@cash@!#':  # Ignora o item com esse nome específico
                continue

            try:
                transaction_date = datetime.strptime(item['date'], "%Y-%m-%d")
            except ValueError:
                continue  # Ignora se a data estiver no formato errado

            # Adiciona a data ao set de datas únicas
            datas.add(transaction_date.date())

            # Classifica os itens como ativos, passivos ou patrimônio líquido
            category = 'circulante' if transaction_date > data_corte else 'nao_circulante'

            if item['type'] == 'asset':
                if item['name'] not in assets[category]:
                    assets[category][item['name']] = []  # Inicializa a lista se não existir
                # Adiciona o valor e a data para ativos
                assets[category][item['name']].append({
                    "date": transaction_date.strftime("%Y-%m-%d"),
                    "value": item['value']
                })

            elif item['type'] == 'liability':
                if item['name'] in ['Capital Social', 'Lucros acumulados']:
                    # Adiciona o Capital Social e Lucros Acumulados na mesma estrutura
                    if item['name'] not in patrimony['circulante']:
                        patrimony['circulante'][item['name']] = []  # Inicializa a lista se não existir
                    patrimony['circulante'][item['name']].append({
                        "date": transaction_date.strftime("%Y-%m-%d"),
                        "value": item['value']
                    })
                else:
                    # Se for passivo, adiciona na estrutura de passivos
                    if item['name'] not in liabilities[category]:
                        liabilities[category][item['name']] = []  # Inicializa a lista se não existir
                    liabilities[category][item['name']].append({
                        "date": transaction_date.strftime("%Y-%m-%d"),
                        "value": item['value']
                    })

        # Ordena as datas por ordem crescente
        sorted_dates = sorted(list(datas))
        sorted_dates_str = [date.strftime("%Y-%m-%d") for date in sorted_dates]

        # Retorna os dados como JSON
        return jsonify({
            'dates': sorted_dates_str,
            'assets': assets,
            'liabilities': liabilities,
            'patrimony': patrimony
        })

    except Exception as e:
        # Caso ocorra algum erro inesperado, retorna um erro genérico
        return jsonify({'error': str(e)}), 500
