from flask_login import login_user
from flask_login import login_user, current_user
from flask import request, redirect, render_template,jsonify

"""

Por favor, peço que na próxima comente para que vai servir esse arquivo, valeu!

"""

from src.model.database.user.search import db_search_user
from src.model.database.company.user_companies.search import db_search_user_company
from src.model.user_model import User

from colorama import Fore, Style

def liability_registration(liability_data):
    print(liability_data)
    return jsonify('ta funcionando'), 200