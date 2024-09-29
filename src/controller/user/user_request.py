from flask import Blueprint, request, render_template, redirect, jsonify
from flask_login import logout_user, login_required, current_user

from werkzeug.security import check_password_hash
from src.model.database.user.search import db_search_user

from src.controller.user.functions.login import process_login
from src.controller.user.functions.register import process_registration

# Tudo aqui é: /user...

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

@user_request.route('/settings', methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        settings = request.get_json()
        password = settings['password']

        password_db = db_search_user(current_user.id)
        password_hash = password_db['password_hash']

        check_status = check_password_hash(password_hash, password)

        if check_status:
            return jsonify({"success": True, "message": "Senha correta"}), 200
        else:
            return jsonify({"success": False, "message": "Senha incorreta"}), 200
    if request.method == 'GET':
        return render_template("user/settings.html")

# -------------------------------------------------------------------------------------

@user_request.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect('/')  


