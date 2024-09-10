from flask import Blueprint, render_template
from flask_login import login_required

index = Blueprint('index', __name__, template_folder='templates', static_folder='static')

@index.route('/')
def home():
    return render_template('index.html')

#template_folder=os.path.abspath(os.path.join(os.path.dirname(__file__), '../../'))