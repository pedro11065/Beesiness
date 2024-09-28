from flask_login import current_user
from flask import jsonify

from src.model.database.company.patrimony.liability.create import db_create_liability

def liability_registration(liability_data, company_id):
    
    name = liability_data.get('name')
    event = liability_data.get('event')
    classe = liability_data.get('classe')
    payment_method = liability_data.get('payment_method')
    status = liability_data.get('status')
    value = liability_data.get('value')
    emission_date = liability_data.get('emission_date')
    expiration_date = liability_data.get('expiration_date')
    description = liability_data.get('description')

    db_create_liability(company_id, current_user.id, name, event, classe, value, emission_date, expiration_date, payment_method, description, status)

    return jsonify('Liability registrado com sucesso!'), 200