from collections import defaultdict
import datetime
from datetime import datetime as dt_cls
import psycopg2
from flask_login import current_user

from src import cache
from src.model.database.connect import connect_database

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
    1: 'Jan', 2: 'Fev', 3: 'Mar', 4: 'Abr', 5: 'Mai', 6: 'Jun',
    7: 'Jul', 8: 'Ago', 9: 'Set', 10: 'Out', 11: 'Nov', 12: 'Dez',
}


def _to_float(val):
    try:
        return float(val) if val is not None else 0.0
    except (TypeError, ValueError):
        return 0.0


def _parse_date(raw):
    if not raw:
        return None
    if isinstance(raw, datetime.datetime):
        return raw
    if isinstance(raw, datetime.date):
        return dt_cls(raw.year, raw.month, raw.day)
    text = str(raw).strip()
    for fmt in ('%Y-%m-%d', '%d/%m/%Y'):
        try:
            return dt_cls.strptime(text[:10], fmt)
        except ValueError:
            continue
    return None


def _fmt_br_date(val):
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.strftime('%d/%m/%Y')
    d = _parse_date(val)
    return d.strftime('%d/%m/%Y') if d else (str(val) if val is not None else '')


def _fmt_iso_date(val):
    if isinstance(val, (datetime.date, datetime.datetime)):
        return val.strftime('%Y-%m-%d')
    d = _parse_date(val)
    return d.strftime('%Y-%m-%d') if d else (str(val) if val is not None else '')


def _fmt_time(val):
    if isinstance(val, datetime.time):
        return val.strftime('%H:%M:%S')
    return str(val)[:8] if val is not None else ''


def _is_equity(item):
    return item.get('event') in EQUITY_KEYS or item.get('name') in EQUITY_KEYS


def _process_dre_items(items, events_to_include):
    grouped = {}
    for item in items:
        if item.get('event') not in events_to_include or item.get('name') == '#!@cash@!#':
            continue
        name = item['name']
        val = _to_float(item.get('value'))
        if name in grouped:
            grouped[name]['value'] += val
        else:
            grouped[name] = {
                'name': name,
                'value': val,
                'event': item.get('event'),
                'type': item.get('type'),
                'date': item.get('date'),
            }
    grouped_list = sorted(grouped.values(), key=lambda x: x['value'], reverse=True)
    for g in grouped_list:
        g['value'] = round(g['value'], 2)
    total = round(sum(x['value'] for x in grouped_list), 2)
    return grouped_list, total


def invalidate_company_snapshot(company_id):
    if company_id:
        cache.delete(f'snapshot_raw_{company_id}')


def _fetch_raw_company_bundle(company_id):
    cache_key = f'snapshot_raw_{company_id}'
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    db_login = connect_database()
    conn = psycopg2.connect(
        host=db_login[0],
        database=db_login[1],
        user=db_login[2],
        password=db_login[3],
    )
    try:
        with conn.cursor() as cur:
            cur.execute(
                'SELECT company_id, user_id, company_name, company_email, company_cnpj FROM table_companies WHERE company_id = %s;',
                (company_id,),
            )
            comp_row = cur.fetchone()

            cur.execute(
                'SELECT * FROM table_assets WHERE company_id = %s ORDER BY creation_date DESC, creation_time DESC;',
                (company_id,),
            )
            asset_rows = cur.fetchall()

            cur.execute(
                'SELECT * FROM table_liabilities WHERE company_id = %s ORDER BY creation_date DESC, creation_time DESC;',
                (company_id,),
            )
            liability_rows = cur.fetchall()

            cur.execute(
                'SELECT * FROM table_historic WHERE company_id = %s ORDER BY creation_date DESC, creation_time DESC;',
                (company_id,),
            )
            historic_rows = cur.fetchall()

            cur.execute(
                """
                SELECT uc.id, uc.user_access_level, u.user_fullname, u.user_cpf
                FROM table_user_companies uc
                JOIN table_users u ON uc.user_id = u.user_id
                WHERE uc.company_id = %s;
                """,
                (company_id,),
            )
            team_rows = cur.fetchall()
    finally:
        conn.close()

    bundle = {
        'comp_row': comp_row,
        'asset_rows': asset_rows,
        'liability_rows': liability_rows,
        'historic_rows': historic_rows,
        'team_rows': team_rows,
    }
    cache.set(cache_key, bundle, timeout=90)
    return bundle


