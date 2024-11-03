from flask import jsonify
from flask_login import current_user

import datetime

from src.model.database.company.patrimony.asset.search_asset import db_search_specific_asset
from src.model.database.company.patrimony.asset.create import db_create_asset
from src.model.database.company.patrimony.asset.update import db_update_asset

def refund_asset(asset_id, company_id):
    asset_data = db_search_specific_asset(asset_id, company_id)

    if "Estorno" in asset_data.get('status').split('-')[-1].strip():
        return jsonify({'error': 'O produto já foi estornado uma vez.'})
    
    if not asset_data:
        return jsonify({'error': 'Ativo com uuid {asset_id} não encontrado na empresa!'})
    
    data_atual = datetime.datetime.now().strftime('%Y-%m-%d')
    data_hora_atual = datetime.datetime.now().strftime('%d/%m/%Y %H:%M:%S')

    name = f'Estorno de {asset_data.get("name")}'
    event = 'Entrada de caixa'
    classe = 'Caixa'
    value = asset_data.get('value')
    location = 'Empresa'
    acquisition_date = data_atual
    description = f"Estorno realizado pelo usuário {current_user.id} no dia {data_hora_atual} do ativo {asset_id}, denominado {asset_data.get('name')}, adquirido em {asset_data.get('acquisition_date')}."
    status = "Estorno"
    installment = 0;

    cash_debit = None
    cash_credit = None
    asset_debit = None
    asset_credit = None
    update_cash = None

    db_create_asset(
        company_id=company_id,
        user_id=current_user.id,
        name=name,
        event=event,
        classe=classe,
        value=value,
        cash_debit=cash_debit,
        cash_credit=cash_credit,
        asset_debit=asset_debit,
        asset_credit=asset_credit,
        location=location,
        acquisition_date=acquisition_date,
        description=description,
        status=status,
        update_cash=update_cash,
        installment=installment,
    )


    db_update_asset(asset_id, company_id, 'status', f'{asset_data.get("status")} - Estornado')

    return jsonify({'success': 'Estorno realizado com sucesso!'})