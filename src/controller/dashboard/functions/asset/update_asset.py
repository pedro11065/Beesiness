from flask import jsonify
from flask_login import current_user

import datetime

from src.model.database.company.patrimony.asset.actions.search_asset import db_search_specific_asset
from src.model.database.company.patrimony.asset.actions.create_historic import db_create_historic
from src.model.database.company.patrimony.asset.update import db_update_asset
from src.model.database.company.patrimony.asset.actions.update_historic import db_update_historic

def update_asset(data, asset_id, company_id):
    asset_data = db_search_specific_asset(asset_id, company_id)

    if not asset_data:
            return jsonify({'message': 'Ativo com uuid {asset_id} não encontrado na empresa!'})

    current_value = asset_data.get('value') # 50000
    new_value = data.get('new_value') # 15000
    difference_value = current_value - new_value # 35000

    if current_value < new_value:
         return jsonify({'message': 'O novo valor é maior que do banco de dados.'})

    # Atualizar o  value do asset por (difference_value) e acquisition_date para o dia atual.
    # Criar um valor no histórico da diferença com o new_value

    # Ativo: 50 mil -> 35 mil
    # Histórico: 15 mil quitado

    db_update_asset(asset_id, company_id, 'value', difference_value) # Atualiza o valor do asset de 50 mil para 35 mil.
    #db_update_historic(asset_id, company_id, 'value', difference_value)
    db_create_historic(asset_id, company_id, asset_data, new_value) # Cria um histórico da diferença do valor, ou seja, 15 mil.


    data_atual = datetime.datetime.now().strftime('%Y-%m-%d')
    if asset_data.get('acquisition_date') != data_atual:
      db_update_asset(asset_id, company_id, 'acquisition_date', data_atual)

    return jsonify({'message': 'Valor do ativo atualizado com sucesso e histórico criado.'})

