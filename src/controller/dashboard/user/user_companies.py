#vai retonar se o usuário tem relação com alguma empresa. 
# Se tiver, vai enviar os dados dessa ou dessas empresas também

"""
  esquema da resposta de um usuário que tem duas relações empresariais:

  {linha 1 (data[0])
    {id_company} (data[0][0])
    {id_user} (data[0][1])
    {user_level_acess} (data[0]2])
    }

  {linha 2 (data[1])
    {id_company} (data[1][0])
    {id_user} (data[1][1])
    {user_level_acess} (data[1]2])
    }

    ...
"""

"""
  esquema da resposta de um usuário que tem duas empresas:

  {linha 1 (data_company[0])
    {company_id} (data_company[0][0])
    {user_id} (data_company[0][1])
    {company_name} (data_company[0][2])
    {company_email} (data_company[0][3])
    {company_cnpj} (data_company[0][4])
    {company_password} (data_company[0][5])
    }

  {linha 2 (data_company[1])
    {company_id} (data_company[1][0])
    {user_id} (data_company[1][1])
    {company_name} (data_company[1][2])
    {company_email} (data_company[1][3])
    {company_cnpj} (data_company[1][4])
    {company_password} (data_company[1][5])
    }
    ...
"""

from flask import Blueprint, request, redirect, render_template, jsonify
from flask_login import login_user, current_user
from src.model.user_model import User

from colorama import Fore, Style

from src.model.database.company.user_companies.search import db_search_user_company
from src.model.database.company.companies.search import db_search_company

#usuário com duas contas: silvinho@gmail.com ; PedroPy13.
def companies_info():

  id = current_user.get_id() #pega o id do usuário 

  try:

    relation, data = db_search_user_company(id)  #e houver relações, vai retornar quais são elas 
  
  except:

    relation = False

  if relation != False:

    qnt_relation = (len(data)) #quantidade de relações(linhas)  

    names = [] ;  cnpjs = [] ; access_levels = []
    print(data[0][0])

    for i in range(qnt_relation): #vai fazer essa mesma coisa a quantidade de relações
      data_company = db_search_company(data[i][0]) #pega os dados da empresa a partir do id dela
      access_level = data[i][2]
      name = data_company[0][2]
      cnpj = data_company[0][4]
      access_levels.append(access_level) #vai adicionar o nivel de acesso a uma lista com os niveis das empresas a qual o usuário é relacionado
      names.append(name)#vai adicionar o nome a uma lista com os nomes das empresas a qual o usuário é relacionado
      cnpjs.append(cnpj)#vai adicionar o cnpj a uma lista com os cnpjs das empresas a qual o usuário é relacionado


    return jsonify({"relação":relation,
                    "Quantidade": qnt_relation,
                    "nivel de acesso": access_levels,
                    "nomes": names,
                    "cnpjs": cnpjs}), 200
 
  return jsonify({"relação":relation}), 200