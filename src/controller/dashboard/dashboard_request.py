from flask import Blueprint, Flask, flash, get_flashed_messages, request, render_template, redirect, session, url_for
from flask_login import login_user, logout_user, current_user, login_required
from src.controller.company.functions.register import process_registration

#tudo aqui é: /dashboard...

dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')


@dashboard_request.route('/')
@login_required
def dashboard():
    return render_template('company/dashboard/dashboard.html')

@dashboard_request.route('/new_user')
@login_required
def dashboard_new_user():
    return render_template('company/dashboard/dashboard_new_user.html')

