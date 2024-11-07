from flask import jsonify
from flask_login import current_user

import datetime

from src.model.database.company.patrimony.liability.actions.search_liability import db_search_specific_liability
from src.model.database.company.patrimony.liability.actions.create_historic import db_create_historic
from src.model.database.company.patrimony.liability.update import db_update_liability

def update_liability(data, liability_id, company_id):
    liability_data = db_search_specific_liability(liability_id, company_id)
    # O liability_data tá retornando um time no valor de debit ????

    print(f'O liability deu: {liability_data}')

    if not liability_data:
        return jsonify({'message': 'Passivo com uuid {liability_id} não encontrado na empresa!'})
    
    current_value = liability_data.get('value') # 50000
    new_value = data.get('new_value') # 15000
    difference_value = current_value - new_value # 35000

    if current_value < new_value:
         return jsonify({'message': 'O novo valor é maior que do banco de dados.'})


    """ Daqui para baixo é só tirar os comentários """

    #db_update_liability(liability_id, company_id, 'value', difference_value) # Atualiza o valor do liability de 50 mil para 35 mil.
    #db_create_historic(liability_id, company_id, liability_data, new_value) # Cria um histórico da diferença do valor, ou seja, 15 mil.


    data_atual = datetime.datetime.now().strftime('%Y-%m-%d')
    #if liability_data.get('emission_date') != data_atual:
      #db_update_liability(liability_id, company_id, 'emission_date', data_atual)

      
    return jsonify({'message': 'Valor do ativo atualizado com sucesso e histórico criado.'})

