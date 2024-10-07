from flask import jsonify
from flask_login import current_user
from colorama import Fore, Style
import datetime
import locale
from datetime import datetime

from src.model.database.company.patrimony.asset.search_cash_value import db_search_cash
from src.model.database.company.patrimony.asset.search import db_search_asset
from src.model.database.company.patrimony.liability.search import db_search_liability
from src.model.database.company.patrimony.historic.search import db_search_historic

from src import cache

@cache.cached(timeout=30)  # Guarda as informações por 30 segundos
def info_dashboard(company_id):
    print(company_id)

    # Saldo em caixa
    cash_data = db_search_cash(company_id)
    cash_now = cash_data[0][0] if cash_data else 0  # Exibe 0 se cash_data estiver vazio

    # Quantidade de ativos
    assets_data = db_search_asset(company_id)
    assets_quant = len(assets_data) - 1 if assets_data else 0 # Exibe 0 se assets_data estiver vazio

    # Quantidade de passivos
    liabilities_data = db_search_liability(company_id)
    liabilities_quant = len(liabilities_data) if liabilities_data else 0 # Exibe 0 se liabilities_data estiver vazio

    # Cálculo de patrimônio
    assets_values = [asset.get('value', 0) for asset in assets_data] if assets_data else []
    liabilities_values = [liability.get('value', 0) for liability in liabilities_data] if liabilities_data else []

    sum_liabilities_values = (sum(liabilities_values))
    sum_asset_values = (sum(assets_values))

    patrimony = sum_asset_values - sum_liabilities_values

   # Histórico de caixa
    historic_data = db_search_historic(company_id)
    cash_data_historic = {}

    if historic_data:
        locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')
        temp_cash_by_day = {} # Dicionário temporário para armazenar o último valor do caixa por data

        for record in historic_data:
            date = record.get('creation_date')
            value = record.get('value', 0)
            cash_name = record.get('name')
            hour = record.get('creation_time')

            if cash_name == '#!@cash@!#':  # Verifica se é o caixa desejado
                if date not in temp_cash_by_day or hour > temp_cash_by_day[date]['hour']: # Compara as horas para garantir que o valor mais recente seja mantido
                    temp_cash_by_day[date] = {'value': value, 'hour': hour}

        # Conversão para o formato desejado
        for date, data in temp_cash_by_day.items():
            day_of_week = datetime.strptime(date, '%d/%m/%Y').strftime('%A')
            cash_data_historic[day_of_week] = data['value']

#---------------------------------------------------------------------------

    return jsonify({
        'cash_now': cash_now,
        'cash_historic': cash_data_historic,
        'assets_quant': assets_quant,
        'liabilities_quant': liabilities_quant,
        'sum_asset_values': sum_asset_values,
        'sum_liabilities_values': sum_liabilities_values,
        'patrimony': patrimony
    }), 200
   
