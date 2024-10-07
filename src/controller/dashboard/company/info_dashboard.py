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

    #descobrir o saldo
    cash_data = db_search_cash(company_id)
    cash_data = cash_data[0][0]  

    print(cash_data)

#---------------------------------------------------------------------------

    #descobrir quantidade de ativos
    assets_data = db_search_asset(company_id)

    assets_quant = len(assets_data)#quantidade de ativos
    
#---------------------------------------------------------------------------

    #descobrir quantidade de passivos
    liabilities_data = db_search_liability(company_id)

    liabilities_quant = len(liabilities_data)#quantidade de ativos

    
#---------------------------------------------------------------------------

     #descobrir patrimonio
    liabilities_values =  [] ; assets_values =  []

    for i in range(liabilities_quant):
        value = liabilities_data[i].get('value')
        liabilities_values.append(value)

    for i in range(assets_quant):
        value = assets_data[i].get('value')
        assets_values.append(value)

    sum_liabilities_values = (sum(liabilities_values))
    sum_asset_values = (sum(assets_values))

    patrimony = sum_asset_values - sum_liabilities_values

#---------------------------------------------------------------------------

    #dados das tabelas de saldo

    dates_list = [] ; values_list = []

    historic_data = db_search_historic(company_id)

    historic_lenght = len(historic_data)
    print(historic_lenght)

    for i in range(historic_lenght):
        date = historic_data[i].get('creation_date')
        dates_list.append(date)

        value = historic_data[i].get('value')
        values_list.append(value)

    print(dates_list)
    print(values_list)

    cash_data_historic = {}
    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')

    for data, value in zip(dates_list, values_list):
        # Converte a string para um objeto de data
        days_of_week = datetime.strptime(data, '%d/%m/%Y').strftime('%A')  # Nome do dia da semana
        if days_of_week not in cash_data_historic:
            cash_data_historic[days_of_week] = 0
        cash_data_historic[days_of_week] += value





#---------------------------------------------------------------------------

    return jsonify({
    'cash_now':cash_data,
    'cash_historic': cash_data_historic,
    'assets_quant': assets_quant,
    'liabilities_quant': liabilities_quant,
    'sum_asset_values': sum_asset_values,
    'sum_liabilities_values': sum_liabilities_values,
    'patrimony': patrimony
     }), 200

   
