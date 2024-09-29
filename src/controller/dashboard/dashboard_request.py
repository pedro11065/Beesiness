from flask import Blueprint, render_template, request, abort, session
from flask_login import login_required, current_user

from src.controller.dashboard.company.info_reason import  info_reason
from src.controller.dashboard.functions.user_companies import companies_info
from src.controller.dashboard.company.register_asset import asset_registration
from src.controller.dashboard.company.register_liability import liability_registration

from src.model.database.company.patrimony.search_all import db_search_liabilities_and_assets

from src.model.database.company.companies.search import db_search_company
from src.model.database.company.user_companies.search import db_search_user_company



# Tudo aqui no url é: /dashboard, ou seja: 127.0.0.1:5000/dashboard/...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')

#----------------------------------------------------------------------------------------- DASHBOARD DO USUÁRIO

@dashboard_request.route('/user', methods=['POST','GET']) 
@login_required
def dashboard_user():
    if request.method == 'POST':
        return companies_info()
    if request.method == 'GET':
        return render_template('dashboard/user/dashboard.html')

#----------------------------------------------------------------------------------------- DASHBOARD DA EMPRESA


@dashboard_request.route(f'/company/<cnpj>', methods=['GET']) 
@login_required
def dashboard_company(cnpj):
    if request.method == 'GET':
        validate_cnpj(cnpj);
        return render_template('dashboard/company/dashboard.html', cnpj=cnpj)

#----------------------------------------------------------------------------------------- REGISTRO DE ATIVOS

@dashboard_request.route(f'/register/asset/<cnpj>', methods=['POST','GET']) 
@login_required
def register_asset_site(cnpj):
    if request.method == 'POST':
        asset_data = request.get_json()
        company_id = session.get('company_id')

        return asset_registration(asset_data, company_id)
    if request.method == 'GET':
        validate_cnpj(cnpj);
        return render_template('dashboard/company/assets/register.html', cnpj=cnpj)

#----------------------------------------------------------------------------------------- REGISTRO DE PASSIVOS


@dashboard_request.route(f'/register/liability/<cnpj>', methods=['POST','GET']) 
@login_required
def register_liability_site(cnpj):
    if request.method == 'POST':
        liability_data = request.get_json()
        company_id = session.get('company_id')
    
        return liability_registration(liability_data, company_id)
    if request.method == 'GET': 
        validate_cnpj(cnpj);
        return render_template('dashboard/company/liabilities/register.html', cnpj=cnpj)
    
#----------------------------------------------------------------------------------------- LIVRO DE RAZÃO (EXTRATO)

@dashboard_request.route('/reason/<cnpj>', methods=['POST','GET'])
@login_required
def register_reason_site(cnpj): 

    validate_cnpj(cnpj)
    
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_reason(company_id, cnpj)

    if request.method == 'GET': 
        return render_template('dashboard/company/reports/reason.html',cnpj=cnpj)
    

#-----------------------------------------------------------------------------------------






def validate_cnpj(cnpj):
    # Estas verificações são necessárias para que os usuários não burlem as empresas pelo URL.
    # Erro 404 - Página não encontrada
    # Erro 403 - Falta de permissão para acesso.

    # Verifica se o CNPJ na URL tem 14 caracteres
    if len(cnpj) != 14:
        abort(404)

    # Verifica se a empresa existe
    company = db_search_company(cnpj)
    if not company:
        abort(404)

    # Busca as relações do usuário com a empresa usando o ID do usuário e o ID da empresa
    user_company_relation = db_search_user_company(current_user.id, company[0][0])

    # Se não houver relação encontrada, retorna erro 404
    if not user_company_relation:
        abort(403)

    # Desestrutura a array para pegar o company_id, user_id e o nível de acesso
    company_id, user_id, user_access_level = user_company_relation[0]

    # Verifica o nível de acesso do usuário.
    if user_access_level not in ['creator', 'editor', 'checker', 'viewer']:
        abort(403)

    session['company_id'] = company_id