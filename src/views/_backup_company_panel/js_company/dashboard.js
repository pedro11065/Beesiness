let balanceChart = null;
let comparisonChart = null;
let dashboardState = {
    cashSeries: { labels: [], values: [] },
    assetsByClass: [],
    exitsByClass: [],
    chartMode: "line",
    classMode: "assets"
};

const INFLOW_EVENTS = new Set([
    "Entrada de Caixa",
    "Entrada de caixa",
    "Venda",
    "Herança",
    "Serviço",
    "Capital Social"
]);
const OUTFLOW_ASSET_EVENTS = new Set(["Compra", "Transferência", "Investimento"]);
const EQUITY_KEYS = new Set(["Capital Social", "Lucro", "Lucros acumulados"]);
const MONTHS_PT = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function getCnpjFromUrl() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
}

function formatCNPJ(raw) {
    const digits = String(raw || "").replace(/\D/g, "");
    if (digits.length !== 14) return raw || "";
    return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

function formatMoney(val) {
    const num = Number(val) || 0;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatCompactBRL(val) {
    const num = Number(val) || 0;
    const abs = Math.abs(num);
    const sign = num < 0 ? "-" : "";
    if (abs >= 1_000_000) {
        return `${sign}R$ ${(abs / 1_000_000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mi`;
    }
    if (abs >= 1_000) {
        return `${sign}R$ ${(abs / 1_000).toLocaleString("pt-BR", { maximumFractionDigits: 0 })} mil`;
    }
    return formatMoney(num);
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

function parseAnyDate(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const [y, m, d] = s.slice(0, 10).split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [d, m, y] = s.split("/").map(Number);
        return new Date(y, m - 1, d);
    }
    const parsed = new Date(s);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function toBrDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}/${m}/${y}`;
}

function isEquity(item) {
    return EQUITY_KEYS.has(item.event) || EQUITY_KEYS.has(item.name);
}

// Fallback de cálculo completo no cliente caso o servidor Python esteja sem auto-reload (ex.: Docker)
async function buildFromJournalFallback(baseData, cnpj) {
    const res = await fetch(`/dashboard/journal/${cnpj}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) return baseData;
    const j = await res.json();

    const assetsList = Array.isArray(j.assets) ? j.assets : [];
    const liabilitiesList = Array.isArray(j.liabilities) ? j.liabilities : [];
    const historicList = Array.isArray(j.historic) ? j.historic : [];

    const cashAsset = assetsList.find((a) => a.name === "#!@cash@!#");
    const cashNow = cashAsset ? Number(cashAsset.value) || 0 : Number(baseData.cash_now) || 0;
    const nonCashAssets = assetsList.filter((a) => a.name !== "#!@cash@!#");

    const sumNonCashAssets = nonCashAssets.reduce((acc, a) => acc + (Number(a.value) || 0), 0);
    const sumAssetValues = cashNow + sumNonCashAssets;

    const currentAssets =
        cashNow +
        nonCashAssets.filter((a) => a.floating === true).reduce((acc, a) => acc + (Number(a.value) || 0), 0);
    const nonCurrentAssets = nonCashAssets
        .filter((a) => a.floating !== true)
        .reduce((acc, a) => acc + (Number(a.value) || 0), 0);

    const equityItems = liabilitiesList.filter(isEquity);
    const obligationItems = liabilitiesList.filter((l) => !isEquity(l));

    const sumEquityValues = equityItems.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const sumObligations = obligationItems.reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const currentLiabilities = obligationItems
        .filter((l) => l.floating === true)
        .reduce((acc, l) => acc + (Number(l.value) || 0), 0);
    const nonCurrentLiabilities = obligationItems
        .filter((l) => l.floating !== true)
        .reduce((acc, l) => acc + (Number(l.value) || 0), 0);

    let countEntrys = 0;
    let valuesEntrys = 0;
    let countExits = 0;
    let valuesExits = 0;
    const dailyDelta = {};
    const exitsMap = {};

    historicList.forEach((h) => {
        if (h.name === "#!@cash@!#") return;
        const val = Number(h.value) || 0;
        const deb = Number(h.debit) || 0;
        const dt = parseAnyDate(h.date) || parseAnyDate(h.creation_date);
        const key = dt ? toIsoDate(dt) : "Sem data";

        if (h.type === "asset" && INFLOW_EVENTS.has(h.event)) {
            countEntrys += 1;
            valuesEntrys += val;
            dailyDelta[key] = (dailyDelta[key] || 0) + val;
        } else if (h.type === "asset" && OUTFLOW_ASSET_EVENTS.has(h.event)) {
            countExits += 1;
            valuesExits += val;
            dailyDelta[key] = (dailyDelta[key] || 0) - val;
            const cat = h.class || h.event || "Outros";
            exitsMap[cat] = (exitsMap[cat] || 0) + val;
        } else if (h.type === "liability" && deb > 0) {
            countExits += 1;
            valuesExits += deb;
            dailyDelta[key] = (dailyDelta[key] || 0) - deb;
            const cat = h.event || "Outros";
            exitsMap[cat] = (exitsMap[cat] || 0) + deb;
        }
    });

    const netFlow = valuesEntrys - valuesExits;
    let running = cashNow - netFlow;
    const cashLabels = [];
    const cashValues = [];
    Object.keys(dailyDelta)
        .sort()
        .forEach((k) => {
            running += dailyDelta[k];
            const dt = parseAnyDate(k);
            cashLabels.push(dt ? toBrDate(dt) : k);
            cashValues.push(Math.round(running * 100) / 100);
        });

    const assetsMap = {};
    if (cashNow !== 0) assetsMap["Caixa disponível"] = cashNow;
    nonCashAssets.forEach((a) => {
        const k = (a.class || "Outros").trim();
        assetsMap[k] = (assetsMap[k] || 0) + (Number(a.value) || 0);
    });

    const assetsByClass = Object.entries(assetsMap)
        .filter(([, v]) => v !== 0)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({ label, value }));

    const exitsByClass = Object.entries(exitsMap)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([label, value]) => ({ label, value }));

    const mAssets = {};
    const mLiabs = {};
    const months = new Set();
    historicList.forEach((h) => {
        if (h.name === "#!@cash@!#" || h.ignore === true || isEquity(h)) return;
        const dt = parseAnyDate(h.date) || parseAnyDate(h.creation_date);
        if (!dt) return;
        const mk = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
        months.add(mk);
        const val = Number(h.value) || 0;
        if (h.type === "asset") mAssets[mk] = (mAssets[mk] || 0) + val;
        else if (h.type === "liability") mLiabs[mk] = (mLiabs[mk] || 0) + val;
    });

    const sortedMonths = Array.from(months).sort();
    const compLabels = sortedMonths.map((mk) => {
        const [y, m] = mk.split("-");
        return `${MONTHS_PT[Number(m) - 1]}/${y.slice(2)}`;
    });

    const validRecent = historicList
        .filter((h) => h.name !== "#!@cash@!#" && h.ignore !== true)
        .sort((a, b) => {
            const da = parseAnyDate(a.date);
            const db = parseAnyDate(b.date);
            return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
        })
        .slice(0, 6)
        .map((h) => {
            const dt = parseAnyDate(h.date);
            return {
                name: h.name || "—",
                event: h.event || "—",
                class: h.class || "—",
                date: dt ? toBrDate(dt) : h.date || "—",
                value: Number(h.value) || 0,
                kind: isEquity(h) ? "equity" : h.type || "asset"
            };
        });

    return {
        version: 2,
        company_name: baseData.company_name || "Painel da empresa",
        company_cnpj: cnpj,
        cash_now: cashNow,
        patrimony: sumAssetValues - sumObligations,
        assets_quant: nonCashAssets.length,
        liabilities_quant: liabilitiesList.length,
        obligations_quant: obligationItems.length,
        sum_asset_values: sumAssetValues,
        sum_non_cash_assets: sumNonCashAssets,
        sum_obligations: sumObligations,
        sum_equity_values: sumEquityValues,
        current_assets: currentAssets,
        non_current_assets: nonCurrentAssets,
        current_liabilities: currentLiabilities,
        non_current_liabilities: nonCurrentLiabilities,
        liquidity_current: currentLiabilities > 0 ? Math.round((currentAssets / currentLiabilities) * 100) / 100 : null,
        liquidity_immediate: currentLiabilities > 0 ? Math.round((cashNow / currentLiabilities) * 100) / 100 : null,
        debt_ratio: sumAssetValues > 0 ? Math.round((sumObligations / sumAssetValues) * 10000) / 100 : 0,
        count_entrys: countEntrys,
        count_exits: countExits,
        values_entrys: valuesEntrys,
        values_exits: valuesExits,
        net_cash_flow: netFlow,
        cash_series: { labels: cashLabels, values: cashValues },
        comparison_series: {
            labels: compLabels,
            assets: sortedMonths.map((mk) => mAssets[mk] || 0),
            liabilities: sortedMonths.map((mk) => mLiabs[mk] || 0)
        },
        assets_by_class: assetsByClass,
        exits_by_class: exitsByClass,
        recent_entries: validRecent
    };
}

