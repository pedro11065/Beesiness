document.addEventListener("DOMContentLoaded", function () {
    const loadingElement = document.getElementById("loading");
    const container = document.getElementById("resultado");
    const newCompanyButton = document.getElementById("newCompanyButton");
    const toolbar = document.getElementById("toolbar");
    const searchInput = document.getElementById("companySearch");
    const countElement = document.getElementById("companyCount");

    const roleLabels = {
        creator: "Proprietário",
        editor: "Editor",
        checker: "Conferente",
        viewer: "Leitor"
    };

    let allCompanies = [];

    newCompanyButton.addEventListener("click", function () {
        window.location.href = "/company/register";
    });

    function formatCNPJ(raw) {
        const digits = String(raw || "").replace(/\D/g, "");
        if (digits.length !== 14) return raw || "";
        return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }

    function escapeHTML(str) {
        const div = document.createElement("div");
        div.textContent = str == null ? "" : String(str);
        return div.innerHTML;
    }

    function updateCount(shown, total) {
        if (!countElement) return;
        if (shown === total) {
            countElement.textContent = total === 1 ? "1 empresa vinculada" : `${total} empresas vinculadas`;
        } else {
            countElement.textContent = `Exibindo ${shown} de ${total}`;
        }
    }

    function renderCompanies(list, query) {
        container.innerHTML = "";

        if (list.length === 0 && query) {
            const emptyFilter = document.createElement("div");
            emptyFilter.className = "state-box";
            emptyFilter.innerHTML = `
                <span class="state-tag">Filtro</span>
                <h2>Nenhuma empresa encontrada</h2>
                <p>Não encontramos nenhuma organização correspondente a "${escapeHTML(query)}".</p>
            `;
            const clearBtn = document.createElement("button");
            clearBtn.type = "button";
            clearBtn.className = "btn-secondary";
            clearBtn.textContent = "Limpar busca";
            clearBtn.addEventListener("click", () => {
                searchInput.value = "";
                renderCompanies(allCompanies, "");
                updateCount(allCompanies.length, allCompanies.length);
                searchInput.focus();
            });
            emptyFilter.appendChild(clearBtn);
            container.appendChild(emptyFilter);
            return;
        }

        list.forEach((item) => {
            const card = document.createElement("a");
            card.className = "company-card company";
            card.href = `/dashboard/company/${encodeURIComponent(item.cnpj)}`;

            const roleKey = item.role || "viewer";
            const roleText = roleLabels[roleKey] || roleKey;
            const roleClass = roleKey === "creator" ? "role-creator" : "";

            card.innerHTML = `
                <div class="card-top">
                    <span class="card-index">${String(item.idx + 1).padStart(2, "0")}</span>
                    <span class="role-badge ${roleClass}">${escapeHTML(roleText)}</span>
                </div>
                <div class="card-body">
                    <h2 class="nome-empresa">${escapeHTML(item.name)}</h2>
                    <span class="company-cnpj">CNPJ ${escapeHTML(formatCNPJ(item.cnpj))}</span>
                </div>
                <div class="card-foot">
                    <span>Abrir painel patrimonial</span>
                    <span class="card-arrow" aria-hidden="true">→</span>
                </div>
            `;
            container.appendChild(card);
        });

        // Card de atalho para registrar nova empresa
        const addCard = document.createElement("a");
        addCard.className = "company-card company-card-add";
        addCard.href = "/company/register";
        addCard.innerHTML = `
            <div class="add-circle" aria-hidden="true">+</div>
            <strong>Adicionar nova empresa</strong>
            <span>Cadastre outro CNPJ na sua conta</span>
        `;
        container.appendChild(addCard);
    }

    async function loadCompanies() {
        container.innerHTML = "";
        loadingElement.hidden = false;

        try {
            const response = await fetch("/dashboard/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error("Erro na resposta da API: " + response.statusText);
            }

            const data = await response.json();
            loadingElement.hidden = true;

            if (data["relação"] && Array.isArray(data.nomes) && data.nomes.length > 0) {
                allCompanies = data.nomes.map((name, idx) => ({
                    idx,
                    name,
                    cnpj: data.cnpjs[idx],
                    role: (data["nivel de acesso"] && data["nivel de acesso"][idx]) || "viewer"
                }));

                toolbar.hidden = false;
                updateCount(allCompanies.length, allCompanies.length);
                renderCompanies(allCompanies, "");
            } else {
                toolbar.hidden = true;
                const emptyState = document.createElement("div");
                emptyState.className = "state-box company-data-error";
                emptyState.innerHTML = `
                    <span class="state-tag">Comece agora</span>
                    <h2>Nenhuma empresa vinculada ainda.</h2>
                    <p>Cadastre o CNPJ da sua empresa para começar a registrar ativos, passivos e gerar relatórios contábeis.</p>
                    <a href="/company/register" class="btn-primary">
                        <span>Registrar primeira empresa</span>
                        <span aria-hidden="true">→</span>
                    </a>
                `;
                container.appendChild(emptyState);
            }
        } catch (error) {
            console.error("Erro ao carregar empresas:", error);
            loadingElement.hidden = true;
            toolbar.hidden = true;

            const errorState = document.createElement("div");
            errorState.className = "state-box state-error";
            errorState.innerHTML = `
                <span class="state-tag">Falha de conexão</span>
                <h2>Não foi possível carregar suas empresas.</h2>
                <p>Ocorreu um problema ao consultar as organizações vinculadas à sua conta.</p>
            `;
            const retryBtn = document.createElement("button");
            retryBtn.type = "button";
            retryBtn.className = "btn-secondary";
            retryBtn.textContent = "Tentar novamente";
            retryBtn.addEventListener("click", loadCompanies);
            errorState.appendChild(retryBtn);
            container.appendChild(errorState);
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const rawQuery = searchInput.value.trim();
            const q = rawQuery.toLowerCase();
            const qDigits = rawQuery.replace(/\D/g, "");

            const filtered = allCompanies.filter((item) => {
                const matchName = String(item.name || "").toLowerCase().includes(q);
                const matchCnpj =
                    (qDigits && String(item.cnpj || "").includes(qDigits)) ||
                    formatCNPJ(item.cnpj).toLowerCase().includes(q);
                return matchName || matchCnpj;
            });

            updateCount(filtered.length, allCompanies.length);
            renderCompanies(filtered, rawQuery);
        });
    }

    loadCompanies();
});
