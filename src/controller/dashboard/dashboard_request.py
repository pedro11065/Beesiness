from flask import Blueprint, render_template
from flask_login import login_required
from src.controller.dashboard.functions.user_companies import companies_info

# Tudo aqui no url é: /dashboard, ou seja: 127.0.0.1:5000/dashboard/...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')


@dashboard_request.route('/user') 
@login_required
def dashboard_user():
    return render_template('dashboard/user/dashboard.html')

@dashboard_request.route('/user/api') 
@login_required
def dashboard_api():
    return companies_info()

@dashboard_request.route('/company') 
@login_required
def dashboard_company():
    return render_template('dashboard/company/dashboard.html')

@dashboard_request.route('/register-asset') 
@login_required
def register_asset():
    return render_template('dashboard/company/assets/register.html')






