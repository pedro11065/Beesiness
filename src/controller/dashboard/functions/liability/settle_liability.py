from flask import jsonify
from flask_login import current_user

import datetime

from src.model.database.company.patrimony.liability.actions.search_liability import db_search_specific_liability
from src.model.database.company.patrimony.liability.actions.create_historic import db_create_historic
from src.model.database.company.patrimony.liability.actions.update_cash import  db_update_cash
from src.model.database.company.patrimony.liability.delete import  db_delete_liability

def settle_liability(liability_id, company_id):
    liability_data = db_search_specific_liability(liability_id, company_id)
    print(f'Settle liability {liability_data}')

    if not liability_data:
        return jsonify({'message': f'Passivo com uuid {liability_id} não encontrado na empresa!'})

    value = liability_data.get('value')
    print(f'Value do settle é: {value}')

    # Dados do registro no histórico para o caixa
    cash_historic_data = {
        'user_id': current_user.id,
        'name': '#!@cash@!#',
        'event': 'Entrada de caixa',
        'class': 'Caixa',
        'debit': value,
        'credit': 0,
        'emission_date': datetime.datetime.now().strftime('%d/%m/%Y'),
        'installment': None,
    }

    try:
        # Recria o histórico do passivo de forma idêntica (única diferença é o value no debit que antes ficava no credit)
        db_create_historic(liability_id, company_id, liability_data, value)

        # Atualiza o cash
        db_update_cash(company_id, value)

        # Remover passivo original da tabela de passivos
        db_delete_liability(liability_id, company_id)

        return jsonify({'message': 'Passivo quitado com sucesso!'})

    except Exception as e:
        print(e)
        return jsonify({'message': 'Erro ao quitar o passivo.'})
