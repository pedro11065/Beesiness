from flask import Blueprint, render_template, request, abort, session, jsonify
from flask_login import login_required, current_user
from src import cache

from src.controller.dashboard.functions.info_authorization import info_authorization
from src.controller.dashboard.functions.asset.info_assets import info_assets
from src.controller.dashboard.functions.info_journal import info_journal
from src.controller.dashboard.functions.info_balance_trial import info_balance_trial
from src.controller.dashboard.functions.info_balance_sheet import info_balance_sheet
from src.controller.dashboard.functions.info_income_statement import info_income_statement
from src.controller.dashboard.functions.info_razonete import info_razonete
from src.controller.dashboard.functions.info_dashboard import info_dashboard
from src.controller.dashboard.functions.info_snapshot import (
    build_company_snapshot,
    invalidate_company_snapshot,
)
from src.controller.dashboard.functions.liability.info_liabilities import info_liabilities
from src.controller.dashboard.user.info_user_companies import info_user_companies

from src.controller.dashboard.functions.asset.update_asset import update_asset
from src.controller.dashboard.functions.liability.update_liability import update_liability

from src.controller.dashboard.functions.asset.sell_asset import sell_asset
from src.controller.dashboard.functions.liability.settle_liability import settle_liability

from src.controller.dashboard.functions.asset.refund_asset import refund_asset
from src.controller.dashboard.functions.liability.refund_liability import refund_liability

from src.controller.dashboard.functions.asset.register_asset import asset_registration
from src.controller.dashboard.functions.liability.register_liability import liability_registration

from src.model.database.company.companies.search import db_search_company
from src.model.database.company.user_companies.search import db_search_user_company


# Tudo aqui no url é: /dashboard, ou seja: 127.0.0.1:5000/dashboard/...
dashboard_request = Blueprint('auth_dashboard', __name__, template_folder='templates', static_folder='static')


def _render_company_spa(cnpj, initial_view, require_creator=False):
    company_id, user_access_level = (
        validate_creator_access(cnpj) if require_creator else validate_cnpj_access(cnpj)
    )
    snapshot = build_company_snapshot(company_id, user_access_level)
    return render_template(
        'dashboard/company/spa_app.html',
        cnpj=cnpj,
        initial_view=initial_view,
        snapshot=snapshot,
    )


# ----------------------------------------------------------------------------------------- SNAPSHOT UNIFICADO (SPA)
@dashboard_request.route('/snapshot/<cnpj>', methods=['POST', 'GET'])
@login_required
def company_snapshot(cnpj):
    company_id, user_access_level = validate_cnpj_access(cnpj)
    if request.args.get('fresh') == '1':
        invalidate_company_snapshot(company_id)
    return jsonify(build_company_snapshot(company_id, user_access_level)), 200


# ----------------------------------------------------------------------------------------- DASHBOARD DO USUÁRIO
@dashboard_request.route('/user', methods=['POST', 'GET'])
@login_required
def dashboard_user():
    if request.method == 'POST':
        return info_user_companies()
    return render_template('dashboard/user/dashboard.html')


