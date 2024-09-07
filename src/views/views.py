from flask import Blueprint, render_template
from flask_login import login_required, current_user

views = Blueprint('views', __name__, template_folder='templates', static_folder='static')

@views.route('/')
def home():
    return render_template('home.html')

@views.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')