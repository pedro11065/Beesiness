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

function fillSublist(ulId, items) {
    const ul = document.getElementById(ulId);
    ul.innerHTML = "";
    if (!Array.isArray(items) || items.length === 0) {
        ul.innerHTML = `<li class="dre-subempty">Nenhuma conta movimentada neste grupo</li>`;
        return;
    }
    items.forEach((it) => {
        const li = document.createElement("li");
        li.className = "dre-subitem";
        li.innerHTML = `
            <span>${escapeHTML(it.name)}</span>
            <strong>${formatMoney(it.value)}</strong>
        `;
        ul.appendChild(li);
    });
}

function applySignedClass(el, value, keepYellowOnFinal = false) {
    const num = Number(value) || 0;
    el.classList.remove("val-positive", "val-negative");
    if (num < 0) el.classList.add("val-negative");
    else if (num > 0 && !keepYellowOnFinal) el.classList.add("val-positive");
}

document.addEventListener("DOMContentLoaded", async function () {
    const loading = document.getElementById("loading");
    const main = document.getElementById("main");
    const cnpj = getCnpjFromUrl();

    document.querySelectorAll(".dre-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
            const list = btn.nextElementSibling;
            if (!list) return;
            const collapsed = list.classList.toggle("is-collapsed");
            btn.setAttribute("aria-expanded", String(!collapsed));
        });
    });

    try {
        const response = await fetch(`/dashboard/income-statement/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok && response.status !== 404) throw new Error("Falha ao carregar DRE");

        const data =
            response.status === 404
                ? {
                      years: [],
                      brute_revenue: [],
                      brute_revenue_float: 0,
                      deductions_revenue: [],
                      deductions_revenue_float: 0,
                      result_revenue: 0,
                      sell_costs: [],
                      sell_costs_float: 0,
                      result_operational_costs: 0,
                      operational_costs: [],
                      operational_costs_float: 0,
                      loss_profit: 0
                  }
                : await response.json();

        const gross = Number(data.brute_revenue_float) || 0;
        const deduct = Number(data.deductions_revenue_float) || 0;
        const netRev = Number(data.result_revenue) || 0;
        const sellCosts = Number(data.sell_costs_float) || 0;
        const grossProfit = Number(data.result_operational_costs) || 0;
        const opCosts = Number(data.operational_costs_float) || 0;
        const finalRes = Number(data.loss_profit) || 0;

        const totalCostsAll = deduct + sellCosts + opCosts;
        const margin = gross > 0 ? (finalRes / gross) * 100 : 0;

        // KPIs superiores
        document.getElementById("kpiLossProfit").textContent = formatMoney(finalRes);
        document.getElementById("kpiGrossRev").textContent = formatMoney(gross);
        document.getElementById("kpiTotalCosts").textContent = formatMoney(totalCostsAll);
        document.getElementById("kpiMargin").textContent =
            `${margin.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

        const years = Array.isArray(data.years) && data.years.length > 0
            ? data.years.length === 1
                ? `Exercício ${data.years[0]}`
                : `${data.years[0]} – ${data.years[data.years.length - 1]}`
            : "Sem movimentação";
        document.getElementById("dreYearsBadge").textContent = years;
        document.getElementById("kpiPeriodNote").textContent = years;

        // Linhas da DRE
        document.getElementById("brute_revenue_total").textContent = formatMoney(gross);
        document.getElementById("deductions_revenue_total").textContent =
            deduct > 0 ? `- ${formatMoney(deduct)}` : formatMoney(0);

        const netRevEl = document.getElementById("result_revenue_total");
        netRevEl.textContent = formatMoney(netRev);
        applySignedClass(netRevEl, netRev);

        document.getElementById("sell_costs_total").textContent =
            sellCosts > 0 ? `- ${formatMoney(sellCosts)}` : formatMoney(0);

        const gpEl = document.getElementById("result_operational_costs_total");
        gpEl.textContent = formatMoney(grossProfit);
        applySignedClass(gpEl, grossProfit);

        document.getElementById("operational_costs_total").textContent =
            opCosts > 0 ? `- ${formatMoney(opCosts)}` : formatMoney(0);

        const finalEl = document.getElementById("loss_profit_total");
        finalEl.textContent = formatMoney(finalRes);
        applySignedClass(finalEl, finalRes, true);

        fillSublist("brute_revenue", data.brute_revenue);
        fillSublist("deductions_revenue", data.deductions_revenue);
        fillSublist("sell_costs", data.sell_costs);
        fillSublist("operational_costs", data.operational_costs);

        loading.hidden = true;
        main.hidden = false;
    } catch (error) {
        console.error("Erro ao carregar DRE:", error);
        loading.hidden = true;
        main.hidden = false;
    }
});
