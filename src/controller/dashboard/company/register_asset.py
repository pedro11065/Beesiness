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
    acquisition_value = asset_data.get('acquisitionValue')
    status = asset_data.get('status')
    description = asset_data.get('description')

    if event in ["Compra","Herança","Leasing","Financiamento"]:
        print(event)
        update_cash=True
        print("update cash: True")
    else: 
        update_cash=False
        print("update cash: False")

    db_create_asset(company_id, current_user.id, name, event, classe, acquisition_value, location, acquisition_date, description, status, update_cash)
    
    


    return jsonify('Asset registrado com sucesso!'), 200

#ideia: ao inves de criar uma outra tabela só para coisas deletadas, é só mudar o campo status para detado,
#  depois criar uma verificação para se caso o status seja igual a deletado, não mostrar para o usuário.