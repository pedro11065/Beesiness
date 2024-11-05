from flask_login import current_user
from flask import jsonify
from src.model.database.company.patrimony.liability.create import db_create_liability

def liability_registration(liability_data, company_id):
    # Extrai os dados do passivo do payload recebido
    name = liability_data.get('name')
    event = liability_data.get('event')
    classe = liability_data.get('classe')
    payment_method = liability_data.get('payment_method')
    installment = liability_data.get('installment')
    status = liability_data.get('status')
    value = liability_data.get('value')
    emission_date = liability_data.get('emission_date')
    expiration_date = liability_data.get('expiration_date')
    description = liability_data.get('description')

    value = float(value)

#-------------------------------------------------- Parcelamento

    if installment == "Débito":
        installment = 1
    
    else:               
        installment = installment[:-1]
        # --> 12x --> 12

    installment = int(installment)

#-------------------------------------------------- Status 


    if status in ['Pendente','Em atraso','Parcelado']:#Se o passivo não foi quitado, ele é uma obrigação, logo, 
        #deve ser registrado na tabela de passivos para o calculo do patrimônio
        status_mode = True #Se for uma obrigação
    
    else:
        status_mode = False #Se não for uma obrigação

#-------------------------------------------------- Debito e crédito 

    if event in ['Multa', 'Juros', 'Conta a pagar', 'Imposto a pagar', 'Salário a pagar', 'Fornecedor', 'Processos judiciais']: 
        update_cash = 'less'  #Se for uma dessas coisas, vai ter uma subtração do meu saldo, logo, update_cash = less

        liability_debit = value 
        liability_credit = 0      
        cash_debit = 0  
        cash_credit = value  

    elif event in ['Financiamento', 'Concessão de crédito', 'Prestação de serviços']:
        update_cash = 'more'  #Se for uma dessas coisas, vai ter uma adição do meu saldo, logo, update_cash = more
        
        liability_debit = 0      
        liability_credit = value             
        cash_debit = value  
        cash_credit =  0

    elif event in ['Empréstimo', 'Capital Social']:
        update_cash = 'more'  #Se for uma dessas coisas, vai ter uma adição do meu saldo, logo, update_cash = more
        
        liability_debit = 0      
        liability_credit = value             
        cash_debit = 0 
        cash_credit =  0

    else:
        update_cash = 'none' #Nem um nem outro

        liability_debit = 0      
        liability_credit = value             
        cash_debit = value  
        cash_credit =  0

#-----------------------------------------------------------------------------------


    db_create_liability(company_id, current_user.id, name, event, classe, value, emission_date, expiration_date, payment_method, description, status, update_cash, liability_debit, liability_credit, cash_debit, cash_credit,installment,status_mode)

    return jsonify('Liability registrado com sucesso!'), 200
