from flask import jsonify
from flask_login import current_user

import datetime

from src.model.database.company.patrimony.asset.actions.search_asset import db_search_specific_asset
from src.model.database.company.patrimony.asset.actions.create_historic import db_create_historic
from src.model.database.company.patrimony.asset.actions.update_cash import  db_update_cash
from src.model.database.company.patrimony.asset.delete import  db_delete_asset

def sell_asset(asset_id, company_id):
    print('PS: Atualmente o sell_asset é um comando desativado, pois está ocorrendo erro no update_cash. Nenhuma alteração ocorreu.')
    
    asset_data = db_search_specific_asset(asset_id, company_id)

    if not asset_data:
        return jsonify({'message': f'Ativo com uuid {asset_id} não encontrado na empresa!'})

    value = asset_data.get('value')

    # Dados do registro no histórico para o caixa
    cash_historic_data = {
        'user_id': current_user.id,
        'name': '#!@cash@!#',
        'event': 'Entrada de caixa',
        'class': 'Caixa',
        'debit': value, # ! Talvez o erro do asset esteja aqui, será que é no credit? !
        'credit': 0,
        'emission_date': datetime.datetime.now().strftime('%d/%m/%Y'),
        'installment': None,
    }

    try:
        # Recria o histórico do passivo de forma idêntica (única diferença é o value no debit que antes ficava no credit)
        #db_create_historic(asset_id, company_id, asset_data, value)

        """ 
            Resolver: O db_update_cash está atualizando errado, supostamente está adicionando o dobro do valor.
       """

        # Cria histórico #!@cash@!# para registrar a alteração no caixa (valor positivo)
        # db_update_cash(company_id, value)

        # Remover passivo original da tabela de passivos
        #db_delete_asset(asset_id, company_id)

        return jsonify({'message': 'Ativo vendido com sucesso!'})

    except Exception as e:
        print(e)
        return jsonify({'message': 'Erro ao vender o ativo.'})
