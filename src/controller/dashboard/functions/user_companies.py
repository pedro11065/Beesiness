from flask import jsonify
from flask_login import current_user
from src.model.database.company.user_companies.search import db_search_user_company
from src.model.database.company.companies.search import db_search_company
from colorama import Fore, Style

def companies_info():
    data = db_search_user_company(current_user.id)

    if data:
        qnt_relation = len(data)  # Quantidade de relações (linhas)
        #print(f'Há {qnt_relation} linhas nas informações de companhia.')

        names = []
        cnpjs = []
        access_levels = []

        for i in range(qnt_relation):
            data_company = db_search_company(data[i][0])  # Pega os dados da empresa a partir do id dela
            
            if not data_company:  # Verifica se data_company está vazio
                print(f'{Fore.RED}[Busca de empresas]{Style.RESET_ALL} A empresa com ID {data[i][0]} não foi encontrada!')
                continue  # Pula para a próxima iteração

            access_level = data[i][2]

            try:
                name = data_company[i][2]
                cnpj = data_company[i][4]
            except IndexError:
                print(f'{Fore.RED}[Busca de empresas]{Style.RESET_ALL} Erro ao acessar dados da empresa!')
                continue  # Pula para a próxima iteração

            access_levels.append(access_level)
            names.append(name)
            cnpjs.append(cnpj)

        if names and cnpjs:  # Certifica-se de que há dados válidos
            return jsonify({
                "relação": True,
                "Quantidade": qnt_relation,
                "nivel de acesso": access_levels,
                "nomes": names,
                "cnpjs": cnpjs
            }), 200
        else:
            return jsonify({
                "relação": False,
            }), 200
    else:
        print(f'{Fore.RED}Nenhuma relação encontrada!{Style.RESET_ALL}')
        return jsonify({"relação": False}), 200
