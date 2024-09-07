from datetime import datetime
from flask import request, redirect, flash, url_for, render_template
from werkzeug.security import generate_password_hash
from src.model.database.user.create_user import db_create_user
from src.model.validation.user.validate import validate_cpf_and_email

def process_registration():
    name = request.form['fullName']
    email = request.form['email']
    password = request.form['password']
    confirm_password = request.form['confirmPassword']
    cpf = request.form['cpf']
    birth_date = request.form['birthDate']

    # Transformando a data de 2006-04-29 para 29/04/2006
    data_nascimento = datetime.strptime(birth_date, '%Y-%m-%d')  # Converte a string para um objeto datetime
    formatted_birth_date = data_nascimento.strftime('%d/%m/%Y')  # Converte o objeto datetime para o formato 'DD/MM/YYYY'

    errors = validate_cpf_and_email(cpf, email)

    if errors: # Se houver erros, adicione-os ao flash e redirecione
        for error in errors:
            flash(error, 'error')
        return redirect(url_for('auth_user.register'))  # Redireciona para a página de registro
    else:
        hashed_password = generate_password_hash(password)
        db_create_user(name, cpf, email, hashed_password, formatted_birth_date)
        return redirect('/user-login')
