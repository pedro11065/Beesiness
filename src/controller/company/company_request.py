from flask import Blueprint, Flask, flash, get_flashed_messages, request, render_template, redirect, session, url_for
from flask_login import login_user, logout_user, current_user, login_required
from src.controller.company.register import process_registration

company_request = Blueprint('auth_company', __name__, template_folder='templates', static_folder='static')

@company_request.route('/company-register', methods= ['POST','GET']) #methods=['GET', 'POST']
@login_required
def register():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        return process_registration(data)
    
    else:
        return render_template('company_register.html')
    #print(a, b)
    #return render_template('login.html')
    #return render_template('registro_empresa.html')