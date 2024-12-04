from flask_login import current_user
from flask import jsonify
from datetime import datetime

from src.model.database.company.patrimony.historic.search import db_search_historic

def info_income_statement(company_id, cnpj):
    try:
        historic_data = db_search_historic(company_id)
        if not historic_data:
            return jsonify({'error': 'No historical data found'}), 404

        assets = []
        liabilities = []

        years = set() # Conjunto para armazenar os anos de forma única

        for item in historic_data:
            try:
                transaction_date = datetime.strptime(item['date'], "%Y-%m-%d")
            except ValueError:
                continue

            # Adiciona o ano ao conjunto de anos únicos
            years.add(transaction_date.year)

            # Classifica os itens como ativos ou passivos
            if item['ignore'] != True:
                if item['type'] == 'asset':
                    assets.append(item)

                elif item['type'] == 'liability':
                    liabilities.append(item)

        sorted_years = sorted(list(years)) # Convertendo o set de anos únicos para uma lista ordenada

#-------------------------------------------------------------------------------------------------------
# Juntando todos os itens com o mesmo nome

#ATIVOS ====================================================

        del_list = []

        for i in range(len(assets)):
            now_name = assets[i]['name']

            for j in range(len(assets)):
                next_name = assets[j]['name']

                if now_name == next_name:
                    float(assets[i]['value']) = float(assets[j]['value']) + float(assets[i]['value'])
                    del_list.append(assets[i]['patrimony_id'])

        for i in del_list:
            print(i)
            for item in assets:
                if item['patrimony_id'] == i:
                    del assets[i]     

#PASSIVOS ====================================================

        del_list = []

        for i in range(len(liabilities)):
            now_name = liabilities[i]['value']

            for j in range(len(liabilities)):
                next_name = liabilities[j]['value']

                if now_name == next_name:
                    float(liabilities[i]['value'])= float(liabilities[j]['value']) + float(assets[i]['value'])
                    del_list.append(liabilities[i]['patrimony_id'])
                    
        for i in del_list:
            print(i)
            for item in assets:
                if item['patrimony_id'] == i:
                    del liabilities[i]    

            









#-------------------------------------------------------------------------------------------------------

        brute_revenue = []  ; brute_revenue_float = 0 #todas receitas
        deductions_revenue = []; deductions_revenue_float = 0 #deduções da receita
        result_revenue = 0 #resultado operacional bruto 

        sell_costs = [] ; sell_costs_float = 0 #custos de venda    
        result_operational_costs = 0 #resultado operacional líquido 

        operational_costs = [] ;  operational_costs_float = 0 #custo operacional
        loss = 0
        loss_profit = 0 #lucro x prezuízo

#-------------------------------------------------------------------------------------------------------
        #Receita bruta
        #brute_revenue eventos: Entrada de Caixa(exceto "#!@cash@!#") -> Receita = Lucro
        
        for item in assets:
            if item['event'] in ['Lucro', 'Venda', 'Serviço'] and item['name'] != '#!@cash@!#':
                brute_revenue.append(item)

                brute_revenue_float += float(item['value'])
            
        for item in liabilities:
            if item['event'] in ['Lucro']:
                brute_revenue.append(item)

                brute_revenue_float += float(item['value'])

#-------------------------------------------------------------------------------------------------------
        #Deduções da receita bruta
        #deductions_revenue eventos: Descontos, Impostos e devoluções --> Despesas relacionadas ao lucro

        for item in liabilities:
            if item['event'] in ['Imposto a pagar(Receita)', 'Devolução', 'Desconto']:
                deductions_revenue.append(item)     

                deductions_revenue_float -= float(item['value'])
 

#-------------------------------------------------------------------------------------------------------
        #Resultado operacional bruto
        #result_revenue = receita - despesas da receita
        result_revenue = brute_revenue_float - deductions_revenue_float
        print(result_revenue)
#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------
        # Gastos diretos para gerar receitas, sem esses gastos, sem vendas(ex.: custo de produtos vendidos).
        #sell_costs eventos: Fornecedor, Salário a pagar; Compra, investimento, serviço
        
        for item in liabilities:
            if item['event'] in ['Fornecedor', 'Salário a pagar','Serviço']:
                sell_costs.append(item)     

                sell_costs_float += float(item['value'])  

        for item in assets:
            if item['event'] in ['Compra', 'Investimento']:
                sell_costs.append(item)     

                sell_costs_float += float(item['value'])  
             
#-------------------------------------------------------------------------------------------------------
        #resultado operacional líquido = Resultado operacional bruto - custo das vendas

        result_operational_costs = result_revenue - sell_costs_float

        print(result_operational_costs)

#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------
        #Custos operacionais

        for item in liabilities:
            if item['event'] in ['Conta a pagar', 'Empréstimo', 'Financiamento', 'Imposto a pagar(Operacional)', 'Multa', 'Serviço']:
                operational_costs.append(item)     

                operational_costs_float += float(item['value'])  

#-------------------------------------------------------------------------------------------------------
        #lucro/prejuízo = Resultado operacional líquido x Custos operacionais
        
        loss_profit = result_operational_costs - operational_costs_float          
        print(loss_profit)



        return jsonify({

            'brute_revenue':brute_revenue, #Receita operacional bruta
            'brute_revenue_float':brute_revenue_float,#Receita operacional bruta(valor)
        
            'deductions_revenue':deductions_revenue, #Deduções da receita bruta
            'deductions_revenue_float':deductions_revenue_float,#Deduções da receita bruta(valor)

            'result_revenue':result_revenue, #Resultado operacional bruto
            
            ################################################

            'sell_costs':sell_costs, #Custos das vendas
            'sell_costs_float':sell_costs_float, #Custos das vendas(valor)

            'result_operational_costs':result_operational_costs, #Resultado operacional líquido

            ################################################

            'operational_costs':operational_costs, #Despesas operacionais
            'operational_costs_float':operational_costs_float, #Despesas operacionais(valor)

            'loss_profit':loss_profit,#lucro/prejuízo operacional

            ################################################
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500