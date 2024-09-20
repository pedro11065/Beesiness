from flask import Blueprint, render_template,request
from flask_login import login_required
from src.controller.dashboard.functions.user_companies import companies_info
from src.controller.dashboard.company.register_asset import asset_registration

# Tudo aqui no url é: /dashboard, ou seja: 127.0.0.1:5000/dashboard/...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')


@dashboard_request.route('/user', methods=['POST','GET']) 
@login_required
def dashboard_user():
    if request.method == 'POST':
        return companies_info()
    if request.method == 'GET':
        return render_template('dashboard/user/dashboard.html')

@dashboard_request.route('/company/<cnpj>') 
@login_required
def dashboard_company(cnpj):
    return render_template('dashboard/company/dashboard.html', cnpj=cnpj)

@dashboard_request.route('/register-asset', methods=['POST','GET']) 
@login_required
def register_asset_site():
    if request.method == 'POST':
        asset_data = request.get_json()
        return asset_registration(asset_data)
    if request.method == 'GET':
        return render_template('dashboard/company/assets/register.html')
    

@dashboard_request.route('/reason')
@login_required
def reason(): 
    return render_template('dashboard/company/reason.html')