def build_company_snapshot(company_id, user_role='viewer'):
    raw = _fetch_raw_company_bundle(company_id)
    comp_row = raw['comp_row']

    company_name = comp_row[2] if comp_row else 'Empresa'
    company_email = comp_row[3] if comp_row else ''
    company_cnpj = comp_row[4] if comp_row else ''

    # 1. Ativos
    assets_list = []
    cash_now = 0.0
    for data in raw['asset_rows'] or []:
        val = _to_float(data[6])
        if data[3] == '#!@cash@!#':
            cash_now = val
        assets_list.append({
            'asset_id': str(data[0]),
            'company_id': str(data[1]),
            'user_id': str(data[2]),
            'name': data[3],
            'event': data[4],
            'class': data[5],
            'value': round(val, 2),
            'location': data[7],
            'acquisition_date': _fmt_br_date(data[8]),
            'description': data[9],
            'status': data[10],
            'creation_date': _fmt_br_date(data[11]),
            'creation_time': _fmt_time(data[12]),
            'installment': data[15],
            'floating': data[16],
        })

    non_cash_assets = [a for a in assets_list if a['name'] != '#!@cash@!#']
    assets_quant = len(non_cash_assets)
    sum_non_cash_assets = sum(a['value'] for a in non_cash_assets)
    sum_asset_values = cash_now + sum_non_cash_assets

    current_assets = cash_now + sum(a['value'] for a in non_cash_assets if a.get('floating') is True)
    non_current_assets = sum(a['value'] for a in non_cash_assets if a.get('floating') is not True)

    # 2. Passivos
    liabilities_list = []
    for data in raw['liability_rows'] or []:
        liabilities_list.append({
            'liability_id': str(data[0]),
            'company_id': str(data[1]),
            'user_id': str(data[2]),
            'name': data[3],
            'event': data[4],
            'class': data[5],
            'value': round(_to_float(data[6]), 2),
            'emission_date': _fmt_br_date(data[7]),
            'expiration_date': _fmt_br_date(data[8]),
            'payment_method': data[9],
            'description': data[10],
            'status': data[11],
            'creation_date': _fmt_br_date(data[12]),
            'creation_time': _fmt_time(data[13]),
            'debit': _to_float(data[14]),
            'credit': _to_float(data[15]),
            'installment': data[16],
            'floating': data[17],
        })

    liabilities_quant = len(liabilities_list)
    equity_items = [l for l in liabilities_list if _is_equity(l)]
    obligation_items = [l for l in liabilities_list if not _is_equity(l)]

    sum_liabilities_values = sum(l['value'] for l in liabilities_list)
    sum_equity_values = sum(l['value'] for l in equity_items)
    sum_obligations = sum(l['value'] for l in obligation_items)
    obligations_quant = len(obligation_items)

    current_liabilities = sum(l['value'] for l in obligation_items if l.get('floating') is True)
    non_current_liabilities = sum(l['value'] for l in obligation_items if l.get('floating') is not True)
    patrimony = sum_asset_values - sum_obligations

    # 3. Histórico
    historic_list = []
    for data in raw['historic_rows'] or []:
        historic_list.append({
            'historic_id': str(data[0]),
            'company_id': str(data[1]),
            'user_id': str(data[2]),
            'patrimony_id': str(data[3]),
            'name': data[4],
            'event': data[5],
            'class': data[6],
            'value': round(_to_float(data[7]), 2),
            'date': _fmt_iso_date(data[8]),
            'creation_date': _fmt_iso_date(data[9]),
            'creation_time': _fmt_time(data[10]),
            'debit': round(_to_float(data[11]), 2),
            'credit': round(_to_float(data[12]), 2),
            'installment': data[13],
            'type': data[14],
            'floating': data[15],
            'ignore': data[16],
        })

    # 4. Fluxo de caixa, gráficos e classes (Visão Geral)
    count_entrys = 0
    values_entrys = 0.0
    count_exits = 0
    values_exits = 0.0
    daily_cash_delta = defaultdict(float)
    outflows_by_category = defaultdict(float)

    for item in historic_list:
        if item['name'] == '#!@cash@!#':
            continue
        val = item['value']
        deb = item['debit']
        item_type = item['type']
        event = item['event'] or 'Outros'
        dt = _parse_date(item['date']) or _parse_date(item['creation_date'])
        date_key = dt.strftime('%Y-%m-%d') if dt else 'Sem data'

        if item_type == 'asset' and event in INFLOW_ASSET_EVENTS:
            count_entrys += 1
            values_entrys += val
            daily_cash_delta[date_key] += val
        elif item_type == 'asset' and event in OUTFLOW_ASSET_EVENTS:
            count_exits += 1
            values_exits += val
            daily_cash_delta[date_key] -= val
            outflows_by_category[item['class'] or event] += val
        elif item_type == 'liability' and deb > 0:
            count_exits += 1
            values_exits += deb
            daily_cash_delta[date_key] -= deb
            outflows_by_category[event] += deb

    net_flow = values_entrys - values_exits
    running_balance = cash_now - net_flow
    cash_series_labels = []
    cash_series_values = []
    for date_key in sorted(daily_cash_delta.keys()):
        running_balance += daily_cash_delta[date_key]
        dt = _parse_date(date_key)
        cash_series_labels.append(dt.strftime('%d/%m/%Y') if dt else date_key)
        cash_series_values.append(round(running_balance, 2))

    assets_class_totals = defaultdict(float)
    if cash_now != 0:
        assets_class_totals['Caixa disponível'] += cash_now
    for a in non_cash_assets:
        cls_name = (a.get('class') or 'Outros').strip()
        assets_class_totals[cls_name] += a['value']

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

    monthly_assets = defaultdict(float)
    monthly_liabilities = defaultdict(float)
    month_keys = set()

    # 5. Balancete & Balanço Patrimonial & DRE em uma única passada
    tb_entries = []
    bs_assets = {'circulante': {}, 'nao_circulante': {}}
    bs_liabilities = {'circulante': {}, 'nao_circulante': {}}
    bs_patrimony = {'circulante': {'Capital Social': [], 'Lucros acumulados': []}}
    bs_dates = set()
    dre_assets = []
    dre_liabilities = []
    dre_years = set()

    for item in historic_list:
        if item['name'] == '#!@cash@!#':
            continue

        dt = _parse_date(item['date']) or _parse_date(item['creation_date'])
        if dt:
            dre_years.add(dt.year)

        if item.get('ignore') is True:
            continue

        iso_d = dt.strftime('%Y-%m-%d') if dt else None
        val = item['value']

        # Balancete
        if item['type'] == 'asset':
            tb_entries.append({'name': item['name'], 'date': iso_d, 'value': val, 'side': 'debit'})
            dre_assets.append(item)
        elif item['type'] == 'liability':
            tb_entries.append({'name': item['name'], 'date': iso_d, 'value': val, 'side': 'credit'})
            dre_liabilities.append(item)

        # Comparativo mensal + Balanço
        if dt:
            bs_dates.add(iso_d)
            cat = 'circulante' if item.get('floating') is True else 'nao_circulante'
            entry = {'date': iso_d, 'value': val}

            if item['type'] == 'asset':
                bs_assets[cat].setdefault(item['name'], []).append(entry)
                if not _is_equity(item):
                    mk = dt.strftime('%Y-%m')
                    month_keys.add(mk)
                    monthly_assets[mk] += val
            elif item['type'] == 'liability':
                if _is_equity(item):
                    k = item['name'] if item['name'] in ('Capital Social', 'Lucros acumulados') else 'Capital Social'
                    bs_patrimony['circulante'].setdefault(k, []).append(entry)
                else:
                    bs_liabilities[cat].setdefault(item['name'], []).append(entry)
                    mk = dt.strftime('%Y-%m')
                    month_keys.add(mk)
                    monthly_liabilities[mk] += val

    sorted_months = sorted(month_keys)
    comparison_labels = []
    comparison_assets = []
    comparison_liabilities = []
    for mk in sorted_months:
        y_s, m_s = mk.split('-')
        comparison_labels.append(f"{MONTH_NAMES_PT.get(int(m_s), m_s)}/{y_s[2:]}")
        comparison_assets.append(round(monthly_assets[mk], 2))
        comparison_liabilities.append(round(monthly_liabilities[mk], 2))

    # Últimos lançamentos vigentes
    valid_historic = [h for h in historic_list if h['name'] != '#!@cash@!#' and h.get('ignore') is not True]
    valid_historic.sort(
        key=lambda h: (h.get('date') or '', h.get('creation_date') or '', h.get('creation_time') or ''),
        reverse=True,
    )
    recent_entries = []
    for item in valid_historic[:6]:
        dt = _parse_date(item['date'])
        recent_entries.append({
            'name': item['name'] or '—',
            'event': item['event'] or '—',
            'class': item['class'] or '—',
            'date': dt.strftime('%d/%m/%Y') if dt else (item['date'] or '—'),
            'value': item['value'],
            'kind': 'equity' if _is_equity(item) else (item['type'] or 'asset'),
        })

    # Balanço: posição consolidada vigente
    current_position = {
        'cash_now': round(cash_now, 2),
        'assets_circulante': [],
        'assets_nao_circulante': [],
        'liabilities_circulante': [],
        'liabilities_nao_circulante': [],
        'equity': [],
    }
    if cash_now != 0:
        current_position['assets_circulante'].append({'name': 'Caixa e equivalentes', 'value': round(cash_now, 2)})

    a_groups = {'circulante': defaultdict(float), 'nao_circulante': defaultdict(float)}
    for a in non_cash_assets:
        cat = 'circulante' if a.get('floating') is True else 'nao_circulante'
        a_groups[cat][a['name']] += a['value']
    for name, val in sorted(a_groups['circulante'].items(), key=lambda x: x[1], reverse=True):
        current_position['assets_circulante'].append({'name': name, 'value': round(val, 2)})
    for name, val in sorted(a_groups['nao_circulante'].items(), key=lambda x: x[1], reverse=True):
        current_position['assets_nao_circulante'].append({'name': name, 'value': round(val, 2)})

    l_groups = {'circulante': defaultdict(float), 'nao_circulante': defaultdict(float)}
    eq_groups = defaultdict(float)
    for l in liabilities_list:
        if _is_equity(l):
            eq_groups[l['name'] or 'Capital Social'] += l['value']
        else:
            cat = 'circulante' if l.get('floating') is True else 'nao_circulante'
            l_groups[cat][l['name']] += l['value']
    for name, val in sorted(l_groups['circulante'].items(), key=lambda x: x[1], reverse=True):
        current_position['liabilities_circulante'].append({'name': name, 'value': round(val, 2)})
    for name, val in sorted(l_groups['nao_circulante'].items(), key=lambda x: x[1], reverse=True):
        current_position['liabilities_nao_circulante'].append({'name': name, 'value': round(val, 2)})
    for name, val in sorted(eq_groups.items(), key=lambda x: x[1], reverse=True):
        current_position['equity'].append({'name': name, 'value': round(val, 2)})

    tot_ca = sum(x['value'] for x in current_position['assets_circulante']) + sum(
        x['value'] for x in current_position['assets_nao_circulante']
    )
    tot_cl = sum(x['value'] for x in current_position['liabilities_circulante']) + sum(
        x['value'] for x in current_position['liabilities_nao_circulante']
    )
    tot_eq = sum(x['value'] for x in current_position['equity'])
    retained = round(tot_ca - tot_cl - tot_eq, 2)
    if abs(retained) >= 0.01:
        current_position['equity'].append({'name': 'Lucros / resultados acumulados', 'value': retained})

    # DRE
    brute_rev, brute_rev_f = _process_dre_items(
        dre_assets + dre_liabilities,
        {'Lucro', 'Venda', 'Serviço', 'Prestação de serviços'},
    )
    deduct_rev, deduct_rev_f = _process_dre_items(
        dre_liabilities,
        {'Imposto a pagar(Receita)', 'Imposto a pagar', 'Devolução', 'Desconto'},
    )
    res_rev = round(brute_rev_f - deduct_rev_f, 2)
    sell_costs, sell_costs_f = _process_dre_items(
        dre_assets + dre_liabilities,
        {'Fornecedor', 'Salário a pagar', 'Compra'},
    )
    res_op_costs = round(res_rev - sell_costs_f, 2)
    op_costs, op_costs_f = _process_dre_items(
        dre_liabilities,
        {'Conta a pagar', 'Empréstimo', 'Financiamento', 'Imposto a pagar(Operacional)', 'Multa', 'Juros'},
    )
    loss_profit = round(res_op_costs - op_costs_f, 2)

    # Indicadores de liquidez
    liq_current = round(current_assets / current_liabilities, 2) if current_liabilities > 0 else None
    liq_immediate = round(cash_now / current_liabilities, 2) if current_liabilities > 0 else None
    debt_ratio = round((sum_obligations / sum_asset_values) * 100, 2) if sum_asset_values > 0 else 0.0

    # Equipe (somente se creator)
    team_users = []
    if user_role == 'creator':
        for row in raw['team_rows'] or []:
            team_users.append({
                'id': row[0],
                'role': row[1],
                'fullname': row[2],
                'cpf': row[3],
                'is_self': (row[3] == getattr(current_user, 'cpf', None)),
            })

    return {
        'company': {
            'name': company_name,
            'email': company_email,
            'cnpj': company_cnpj,
        },
        'user': {
            'role': user_role,
            'cpf': getattr(current_user, 'cpf', ''),
            'fullname': getattr(current_user, 'fullname', ''),
        },
        'overview': {
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
            'liquidity_current': liq_current,
            'liquidity_immediate': liq_immediate,
            'debt_ratio': debt_ratio,
            'count_entrys': count_entrys,
            'count_exits': count_exits,
            'values_entrys': round(values_entrys, 2),
            'values_exits': round(values_exits, 2),
            'net_cash_flow': round(net_flow, 2),
            'cash_series': {'labels': cash_series_labels, 'values': cash_series_values},
            'comparison_series': {
                'labels': comparison_labels,
                'assets': comparison_assets,
                'liabilities': comparison_liabilities,
            },
            'assets_by_class': assets_by_class,
            'exits_by_class': exits_by_class,
            'recent_entries': recent_entries,
        },
        'assets': assets_list,
        'liabilities': liabilities_list,
        'historic': historic_list,
        'trial_balance': {'entries': tb_entries},
        'balance_sheet': {
            'dates': sorted(bs_dates),
            'assets': bs_assets,
            'liabilities': bs_liabilities,
            'patrimony': bs_patrimony,
            'current_position': current_position,
        },
        'income_statement': {
            'years': sorted(dre_years),
            'brute_revenue': brute_rev,
            'brute_revenue_float': brute_rev_f,
            'deductions_revenue': deduct_rev,
            'deductions_revenue_float': deduct_rev_f,
            'result_revenue': res_rev,
            'sell_costs': sell_costs,
            'sell_costs_float': sell_costs_f,
            'result_operational_costs': res_op_costs,
            'operational_costs': op_costs,
            'operational_costs_float': op_costs_f,
            'loss_profit': loss_profit,
        },
        'team_users': team_users,
    }
