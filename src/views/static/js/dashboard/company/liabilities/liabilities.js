let allLiabilities = [];
let currentLiability = null;
let activeFilter = "all";
let shouldReloadAfterAlert = false;

const EQUITY_KEYS = new Set(["Capital Social", "Lucro", "Lucros acumulados"]);

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

function isEquity(item) {
    return EQUITY_KEYS.has(item.event) || EQUITY_KEYS.has(item.name);
}

function openModalById(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add("is-open");
}

function closeModalById(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove("is-open");
}

function showAlert(message, reloadOnClose = false) {
    shouldReloadAfterAlert = reloadOnClose;
    document.getElementById("body-content").textContent = message;
    openModalById("alert-modal");
}

function statusBadgeClass(item) {
    if (isEquity(item)) return "badge-gold";
    const s = String(item.status || "").toLowerCase();
    if (s.includes("pago") || s.includes("quitad")) return "badge-pos";
    if (s.includes("atraso")) return "badge-danger";
    if (s.includes("pendent") || s.includes("parcel") || s.includes("prazo")) return "badge-warn";
    return "";
}

function openLiabilityDetails(liab) {
    currentLiability = liab;
    const eq = isEquity(liab);
    document.getElementById("name").textContent = liab.name === "#!@cash@!#" ? "Caixa" : liab.name || "—";
    document.getElementById("value").textContent = formatMoney(liab.value);
    document.getElementById("event").textContent = liab.event || "—";
    document.getElementById("class").textContent = liab.class || "—";
    document.getElementById("emission_date").textContent = liab.emission_date || "—";
    document.getElementById("expiration_date").textContent = liab.expiration_date || "—";
    document.getElementById("payment_method").textContent = liab.payment_method || "—";
    document.getElementById("installment").textContent = liab.installment ? `${liab.installment}x` : "1x";
    document.getElementById("status").textContent = eq ? "Integralizado / Registrado" : liab.status || "—";
    document.getElementById("floating").textContent = eq
        ? "Patrimônio Líquido"
        : liab.floating
            ? "Passivo circulante"
            : "Passivo não circulante";
    document.getElementById("description").textContent = liab.description || "—";
    document.getElementById("creation").textContent = `${liab.creation_date || ""} às ${liab.creation_time || ""}`;
    document.getElementById("uuid").textContent = liab.liability_id || "";

    document.getElementById("btnSettleLiability").hidden = eq;
    openModalById("modal");
}

function renderRows() {
    const tbody = document.getElementById("data-container");
    const tableWrap = document.getElementById("tableWrap");
    const emptyFilter = document.getElementById("emptyFilterState");
    const q = (document.getElementById("liabilitySearch").value || "").trim().toLowerCase();

    const filtered = allLiabilities.filter((l) => {
        const eq = isEquity(l);
        if (activeFilter === "obligations" && eq) return false;
        if (activeFilter === "equity" && !eq) return false;
        if (!q) return true;
        return [l.name, l.event, l.class, l.payment_method, l.status]
            .some((field) => String(field || "").toLowerCase().includes(q));
    });

    tbody.innerHTML = "";

    if (filtered.length === 0) {
        tableWrap.hidden = true;
        emptyFilter.hidden = false;
        return;
    }

    tableWrap.hidden = false;
    emptyFilter.hidden = true;

    filtered.forEach((liab) => {
        const tr = document.createElement("tr");
        tr.className = "is-clickable";
        tr.tabIndex = 0;
        const eq = isEquity(liab);
        const badgeCls = statusBadgeClass(liab);
        const statusLabel = eq ? "Patrimônio" : liab.status || "—";

        tr.innerHTML = `
            <td class="td-strong">${escapeHTML(liab.name === "#!@cash@!#" ? "Caixa" : liab.name)}</td>
            <td>${escapeHTML(liab.event)}</td>
            <td class="td-muted">${escapeHTML(liab.class)}</td>
            <td class="td-date">${escapeHTML(liab.emission_date)}</td>
            <td class="td-date">${escapeHTML(liab.expiration_date)}</td>
            <td>${escapeHTML(liab.payment_method)}</td>
            <td><span class="badge ${badgeCls}">${escapeHTML(statusLabel)}</span></td>
            <td class="num-col">${formatMoney(liab.value)}</td>
        `;
        tr.addEventListener("click", () => openLiabilityDetails(liab));
        tr.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openLiabilityDetails(liab);
            }
        });
        tbody.appendChild(tr);
    });
}

