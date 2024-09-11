from flask import Blueprint, Flask, flash, get_flashed_messages, request, render_template, redirect, session, url_for
from flask_login import login_user, logout_user, current_user, login_required
from src.controller.dashboard.functions.user_companies import companies_info
#tudo aqui é: /dashboard...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')


@dashboard_request.route('/') #no caso, tanto a api tanto o site usam o metodo get, então vou criar uma rota só para a API
@login_required
def dashboard():
    return render_template('company/dashboard/dashboard.html')

@dashboard_request.route('/api') #no caso, tanto a api tanto o site usam o metodo get, então vou criar uma rota só para a API
@login_required
def dashboard_api():
    return companies_info()



