from flask_login import current_user
from flask import jsonify

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_reason(company_id, cnpj):

    info = db_search_historic(company_id)

    if info == False:
        return  jsonify('Nenhum dado registro no banco de dados.'), 200

    if info == None:
        return  jsonify('Erro algo pesquisar  no banco de dados, tente mais tarde.'), 500

    historic_id = info.get('historic_id')
    company_id = info.get('company_id')
    user_id = info.get('user_id')
    patrimony_id = info.get('patrimony_id')
    name = info.get('name')
    event = info.get('event')
    class_ = info.get('class_')
    value = info.get('value')
    date = info.get('date')
    type = info.get('type')
    creation_date = info.get('creation_date')
    creation_date = [cd.isoformat() for cd in creation_date]
    creation_time = info.get('creation_time')
    creation_time = [ct.strftime('%H:%M:%S') for ct in creation_time]

    print("\nestou em: src\controller\dashboard\company\info_reason.py ")
    print("Print de demostração ")
    print(f"\n\nhistoric_id: {historic_id}")
    print(f"company_id: {company_id}")
    print(f"user_id: {user_id}")
    print(f"patrimony_id: {patrimony_id}")
    print(f"name: {name}")
    print(f"event: {event}")
    print(f"class: {class_}")
    print(f"value: {value}")
    print(f"date: {date}")
    print(f"type: {type}")
    print(f"creation_date: {creation_date}")
    print(f"creation_time: {creation_time}\n\n")

    return jsonify({
        'redirect_url': f'/dashboard/reason/{cnpj}',
        'historic_id': historic_id,
        'company_id': company_id,
        'user_id': user_id,
        'patrimony_id': patrimony_id,
        'name': name,
        'event': event,
        'class_': class_,
        'value': value,
        'date': date,
        'type': type,
        'creation_date': creation_date,
        'creation_time': creation_time
    })


    

