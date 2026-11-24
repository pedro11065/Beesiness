let historicRows = [];
let activeView = "all";

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

function cleanAccountName(name) {
    return name === "#!@cash@!#" ? "Caixa" : name || "Conta";
}

function parseIsoDate(raw) {
    if (!raw) return null;
    const s = String(raw).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
        const [y, m, d] = s.slice(0, 10).split("-").map(Number);
        return new Date(y, m - 1, d);
    }
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? null : d;
}

function renderRazonetes() {
    const container = document.getElementById("razContent");
    const emptyEl = document.getElementById("razEmpty");
    const q = (document.getElementById("razSearch").value || "").trim().toLowerCase();

    container.innerHTML = "";

    // Mantém apenas lançamentos que possuem débito ou crédito efetivo > 0
    const effective = historicRows.filter((item) => {
        const d = Number(item.debit) || 0;
        const c = Number(item.credit) || 0;
        if (d <= 0 && c <= 0) return false;
        const accName = cleanAccountName(item.name);
        if (q && !accName.toLowerCase().includes(q)) return false;
        return true;
    });

    if (effective.length === 0) {
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    const periods = new Map();
    effective.forEach((item) => {
        const dt = parseIsoDate(item.date);
        let key = "all";
        let title = "Posição consolidada das contas";
        if (dt && activeView === "month") {
            key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
            title = `${MONTHS_FULL[dt.getMonth()]} de ${dt.getFullYear()}`;
        } else if (dt && activeView === "day") {
            const dStr = String(dt.getDate()).padStart(2, "0");
            const mStr = String(dt.getMonth() + 1).padStart(2, "0");
            key = `${dt.getFullYear()}-${mStr}-${dStr}`;
            title = `${dStr}/${mStr}/${dt.getFullYear()}`;
        }

        if (!periods.has(key)) periods.set(key, { title, accounts: new Map() });
        const accName = cleanAccountName(item.name);
        const accMap = periods.get(key).accounts;
        if (!accMap.has(accName)) accMap.set(accName, { debits: [], credits: [] });

        const acc = accMap.get(accName);
        const deb = Number(item.debit) || 0;
        const cred = Number(item.credit) || 0;
        if (deb > 0) acc.debits.push(deb);
        if (cred > 0) acc.credits.push(cred);
    });

    const sortedKeys = Array.from(periods.keys()).sort().reverse();
    sortedKeys.forEach((key) => {
        const period = periods.get(key);
        const accEntries = Array.from(period.accounts.entries()).sort((a, b) => {
            if (a[0] === "Caixa") return -1;
            if (b[0] === "Caixa") return 1;
            return a[0].localeCompare(b[0], "pt-BR");
        });

        const section = document.createElement("section");
        section.className = "raz-period";
        section.innerHTML = `
            <header class="raz-period-title">
                <h2>${escapeHTML(period.title)}</h2>
                <span>${accEntries.length} ${accEntries.length === 1 ? "razonete" : "razonetes"}</span>
            </header>
            <div class="t-grid"></div>
        `;

        const grid = section.querySelector(".t-grid");
        accEntries.forEach(([accName, { debits, credits }]) => {
            const totD = debits.reduce((s, v) => s + v, 0);
            const totC = credits.reduce((s, v) => s + v, 0);
            const diff = totD - totC;
            const balLabel = diff > 0 ? "Saldo devedor" : diff < 0 ? "Saldo credor" : "Conta saldada";

            const card = document.createElement("article");
            card.className = "t-card";
            card.innerHTML = `
                <div class="t-head">
                    <h3>${escapeHTML(accName)}</h3>
                </div>
                <div class="t-cols-head">
                    <span>Débito (D)</span>
                    <span>Crédito (C)</span>
                </div>
                <div class="t-body">
                    <div class="t-side t-side-debit">
                        ${debits.length ? debits.map((v) => `<div>${formatMoney(v)}</div>`).join("") : `<div class="t-empty-mark">—</div>`}
                    </div>
                    <div class="t-side t-side-credit">
                        ${credits.length ? credits.map((v) => `<div>${formatMoney(v)}</div>`).join("") : `<div class="t-empty-mark">—</div>`}
                    </div>
                </div>
                <div class="t-totals">
                    <span>${formatMoney(totD)}</span>
                    <span>${formatMoney(totC)}</span>
                </div>
                <div class="t-balance">
                    <span>${balLabel}</span>
                    <strong>${formatMoney(Math.abs(diff))}</strong>
                </div>
            `;
            grid.appendChild(card);
        });

        container.appendChild(section);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const loading = document.getElementById("loading");
    const main = document.getElementById("main");
    const cnpj = getCnpjFromUrl();

    document.getElementById("razSearch").addEventListener("input", renderRazonetes);
    document.querySelectorAll("[data-rview]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeView = btn.dataset.rview;
            document.querySelectorAll("[data-rview]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderRazonetes();
        });
    });

    try {
        const response = await fetch(`/dashboard/razonete/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Falha ao buscar razonetes");

        const data = await response.json();
        historicRows = Array.isArray(data.historic) ? data.historic : [];

        loading.hidden = true;
        main.hidden = false;
        renderRazonetes();
    } catch (error) {
        console.error("Erro ao carregar razonetes:", error);
        loading.hidden = true;
        main.hidden = false;
        document.getElementById("razEmpty").hidden = false;
    }
});
