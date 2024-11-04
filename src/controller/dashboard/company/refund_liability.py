from flask import jsonify
from flask_login import current_user

import datetime

from src.model.database.company.patrimony.liability.search_liability import db_search_specific_liability
from src.model.database.company.patrimony.liability.create import db_create_liability
from src.model.database.company.patrimony.liability.update import db_update_liability

def refund_liability(liability_id, company_id):
    liability_data = db_search_specific_liability(liability_id, company_id)

    if not liability_data:
        return jsonify({'message': 'Passivo com uuid {liability_id} não encontrado na empresa!'})

    if "Estorno" in liability_data.get('status').split('-')[-1].strip():
        return jsonify({'message': 'O produto já foi estornado uma vez.'})
    
    data_atual = datetime.datetime.now().strftime('%Y-%m-%d')
    data_hora_atual = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')



    name = f'Estorno de {liability_data.get("name")}'
    event = 'Entrada de caixa'
    classe = 'Caixa'
    emission_date = data_atual
    value = liability_data.get('value')
    description = f"Estorno realizado pelo usuário {current_user.id} no dia {data_hora_atual} do passivo {liability_id}, denominado {liability_data.get('name')}, adquirido em {liability_data.get('acquisition_date')}."
    status = "Estornado"
    installment = 0;

    cash_debit = None
    cash_credit = None
    liability_debit = None
    liability_credit = None
    update_cash = None
    expiration_date = None
    payment_method = None
    status_mode = False # Não é uma obrigação (pagamentos, etc)

    # PS: O create_liability não está sendo criado embora o update_liability ocorra, é necessário fazer testes para encontrar o problema.
        
    try:
        db_create_liability(
            company_id=company_id,
            user_id=current_user.id,
            name=name,
            event=event,
            classe=classe,
            value=value,
            emission_date=emission_date,
            expiration_date=expiration_date,
            payment_method=payment_method,
            description=description,
            status=status,
            installment=installment,
            cash_debit=cash_debit,
            cash_credit=cash_credit,
            liability_debit=liability_debit,
            liability_credit=liability_credit,
            update_cash=update_cash,
            status_mode=status_mode, 
        )

        db_update_liability(liability_id, company_id, 'status', f'{liability_data.get("status")} - Estornado')
        return jsonify({'message': 'Estorno realizado com sucesso!'})
    
    except Exception as e:
        print(e)
        return jsonify({'message': 'Erro ao realizar o estorno.'})
