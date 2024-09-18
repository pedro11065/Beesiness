from flask import Blueprint, request, render_template
from flask_login import login_required
from src.controller.company.functions.register import process_registration

#tudo aqui é: /company...

company_request = Blueprint('auth_company', __name__, template_folder='templates', static_folder='static')

@company_request.route('/register', methods= ['POST','GET']) #methods=['GET', 'POST']
@login_required
def register():
    if request.method == 'POST':
        data = request.get_json()
        return process_registration(data)
    else:
        return render_template('company/register.html')

