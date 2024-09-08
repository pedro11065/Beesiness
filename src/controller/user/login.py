from werkzeug.security import check_password_hash
from flask import request, redirect, render_template
from src.model.database.user.search_user import db_search_user
from src.model.user_model import User
from flask_login import login_user

def process_login():
    email = request.form['username']
    password = request.form['password']

    user_data = db_search_user(email)

    if user_data and check_password_hash(user_data['password_hash'], password):
        user = User(
            id=user_data['id'],
            fullname=user_data['fullname'],
            cpf=user_data['cpf'],
            email=user_data['email'],
            password_hash=user_data['password_hash']
        )
        login_user(user)
        return redirect('/dashboard_new_user')
    else:
        return redirect('/user-login')
