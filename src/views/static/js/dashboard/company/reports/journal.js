let journalPayload = { historic: [], assets: [], liabilities: [] };
let activeFilter = "active";
let activeGroup = "month";

const EQUITY_KEYS = new Set(["Capital Social", "Lucro", "Lucros acumulados"]);
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

function formatBrDate(d) {
    if (!d) return "—";
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function isEquity(item) {
    return EQUITY_KEYS.has(item.event) || EQUITY_KEYS.has(item.name);
}

function openEntryModal(item) {
    const isAsset = item.type === "asset";
    const fullItem = isAsset
        ? (journalPayload.assets || []).find((a) => a.asset_id === item.patrimony_id)
        : (journalPayload.liabilities || []).find((l) => l.liability_id === item.patrimony_id);

    const eq = isEquity(item);
    document.getElementById("modalTitle").textContent = eq
        ? "Lançamento de Patrimônio Líquido"
        : isAsset
            ? "Lançamento de Ativo"
            : "Lançamento de Passivo";

    const compDate = parseIsoDate(item.date);
    document.getElementById("name").textContent = (fullItem && fullItem.name) || item.name || "—";
    document.getElementById("value").textContent = formatMoney(item.value);
    document.getElementById("event").textContent = item.event || "—";
    document.getElementById("class").textContent = item.class || "—";
    document.getElementById("comp_date").textContent = formatBrDate(compDate);
    document.getElementById("status").textContent =
        item.ignore === true
            ? "Quitado / Estornado no histórico"
            : (fullItem && fullItem.status) || "Registrado";

    document.getElementById("description").textContent =
        (fullItem && fullItem.description) || "Registro contábil escriturado no Livro Diário.";
    document.getElementById("dc_info").textContent =
        `D: ${formatMoney(item.debit)} · C: ${formatMoney(item.credit)}`;
    document.getElementById("uuid").textContent = item.historic_id || item.patrimony_id || "";

    const wrapPay = document.getElementById("WrapPayment");
    const wrapExp = document.getElementById("WrapExpiration");
    const wrapLoc = document.getElementById("WrapLocation");
    wrapPay.hidden = true;
    wrapExp.hidden = true;
    wrapLoc.hidden = true;

    if (!isAsset && fullItem) {
        if (fullItem.payment_method) {
            document.getElementById("payment_method").textContent = fullItem.payment_method;
            wrapPay.hidden = false;
        }
        if (fullItem.expiration_date) {
            document.getElementById("expiration_date").textContent = fullItem.expiration_date;
            wrapExp.hidden = false;
        }
    } else if (isAsset && fullItem && fullItem.location) {
        document.getElementById("location").textContent = fullItem.location;
        wrapLoc.hidden = false;
    }

    document.getElementById("modal").classList.add("is-open");
}

function renderJournal() {
    const groupsContainer = document.getElementById("journalGroups");
    const emptyEl = document.getElementById("emptyJournalState");
    const q = (document.getElementById("journalSearch").value || "").trim().toLowerCase();

    const nonCash = (journalPayload.historic || []).filter((h) => h.name !== "#!@cash@!#");

    const filtered = nonCash.filter((h) => {
        if (activeFilter === "active" && h.ignore === true) return false;
        if (activeFilter === "asset" && (h.type !== "asset" || h.ignore === true)) return false;
        if (activeFilter === "liability" && (h.type !== "liability" || h.ignore === true)) return false;
        if (!q) return true;
        return [h.name, h.event, h.class].some((f) => String(f || "").toLowerCase().includes(q));
    });

    groupsContainer.innerHTML = "";

    if (filtered.length === 0) {
        emptyEl.hidden = false;
        return;
    }
    emptyEl.hidden = true;

    // Ordenar do mais recente para o mais antigo
    const sorted = [...filtered].sort((a, b) => {
        const da = parseIsoDate(a.date);
        const db = parseIsoDate(b.date);
        return (db ? db.getTime() : 0) - (da ? da.getTime() : 0);
    });

    const groups = new Map();
    sorted.forEach((item) => {
        const dt = parseIsoDate(item.date);
        let key = "Sem data";
        let title = "Sem data";
        if (dt) {
            const y = dt.getFullYear();
            const m = dt.getMonth();
            const d = String(dt.getDate()).padStart(2, "0");
            if (activeGroup === "day") {
                key = `${y}-${String(m + 1).padStart(2, "0")}-${d}`;
                title = `${d} de ${MONTHS_FULL[m]} de ${y}`;
            } else if (activeGroup === "year") {
                key = `${y}`;
                title = `Exercício ${y}`;
            } else {
                key = `${y}-${String(m + 1).padStart(2, "0")}`;
                title = `${MONTHS_FULL[m]} de ${y}`;
            }
        }
        if (!groups.has(key)) groups.set(key, { title, items: [] });
        groups.get(key).items.push(item);
    });

    groups.forEach((group) => {
        const total = group.items.reduce((s, it) => s + (Number(it.value) || 0), 0);
        const section = document.createElement("section");
        section.className = "journal-group";

        section.innerHTML = `
            <header class="journal-group-head">
                <h2>${escapeHTML(group.title)}</h2>
                <div class="journal-group-meta">
                    <span>${group.items.length} ${group.items.length === 1 ? "lançamento" : "lançamentos"}</span>
                    <strong>${formatMoney(total)}</strong>
                </div>
            </header>
            <div class="table-wrap">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Conta / Descrição</th>
                            <th>Evento · Classe</th>
                            <th>Natureza</th>
                            <th class="num-col">Débito</th>
                            <th class="num-col">Crédito</th>
                            <th class="num-col">Valor</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `;

        const tbody = section.querySelector("tbody");
        group.items.forEach((item) => {
            const dt = parseIsoDate(item.date);
            const eq = isEquity(item);
            const tr = document.createElement("tr");
            tr.className = `is-clickable ${item.ignore === true ? "row-archived" : ""}`;
            tr.tabIndex = 0;

            let badgeHtml = `<span class="badge badge-pos">Ativo</span>`;
            if (item.ignore === true) {
                badgeHtml = `<span class="badge">Quitado / Estornado</span>`;
            } else if (eq) {
                badgeHtml = `<span class="badge badge-gold">Patrimônio Líquido</span>`;
            } else if (item.type === "liability") {
                badgeHtml = `<span class="badge badge-danger">Passivo</span>`;
            }

            tr.innerHTML = `
                <td class="td-date">${escapeHTML(formatBrDate(dt))}</td>
                <td class="td-strong">${escapeHTML(item.name)}</td>
                <td class="td-muted">${escapeHTML(item.event)} · ${escapeHTML(item.class)}</td>
                <td>${badgeHtml}</td>
                <td class="num-col td-muted">${Number(item.debit) > 0 ? formatMoney(item.debit) : "—"}</td>
                <td class="num-col td-muted">${Number(item.credit) > 0 ? formatMoney(item.credit) : "—"}</td>
                <td class="num-col">${formatMoney(item.value)}</td>
            `;
            tr.addEventListener("click", () => openEntryModal(item));
            tr.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openEntryModal(item);
                }
            });
            tbody.appendChild(tr);
        });

        groupsContainer.appendChild(section);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const loading = document.getElementById("loading");
    const main = document.getElementById("main");
    const cnpj = getCnpjFromUrl();
    const modal = document.getElementById("modal");

    document.getElementById("btnCloseJournalModal").addEventListener("click", () => modal.classList.remove("is-open"));
    modal.addEventListener("click", (e) => {
        if (e.target === modal) modal.classList.remove("is-open");
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") modal.classList.remove("is-open");
    });

    document.getElementById("journalSearch").addEventListener("input", renderJournal);
    document.querySelectorAll("[data-jfilter]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeFilter = btn.dataset.jfilter;
            document.querySelectorAll("[data-jfilter]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderJournal();
        });
    });
    document.querySelectorAll("[data-jgroup]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeGroup = btn.dataset.jgroup;
            document.querySelectorAll("[data-jgroup]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderJournal();
        });
    });

    try {
        const response = await fetch(`/dashboard/journal/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Falha ao carregar Livro Diário");

        const data = await response.json();
        journalPayload = {
            historic: Array.isArray(data.historic) ? data.historic : [],
            assets: Array.isArray(data.assets) ? data.assets : [],
            liabilities: Array.isArray(data.liabilities) ? data.liabilities : []
        };

        const nonCash = journalPayload.historic.filter((h) => h.name !== "#!@cash@!#");
        const activeRows = nonCash.filter((h) => h.ignore !== true);
        const archivedCount = nonCash.length - activeRows.length;

        const sumAssets = activeRows
            .filter((h) => h.type === "asset")
            .reduce((s, h) => s + (Number(h.value) || 0), 0);
        const sumLiabs = activeRows
            .filter((h) => h.type === "liability" && !isEquity(h))
            .reduce((s, h) => s + (Number(h.value) || 0), 0);
        const sumEq = activeRows
            .filter((h) => h.type === "liability" && isEquity(h))
            .reduce((s, h) => s + (Number(h.value) || 0), 0);

        document.getElementById("sumJournalCount").textContent = String(activeRows.length);
        document.getElementById("sumJournalArchived").textContent = `${archivedCount} quitados / estornados`;
        document.getElementById("sumJournalAssets").textContent = formatMoney(sumAssets);
        document.getElementById("sumJournalLiabilities").textContent = formatMoney(sumLiabs);
        document.getElementById("sumJournalEquity").textContent = formatMoney(sumEq);

        loading.hidden = true;
        main.hidden = false;
        renderJournal();
    } catch (error) {
        console.error("Erro ao carregar Livro Diário:", error);
        loading.hidden = true;
        main.hidden = false;
        document.getElementById("emptyJournalState").hidden = false;
    }
});