document.addEventListener("DOMContentLoaded", async function () {
    const loading = document.getElementById("loading");
    const main = document.getElementById("main");
    const tablePanel = document.getElementById("tablePanel");
    const emptyDataState = document.getElementById("emptyDataState");
    const cnpj = getCnpjFromUrl();

    document.querySelectorAll("[data-close-modal]").forEach((btn) => {
        btn.addEventListener("click", () => closeModalById(btn.dataset.closeModal));
    });
    document.querySelectorAll(".modal").forEach((m) => {
        m.addEventListener("click", (e) => {
            if (e.target === m) m.classList.remove("is-open");
        });
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal.is-open").forEach((m) => m.classList.remove("is-open"));
        }
    });

    document.getElementById("btnCloseAlert").addEventListener("click", () => {
        closeModalById("alert-modal");
        if (shouldReloadAfterAlert) window.location.reload();
    });

    document.getElementById("liabilitySearch").addEventListener("input", renderRows);
    document.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeFilter = btn.dataset.filter;
            document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderRows();
        });
    });

    // Abater valor
    document.getElementById("btnEditLiability").addEventListener("click", () => {
        if (!currentLiability) return;
        document.getElementById("edit-name").value = currentLiability.name || "";
        document.getElementById("old_value").value = Number(currentLiability.value || 0).toFixed(2);
        document.getElementById("new_value").value = "";
        openModalById("edit-modal");
    });

    document.getElementById("btnConfirmEdit").addEventListener("click", async () => {
        if (!currentLiability) return;
        const discountVal = parseFloat(document.getElementById("new_value").value);
        const oldVal = Number(currentLiability.value) || 0;

        if (Number.isNaN(discountVal) || discountVal <= 0 || discountVal >= oldVal) {
            showAlert("Informe um valor maior que 0 e menor que o valor atual.");
            return;
        }

        const btn = document.getElementById("btnConfirmEdit");
        btn.disabled = true;
        try {
            const response = await fetch(`/dashboard/update-liability/${currentLiability.liability_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_value: discountVal })
            });
            const result = await response.json();
            closeModalById("edit-modal");
            closeModalById("modal");
            showAlert(result.message || "Valor atualizado com sucesso.", response.ok);
        } catch (err) {
            showAlert("Erro ao atualizar o valor do passivo.");
        } finally {
            btn.disabled = false;
        }
    });

    // Quitar obrigação
    document.getElementById("btnSettleLiability").addEventListener("click", () => {
        if (!currentLiability) return;
        openModalById("settle-modal");
    });

    document.getElementById("btnConfirmSettle").addEventListener("click", async () => {
        if (!currentLiability) return;
        const btn = document.getElementById("btnConfirmSettle");
        btn.disabled = true;
        try {
            const response = await fetch(`/dashboard/settle-liability/${currentLiability.liability_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const result = await response.json();
            closeModalById("settle-modal");
            closeModalById("modal");
            showAlert(result.message || "Passivo quitado com sucesso.", response.ok);
        } catch (err) {
            showAlert("Erro ao quitar o passivo.");
        } finally {
            btn.disabled = false;
        }
    });

    // Estornar
    document.getElementById("btnDeleteLiability").addEventListener("click", () => {
        if (!currentLiability) return;
        if (String(currentLiability.status || "").toLowerCase().includes("estornado")) {
            showAlert("Este passivo já foi estornado anteriormente.");
            return;
        }
        openModalById("confirm-modal");
    });

    document.getElementById("btnConfirmDelete").addEventListener("click", async () => {
        if (!currentLiability) return;
        const btn = document.getElementById("btnConfirmDelete");
        btn.disabled = true;
        try {
            const response = await fetch(`/dashboard/refund-liability/${currentLiability.liability_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const result = await response.json();
            closeModalById("confirm-modal");
            closeModalById("modal");
            showAlert(result.message || "Passivo estornado com sucesso.", response.ok);
        } catch (err) {
            showAlert("Erro ao estornar o passivo.");
        } finally {
            btn.disabled = false;
        }
    });

    // Carregar passivos
    try {
        const response = await fetch(`/dashboard/liabilities/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Falha ao buscar passivos");

        const data = await response.json();
        allLiabilities = Array.isArray(data.historic) ? data.historic : [];

        const obligations = allLiabilities.filter((l) => !isEquity(l));
        const equityList = allLiabilities.filter(isEquity);

        const sumOblig = obligations.reduce((s, l) => s + (Number(l.value) || 0), 0);
        const sumCurr = obligations.filter((l) => l.floating === true).reduce((s, l) => s + (Number(l.value) || 0), 0);
        const sumNonCurr = obligations.filter((l) => l.floating !== true).reduce((s, l) => s + (Number(l.value) || 0), 0);
        const sumEq = equityList.reduce((s, l) => s + (Number(l.value) || 0), 0);

        document.getElementById("sumObligations").textContent = formatMoney(sumOblig);
        document.getElementById("sumObligationsCount").textContent =
            obligations.length === 1 ? "1 obrigação ativa" : `${obligations.length} obrigações ativas`;
        document.getElementById("sumLiabCurrent").textContent = formatMoney(sumCurr);
        document.getElementById("sumLiabNonCurrent").textContent = formatMoney(sumNonCurr);
        document.getElementById("sumEquity").textContent = formatMoney(sumEq);

        loading.hidden = true;
        main.hidden = false;

        if (allLiabilities.length === 0) {
            tablePanel.hidden = true;
            emptyDataState.hidden = false;
        } else {
            tablePanel.hidden = false;
            emptyDataState.hidden = true;
            renderRows();
        }
    } catch (error) {
        console.error("Erro ao carregar passivos:", error);
        loading.hidden = true;
        main.hidden = false;
        tablePanel.hidden = true;
        emptyDataState.hidden = false;
    }
});
