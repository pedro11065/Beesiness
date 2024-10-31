from flask_login import current_user
from flask import jsonify

from src.model.database.company.patrimony.asset.create import db_create_asset

def asset_registration(asset_data, company_id):

    print(f"dados recebidos: {asset_data}")
    
    event = asset_data.get('event')
    classe = asset_data.get('classe')
    name = asset_data.get('name')
    location = asset_data.get('localization')
    acquisition_date = asset_data.get('acquisitionDate')
    value = asset_data.get('acquisitionValue')
    status = asset_data.get('status')
    installment = asset_data.get('installment')
    description = asset_data.get('description')

#-------------------------------------------------- Parcelamento

    if installment == "Débito":
        installment = 0
    
    else:               # indices: 0 1 2
        installment = installment[:-1]
        print(installment)



#-------------------------------------------------- Debito e crédito 
    value = float(value)
    
    if event == 'Compra':
        update_cash = 'less' 

        cash_debit = 0
        cash_credit = value    
        asset_debit = value    
        asset_credit = 0

    elif event in ["Entrada de Caixa","Venda","Herança"]:
        update_cash = 'more' 

        cash_debit = value   
        cash_credit = 0
        asset_debit = 0
        asset_credit = value     
             
    else:
        update_cash = 'none'
        
        cash_debit = value   
        cash_credit = 0
        asset_debit = 0
        asset_credit = value   

    #---------------------------------------------------------------------

    db_create_asset(company_id, current_user.id, name, event, classe, value, cash_debit, cash_credit,  asset_debit, asset_credit, location, acquisition_date, description, status, update_cash)

    return jsonify('Asset registrado com sucesso!'), 200
