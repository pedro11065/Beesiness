let allAssets = [];
let currentAsset = null;
let activeFilter = "all";
let shouldReloadAfterAlert = false;

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

function statusBadgeClass(status) {
    const s = String(status || "").toLowerCase();
    if (s.includes("dispon") || s.includes("uso") || s.includes("realiz") || s.includes("comprad")) return "badge-pos";
    if (s.includes("manuten") || s.includes("empenh") || s.includes("alug")) return "badge-gold";
    if (s.includes("danific") || s.includes("perdid") || s.includes("apreend") || s.includes("obsolet")) return "badge-danger";
    return "";
}

function openAssetDetails(asset) {
    currentAsset = asset;
    document.getElementById("name").textContent = asset.name || "—";
    document.getElementById("value").textContent = formatMoney(asset.value);
    document.getElementById("class").textContent = asset.class || "—";
    document.getElementById("event").textContent = asset.event || "—";
    document.getElementById("floating").textContent = asset.floating ? "Ativo circulante" : "Ativo não circulante";
    document.getElementById("status").textContent = asset.status || "—";
    document.getElementById("acquisition_date").textContent = asset.acquisition_date || "—";
    document.getElementById("installment").textContent = asset.installment ? `${asset.installment}x` : "À vista";
    document.getElementById("location").textContent = asset.location || "—";
    document.getElementById("description").textContent = asset.description || "—";
    document.getElementById("creation").textContent = `${asset.creation_date || ""} às ${asset.creation_time || ""}`;
    document.getElementById("uuid").textContent = asset.asset_id || "";
    openModalById("modal");
}

