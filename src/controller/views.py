from flask import Blueprint, render_template
from flask_login import login_required

views = Blueprint('views', __name__, template_folder='templates', static_folder='static')

@views.route('/')
def home():
    return render_template('index.html')

@views.route('/dashboard')
@login_required
def dashboard():
    return render_template('company/dashboard.html')

@views.route('/dashboard_new_user')
@login_required
def dashboard_new_user():
    return render_template('company/dashboard_new_user.html')