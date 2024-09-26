from flask import Blueprint, render_template,request
from flask_login import login_required, login_user, current_user
from src.controller.dashboard.functions.user_companies import companies_info
from src.controller.dashboard.company.register_asset import asset_registration
from src.controller.dashboard.company.register_liability import liability_registration

# Tudo aqui no url é: /dashboard, ou seja: 127.0.0.1:5000/dashboard/...


dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')


@dashboard_request.route('/user', methods=['POST','GET']) 
@login_required
def dashboard_user():
    if request.method == 'POST':
        return companies_info()
    if request.method == 'GET':

        return render_template('dashboard/user/dashboard.html')


@dashboard_request.route(f'/company/<cnpj>') 
@login_required
def dashboard_company(cnpj):

    print("dashboard_request.py")
    print(cnpj)
    global global_cpnj
    print(current_user)

#Tentei. Tentei muito colocar o cnpj no current user, mas não dá, ´pq os dados do current user são 
#tirados diretamente do db_search_user(user_id), e o cnpj não fica lá. E toda vez que o init é 
#chamado(sempre) os dados do cpnj são apagados, então a solução é criar uma versão do 'user' em 
#src\model\user_model.py chamada 'company', ai sim ia dar para guardar os dados da empresa e 
#consultar o banco de dados e deixar a URL com cnpj em todos os cantos"""


    return render_template('dashboard/company/dashboard.html')

@dashboard_request.route(f'//register/asset', methods=['POST','GET']) 
@login_required
def register_asset_site():
    if request.method == 'POST':
        asset_data = request.get_json()
        return asset_registration(asset_data)
    if request.method == 'GET':
        
        return render_template('dashboard/company/assets/register.html')

@dashboard_request.route(f'/register/liability', methods=['POST','GET']) 
@login_required
def register_liability_site():
    if request.method == 'POST':
        asset_data = request.get_json()
        return liability_registration(asset_data)
    if request.method == 'GET':
        return render_template('dashboard/company/liabilities/register.html')
    
    

@dashboard_request.route('/reason')
@login_required
def reason(): 
    return render_template('dashboard/company/reason.html')