function renderBalanceChart() {
    const stage = document.getElementById("balanceChartStage");
    const empty = document.getElementById("balanceEmpty");
    const canvas = document.getElementById("balanceChartCanvas");
    const { labels, values } = dashboardState.cashSeries;

    if (!labels || labels.length === 0) {
        stage.hidden = true;
        empty.hidden = false;
        return;
    }

    stage.hidden = false;
    empty.hidden = true;

    if (balanceChart) balanceChart.destroy();

    const ctx = canvas.getContext("2d");
    const isLine = dashboardState.chartMode === "line";
    const gradient = ctx.createLinearGradient(0, 0, 0, 280);
    gradient.addColorStop(0, "rgba(237, 200, 5, 0.32)");
    gradient.addColorStop(1, "rgba(237, 200, 5, 0.02)");

    balanceChart = new Chart(ctx, {
        type: isLine ? "line" : "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Saldo em caixa",
                    data: values,
                    fill: isLine,
                    tension: 0.32,
                    backgroundColor: isLine ? gradient : "#EDC805",
                    borderColor: isLine ? "#0F0F0F" : "#0F0F0F",
                    borderWidth: isLine ? 2.2 : 0,
                    borderRadius: isLine ? 0 : 6,
                    pointRadius: isLine ? 3.5 : 0,
                    pointHoverRadius: 5.5,
                    pointBackgroundColor: "#EDC805",
                    pointBorderColor: "#0F0F0F",
                    pointBorderWidth: 1.8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: "#141414",
                    titleFont: { family: "Inter", size: 12, weight: "600" },
                    bodyFont: { family: "Inter", size: 13 },
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: (ctxItem) => ` Saldo: ${formatMoney(ctxItem.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: "Inter", size: 11 },
                        color: "#6B6B6B",
                        maxRotation: 0,
                        autoSkipPadding: 14
                    }
                },
                y: {
                    grid: { color: "rgba(0, 0, 0, 0.06)" },
                    border: { display: false },
                    ticks: {
                        font: { family: "Inter", size: 11 },
                        color: "#6B6B6B",
                        callback: (v) => formatCompactBRL(v)
                    }
                }
            }
        }
    });
}

function renderComparisonChart(series) {
    const stage = document.getElementById("comparisonChartStage");
    const empty = document.getElementById("comparisonEmpty");
    const canvas = document.getElementById("assetsLiabilitiesChartCanvas");

    if (!series || !series.labels || series.labels.length === 0) {
        stage.hidden = true;
        empty.hidden = false;
        return;
    }

    stage.hidden = false;
    empty.hidden = true;

    if (comparisonChart) comparisonChart.destroy();

    const ctx = canvas.getContext("2d");
    comparisonChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: series.labels,
            datasets: [
                {
                    label: "Ativos registrados",
                    data: series.assets,
                    backgroundColor: "#EDC805",
                    borderRadius: 6,
                    maxBarThickness: 34
                },
                {
                    label: "Passivos exigíveis",
                    data: series.liabilities,
                    backgroundColor: "#1A1A1A",
                    borderRadius: 6,
                    maxBarThickness: 34
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            plugins: {
                legend: {
                    position: "top",
                    align: "end",
                    labels: {
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                        pointStyle: "circle",
                        font: { family: "Inter", size: 12, weight: "500" },
                        color: "#3A3A3A"
                    }
                },
                tooltip: {
                    backgroundColor: "#141414",
                    titleFont: { family: "Inter", size: 12, weight: "600" },
                    bodyFont: { family: "Inter", size: 12 },
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: (item) => ` ${item.dataset.label}: ${formatMoney(item.parsed.y)}`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: "Inter", size: 11, weight: "500" }, color: "#5F5F5F" }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: "rgba(0, 0, 0, 0.06)" },
                    border: { display: false },
                    ticks: {
                        font: { family: "Inter", size: 11 },
                        color: "#6B6B6B",
                        callback: (v) => formatCompactBRL(v)
                    }
                }
            }
        }
    });
}

function renderClassBreakdown() {
    const listEl = document.getElementById("classBreakdownList");
    const emptyEl = document.getElementById("classEmpty");
    const titleEl = document.getElementById("classPanelTitle");
    const subEl = document.getElementById("classPanelSub");

    const isAssets = dashboardState.classMode === "assets";
    const items = isAssets ? dashboardState.assetsByClass : dashboardState.exitsByClass;

    titleEl.textContent = isAssets ? "Ativos por classe" : "Saídas por categoria";
    subEl.textContent = isAssets
        ? "Participação de cada classe sobre o ativo total."
        : "Distribuição dos pagamentos, quitações e aquisições à vista.";

    listEl.innerHTML = "";

    if (!items || items.length === 0) {
        listEl.hidden = true;
        emptyEl.hidden = false;
        return;
    }

    listEl.hidden = false;
    emptyEl.hidden = true;

    const total = items.reduce((acc, it) => acc + Math.max(0, Number(it.value) || 0), 0) || 1;

    items.forEach((it) => {
        const val = Number(it.value) || 0;
        const pct = Math.max(0, (val / total) * 100);
        const li = document.createElement("li");
        li.className = "class-item";
        li.innerHTML = `
            <div class="class-row">
                <span class="class-name">${escapeHTML(it.label)}</span>
                <span class="class-meta">
                    <span class="class-val">${formatMoney(val)}</span>
                    <span class="class-pct">${pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</span>
                </span>
            </div>
            <div class="class-bar">
                <div class="class-bar-fill" style="width: ${Math.max(pct, 2)}%"></div>
            </div>
        `;
        listEl.appendChild(li);
    });
}

function renderRecentEntries(entries) {
    const wrap = document.getElementById("recentTableWrap");
    const tbody = document.getElementById("recentEntriesBody");
    const empty = document.getElementById("recentEmpty");

    tbody.innerHTML = "";

    if (!entries || entries.length === 0) {
        wrap.hidden = true;
        empty.hidden = false;
        return;
    }

    wrap.hidden = false;
    empty.hidden = true;

    const kindMeta = {
        asset: { label: "Ativo", cls: "kind-asset" },
        liability: { label: "Passivo", cls: "kind-liability" },
        equity: { label: "Capital / PL", cls: "kind-equity" }
    };

    entries.forEach((item) => {
        const meta = kindMeta[item.kind] || kindMeta.asset;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td class="td-date">${escapeHTML(item.date)}</td>
            <td class="td-name">${escapeHTML(item.name)}</td>
            <td class="td-sub">${escapeHTML(item.event)} · ${escapeHTML(item.class)}</td>
            <td><span class="kind-pill ${meta.cls}">${meta.label}</span></td>
            <td class="num-col">${formatMoney(item.value)}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const main = document.getElementById("main");
    const loading = document.getElementById("loading");
    const cnpj = getCnpjFromUrl();

    const cnpjPill = document.getElementById("companyCnpjPill");
    if (cnpjPill && cnpj) {
        cnpjPill.textContent = `CNPJ ${formatCNPJ(cnpj)}`;
    }

    // Alternadores de modo dos gráficos e classes
    document.querySelectorAll("[data-chart-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
            dashboardState.chartMode = btn.dataset.chartMode;
            document.querySelectorAll("[data-chart-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderBalanceChart();
        });
    });

    document.querySelectorAll("[data-class-mode]").forEach((btn) => {
        btn.addEventListener("click", () => {
            dashboardState.classMode = btn.dataset.classMode;
            document.querySelectorAll("[data-class-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderClassBreakdown();
        });
    });

    try {
        const response = await fetch(`/dashboard/company/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Erro na resposta da API: " + response.statusText);
        }

        let data = await response.json();
        if (data.version !== 2) {
            data = await buildFromJournalFallback(data, cnpj);
        }

        loading.hidden = true;
        main.hidden = false;

        // Cabeçalho da empresa
        const titleEl = document.getElementById("companyTitle");
        if (titleEl) {
            titleEl.textContent = data.company_name || "Painel da empresa";
            if (data.company_name) document.title = `${data.company_name} | Beesiness`;
        }

        // KPI 01: Saldo em caixa
        document.getElementById("cash_now").textContent = formatMoney(data.cash_now);
        document.getElementById("cash_sub").textContent =
            `${data.count_entrys} entradas e ${data.count_exits} saídas reconciliadas`;

        // KPI 02: Patrimônio líquido
        document.getElementById("patrimony").textContent = formatMoney(data.patrimony);
        document.getElementById("patrimony_sub").textContent =
            `Ativo total ${formatCompactBRL(data.sum_asset_values)} − Exigível ${formatCompactBRL(data.sum_obligations)}`;

        // KPI 03: Ativos registrados
        document.getElementById("assets_quant").textContent = String(data.assets_quant ?? 0);
        document.getElementById("assets_total").textContent = formatMoney(data.sum_non_cash_assets);
        document.getElementById("assets_sub").textContent =
            `Total c/ caixa: ${formatCompactBRL(data.sum_asset_values)}`;

        // KPI 04: Passivos / Obrigações
        document.getElementById("liabilities_quant").textContent = String(data.liabilities_quant ?? 0);
        document.getElementById("obligations_total").textContent = formatMoney(data.sum_obligations);
        document.getElementById("liabilities_sub").textContent =
            data.sum_equity_values > 0
                ? `${data.obligations_quant} dívidas · Capital ${formatCompactBRL(data.sum_equity_values)}`
                : "Gerenciar passivos e obrigações";

        // Faixa estrutural
        document.getElementById("current_assets_val").textContent = formatMoney(data.current_assets);
        document.getElementById("non_current_assets_val").textContent = formatMoney(data.non_current_assets);
        document.getElementById("current_liabilities_val").textContent = formatMoney(data.current_liabilities);
        document.getElementById("non_current_liabilities_val").textContent = formatMoney(data.non_current_liabilities);

        // 6 Indicadores contábeis
        document.getElementById("count_entrys").textContent = String(data.count_entrys ?? 0);
        document.getElementById("values_entrys").textContent = formatMoney(data.values_entrys);
        document.getElementById("count_exits").textContent = String(data.count_exits ?? 0);
        document.getElementById("values_exits").textContent = formatMoney(data.values_exits);
        document.getElementById("equity_total").textContent = formatMoney(data.sum_equity_values);

        const liqCurrentEl = document.getElementById("liquidity_current");
        const liqBadgeEl = document.getElementById("liquidity_badge");
        if (data.liquidity_current == null) {
            liqCurrentEl.textContent = "Sem dívida CP";
            liqBadgeEl.textContent = "Confortável";
            liqBadgeEl.className = "metric-badge badge-pos";
        } else {
            liqCurrentEl.textContent = `${data.liquidity_current.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
            if (data.liquidity_current >= 1.5) {
                liqBadgeEl.textContent = "Saudável";
                liqBadgeEl.className = "metric-badge badge-pos";
            } else if (data.liquidity_current >= 1.0) {
                liqBadgeEl.textContent = "Equilibrada";
                liqBadgeEl.className = "metric-badge badge-gold";
            } else {
                liqBadgeEl.textContent = "Atenção";
                liqBadgeEl.className = "metric-badge badge-warn";
            }
        }

        const liqImmEl = document.getElementById("liquidity_immediate");
        if (data.liquidity_immediate == null) {
            liqImmEl.textContent = "Sem dívida CP";
        } else {
            liqImmEl.textContent = `${data.liquidity_immediate.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;
        }

        const debtRatio = Number(data.debt_ratio) || 0;
        document.getElementById("debt_ratio").textContent =
            `${debtRatio.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
        const debtBadgeEl = document.getElementById("debt_badge");
        if (debtRatio <= 35) {
            debtBadgeEl.textContent = "Baixo";
            debtBadgeEl.className = "metric-badge badge-pos";
        } else if (debtRatio <= 65) {
            debtBadgeEl.textContent = "Moderado";
            debtBadgeEl.className = "metric-badge badge-gold";
        } else {
            debtBadgeEl.textContent = "Elevado";
            debtBadgeEl.className = "metric-badge badge-warn";
        }

        // Gráficos, classes e tabela recente
        dashboardState.cashSeries = data.cash_series || { labels: [], values: [] };
        dashboardState.assetsByClass = data.assets_by_class || [];
        dashboardState.exitsByClass = data.exits_by_class || [];

        renderBalanceChart();
        renderClassBreakdown();
        renderComparisonChart(data.comparison_series);
        renderRecentEntries(data.recent_entries);
    } catch (error) {
        console.error("Erro ao carregar indicadores da empresa:", error);
        loading.hidden = true;
        main.hidden = false;
        document.getElementById("companyTitle").textContent = "Erro ao carregar painel";
    }
});
