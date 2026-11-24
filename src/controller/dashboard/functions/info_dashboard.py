from collections import defaultdict
from datetime import datetime
from flask import jsonify

from src.model.database.company.companies.search import db_search_company
from src.model.database.company.patrimony.asset.search import db_search_asset
from src.model.database.company.patrimony.asset.search_cash_value import db_search_cash
from src.model.database.company.patrimony.historic.search import db_search_historic
from src.model.database.company.patrimony.liability.search import db_search_liability

INFLOW_ASSET_EVENTS = {
    'Entrada de Caixa',
    'Entrada de caixa',
    'Venda',
    'Herança',
    'Serviço',
    'Capital Social',
}
OUTFLOW_ASSET_EVENTS = {'Compra', 'Transferência', 'Investimento'}
EQUITY_KEYS = {'Capital Social', 'Lucro', 'Lucros acumulados'}

MONTH_NAMES_PT = {
    1: 'Jan',
    2: 'Fev',
    3: 'Mar',
    4: 'Abr',
    5: 'Mai',
    6: 'Jun',
    7: 'Jul',
    8: 'Ago',
    9: 'Set',
    10: 'Out',
    11: 'Nov',
    12: 'Dez',
}


def _to_float(val):
    try:
        return float(val) if val is not None else 0.0
    except (TypeError, ValueError):
        return 0.0


def _parse_iso_or_br_date(raw):
    if not raw:
        return None
    text = str(raw).strip()
    for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
        try:
            return datetime.strptime(text, fmt)
        except ValueError:
            continue
    return None


def _is_equity_item(item):
    return (
        item.get('event') in EQUITY_KEYS
        or item.get('name') in EQUITY_KEYS
    )


