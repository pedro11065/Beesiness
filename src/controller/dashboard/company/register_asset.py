from flask_login import login_user
from flask_login import login_user, current_user
from flask import request, redirect, render_template,jsonify



from src.model.database.user.search import db_search_user
from src.model.database.company.user_companies.search import db_search_user_company
from src.model.user_model import User

from colorama import Fore, Style

def asset_registration(asset_data):
    print(asset_data)
    return jsonify('ta funcionando'), 200