from flask import Blueprint, request, render_template, redirect
from flask_login import logout_user, login_required, current_user

from src.controller.user.functions.login import process_login
from src.controller.user.functions.register import process_registration

#tudo aqui é: /user...

user_request = Blueprint('auth_user', __name__, template_folder='templates', static_folder='static')

# -------------------------------------------------------------------------------------

@user_request.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        return process_login(data)
    
    if request.method == 'GET':
        return render_template('user/login.html')

# -------------------------------------------------------------------------------------

@user_request.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        create_data = request.get_json()
        return process_registration(create_data)
    
    if request.method == 'GET':
        return render_template('user/register.html')

# -------------------------------------------------------------------------------------

@user_request.route('/forget-password')
def forget_password():
    return render_template("user/forget_password.html")

# -------------------------------------------------------------------------------------

@user_request.route('/settings')
@login_required
def settings():
    print(current_user.id)
    return render_template("user/settings.html", name=current_user.fullname, email=current_user.email, cpf=current_user.cpf)

# -------------------------------------------------------------------------------------

@user_request.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/')  


