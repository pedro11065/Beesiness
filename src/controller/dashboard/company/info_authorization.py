from flask import jsonify
from flask_login import current_user

from src.model.database.company.user_companies.create import db_create_user_company
from src.model.database.user.search import db_search_user
from src.model.database.company.user_companies.update import db_update_user_companies
from src.model.database.company.user_companies.delete import db_delete_user_companies

def info_authorization(data, company_id):
    action = data.get('action')
    cpf = data.get('data').get('cpf')
    user = db_search_user(cpf)
    permission = data.get('data').get('permission')

    if(cpf == current_user.cpf):
        return jsonify({'message': 'Não é possível alterar os próprios dados.'})
    
    if action == 'search':
        if user:
            return jsonify({'result': user})
        else:
            return jsonify({'message': 'Usuário não encontrado'})

    elif action == 'add':
        if user:
            db_create_user_company(company_id, user['id'], permission)
            return jsonify({'message': 'Usuário adicionado'})
        else:
            return jsonify({'message': 'Usuário não encontrado'})

    elif action == 'update_permission':
        if user:
            db_update_user_companies(permission, user['id'])
            return jsonify({'message': 'Permissão atualizada'})
        else:
            return jsonify({'message': 'Usuário não encontrado'})
    elif action == 'delete':
        if user:
            db_delete_user_companies(user['id'])
            return jsonify({'message': 'Usuário deletado com sucesso.'})
        else:
            return jsonify({'message': 'Usuário não encontrado.'})
        
    else:
        return jsonify({'message': 'Ação não reconhecida'}), 400