function renderRows() {
    const tbody = document.getElementById("data-container");
    const tableWrap = document.getElementById("tableWrap");
    const emptyFilter = document.getElementById("emptyFilterState");
    const q = (document.getElementById("assetSearch").value || "").trim().toLowerCase();

    const filtered = allAssets.filter((a) => {
        if (activeFilter === "current" && a.floating !== true) return false;
        if (activeFilter === "non_current" && a.floating === true) return false;
        if (!q) return true;
        return [a.name, a.class, a.event, a.status, a.location]
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

    filtered.forEach((asset) => {
        const tr = document.createElement("tr");
        tr.className = "is-clickable";
        tr.tabIndex = 0;
        const badgeCls = statusBadgeClass(asset.status);
        tr.innerHTML = `
            <td class="td-strong">${escapeHTML(asset.name)}</td>
            <td>${escapeHTML(asset.class)}</td>
            <td class="td-muted">${escapeHTML(asset.event)}</td>
            <td><span class="badge ${asset.floating ? "badge-gold" : ""}">${asset.floating ? "Circulante" : "Não circulante"}</span></td>
            <td class="td-date">${escapeHTML(asset.acquisition_date)}</td>
            <td><span class="badge ${badgeCls}">${escapeHTML(asset.status)}</span></td>
            <td class="num-col">${formatMoney(asset.value)}</td>
        `;
        tr.addEventListener("click", () => openAssetDetails(asset));
        tr.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openAssetDetails(asset);
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

    // Fechamento padrão de modais
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

    // Busca e filtros
    document.getElementById("assetSearch").addEventListener("input", renderRows);
    document.querySelectorAll("[data-filter]").forEach((btn) => {
        btn.addEventListener("click", () => {
            activeFilter = btn.dataset.filter;
            document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
            renderRows();
        });
    });

    // Ações do modal de detalhes
    document.getElementById("btnEditAsset").addEventListener("click", () => {
        if (!currentAsset) return;
        document.getElementById("edit-name").value = currentAsset.name || "";
        document.getElementById("old_value").value = Number(currentAsset.value || 0).toFixed(2);
        document.getElementById("new_value").value = "";
        openModalById("edit-modal");
    });

    document.getElementById("btnConfirmEdit").addEventListener("click", async () => {
        if (!currentAsset) return;
        const discountVal = parseFloat(document.getElementById("new_value").value);
        const oldVal = Number(currentAsset.value) || 0;

        if (Number.isNaN(discountVal) || discountVal <= 0 || discountVal >= oldVal) {
            showAlert("Informe um valor maior que 0 e menor que o valor atual do ativo.");
            return;
        }

        const btn = document.getElementById("btnConfirmEdit");
        btn.disabled = true;
        try {
            const response = await fetch(`/dashboard/update-asset/${currentAsset.asset_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ new_value: discountVal })
            });
            const result = await response.json();
            closeModalById("edit-modal");
            closeModalById("modal");
            showAlert(result.message || "Valor atualizado com sucesso.", response.ok);
        } catch (err) {
            showAlert("Erro ao atualizar o valor do ativo.");
        } finally {
            btn.disabled = false;
        }
    });

    document.getElementById("btnSellAsset").addEventListener("click", () => {
        if (!currentAsset) return;
        openModalById("sell-modal");
    });

    document.getElementById("btnConfirmSell").addEventListener("click", async () => {
        if (!currentAsset) return;
        const btn = document.getElementById("btnConfirmSell");
        btn.disabled = true;
        try {
            const response = await fetch(`/dashboard/sell-asset/${currentAsset.asset_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const result = await response.json();
            closeModalById("sell-modal");
            closeModalById("modal");
            showAlert(result.message || "Operação concluída.", response.ok);
        } catch (err) {
            showAlert("Erro ao registrar venda do ativo.");
        } finally {
            btn.disabled = false;
        }
    });

    document.getElementById("btnDeleteAsset").addEventListener("click", () => {
        if (!currentAsset) return;
        if (String(currentAsset.status || "").toLowerCase().includes("estornado")) {
            showAlert("Este ativo já foi estornado anteriormente.");
            return;
        }
        openModalById("confirm-modal");
    });

    document.getElementById("btnConfirmDelete").addEventListener("click", async () => {
        if (!currentAsset) return;
        const btn = document.getElementById("btnConfirmDelete");
        btn.disabled = true;
        try {
            const response = await fetch(`/dashboard/refund-asset/${currentAsset.asset_id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            const result = await response.json();
            closeModalById("confirm-modal");
            closeModalById("modal");
            showAlert(result.message || "Ativo estornado com sucesso.", response.ok);
        } catch (err) {
            showAlert("Erro ao estornar o ativo.");
        } finally {
            btn.disabled = false;
        }
    });

    // Carregar ativos
    try {
        const response = await fetch(`/dashboard/assets/${cnpj}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });
        if (!response.ok) throw new Error("Falha ao buscar ativos");

        const data = await response.json();
        const rows = Array.isArray(data.value) ? data.value : [];
        const cashRow = rows.find((r) => r.name === "#!@cash@!#");
        const cashVal = cashRow ? Number(cashRow.value) || 0 : 0;
        allAssets = rows.filter((r) => r.name !== "#!@cash@!#");

        const totalNonCash = allAssets.reduce((s, a) => s + (Number(a.value) || 0), 0);
        const totalCurrent = allAssets.filter((a) => a.floating === true).reduce((s, a) => s + (Number(a.value) || 0), 0);
        const totalNonCurrent = allAssets.filter((a) => a.floating !== true).reduce((s, a) => s + (Number(a.value) || 0), 0);

        document.getElementById("sumAssetsTotal").textContent = formatMoney(totalNonCash);
        document.getElementById("sumCashNote").textContent = `Caixa disponível: ${formatMoney(cashVal)}`;
        document.getElementById("sumAssetsCurrent").textContent = formatMoney(totalCurrent);
        document.getElementById("sumAssetsNonCurrent").textContent = formatMoney(totalNonCurrent);
        document.getElementById("sumAssetsCount").textContent = String(allAssets.length);

        loading.hidden = true;
        main.hidden = false;

        if (allAssets.length === 0) {
            tablePanel.hidden = true;
            emptyDataState.hidden = false;
        } else {
            tablePanel.hidden = false;
            emptyDataState.hidden = true;
            renderRows();
        }
    } catch (error) {
        console.error("Erro ao carregar ativos:", error);
        loading.hidden = true;
        main.hidden = false;
        tablePanel.hidden = true;
        emptyDataState.hidden = false;
    }
});
