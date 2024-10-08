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

    #descobrir o saldo
    cash_data = db_search_cash(company_id)
    cash_now = cash_data[0][0]  

#---------------------------------------------------------------------------

    #descobrir quantidade de ativos
    assets_data = db_search_asset(company_id)

    assets_quant = len(assets_data) - 1#quantidade de ativos
    
#---------------------------------------------------------------------------

    #descobrir quantidade de passivos
    try:
        liabilities_data = db_search_liability(company_id)

        liabilities_quant = len(liabilities_data)#quantidade de ativos
    except:
        liabilities_quant = 0
    
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
    #tabela de saldo
    
    dates_list = [] 
    values_list = [] 
    hours_list = [] 
    cash_list = []  # Lista para armazenar o nome do caixa

    historic_data = db_search_historic(company_id)

    historic_length = len(historic_data)

    for i in range(historic_length):
        hour = historic_data[i].get('creation_time')
        hours_list.append(hour)

        date = historic_data[i].get('creation_date')
        dates_list.append(date)

        value = historic_data[i].get('value')
        values_list.append(value)

        cash_name = historic_data[i].get('name')  # Captura o nome do caixa
        cash_list.append(cash_name)

    cash_data_historic = {}
    locale.setlocale(locale.LC_TIME, 'pt_BR.UTF-8')

    # Dicionário temporário para armazenar o último valor do caixa por data
    temp_cash_by_day = {}

    for i in range(historic_length):
        date = dates_list[i]
        value = values_list[i]
        cash_name = cash_list[i]
        hour = hours_list[i]

        # Filtra apenas os registros do caixa específico
        if cash_name == '#!@cash@!#':
            # Verifica se já existe uma entrada para essa data
            if date not in temp_cash_by_day:
                # Armazena o primeiro valor encontrado para esse dia
                temp_cash_by_day[date] = {'value': value, 'hour': hour}
            else:
                # Compara as horas para garantir que o valor mais recente seja mantido
                if hour > temp_cash_by_day[date]['hour']:
                    temp_cash_by_day[date] = {'value': value, 'hour': hour}

    # Converte o dicionário temporário para o formato desejado (nome do dia da semana e valor)
    for date, data in temp_cash_by_day.items():
        day_of_week = datetime.strptime(date, '%d/%m/%Y').strftime('%A')  # Nome do dia da semana
        cash_data_historic[day_of_week] = data['value']



#---------------------------------------------------------------------------
#tabela ativos e passivos




#---------------------------------------------------------------------------
#Movimentação de caixa no dia, semana e mes

    dates_list_today = [] ; values_list_today = [] ; values_list_week = []

    date_today = datetime.now()
    date_today_f = date_today.strftime("%d/%m/%Y")

    for i in range(historic_length):
        date = historic_data[i].get('creation_date')
        value = historic_data[i].get('value')
        name = historic_data[i].get('name')

        if name != '#!@cash@!#':
            if date == date_today_f:
                dates_list_today.append(date)
                values_list_today.append(value)

            else:
                values_list_week.append(value)

    
    value_today = sum(values_list_today)
    value_week = sum(values_list_week)
 

    return jsonify({
        'value_today':value_today,
        'value_week':value_week,
        'cash_now': cash_now,
        'cash_historic': cash_data_historic,
        'assets_quant': assets_quant,
        'liabilities_quant': liabilities_quant,
        'sum_asset_values': sum_asset_values,
        'sum_liabilities_values': sum_liabilities_values,
        'patrimony': patrimony
    }), 200
   
