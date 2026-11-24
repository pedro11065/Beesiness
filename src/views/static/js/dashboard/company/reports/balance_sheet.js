let bsPayload = null;

const MONTHS_FULL = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function getCnpjFromUrl() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "";
}

function formatMoney(val) {
    const num = Number(val) || 0;
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
}

function renderList(ulId, subId, items) {
    const ul = document.getElementById(ulId);
    const subEl = document.getElementById(subId);
    ul.innerHTML = "";

    const total = (items || []).reduce((s, it) => s + (Number(it.value) || 0), 0);
    subEl.textContent = formatMoney(total);

    if (!items || items.length === 0) {
        ul.innerHTML = `<li class="bs-empty">Sem lançamentos nesta rubrica</li>`;
        return total;
    }

    items.forEach((it) => {
        const li = document.createElement("li");
        li.className = "bs-item";
        li.innerHTML = `
            <span>${escapeHTML(it.name)}</span>
            <strong>${formatMoney(it.value)}</strong>
        `;
        ul.appendChild(li);
    });
    return total;
}

function extractMonthItems(categoryDict, year, month) {
    const out = [];
    Object.entries(categoryDict || {}).forEach(([name, txList]) => {
        if (!Array.isArray(txList)) return;
        const sum = txList
            .filter((t) => {
                const [y, m] = String(t.date || "").split("-").map(Number);
                return y === year && m === month;
            })
            .reduce((s, t) => s + (Number(t.value) || 0), 0);
        if (sum !== 0) out.push({ name, value: sum });
    });
    return out.sort((a, b) => b.value - a.value);
}

function renderBalanceSheet(mode) {
    if (!bsPayload) return;
    const titleEl = document.getElementById("bsPeriodTitle");

    if (mode === "consolidated" && bsPayload.current_position) {
        titleEl.textContent = "Posição patrimonial consolidada (vigente)";
        const cp = bsPayload.current_position;
        const aC = renderList("list-ativo-circ", "sub-ativo-circ", cp.assets_circulante);
        const aNC = renderList("list-ativo-ncirc", "sub-ativo-ncirc", cp.assets_nao_circulante);
        const pC = renderList("list-passivo-circ", "sub-passivo-circ", cp.liabilities_circulante);
        const pNC = renderList("list-passivo-ncirc", "sub-passivo-ncirc", cp.liabilities_nao_circulante);
        const eq = renderList("list-patrimonio", "sub-patrimonio", cp.equity);

        document.getElementById("total-ativo").textContent = formatMoney(aC + aNC);
        document.getElementById("total-passivo-patrimonio").textContent = formatMoney(pC + pNC + eq);
        return;
    }

    // Competência mensal MM/YYYY
    const [mStr, yStr] = String(mode).split("/");
    const month = Number(mStr);
    const year = Number(yStr);
    titleEl.textContent = `Movimentação patrimonial · ${MONTHS_FULL[month - 1] || mStr} de ${year}`;

    const aC = renderList(
        "list-ativo-circ",
        "sub-ativo-circ",
        extractMonthItems((bsPayload.assets || {}).circulante, year, month)
    );
    const aNC = renderList(
        "list-ativo-ncirc",
        "sub-ativo-ncirc",
        extractMonthItems((bsPayload.assets || {}).nao_circulante, year, month)
    );
    const pC = renderList(
        "list-passivo-circ",
        "sub-passivo-circ",
        extractMonthItems((bsPayload.liabilities || {}).circulante, year, month)
    );
    const pNC = renderList(
        "list-passivo-ncirc",
        "sub-passivo-ncirc",
        extractMonthItems((bsPayload.liabilities || {}).nao_circulante, year, month)
    );

    const patDict = ((bsPayload.patrimony || {}).circulante) || {};
    const eqItems = extractMonthItems(patDict, year, month);
    const monthDiff = Math.round((aC + aNC - (pC + pNC) - eqItems.reduce((s, x) => s + x.value, 0)) * 100) / 100;
    if (Math.abs(monthDiff) >= 0.01) {
        eqItems.push({ name: "Resultado líquido do período", value: monthDiff });
    }
    const eq = renderList("list-patrimonio", "sub-patrimonio", eqItems);

    document.getElementById("total-ativo").textContent = formatMoney(aC + aNC);
    document.getElementById("total-passivo-patrimonio").textContent = formatMoney(pC + pNC + eq);
}

document.addEventListener("DOMContentLoaded", async function () {
    const loading = document.getElementById("loading");
    const main = document.getElementById("main");
    const select = document.getElementById("month-year-select");
    const cnpj = getCnpjFromUrl();

    select.addEventListener("change", () => renderBalanceSheet(select.value));

    try {
        const response = await fetch(`/dashboard/balance-sheet/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok && response.status !== 404) throw new Error("Erro ao consultar balanço");

        bsPayload =
            response.status === 404
                ? {
                      dates: [],
                      assets: { circulante: {}, nao_circulante: {} },
                      liabilities: { circulante: {}, nao_circulante: {} },
                      patrimony: { circulante: {} },
                      current_position: {
                          assets_circulante: [],
                          assets_nao_circulante: [],
                          liabilities_circulante: [],
                          liabilities_nao_circulante: [],
                          equity: []
                      }
                  }
                : await response.json();

        const uniqueMonths = Array.from(
            new Set(
                (bsPayload.dates || []).map((d) => {
                    const [y, m] = d.split("-");
                    return `${m}/${y}`;
                })
            )
        ).sort((a, b) => {
            const [mA, yA] = a.split("/").map(Number);
            const [mB, yB] = b.split("/").map(Number);
            return yA === yB ? mA - mB : yA - yB;
        });

        uniqueMonths.forEach((my) => {
            const [m, y] = my.split("/");
            const opt = document.createElement("option");
            opt.value = my;
            opt.textContent = `${MONTHS_FULL[Number(m) - 1]} / ${y}`;
            select.appendChild(opt);
        });

        loading.hidden = true;
        main.hidden = false;
        renderBalanceSheet("consolidated");
    } catch (error) {
        console.error("Erro ao carregar Balanço Patrimonial:", error);
        loading.hidden = true;
        main.hidden = false;
    }
});
