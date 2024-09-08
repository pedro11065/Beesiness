from flask import Blueprint, render_template
from flask_login import login_required

views = Blueprint('views', __name__, template_folder='templates', static_folder='static')

@views.route('/home')
def home():
    return render_template('home.html')

@views.route('/')
def home_():
    return render_template('home.html')

@views.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@views.route('/dashboard_new_user')
@login_required
def dashboard_new_user():
    return render_template('dashboard_new_user.html')