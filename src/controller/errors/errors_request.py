from flask import Blueprint, render_template
from flask_login import login_required

errors = Blueprint('errors', __name__, template_folder='templates', static_folder='static')

@errors.route('/404')
def error_404():
    return render_template('404.html')

