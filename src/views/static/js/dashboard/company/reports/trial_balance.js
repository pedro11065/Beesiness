let rawEntries = [];
let currentView = "year";

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

function normalizeEntriesFromLegacy(data) {
    if (Array.isArray(data.entries)) return data.entries;
    const list = [];
    const pushSide = (dict, side) => {
        Object.entries(dict || {}).forEach(([name, items]) => {
            (items || []).forEach((it) => {
                list.push({
                    name,
                    date: it.date,
                    value: Number(it.value) || 0,
                    side
                });
            });
        });
    };
    pushSide(data.assets, "debit");
    pushSide(data.liabilities, "credit");
    return list;
}

function renderTrialBalance() {
    const container = document.getElementById("tbContent");
    const emptyEl = document.getElementById("tbEmpty");
    const q = (document.getElementById("tbSearch").value || "").trim().toLowerCase();

    const filtered = rawEntries.filter((e) => !q || String(e.name || "").toLowerCase().includes(q));
    container.innerHTML = "";

    if (filtered.length === 0) {
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    const periods = new Map();
    filtered.forEach((item) => {
        const dStr = String(item.date || "");
        let key = "Consolidado";
        let title = "Consolidado geral";
        if (/^\d{4}-\d{2}-\d{2}/.test(dStr)) {
            const [y, m, d] = dStr.slice(0, 10).split("-").map(Number);
            if (currentView === "year") {
                key = `${y}`;
                title = `Exercício ${y}`;
            } else if (currentView === "month") {
                key = `${y}-${String(m).padStart(2, "0")}`;
                title = `${MONTHS_FULL[m - 1]} de ${y}`;
            } else {
                key = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                title = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
            }
        }
        if (!periods.has(key)) periods.set(key, { title, accounts: new Map() });
        const accMap = periods.get(key).accounts;
        if (!accMap.has(item.name)) accMap.set(item.name, { debit: 0, credit: 0 });
        const acc = accMap.get(item.name);
        if (item.side === "debit") acc.debit += Number(item.value) || 0;
        else acc.credit += Number(item.value) || 0;
    });

    const sortedKeys = Array.from(periods.keys()).sort().reverse();
    sortedKeys.forEach((k) => {
        const period = periods.get(k);
        let totDebit = 0;
        let totCredit = 0;
        const rows = Array.from(period.accounts.entries()).sort((a, b) => (b[1].debit + b[1].credit) - (a[1].debit + a[1].credit));

        rows.forEach(([, v]) => {
            totDebit += v.debit;
            totCredit += v.credit;
        });

        const section = document.createElement("section");
        section.className = "tb-period-card";
        section.innerHTML = `
            <header class="tb-period-head">
                <h2>${escapeHTML(period.title)}</h2>
                <span>${rows.length} ${rows.length === 1 ? "conta" : "contas"}</span>
            </header>
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Conta contábil</th>
                            <th>Natureza do saldo</th>
                            <th class="num-col">Movimento Débito</th>
                            <th class="num-col">Movimento Crédito</th>
                            <th class="num-col">Saldo apurado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows
                            .map(([name, v]) => {
                                const net = v.debit - v.credit;
                                const natBadge =
                                    net > 0
                                        ? `<span class="badge badge-pos">Devedor</span>`
                                        : net < 0
                                            ? `<span class="badge badge-gold">Credor</span>`
                                            : `<span class="badge">Zerado</span>`;
                                return `
                                    <tr>
                                        <td class="td-strong">${escapeHTML(name)}</td>
                                        <td>${natBadge}</td>
                                        <td class="num-col">${v.debit > 0 ? formatMoney(v.debit) : "—"}</td>
                                        <td class="num-col">${v.credit > 0 ? formatMoney(v.credit) : "—"}</td>
                                        <td class="num-col">${formatMoney(Math.abs(net))}</td>
                                    </tr>
                                `;
                            })
                            .join("")}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="2">Totais do período</td>
                            <td class="num-col">${formatMoney(totDebit)}</td>
                            <td class="num-col">${formatMoney(totCredit)}</td>
                            <td class="num-col">${formatMoney(totDebit - totCredit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        container.appendChild(section);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const loading = document.getElementById("loading");
    const main = document.getElementById("main");
    const cnpj = getCnpjFromUrl();

    document.getElementById("tbSearch").addEventListener("input", renderTrialBalance);
    document.querySelectorAll("[data-view]").forEach((btn) => {
        btn.addEventListener("click", () => {
            currentView = btn.dataset.view;
            document.querySelectorAll("[data-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderTrialBalance();
        });
    });

    try {
        const response = await fetch(`/dashboard/trial-balance/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok && response.status !== 404) throw new Error("Falha ao buscar balancete");

        const data = response.status === 404 ? { assets: {}, liabilities: {} } : await response.json();
        rawEntries = normalizeEntriesFromLegacy(data);

        const totD = rawEntries.filter((e) => e.side === "debit").reduce((s, e) => s + e.value, 0);
        const totC = rawEntries.filter((e) => e.side === "credit").reduce((s, e) => s + e.value, 0);
        const uniqueAccs = new Set(rawEntries.map((e) => e.name)).size;

        document.getElementById("tbSumDebit").textContent = formatMoney(totD);
        document.getElementById("tbSumCredit").textContent = formatMoney(totC);
        document.getElementById("tbSumNet").textContent = formatMoney(totD - totC);
        document.getElementById("tbAccountCount").textContent = String(uniqueAccs);

        loading.hidden = true;
        main.hidden = false;
        renderTrialBalance();
    } catch (error) {
        console.error("Erro ao carregar balancete:", error);
        loading.hidden = true;
        main.hidden = false;
        document.getElementById("tbEmpty").hidden = false;
    }
});