# ----------------------------------------------------------------------------------------- DASHBOARD DA EMPRESA
@dashboard_request.route('/company/<cnpj>', methods=['POST', 'GET'])
@login_required
def dashboard_company(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_dashboard(company_id)
    return _render_company_spa(cnpj, 'overview')


# ----------------------------------------------------------------------------------------- REGISTRO DE ATIVOS
@dashboard_request.route('/register/asset/<cnpj>', methods=['POST', 'GET'])
@login_required
def register_asset_site(cnpj):
    if request.method == 'POST':
        asset_data = request.get_json()
        company_id = session.get('company_id')
        resp = asset_registration(asset_data, company_id)
        invalidate_company_snapshot(company_id)
        return resp
    return _render_company_spa(cnpj, 'register_asset')


# ----------------------------------------------------------------------------------------- REGISTRO DE PASSIVOS
@dashboard_request.route('/register/liability/<cnpj>', methods=['POST', 'GET'])
@login_required
def register_liability_site(cnpj):
    if request.method == 'POST':
        liability_data = request.get_json()
        company_id = session.get('company_id')
        resp = liability_registration(liability_data, company_id)
        invalidate_company_snapshot(company_id)
        return resp
    return _render_company_spa(cnpj, 'register_liability')


# ----------------------------------------------------------------------------------------- LIVRO DIÁRIO
@dashboard_request.route('/journal/<cnpj>', methods=['POST', 'GET'])
@login_required
def register_journal_site(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_journal(company_id, cnpj)
    return _render_company_spa(cnpj, 'journal')


# ----------------------------------------------------------------------------------------- BALANCETE DE VERIFICAÇÃO
@dashboard_request.route('/trial-balance/<cnpj>', methods=['POST', 'GET'])
@login_required
def balance_trial(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_balance_trial(company_id, cnpj)
    return _render_company_spa(cnpj, 'trial_balance')


# ----------------------------------------------------------------------------------------- BALANÇO PATRIMONIAL
@dashboard_request.route('/balance-sheet/<cnpj>', methods=['POST', 'GET'])
@login_required
def balance_sheet(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_balance_sheet(company_id, cnpj)
    return _render_company_spa(cnpj, 'balance_sheet')


# ----------------------------------------------------------------------------------------- DRE
@dashboard_request.route('/income-statement/<cnpj>', methods=['POST', 'GET'])
@login_required
def income_statement(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_income_statement(company_id, cnpj)
    return _render_company_spa(cnpj, 'income_statement')


# ----------------------------------------------------------------------------------------- RAZONETE
@dashboard_request.route('razonete/<cnpj>', methods=['POST', 'GET'])
@login_required
def razonete_site(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_razonete(company_id, cnpj)
    return _render_company_spa(cnpj, 'razonete')


# ----------------------------------------------------------------------------------------- ATIVOS
@dashboard_request.route('assets/<cnpj>', methods=['POST', 'GET'])
@login_required
def assets_site(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_assets(company_id)
    return _render_company_spa(cnpj, 'assets')


@dashboard_request.route('/refund-asset/<uuid>', methods=['POST'])
@login_required
def assets_refund(uuid):
    company_id = session.get('company_id')
    resp = refund_asset(uuid, company_id)
    invalidate_company_snapshot(company_id)
    return resp


@dashboard_request.route('/update-asset/<uuid>', methods=['POST'])
@login_required
def assets_update(uuid):
    data = request.get_json()
    company_id = session.get('company_id')
    resp = update_asset(data, uuid, company_id)
    invalidate_company_snapshot(company_id)
    return resp


@dashboard_request.route('/sell-asset/<uuid>', methods=['POST'])
@login_required
def assets_sell(uuid):
    company_id = session.get('company_id')
    resp = sell_asset(uuid, company_id)
    invalidate_company_snapshot(company_id)
    return resp


# ----------------------------------------------------------------------------------------- PASSIVOS
@dashboard_request.route('liabilities/<cnpj>', methods=['POST', 'GET'])
@login_required
def liabilities_site(cnpj):
    if request.method == 'POST':
        company_id = session.get('company_id')
        return info_liabilities(company_id)
    return _render_company_spa(cnpj, 'liabilities')


@dashboard_request.route('/refund-liability/<uuid>', methods=['POST'])
@login_required
def liabilities_refund(uuid):
    company_id = session.get('company_id')
    resp = refund_liability(uuid, company_id)
    invalidate_company_snapshot(company_id)
    return resp


@dashboard_request.route('/update-liability/<uuid>', methods=['POST'])
@login_required
def liabilities_update(uuid):
    data = request.get_json()
    company_id = session.get('company_id')
    resp = update_liability(data, uuid, company_id)
    invalidate_company_snapshot(company_id)
    return resp


@dashboard_request.route('/settle-liability/<uuid>', methods=['POST'])
@login_required
def liabilities_settle(uuid):
    company_id = session.get('company_id')
    resp = settle_liability(uuid, company_id)
    invalidate_company_snapshot(company_id)
    return resp


# ----------------------------------------------------------------------------------------- PERMISSÕES
@dashboard_request.route('/company/<cnpj>/authorization', methods=['POST', 'GET'])
@login_required
def authorization_site(cnpj):
    if request.method == 'POST':
        validate_creator_access(cnpj)
        data = request.get_json() or {}
        company_id = session.get('company_id')
        resp = info_authorization(data, company_id)
        if data.get('action') != 'search':
            invalidate_company_snapshot(company_id)
        return resp

    return _render_company_spa(cnpj, 'authorization', require_creator=True)


# ----------------------------------------------------------------------------------------- CONFIGURAÇÕES DA EMPRESA
@dashboard_request.route('/company/<cnpj>/settings', methods=['POST', 'GET'])
@login_required
def settings_site(cnpj):
    if request.method == 'GET':
        validate_creator_access(cnpj)
        return render_template('dashboard/company/settings.html')
    return jsonify({'message': 'Método não implementado.'}), 405


def validate_cnpj_access(cnpj):
    if len(cnpj) != 14:
        abort(404)

    cached_relation = cache.get(f'relation_{current_user.id}_{cnpj}')
    if cached_relation:
        company_id, user_access_level = cached_relation
    else:
        company = db_search_company(cnpj)
        if not company:
            abort(404)

        user_company_relation = db_search_user_company(current_user.id, company[0][0])
        if not user_company_relation:
            abort(403)

        company_id, user_id, user_access_level, _rel_id = user_company_relation[0]
        cache.set(f'relation_{current_user.id}_{cnpj}', (company_id, user_access_level), timeout=600)

    if user_access_level not in ['creator', 'editor', 'checker', 'viewer']:
        abort(403)

    session['company_id'] = company_id
    return company_id, user_access_level


def validate_creator_access(cnpj):
    company_id, user_access_level = validate_cnpj_access(cnpj)
    if user_access_level != 'creator':
        abort(403)
    session['company_id'] = company_id
    return company_id, user_access_level
