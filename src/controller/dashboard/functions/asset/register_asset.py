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
    floating = asset_data.get('floating')
    payment_method = asset_data.get('payment_method')
    installment = asset_data.get('installment')
    description = asset_data.get('description')

    print(acquisition_date)


#-------------------------------------------------- Circulante ou não circulante

    if floating == "Circulante":
        floating = True

    else:
        floating = False

#-------------------------------------------------- Parcelamento

    if installment == "Débito":
        installment = 1
    
    else:               
        installment = installment[:-1]
        # --> 12x --> 12
    
    installment = int(installment)
    print(installment)

#-------------------------------------------------- Debito e crédito 
    value = float(value)
    
    if event in ['Compra','Transferência','Investimento']:
        update_cash = 'less' 

        cash_debit = value 
        cash_credit = 0  
        asset_debit = value    
        asset_credit = 0

    elif event in ["Entrada de Caixa","Venda","Herança","Serviço"]:
        update_cash = 'more' 

        cash_debit = value   
        cash_credit = 0
        asset_debit = 0
        asset_credit = 0    


    elif event == "Capital Social":
        update_cash = 'more'
        
        cash_debit = 0 
        cash_credit = 0
        asset_debit = 0
        asset_credit = 0

    else:
        update_cash = 'none'
        
        cash_debit = 0 
        cash_credit = 0
        asset_debit = value    
        asset_credit = 0

    #---------------------------------------------------------------------

    db_create_asset(company_id, current_user.id, name, event, classe, value, cash_debit, cash_credit,  asset_debit, asset_credit, location, acquisition_date, description, status, update_cash, installment, floating)

    return jsonify('Asset registrado com sucesso!'), 200