def info_dashboard(company_id):
    # 0. Metadados da empresa
    company_name = 'Empresa'
    company_cnpj = ''
    company_rows = db_search_company(company_id)
    if company_rows and len(company_rows) > 0:
        company_name = company_rows[0][2] or 'Empresa'
        company_cnpj = company_rows[0][4] or ''

    # 1. Saldo atual em caixa
    cash_rows = db_search_cash(company_id)
    cash_now = _to_float(cash_rows[0][0]) if cash_rows and len(cash_rows) > 0 else 0.0

    # 2. Ativos registrados (tabela atual)
    assets_data = db_search_asset(company_id) or []
    non_cash_assets = [a for a in assets_data if a.get('name') != '#!@cash@!#']
    assets_quant = len(non_cash_assets)

    sum_non_cash_assets = sum(_to_float(a.get('value')) for a in non_cash_assets)
    sum_asset_values = cash_now + sum_non_cash_assets

    current_assets = cash_now + sum(
        _to_float(a.get('value')) for a in non_cash_assets if a.get('floating') is True
    )
    non_current_assets = sum(
        _to_float(a.get('value')) for a in non_cash_assets if a.get('floating') is not True
    )

    # 3. Passivos e Patrimônio Líquido registrados
    raw_liabilities = db_search_liability(company_id)
    liabilities_data = raw_liabilities if isinstance(raw_liabilities, list) else []
    liabilities_quant = len(liabilities_data)

    equity_items = [l for l in liabilities_data if _is_equity_item(l)]
    obligation_items = [l for l in liabilities_data if not _is_equity_item(l)]

    sum_liabilities_values = sum(_to_float(l.get('value')) for l in liabilities_data)
    sum_equity_values = sum(_to_float(l.get('value')) for l in equity_items)
    sum_obligations = sum(_to_float(l.get('value')) for l in obligation_items)
    obligations_quant = len(obligation_items)

    current_liabilities = sum(
        _to_float(l.get('value')) for l in obligation_items if l.get('floating') is True
    )
    non_current_liabilities = sum(
        _to_float(l.get('value')) for l in obligation_items if l.get('floating') is not True
    )

    # Patrimônio Líquido contábil = Ativo Total - Passivo Exigível (obrigações com terceiros)
    patrimony = sum_asset_values - sum_obligations

    # 4. Histórico: reconciliação exata de entradas, saídas e evolução de saldo
    raw_historic = db_search_historic(company_id)
    historic_data = raw_historic if isinstance(raw_historic, list) else []

    count_entrys = 0
    values_entrys = 0.0
    count_exits = 0
    values_exits = 0.0

    daily_cash_delta = defaultdict(float)
    outflows_by_category = defaultdict(float)

    for item in historic_data:
        if item.get('name') == '#!@cash@!#':
            continue

        val = _to_float(item.get('value'))
        deb = _to_float(item.get('debit'))
        item_type = item.get('type')
        event = item.get('event') or 'Outros'

        dt = _parse_iso_or_br_date(item.get('date')) or _parse_iso_or_br_date(item.get('creation_date'))
        date_key = dt.strftime('%Y-%m-%d') if dt else 'Sem data'

        if item_type == 'asset' and event in INFLOW_ASSET_EVENTS:
            count_entrys += 1
            values_entrys += val
            daily_cash_delta[date_key] += val
        elif item_type == 'asset' and event in OUTFLOW_ASSET_EVENTS:
            count_exits += 1
            values_exits += val
            daily_cash_delta[date_key] -= val
            category_label = item.get('class') or event
            outflows_by_category[category_label] += val
        elif item_type == 'liability' and deb > 0:
            count_exits += 1
            values_exits += deb
            daily_cash_delta[date_key] -= deb
            outflows_by_category[event] += deb

    # Série cronológica de saldo em caixa (reconciliada com cash_now)
    net_flow = values_entrys - values_exits
    running_balance = cash_now - net_flow
    cash_series_labels = []
    cash_series_values = []
    cash_data_historic = {}

    for date_key in sorted(daily_cash_delta.keys()):
        running_balance += daily_cash_delta[date_key]
        dt = _parse_iso_or_br_date(date_key)
        label = dt.strftime('%d/%m/%Y') if dt else date_key
        cash_series_labels.append(label)
        rounded_val = round(running_balance, 2)
        cash_series_values.append(rounded_val)
        cash_data_historic[label] = rounded_val

    # 5. Distribuição por classe (Ativos e Saídas)
    assets_class_totals = defaultdict(float)
    if cash_now != 0:
        assets_class_totals['Caixa disponível'] += cash_now
    for asset in non_cash_assets:
        cls_name = (asset.get('class') or 'Outros').strip()
        assets_class_totals[cls_name] += _to_float(asset.get('value'))

    assets_by_class = [
        {'label': k, 'value': round(v, 2)}
        for k, v in sorted(assets_class_totals.items(), key=lambda x: x[1], reverse=True)
        if v != 0
    ]

    exits_by_class = [
        {'label': k, 'value': round(v, 2)}
        for k, v in sorted(outflows_by_category.items(), key=lambda x: x[1], reverse=True)
        if v > 0
    ]

    # 6. Comparativo temporal Ativos x Passivos (por mês de competência)
    monthly_assets = defaultdict(float)
    monthly_liabilities = defaultdict(float)
    month_keys = set()

    for item in historic_data:
        if item.get('name') == '#!@cash@!#' or item.get('ignore') is True:
            continue
        if _is_equity_item(item):
            continue

        dt = _parse_iso_or_br_date(item.get('date')) or _parse_iso_or_br_date(item.get('creation_date'))
        if not dt:
            continue
        m_key = dt.strftime('%Y-%m')
        month_keys.add(m_key)
        val = _to_float(item.get('value'))
        if item.get('type') == 'asset':
            monthly_assets[m_key] += val
        elif item.get('type') == 'liability':
            monthly_liabilities[m_key] += val

    sorted_months = sorted(month_keys)
    comparison_labels = []
    comparison_assets = []
    comparison_liabilities = []

    for m_key in sorted_months:
        year_str, month_str = m_key.split('-')
        m_label = f"{MONTH_NAMES_PT.get(int(month_str), month_str)}/{year_str[2:]}"
        comparison_labels.append(m_label)
        comparison_assets.append(round(monthly_assets[m_key], 2))
        comparison_liabilities.append(round(monthly_liabilities[m_key], 2))

    # 7. Indicadores contábeis (liquidez e estrutura)
    liquidity_current = (
        round(current_assets / current_liabilities, 2)
        if current_liabilities > 0
        else None
    )
    liquidity_immediate = (
        round(cash_now / current_liabilities, 2)
        if current_liabilities > 0
        else None
    )
    debt_ratio = (
        round((sum_obligations / sum_asset_values) * 100, 2)
        if sum_asset_values > 0
        else 0.0
    )
    short_term_debt_share = (
        round((current_liabilities / sum_obligations) * 100, 1)
        if sum_obligations > 0
        else 0.0
    )

    # 8. Últimos lançamentos válidos para visão rápida
    valid_historic = [
        h for h in historic_data
        if h.get('name') != '#!@cash@!#' and h.get('ignore') is not True
    ]
    valid_historic.sort(
        key=lambda h: (
            (_parse_iso_or_br_date(h.get('date')) or datetime.min).strftime('%Y-%m-%d'),
            str(h.get('creation_date') or ''),
            str(h.get('creation_time') or ''),
        ),
        reverse=True,
    )

    recent_entries = []
    for item in valid_historic[:6]:
        dt = _parse_iso_or_br_date(item.get('date'))
        kind = 'equity' if _is_equity_item(item) else (item.get('type') or 'asset')
        recent_entries.append({
            'name': item.get('name') or '—',
            'event': item.get('event') or '—',
            'class': item.get('class') or '—',
            'date': dt.strftime('%d/%m/%Y') if dt else (item.get('date') or '—'),
            'value': round(_to_float(item.get('value')), 2),
            'kind': kind,
        })

    return jsonify({
        'version': 2,
        'company_name': company_name,
        'company_cnpj': company_cnpj,

        'cash_now': round(cash_now, 2),
        'patrimony': round(patrimony, 2),

        'assets_quant': assets_quant,
        'liabilities_quant': liabilities_quant,
        'obligations_quant': obligations_quant,

        'sum_asset_values': round(sum_asset_values, 2),
        'sum_non_cash_assets': round(sum_non_cash_assets, 2),
        'sum_liabilities_values': round(sum_liabilities_values, 2),
        'sum_obligations': round(sum_obligations, 2),
        'sum_equity_values': round(sum_equity_values, 2),

        'current_assets': round(current_assets, 2),
        'non_current_assets': round(non_current_assets, 2),
        'current_liabilities': round(current_liabilities, 2),
        'non_current_liabilities': round(non_current_liabilities, 2),

        'liquidity_current': liquidity_current,
        'liquidity_immediate': liquidity_immediate,
        'debt_ratio': debt_ratio,
        'short_term_debt_share': short_term_debt_share,

        'count_entrys': count_entrys,
        'count_exits': count_exits,
        'values_entrys': round(values_entrys, 2),
        'values_exits': round(values_exits, 2),
        'net_cash_flow': round(net_flow, 2),

        'cash_historic': cash_data_historic,
        'cash_series': {
            'labels': cash_series_labels,
            'values': cash_series_values,
        },
        'comparison_series': {
            'labels': comparison_labels,
            'assets': comparison_assets,
            'liabilities': comparison_liabilities,
        },
        'assets_by_class': assets_by_class,
        'exits_by_class': exits_by_class,
        'recent_entries': recent_entries,
    }), 200
