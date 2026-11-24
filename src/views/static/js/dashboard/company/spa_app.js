(function () {
    "use strict";

    window.__SPA_BOOT_ID__ = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const EQUITY_KEYS = new Set(["Capital Social", "Lucro", "Lucros acumulados"]);
    const MONTHS_FULL = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const root = document.getElementById("spaRoot");
    const cnpj = (root && root.dataset.cnpj) || "";
    let activeView = (root && root.dataset.initialView) || "overview";

    let store = null;
    let balanceChart = null;
    let comparisonChart = null;
    let chartsDirty = true;

    // Estados locais de filtro / UI de cada módulo
    const ui = {
        ovChartMode: "line",
        ovClassMode: "assets",
        astFilter: "all",
        currentAsset: null,
        libFilter: "all",
        currentLiability: null,
        jrnFilter: "active",
        jrnGroup: "month",
        tbView: "year",
        razView: "all",
        bsMode: "consolidated",
        authEditMode: false,
        authTargetCpf: "",
        successListTarget: "assets"
    };

    const VIEW_URLS = {
        overview: `/dashboard/company/${cnpj}`,
        assets: `/dashboard/assets/${cnpj}`,
        liabilities: `/dashboard/liabilities/${cnpj}`,
        register_asset: `/dashboard/register/asset/${cnpj}`,
        register_liability: `/dashboard/register/liability/${cnpj}`,
        journal: `/dashboard/journal/${cnpj}`,
        trial_balance: `/dashboard/trial-balance/${cnpj}`,
        razonete: `/dashboard/razonete/${cnpj}`,
        balance_sheet: `/dashboard/balance-sheet/${cnpj}`,
        income_statement: `/dashboard/income-statement/${cnpj}`,
        authorization: `/dashboard/company/${cnpj}/authorization`
    };

    function getViewMeta(viewName) {
        const companyName = (store && store.company && store.company.name) || "Painel da empresa";
        const map = {
            overview: {
                eyebrow: "Painel patrimonial",
                heading: companyName,
                title: `${companyName} | Beesiness`
            },
            assets: {
                eyebrow: "Gestão de bens e direitos",
                heading: "Ativos registrados.",
                title: `Ativos · ${companyName} | Beesiness`
            },
            liabilities: {
                eyebrow: "Obrigações e capital",
                heading: "Passivos registrados.",
                title: `Passivos · ${companyName} | Beesiness`
            },
            register_asset: {
                eyebrow: "Novo lançamento patrimonial",
                heading: "Registrar ativo.",
                title: `Registrar ativo · ${companyName} | Beesiness`
            },
            register_liability: {
                eyebrow: "Obrigações e capital",
                heading: "Registrar passivo.",
                title: `Registrar passivo · ${companyName} | Beesiness`
            },
            journal: {
                eyebrow: "Escrituração cronológica",
                heading: "Livro Diário.",
                title: `Livro Diário · ${companyName} | Beesiness`
            },
            trial_balance: {
                eyebrow: "Verificação de saldos",
                heading: "Balancete de verificação.",
                title: `Balancete · ${companyName} | Beesiness`
            },
            razonete: {
                eyebrow: "Contas em T (Livro Razão)",
                heading: "Razonetes.",
                title: `Razonetes · ${companyName} | Beesiness`
            },
            balance_sheet: {
                eyebrow: "Demonstração estática",
                heading: "Balanço Patrimonial.",
                title: `Balanço Patrimonial · ${companyName} | Beesiness`
            },
            income_statement: {
                eyebrow: "Desempenho econômico",
                heading: "Demonstração do Resultado (DRE).",
                title: `DRE · ${companyName} | Beesiness`
            },
            authorization: {
                eyebrow: "Controle de acesso",
                heading: "Permissões da equipe.",
                title: `Permissões · ${companyName} | Beesiness`
            }
        };
        return map[viewName] || map.overview;
    }

    function resolveViewFromPath(pathname) {
        const p = String(pathname || "").replace(/\/+$/, "");
        if (p.endsWith("/authorization")) return "authorization";
        if (p.includes("/register/asset/")) return "register_asset";
        if (p.includes("/register/liability/")) return "register_liability";
        if (p.includes("/assets/")) return "assets";
        if (p.includes("/liabilities/")) return "liabilities";
        if (p.includes("/journal/")) return "journal";
        if (p.includes("/trial-balance/")) return "trial_balance";
        if (p.includes("/razonete/")) return "razonete";
        if (p.includes("/balance-sheet/")) return "balance_sheet";
        if (p.includes("/income-statement/")) return "income_statement";
        return "overview";
    }

    // =========================================================
    // Utilitários de formatação
    // =========================================================
    function formatCNPJ(raw) {
        const d = String(raw || "").replace(/\D/g, "");
        if (d.length !== 14) return raw || "";
        return d.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
    }

    function formatCPF(raw) {
        const d = String(raw || "").replace(/\D/g, "").slice(0, 11);
        if (d.length !== 11) return raw || "";
        return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
    }

    function maskCPFInput(val) {
        let v = String(val || "").replace(/\D/g, "").slice(0, 11);
        v = v.replace(/^(\d{3})(\d)/, "$1.$2");
        v = v.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
        v = v.replace(/\.(\d{3})(\d)/, ".$1-$2");
        return v;
    }

    function verifyCPF(strCPF) {
        if (strCPF.length !== 11 || /(.)\1{10}/.test(strCPF)) return false;
        let soma = 0;
        for (let i = 1; i <= 9; i++) soma += parseInt(strCPF.substring(i - 1, i), 10) * (11 - i);
        let resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        if (resto !== parseInt(strCPF.substring(9, 10), 10)) return false;

        soma = 0;
        for (let i = 1; i <= 10; i++) soma += parseInt(strCPF.substring(i - 1, i), 10) * (12 - i);
        resto = (soma * 10) % 11;
        if (resto === 10 || resto === 11) resto = 0;
        return resto === parseInt(strCPF.substring(10, 11), 10);
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

    function formatCurrencyInput(raw) {
        const digits = String(raw || "").replace(/\D/g, "");
        if (!digits) return "";
        const num = parseFloat(digits) / 100;
        return num.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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

    // =========================================================
    // Modais
    // =========================================================
    function openModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.add("is-open");
    }

    function closeModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.remove("is-open");
    }

    function closeAllModals() {
        document.querySelectorAll(".modal.is-open").forEach((m) => m.classList.remove("is-open"));
    }

    function showAlert(message, title = "Aviso") {
        document.getElementById("spa-alert-title").textContent = title;
        document.getElementById("spa-alert-msg").textContent = message;
        openModal("spa-alert-modal");
    }

    function showSuccess(title, message, listViewTarget, listBtnLabel) {
        ui.successListTarget = listViewTarget;
        document.getElementById("spa-success-title").textContent = title;
        document.getElementById("spa-success-msg").textContent = message;
        document.getElementById("spa-success-list-btn").textContent = listBtnLabel;
        openModal("spa-success-modal");
    }

    // =========================================================
    // Roteador SPA (Troca em 0ms)
    // =========================================================
    function updateHeaderChrome(viewName) {
        const meta = getViewMeta(viewName);
        const companyName = (store && store.company && store.company.name) || "Empresa";
        const formattedCnpj = `CNPJ ${formatCNPJ(cnpj)}`;

        document.getElementById("spaEyebrow").textContent = meta.eyebrow;
        document.getElementById("companyTitle").textContent = meta.heading;
        document.getElementById("companyCnpjText").textContent =
            viewName === "overview" ? formattedCnpj : `${companyName} · ${formattedCnpj}`;
        document.title = meta.title;

        document.querySelectorAll(".module-tabs .tab").forEach((tab) => {
            const isMatch = tab.dataset.spaView === viewName;
            tab.classList.toggle("is-active", isMatch);
            if (isMatch) tab.setAttribute("aria-current", "page");
            else tab.removeAttribute("aria-current");
        });

        const btnAst = document.getElementById("btnActionRegAsset");
        const btnLib = document.getElementById("btnActionRegLiability");
        btnAst.className = `btn ${viewName === "register_asset" ? "btn-dark" : "btn-primary"}`;
        btnLib.className = `btn ${viewName === "register_liability" ? "btn-dark" : "btn-outline"}`;
    }

    function switchView(viewName, { pushHistory = true } = {}) {
        const target = VIEW_URLS[viewName] ? viewName : "overview";
        activeView = target;

        document.querySelectorAll(".spa-view").forEach((sec) => {
            sec.hidden = sec.dataset.view !== target;
        });

        updateHeaderChrome(target);

        if (target === "overview" && chartsDirty) {
            renderOverviewCharts(false);
        }

        if (window.scrollY > 220) {
            window.scrollTo(0, 0);
        }

        if (pushHistory) {
            const targetUrl = VIEW_URLS[target];
            if (window.location.pathname !== targetUrl) {
                window.history.pushState({ view: target }, "", targetUrl);
            }
        }
    }

    // =========================================================
    // Sincronização em segundo plano após mutações
    // =========================================================
    async function refreshSnapshot() {
        const dot = document.getElementById("spaSyncDot");
        if (dot) dot.classList.add("is-syncing");
        try {
            const res = await fetch(`/dashboard/snapshot/${cnpj}?fresh=1`, {
                method: "POST",
                headers: { "Content-Type": "application/json" }
            });
            if (!res.ok) return;
            store = await res.json();
            chartsDirty = true;
            renderAllViews();
        } catch (err) {
            console.error("Erro ao sincronizar snapshot:", err);
        } finally {
            if (dot) dot.classList.remove("is-syncing");
        }
    }

    // =========================================================
    // 1. Render: Visão Geral
    // =========================================================
    function renderOverviewClassBreakdown() {
        if (!store || !store.overview) return;
        const ov = store.overview;
        const listEl = document.getElementById("ov-class-list");
        const emptyEl = document.getElementById("ov-class-empty");
        const titleEl = document.getElementById("ov-class-title");
        const subEl = document.getElementById("ov-class-sub");

        const isAssets = ui.ovClassMode === "assets";
        const items = isAssets ? ov.assets_by_class || [] : ov.exits_by_class || [];

        titleEl.textContent = isAssets ? "Ativos por classe" : "Saídas por categoria";
        subEl.textContent = isAssets
            ? "Participação de cada classe sobre o ativo total."
            : "Distribuição dos pagamentos, quitações e aquisições à vista.";

        listEl.innerHTML = "";
        if (items.length === 0) {
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

    function renderOverviewCharts(animate = false) {
        if (!store || !store.overview || typeof Chart === "undefined") return;
        const ov = store.overview;

        // Gráfico 1: Saldo x Tempo
        const bStage = document.getElementById("ov-balance-stage");
        const bEmpty = document.getElementById("ov-balance-empty");
        const bCanvas = document.getElementById("ov-balance-canvas");
        const cashSeries = ov.cash_series || { labels: [], values: [] };

        if (!cashSeries.labels || cashSeries.labels.length === 0) {
            bStage.hidden = true;
            bEmpty.hidden = false;
        } else {
            bStage.hidden = false;
            bEmpty.hidden = true;
            if (balanceChart) balanceChart.destroy();

            const ctx = bCanvas.getContext("2d");
            const isLine = ui.ovChartMode === "line";
            const gradient = ctx.createLinearGradient(0, 0, 0, 280);
            gradient.addColorStop(0, "rgba(237, 200, 5, 0.32)");
            gradient.addColorStop(1, "rgba(237, 200, 5, 0.02)");

            balanceChart = new Chart(ctx, {
                type: isLine ? "line" : "bar",
                data: {
                    labels: cashSeries.labels,
                    datasets: [
                        {
                            label: "Saldo em caixa",
                            data: cashSeries.values,
                            fill: isLine,
                            tension: 0.32,
                            backgroundColor: isLine ? gradient : "#EDC805",
                            borderColor: "#0F0F0F",
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
                    animation: animate ? { duration: 220 } : false,
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

        // Gráfico 2: Ativos x Passivos por mês
        const cStage = document.getElementById("ov-comp-stage");
        const cEmpty = document.getElementById("ov-comp-empty");
        const cCanvas = document.getElementById("ov-comp-canvas");
        const comp = ov.comparison_series || { labels: [], assets: [], liabilities: [] };

        if (!comp.labels || comp.labels.length === 0) {
            cStage.hidden = true;
            cEmpty.hidden = false;
        } else {
            cStage.hidden = false;
            cEmpty.hidden = true;
            if (comparisonChart) comparisonChart.destroy();

            const ctx2 = cCanvas.getContext("2d");
            comparisonChart = new Chart(ctx2, {
                type: "bar",
                data: {
                    labels: comp.labels,
                    datasets: [
                        {
                            label: "Ativos registrados",
                            data: comp.assets,
                            backgroundColor: "#EDC805",
                            borderRadius: 6,
                            maxBarThickness: 34
                        },
                        {
                            label: "Passivos exigíveis",
                            data: comp.liabilities,
                            backgroundColor: "#1A1A1A",
                            borderRadius: 6,
                            maxBarThickness: 34
                        }
                    ]
                },
                options: {
                    animation: animate ? { duration: 220 } : false,
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

        chartsDirty = false;
    }

    function renderOverview() {
        if (!store || !store.overview) return;
        const data = store.overview;

        document.getElementById("ov-cash-now").textContent = formatMoney(data.cash_now);
        document.getElementById("ov-cash-sub").textContent =
            `${data.count_entrys} entradas e ${data.count_exits} saídas reconciliadas`;

        document.getElementById("ov-patrimony").textContent = formatMoney(data.patrimony);
        document.getElementById("ov-patrimony-sub").textContent =
            `Ativo total ${formatCompactBRL(data.sum_asset_values)} − Exigível ${formatCompactBRL(data.sum_obligations)}`;

        document.getElementById("ov-assets-quant").textContent = String(data.assets_quant ?? 0);
        document.getElementById("ov-assets-total").textContent = formatMoney(data.sum_non_cash_assets);
        document.getElementById("ov-assets-sub").textContent =
            `Total c/ caixa: ${formatCompactBRL(data.sum_asset_values)}`;

        document.getElementById("ov-liabilities-quant").textContent = String(data.liabilities_quant ?? 0);
        document.getElementById("ov-obligations-total").textContent = formatMoney(data.sum_obligations);
        document.getElementById("ov-liabilities-sub").textContent =
            data.sum_equity_values > 0
                ? `${data.obligations_quant} dívidas · Capital ${formatCompactBRL(data.sum_equity_values)}`
                : "Gerenciar passivos e obrigações";

        document.getElementById("ov-curr-assets").textContent = formatMoney(data.current_assets);
        document.getElementById("ov-ncurr-assets").textContent = formatMoney(data.non_current_assets);
        document.getElementById("ov-curr-liab").textContent = formatMoney(data.current_liabilities);
        document.getElementById("ov-ncurr-liab").textContent = formatMoney(data.non_current_liabilities);

        document.getElementById("ov-count-entrys").textContent = String(data.count_entrys ?? 0);
        document.getElementById("ov-values-entrys").textContent = formatMoney(data.values_entrys);
        document.getElementById("ov-count-exits").textContent = String(data.count_exits ?? 0);
        document.getElementById("ov-values-exits").textContent = formatMoney(data.values_exits);
        document.getElementById("ov-equity-total").textContent = formatMoney(data.sum_equity_values);

        const liqCurrentEl = document.getElementById("ov-liq-current");
        const liqBadgeEl = document.getElementById("ov-liq-badge");
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

        const liqImmEl = document.getElementById("ov-liq-immediate");
        liqImmEl.textContent =
            data.liquidity_immediate == null
                ? "Sem dívida CP"
                : `${data.liquidity_immediate.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}x`;

        const debtRatio = Number(data.debt_ratio) || 0;
        document.getElementById("ov-debt-ratio").textContent =
            `${debtRatio.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%`;
        const debtBadgeEl = document.getElementById("ov-debt-badge");
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

        renderOverviewClassBreakdown();

        // Últimos lançamentos
        const recentWrap = document.getElementById("ov-recent-wrap");
        const recentBody = document.getElementById("ov-recent-body");
        const recentEmpty = document.getElementById("ov-recent-empty");
        const entries = data.recent_entries || [];
        recentBody.innerHTML = "";

        if (entries.length === 0) {
            recentWrap.hidden = true;
            recentEmpty.hidden = false;
        } else {
            recentWrap.hidden = false;
            recentEmpty.hidden = true;
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
                recentBody.appendChild(tr);
            });
        }

        if (activeView === "overview") {
            renderOverviewCharts(false);
        }
    }

    // =========================================================
    // 2. Render: Ativos
    // =========================================================
    function assetStatusBadge(status) {
        const s = String(status || "").toLowerCase();
        if (s.includes("dispon") || s.includes("uso") || s.includes("realiz") || s.includes("comprad")) return "badge-pos";
        if (s.includes("manuten") || s.includes("empenh") || s.includes("alug")) return "badge-gold";
        if (s.includes("danific") || s.includes("perdid") || s.includes("apreend") || s.includes("obsolet")) return "badge-danger";
        return "";
    }

    function openAssetDetails(asset) {
        ui.currentAsset = asset;
        document.getElementById("ast-det-name").textContent = asset.name || "—";
        document.getElementById("ast-det-value").textContent = formatMoney(asset.value);
        document.getElementById("ast-det-class").textContent = asset.class || "—";
        document.getElementById("ast-det-event").textContent = asset.event || "—";
        document.getElementById("ast-det-floating").textContent = asset.floating ? "Ativo circulante" : "Ativo não circulante";
        document.getElementById("ast-det-status").textContent = asset.status || "—";
        document.getElementById("ast-det-date").textContent = asset.acquisition_date || "—";
        document.getElementById("ast-det-installment").textContent = asset.installment ? `${asset.installment}x` : "À vista";
        document.getElementById("ast-det-location").textContent = asset.location || "—";
        document.getElementById("ast-det-description").textContent = asset.description || "—";
        document.getElementById("ast-det-creation").textContent = `${asset.creation_date || ""} às ${asset.creation_time || ""}`;
        document.getElementById("ast-det-uuid").textContent = asset.asset_id || "";
        openModal("ast-detail-modal");
    }

    function renderAssetsRows() {
        const rows = (store && store.assets) || [];
        const nonCash = rows.filter((a) => a.name !== "#!@cash@!#");
        const tbody = document.getElementById("ast-tbody");
        const wrap = document.getElementById("ast-table-wrap");
        const emptyFilter = document.getElementById("ast-empty-filter");
        const q = (document.getElementById("ast-search").value || "").trim().toLowerCase();

        const filtered = nonCash.filter((a) => {
            if (ui.astFilter === "current" && a.floating !== true) return false;
            if (ui.astFilter === "non_current" && a.floating === true) return false;
            if (!q) return true;
            return [a.name, a.class, a.event, a.status, a.location]
                .some((field) => String(field || "").toLowerCase().includes(q));
        });

        tbody.innerHTML = "";
        if (filtered.length === 0) {
            wrap.hidden = true;
            emptyFilter.hidden = false;
            return;
        }
        wrap.hidden = false;
        emptyFilter.hidden = true;

        filtered.forEach((asset) => {
            const tr = document.createElement("tr");
            tr.className = "is-clickable";
            tr.tabIndex = 0;
            tr.innerHTML = `
                <td class="td-strong">${escapeHTML(asset.name)}</td>
                <td>${escapeHTML(asset.class)}</td>
                <td class="td-muted">${escapeHTML(asset.event)}</td>
                <td><span class="badge ${asset.floating ? "badge-gold" : ""}">${asset.floating ? "Circulante" : "Não circulante"}</span></td>
                <td class="td-date">${escapeHTML(asset.acquisition_date)}</td>
                <td><span class="badge ${assetStatusBadge(asset.status)}">${escapeHTML(asset.status)}</span></td>
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

    function renderAssets() {
        const rows = (store && store.assets) || [];
        const cashRow = rows.find((r) => r.name === "#!@cash@!#");
        const cashVal = cashRow ? Number(cashRow.value) || 0 : 0;
        const nonCash = rows.filter((r) => r.name !== "#!@cash@!#");

        const totalNonCash = nonCash.reduce((s, a) => s + (Number(a.value) || 0), 0);
        const totalCurrent = nonCash.filter((a) => a.floating === true).reduce((s, a) => s + (Number(a.value) || 0), 0);
        const totalNonCurrent = nonCash.filter((a) => a.floating !== true).reduce((s, a) => s + (Number(a.value) || 0), 0);

        document.getElementById("ast-sum-total").textContent = formatMoney(totalNonCash);
        document.getElementById("ast-sum-cash").textContent = `Caixa disponível: ${formatMoney(cashVal)}`;
        document.getElementById("ast-sum-current").textContent = formatMoney(totalCurrent);
        document.getElementById("ast-sum-ncurrent").textContent = formatMoney(totalNonCurrent);
        document.getElementById("ast-sum-count").textContent = String(nonCash.length);

        const panel = document.getElementById("ast-table-panel");
        const emptyData = document.getElementById("ast-empty-data");
        if (nonCash.length === 0) {
            panel.hidden = true;
            emptyData.hidden = false;
        } else {
            panel.hidden = false;
            emptyData.hidden = true;
            renderAssetsRows();
        }
    }

    // =========================================================
    // 3. Render: Passivos
    // =========================================================
    function liabilityStatusBadge(item) {
        if (isEquity(item)) return "badge-gold";
        const s = String(item.status || "").toLowerCase();
        if (s.includes("pago") || s.includes("quitad")) return "badge-pos";
        if (s.includes("atraso")) return "badge-danger";
        if (s.includes("pendent") || s.includes("parcel") || s.includes("prazo")) return "badge-warn";
        return "";
    }

    function openLiabilityDetails(liab) {
        ui.currentLiability = liab;
        const eq = isEquity(liab);
        document.getElementById("lib-det-name").textContent = liab.name === "#!@cash@!#" ? "Caixa" : liab.name || "—";
        document.getElementById("lib-det-value").textContent = formatMoney(liab.value);
        document.getElementById("lib-det-event").textContent = liab.event || "—";
        document.getElementById("lib-det-class").textContent = liab.class || "—";
        document.getElementById("lib-det-emission").textContent = liab.emission_date || "—";
        document.getElementById("lib-det-expiration").textContent = liab.expiration_date || "—";
        document.getElementById("lib-det-payment").textContent = liab.payment_method || "—";
        document.getElementById("lib-det-installment").textContent = liab.installment ? `${liab.installment}x` : "1x";
        document.getElementById("lib-det-status").textContent = eq ? "Integralizado / Registrado" : liab.status || "—";
        document.getElementById("lib-det-floating").textContent = eq
            ? "Patrimônio Líquido"
            : liab.floating
                ? "Passivo circulante"
                : "Passivo não circulante";
        document.getElementById("lib-det-description").textContent = liab.description || "—";
        document.getElementById("lib-det-creation").textContent = `${liab.creation_date || ""} às ${liab.creation_time || ""}`;
        document.getElementById("lib-det-uuid").textContent = liab.liability_id || "";
        document.getElementById("lib-btn-settle").hidden = eq;
        openModal("lib-detail-modal");
    }

    function renderLiabilitiesRows() {
        const list = (store && store.liabilities) || [];
        const tbody = document.getElementById("lib-tbody");
        const wrap = document.getElementById("lib-table-wrap");
        const emptyFilter = document.getElementById("lib-empty-filter");
        const q = (document.getElementById("lib-search").value || "").trim().toLowerCase();

        const filtered = list.filter((l) => {
            const eq = isEquity(l);
            if (ui.libFilter === "obligations" && eq) return false;
            if (ui.libFilter === "equity" && !eq) return false;
            if (!q) return true;
            return [l.name, l.event, l.class, l.payment_method, l.status]
                .some((field) => String(field || "").toLowerCase().includes(q));
        });

        tbody.innerHTML = "";
        if (filtered.length === 0) {
            wrap.hidden = true;
            emptyFilter.hidden = false;
            return;
        }
        wrap.hidden = false;
        emptyFilter.hidden = true;

        filtered.forEach((liab) => {
            const eq = isEquity(liab);
            const tr = document.createElement("tr");
            tr.className = "is-clickable";
            tr.tabIndex = 0;
            tr.innerHTML = `
                <td class="td-strong">${escapeHTML(liab.name === "#!@cash@!#" ? "Caixa" : liab.name)}</td>
                <td>${escapeHTML(liab.event)}</td>
                <td class="td-muted">${escapeHTML(liab.class)}</td>
                <td class="td-date">${escapeHTML(liab.emission_date)}</td>
                <td class="td-date">${escapeHTML(liab.expiration_date)}</td>
                <td>${escapeHTML(liab.payment_method)}</td>
                <td><span class="badge ${liabilityStatusBadge(liab)}">${escapeHTML(eq ? "Patrimônio" : liab.status || "—")}</span></td>
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

    function renderLiabilities() {
        const list = (store && store.liabilities) || [];
        const obligations = list.filter((l) => !isEquity(l));
        const equityList = list.filter(isEquity);

        const sumOblig = obligations.reduce((s, l) => s + (Number(l.value) || 0), 0);
        const sumCurr = obligations.filter((l) => l.floating === true).reduce((s, l) => s + (Number(l.value) || 0), 0);
        const sumNonCurr = obligations.filter((l) => l.floating !== true).reduce((s, l) => s + (Number(l.value) || 0), 0);
        const sumEq = equityList.reduce((s, l) => s + (Number(l.value) || 0), 0);

        document.getElementById("lib-sum-obligations").textContent = formatMoney(sumOblig);
        document.getElementById("lib-sum-obligations-count").textContent =
            obligations.length === 1 ? "1 obrigação ativa" : `${obligations.length} obrigações ativas`;
        document.getElementById("lib-sum-current").textContent = formatMoney(sumCurr);
        document.getElementById("lib-sum-ncurrent").textContent = formatMoney(sumNonCurr);
        document.getElementById("lib-sum-equity").textContent = formatMoney(sumEq);

        const panel = document.getElementById("lib-table-panel");
        const emptyData = document.getElementById("lib-empty-data");
        if (list.length === 0) {
            panel.hidden = true;
            emptyData.hidden = false;
        } else {
            panel.hidden = false;
            emptyData.hidden = true;
            renderLiabilitiesRows();
        }
    }

    // =========================================================
    // 4. Render: Livro Diário
    // =========================================================
    function openJournalEntryModal(item) {
        const isAsset = item.type === "asset";
        const fullItem = isAsset
            ? ((store && store.assets) || []).find((a) => a.asset_id === item.patrimony_id)
            : ((store && store.liabilities) || []).find((l) => l.liability_id === item.patrimony_id);

        const eq = isEquity(item);
        document.getElementById("jrn-det-title").textContent = eq
            ? "Lançamento de Patrimônio Líquido"
            : isAsset
                ? "Lançamento de Ativo"
                : "Lançamento de Passivo";

        const compDate = parseIsoDate(item.date);
        document.getElementById("jrn-det-name").textContent = (fullItem && fullItem.name) || item.name || "—";
        document.getElementById("jrn-det-value").textContent = formatMoney(item.value);
        document.getElementById("jrn-det-event").textContent = item.event || "—";
        document.getElementById("jrn-det-class").textContent = item.class || "—";
        document.getElementById("jrn-det-date").textContent = formatBrDate(compDate);
        document.getElementById("jrn-det-status").textContent =
            item.ignore === true
                ? "Quitado / Estornado no histórico"
                : (fullItem && fullItem.status) || "Registrado";
        document.getElementById("jrn-det-desc").textContent =
            (fullItem && fullItem.description) || "Registro contábil escriturado no Livro Diário.";
        document.getElementById("jrn-det-dc").textContent =
            `D: ${formatMoney(item.debit)} · C: ${formatMoney(item.credit)}`;
        document.getElementById("jrn-det-uuid").textContent = item.historic_id || item.patrimony_id || "";

        const wrapPay = document.getElementById("jrn-wrap-pay");
        const wrapExp = document.getElementById("jrn-wrap-exp");
        const wrapLoc = document.getElementById("jrn-wrap-loc");
        wrapPay.hidden = true;
        wrapExp.hidden = true;
        wrapLoc.hidden = true;

        if (!isAsset && fullItem) {
            if (fullItem.payment_method) {
                document.getElementById("jrn-det-pay").textContent = fullItem.payment_method;
                wrapPay.hidden = false;
            }
            if (fullItem.expiration_date) {
                document.getElementById("jrn-det-exp").textContent = fullItem.expiration_date;
                wrapExp.hidden = false;
            }
        } else if (isAsset && fullItem && fullItem.location) {
            document.getElementById("jrn-det-loc").textContent = fullItem.location;
            wrapLoc.hidden = false;
        }

        openModal("jrn-detail-modal");
    }

    function renderJournalGroups() {
        const historic = (store && store.historic) || [];
        const groupsContainer = document.getElementById("jrn-groups");
        const emptyEl = document.getElementById("jrn-empty");
        const q = (document.getElementById("jrn-search").value || "").trim().toLowerCase();

        const nonCash = historic.filter((h) => h.name !== "#!@cash@!#");
        const filtered = nonCash.filter((h) => {
            if (ui.jrnFilter === "active" && h.ignore === true) return false;
            if (ui.jrnFilter === "asset" && (h.type !== "asset" || h.ignore === true)) return false;
            if (ui.jrnFilter === "liability" && (h.type !== "liability" || h.ignore === true)) return false;
            if (!q) return true;
            return [h.name, h.event, h.class].some((f) => String(f || "").toLowerCase().includes(q));
        });

        groupsContainer.innerHTML = "";
        if (filtered.length === 0) {
            emptyEl.hidden = false;
            return;
        }
        emptyEl.hidden = true;

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
                if (ui.jrnGroup === "day") {
                    key = `${y}-${String(m + 1).padStart(2, "0")}-${d}`;
                    title = `${d} de ${MONTHS_FULL[m]} de ${y}`;
                } else if (ui.jrnGroup === "year") {
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
                tr.addEventListener("click", () => openJournalEntryModal(item));
                tr.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openJournalEntryModal(item);
                    }
                });
                tbody.appendChild(tr);
            });
            groupsContainer.appendChild(section);
        });
    }

    function renderJournal() {
        const historic = (store && store.historic) || [];
        const nonCash = historic.filter((h) => h.name !== "#!@cash@!#");
        const activeRows = nonCash.filter((h) => h.ignore !== true);
        const archivedCount = nonCash.length - activeRows.length;

        const sumAssets = activeRows.filter((h) => h.type === "asset").reduce((s, h) => s + (Number(h.value) || 0), 0);
        const sumLiabs = activeRows
            .filter((h) => h.type === "liability" && !isEquity(h))
            .reduce((s, h) => s + (Number(h.value) || 0), 0);
        const sumEq = activeRows
            .filter((h) => h.type === "liability" && isEquity(h))
            .reduce((s, h) => s + (Number(h.value) || 0), 0);

        document.getElementById("jrn-sum-count").textContent = String(activeRows.length);
        document.getElementById("jrn-sum-archived").textContent = `${archivedCount} quitados / estornados`;
        document.getElementById("jrn-sum-assets").textContent = formatMoney(sumAssets);
        document.getElementById("jrn-sum-liabilities").textContent = formatMoney(sumLiabs);
        document.getElementById("jrn-sum-equity").textContent = formatMoney(sumEq);

        renderJournalGroups();
    }

    // =========================================================
    // 5. Render: Balancete de Verificação
    // =========================================================
    function renderTrialBalancePeriods() {
        const entries = (store && store.trial_balance && store.trial_balance.entries) || [];
        const container = document.getElementById("tb-content");
        const emptyEl = document.getElementById("tb-empty");
        const q = (document.getElementById("tb-search").value || "").trim().toLowerCase();

        const filtered = entries.filter((e) => !q || String(e.name || "").toLowerCase().includes(q));
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
                if (ui.tbView === "year") {
                    key = `${y}`;
                    title = `Exercício ${y}`;
                } else if (ui.tbView === "month") {
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

        Array.from(periods.keys())
            .sort()
            .reverse()
            .forEach((k) => {
                const period = periods.get(k);
                let totDebit = 0;
                let totCredit = 0;
                const rows = Array.from(period.accounts.entries()).sort(
                    (a, b) => (b[1].debit + b[1].credit) - (a[1].debit + a[1].credit)
                );
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

    function renderTrialBalance() {
        const entries = (store && store.trial_balance && store.trial_balance.entries) || [];
        const totD = entries.filter((e) => e.side === "debit").reduce((s, e) => s + (Number(e.value) || 0), 0);
        const totC = entries.filter((e) => e.side === "credit").reduce((s, e) => s + (Number(e.value) || 0), 0);
        const uniqueAccs = new Set(entries.map((e) => e.name)).size;

        document.getElementById("tb-sum-debit").textContent = formatMoney(totD);
        document.getElementById("tb-sum-credit").textContent = formatMoney(totC);
        document.getElementById("tb-sum-net").textContent = formatMoney(totD - totC);
        document.getElementById("tb-account-count").textContent = String(uniqueAccs);

        renderTrialBalancePeriods();
    }

    // =========================================================
    // 6. Render: Razonetes (Contas em T)
    // =========================================================
    function cleanAccountName(name) {
        return name === "#!@cash@!#" ? "Caixa" : name || "Conta";
    }

    function renderRazonetes() {
        const historicRows = (store && store.historic) || [];
        const container = document.getElementById("raz-content");
        const emptyEl = document.getElementById("raz-empty");
        const q = (document.getElementById("raz-search").value || "").trim().toLowerCase();

        container.innerHTML = "";

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
            if (dt && ui.razView === "month") {
                key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
                title = `${MONTHS_FULL[dt.getMonth()]} de ${dt.getFullYear()}`;
            } else if (dt && ui.razView === "day") {
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

        Array.from(periods.keys())
            .sort()
            .reverse()
            .forEach((key) => {
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
                        <div class="t-head"><h3>${escapeHTML(accName)}</h3></div>
                        <div class="t-cols-head"><span>Débito (D)</span><span>Crédito (C)</span></div>
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

    // =========================================================
    // 7. Render: Balanço Patrimonial
    // =========================================================
    function renderBsList(ulId, subId, items) {
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
            li.innerHTML = `<span>${escapeHTML(it.name)}</span><strong>${formatMoney(it.value)}</strong>`;
            ul.appendChild(li);
        });
        return total;
    }

    function extractBsMonthItems(categoryDict, year, month) {
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

    function renderBalanceSheetBody() {
        const bs = (store && store.balance_sheet) || {};
        const titleEl = document.getElementById("bs-period-title");

        if (ui.bsMode === "consolidated" && bs.current_position) {
            titleEl.textContent = "Posição patrimonial consolidada (vigente)";
            const cp = bs.current_position;
            const aC = renderBsList("bs-list-ativo-circ", "bs-sub-ativo-circ", cp.assets_circulante);
            const aNC = renderBsList("bs-list-ativo-ncirc", "bs-sub-ativo-ncirc", cp.assets_nao_circulante);
            const pC = renderBsList("bs-list-passivo-circ", "bs-sub-passivo-circ", cp.liabilities_circulante);
            const pNC = renderBsList("bs-list-passivo-ncirc", "bs-sub-passivo-ncirc", cp.liabilities_nao_circulante);
            const eq = renderBsList("bs-list-patrimonio", "bs-sub-patrimonio", cp.equity);

            document.getElementById("bs-total-ativo").textContent = formatMoney(aC + aNC);
            document.getElementById("bs-total-passivo-patrimonio").textContent = formatMoney(pC + pNC + eq);
            return;
        }

        const [mStr, yStr] = String(ui.bsMode).split("/");
        const month = Number(mStr);
        const year = Number(yStr);
        titleEl.textContent = `Movimentação patrimonial · ${MONTHS_FULL[month - 1] || mStr} de ${year}`;

        const aC = renderBsList("bs-list-ativo-circ", "bs-sub-ativo-circ", extractBsMonthItems((bs.assets || {}).circulante, year, month));
        const aNC = renderBsList("bs-list-ativo-ncirc", "bs-sub-ativo-ncirc", extractBsMonthItems((bs.assets || {}).nao_circulante, year, month));
        const pC = renderBsList("bs-list-passivo-circ", "bs-sub-passivo-circ", extractBsMonthItems((bs.liabilities || {}).circulante, year, month));
        const pNC = renderBsList("bs-list-passivo-ncirc", "bs-sub-passivo-ncirc", extractBsMonthItems((bs.liabilities || {}).nao_circulante, year, month));

        const patDict = ((bs.patrimony || {}).circulante) || {};
        const eqItems = extractBsMonthItems(patDict, year, month);
        const monthDiff = Math.round((aC + aNC - (pC + pNC) - eqItems.reduce((s, x) => s + x.value, 0)) * 100) / 100;
        if (Math.abs(monthDiff) >= 0.01) {
            eqItems.push({ name: "Resultado líquido do período", value: monthDiff });
        }
        const eq = renderBsList("bs-list-patrimonio", "bs-sub-patrimonio", eqItems);

        document.getElementById("bs-total-ativo").textContent = formatMoney(aC + aNC);
        document.getElementById("bs-total-passivo-patrimonio").textContent = formatMoney(pC + pNC + eq);
    }

    function renderBalanceSheet() {
        const bs = (store && store.balance_sheet) || {};
        const select = document.getElementById("bs-period-select");
        const prev = select.value || "consolidated";

        select.innerHTML = `<option value="consolidated">Posição atual consolidada</option>`;
        const uniqueMonths = Array.from(
            new Set(
                (bs.dates || []).map((d) => {
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

        if (Array.from(select.options).some((o) => o.value === prev)) {
            select.value = prev;
            ui.bsMode = prev;
        } else {
            select.value = "consolidated";
            ui.bsMode = "consolidated";
        }

        renderBalanceSheetBody();
    }

    // =========================================================
    // 8. Render: DRE
    // =========================================================
    function fillDreSublist(ulId, items) {
        const ul = document.getElementById(ulId);
        ul.innerHTML = "";
        if (!Array.isArray(items) || items.length === 0) {
            ul.innerHTML = `<li class="dre-subempty">Nenhuma conta movimentada neste grupo</li>`;
            return;
        }
        items.forEach((it) => {
            const li = document.createElement("li");
            li.className = "dre-subitem";
            li.innerHTML = `<span>${escapeHTML(it.name)}</span><strong>${formatMoney(it.value)}</strong>`;
            ul.appendChild(li);
        });
    }

    function applySignedClass(el, value, keepYellowOnFinal = false) {
        const num = Number(value) || 0;
        el.classList.remove("val-positive", "val-negative");
        if (num < 0) el.classList.add("val-negative");
        else if (num > 0 && !keepYellowOnFinal) el.classList.add("val-positive");
    }

    function renderIncomeStatement() {
        const data = (store && store.income_statement) || {};
        const gross = Number(data.brute_revenue_float) || 0;
        const deduct = Number(data.deductions_revenue_float) || 0;
        const netRev = Number(data.result_revenue) || 0;
        const sellCosts = Number(data.sell_costs_float) || 0;
        const grossProfit = Number(data.result_operational_costs) || 0;
        const opCosts = Number(data.operational_costs_float) || 0;
        const finalRes = Number(data.loss_profit) || 0;

        const totalCostsAll = deduct + sellCosts + opCosts;
        const margin = gross > 0 ? (finalRes / gross) * 100 : 0;

        document.getElementById("dre-kpi-loss-profit").textContent = formatMoney(finalRes);
        document.getElementById("dre-kpi-gross").textContent = formatMoney(gross);
        document.getElementById("dre-kpi-costs").textContent = formatMoney(totalCostsAll);
        document.getElementById("dre-kpi-margin").textContent =
            `${margin.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

        const years =
            Array.isArray(data.years) && data.years.length > 0
                ? data.years.length === 1
                    ? `Exercício ${data.years[0]}`
                    : `${data.years[0]} – ${data.years[data.years.length - 1]}`
                : "Sem movimentação";
        document.getElementById("dre-years-badge").textContent = years;
        document.getElementById("dre-kpi-period").textContent = years;

        document.getElementById("dre-brute-total").textContent = formatMoney(gross);
        document.getElementById("dre-deduct-total").textContent = deduct > 0 ? `- ${formatMoney(deduct)}` : formatMoney(0);

        const netRevEl = document.getElementById("dre-net-rev-total");
        netRevEl.textContent = formatMoney(netRev);
        applySignedClass(netRevEl, netRev);

        document.getElementById("dre-sell-total").textContent = sellCosts > 0 ? `- ${formatMoney(sellCosts)}` : formatMoney(0);

        const gpEl = document.getElementById("dre-gross-res-total");
        gpEl.textContent = formatMoney(grossProfit);
        applySignedClass(gpEl, grossProfit);

        document.getElementById("dre-op-total").textContent = opCosts > 0 ? `- ${formatMoney(opCosts)}` : formatMoney(0);

        const finalEl = document.getElementById("dre-final-total");
        finalEl.textContent = formatMoney(finalRes);
        applySignedClass(finalEl, finalRes, true);

        fillDreSublist("dre-brute-list", data.brute_revenue);
        fillDreSublist("dre-deduct-list", data.deductions_revenue);
        fillDreSublist("dre-sell-list", data.sell_costs);
        fillDreSublist("dre-op-list", data.operational_costs);
    }

    // =========================================================
    // 9. Render: Permissões da Equipe
    // =========================================================
    function renderAuthorization() {
        const userRole = store && store.user ? store.user.role : "viewer";
        const tabAuth = document.getElementById("tabAuthorization");
        const wrap = document.getElementById("auth-content-wrap");
        const restricted = document.getElementById("auth-restricted-state");

        if (userRole !== "creator") {
            if (tabAuth) tabAuth.hidden = true;
            wrap.hidden = true;
            restricted.hidden = false;
            return;
        }

        if (tabAuth) tabAuth.hidden = false;
        wrap.hidden = false;
        restricted.hidden = true;

        const members = (store && store.team_users) || [];
        document.getElementById("auth-members-title").textContent = `Membros com acesso (${members.length})`;
        const tbody = document.getElementById("auth-tbody");
        tbody.innerHTML = "";

        members.forEach((m) => {
            let roleBadge = `<span class="badge">Leitor</span>`;
            if (m.role === "creator") roleBadge = `<span class="badge badge-gold">Proprietário</span>`;
            else if (m.role === "editor") roleBadge = `<span class="badge badge-pos">Editor</span>`;
            else if (m.role === "checker") roleBadge = `<span class="badge">Conferente</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="td-strong" style="text-transform: capitalize;">
                    ${escapeHTML(m.fullname)}
                    ${m.is_self ? `<span class="you-tag">(você)</span>` : ""}
                </td>
                <td class="td-date">${escapeHTML(formatCPF(m.cpf))}</td>
                <td>${roleBadge}</td>
                <td class="num-col">
                    ${
                        m.is_self
                            ? `<span class="td-muted" style="font-size:.78rem;">Titular da sessão</span>`
                            : `<div class="row-actions">
                                   <button type="button" class="btn btn-sm btn-outline" data-auth-edit="${escapeHTML(m.cpf)}" data-auth-name="${escapeHTML(m.fullname)}" data-auth-role="${escapeHTML(m.role)}">Alterar papel</button>
                                   <button type="button" class="btn btn-sm btn-danger" data-auth-del="${escapeHTML(m.cpf)}" data-auth-name="${escapeHTML(m.fullname)}">Remover</button>
                               </div>`
                    }
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    function renderAllViews() {
        if (!store) return;
        updateHeaderChrome(activeView);
        renderOverview();
        renderAssets();
        renderLiabilities();
        renderJournal();
        renderTrialBalance();
        renderRazonetes();
        renderBalanceSheet();
        renderIncomeStatement();
        renderAuthorization();
    }

    // =========================================================
    // Eventos & Mutações
    // =========================================================
    function bindEvents() {
        // Interceptação global de links/botões SPA
        document.addEventListener("click", (e) => {
            const trigger = e.target.closest("[data-spa-view]");
            if (!trigger) return;
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
            e.preventDefault();
            switchView(trigger.dataset.spaView, { pushHistory: true });
        });

        window.addEventListener("popstate", (e) => {
            const target = (e.state && e.state.view) || resolveViewFromPath(window.location.pathname);
            switchView(target, { pushHistory: false });
        });

        // Fechar modais
        document.querySelectorAll("[data-close-modal]").forEach((btn) => {
            btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
        });
        document.querySelectorAll(".modal").forEach((m) => {
            m.addEventListener("click", (e) => {
                if (e.target === m) m.classList.remove("is-open");
            });
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeAllModals();
        });
        document.getElementById("spa-alert-close").addEventListener("click", () => closeModal("spa-alert-modal"));

        document.getElementById("spa-success-list-btn").addEventListener("click", () => {
            closeModal("spa-success-modal");
            switchView(ui.successListTarget, { pushHistory: true });
        });
        document.getElementById("spa-success-overview-btn").addEventListener("click", () => {
            closeModal("spa-success-modal");
            switchView("overview", { pushHistory: true });
        });

        // Visão Geral: toggles de gráfico e classe
        document.querySelectorAll("[data-ov-chart-mode]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.ovChartMode = btn.dataset.ovChartMode;
                document.querySelectorAll("[data-ov-chart-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderOverviewCharts(false);
            });
        });
        document.querySelectorAll("[data-ov-class-mode]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.ovClassMode = btn.dataset.ovClassMode;
                document.querySelectorAll("[data-ov-class-mode]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderOverviewClassBreakdown();
            });
        });

        // Ativos: filtros e mutações
        document.getElementById("ast-search").addEventListener("input", renderAssetsRows);
        document.querySelectorAll("[data-ast-filter]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.astFilter = btn.dataset.astFilter;
                document.querySelectorAll("[data-ast-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderAssetsRows();
            });
        });

        document.getElementById("ast-btn-edit").addEventListener("click", () => {
            if (!ui.currentAsset) return;
            document.getElementById("ast-edit-name").value = ui.currentAsset.name || "";
            document.getElementById("ast-edit-old").value = Number(ui.currentAsset.value || 0).toFixed(2);
            document.getElementById("ast-edit-new").value = "";
            openModal("ast-edit-modal");
        });

        document.getElementById("ast-btn-confirm-edit").addEventListener("click", async () => {
            if (!ui.currentAsset) return;
            const discountVal = parseFloat(document.getElementById("ast-edit-new").value);
            const oldVal = Number(ui.currentAsset.value) || 0;
            if (Number.isNaN(discountVal) || discountVal <= 0 || discountVal >= oldVal) {
                showAlert("Informe um valor maior que 0 e menor que o valor atual do ativo.");
                return;
            }
            const btn = document.getElementById("ast-btn-confirm-edit");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/update-asset/${ui.currentAsset.asset_id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ new_value: discountVal })
                });
                const result = await res.json();
                closeModal("ast-edit-modal");
                closeModal("ast-detail-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(result.message || "Valor atualizado com sucesso.");
            } catch {
                showAlert("Erro ao atualizar o valor do ativo.");
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById("ast-btn-sell").addEventListener("click", () => {
            if (ui.currentAsset) openModal("ast-sell-modal");
        });

        document.getElementById("ast-btn-confirm-sell").addEventListener("click", async () => {
            if (!ui.currentAsset) return;
            const btn = document.getElementById("ast-btn-confirm-sell");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/sell-asset/${ui.currentAsset.asset_id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const result = await res.json();
                closeModal("ast-sell-modal");
                closeModal("ast-detail-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(result.message || "Venda registrada com sucesso.");
            } catch {
                showAlert("Erro ao registrar venda do ativo.");
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById("ast-btn-delete").addEventListener("click", () => {
            if (!ui.currentAsset) return;
            if (String(ui.currentAsset.status || "").toLowerCase().includes("estornado")) {
                showAlert("Este ativo já foi estornado anteriormente.");
                return;
            }
            openModal("ast-delete-modal");
        });

        document.getElementById("ast-btn-confirm-delete").addEventListener("click", async () => {
            if (!ui.currentAsset) return;
            const btn = document.getElementById("ast-btn-confirm-delete");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/refund-asset/${ui.currentAsset.asset_id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const result = await res.json();
                closeModal("ast-delete-modal");
                closeModal("ast-detail-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(result.message || "Ativo estornado com sucesso.");
            } catch {
                showAlert("Erro ao estornar o ativo.");
            } finally {
                btn.disabled = false;
            }
        });

        // Passivos: filtros e mutações
        document.getElementById("lib-search").addEventListener("input", renderLiabilitiesRows);
        document.querySelectorAll("[data-lib-filter]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.libFilter = btn.dataset.libFilter;
                document.querySelectorAll("[data-lib-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderLiabilitiesRows();
            });
        });

        document.getElementById("lib-btn-edit").addEventListener("click", () => {
            if (!ui.currentLiability) return;
            document.getElementById("lib-edit-name").value = ui.currentLiability.name || "";
            document.getElementById("lib-edit-old").value = Number(ui.currentLiability.value || 0).toFixed(2);
            document.getElementById("lib-edit-new").value = "";
            openModal("lib-edit-modal");
        });

        document.getElementById("lib-btn-confirm-edit").addEventListener("click", async () => {
            if (!ui.currentLiability) return;
            const discountVal = parseFloat(document.getElementById("lib-edit-new").value);
            const oldVal = Number(ui.currentLiability.value) || 0;
            if (Number.isNaN(discountVal) || discountVal <= 0 || discountVal >= oldVal) {
                showAlert("Informe um valor maior que 0 e menor que o valor atual.");
                return;
            }
            const btn = document.getElementById("lib-btn-confirm-edit");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/update-liability/${ui.currentLiability.liability_id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ new_value: discountVal })
                });
                const result = await res.json();
                closeModal("lib-edit-modal");
                closeModal("lib-detail-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(result.message || "Valor atualizado com sucesso.");
            } catch {
                showAlert("Erro ao atualizar o valor do passivo.");
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById("lib-btn-settle").addEventListener("click", () => {
            if (ui.currentLiability) openModal("lib-settle-modal");
        });

        document.getElementById("lib-btn-confirm-settle").addEventListener("click", async () => {
            if (!ui.currentLiability) return;
            const btn = document.getElementById("lib-btn-confirm-settle");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/settle-liability/${ui.currentLiability.liability_id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const result = await res.json();
                closeModal("lib-settle-modal");
                closeModal("lib-detail-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(result.message || "Passivo quitado com sucesso.");
            } catch {
                showAlert("Erro ao quitar o passivo.");
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById("lib-btn-delete").addEventListener("click", () => {
            if (!ui.currentLiability) return;
            if (String(ui.currentLiability.status || "").toLowerCase().includes("estornado")) {
                showAlert("Este passivo já foi estornado anteriormente.");
                return;
            }
            openModal("lib-delete-modal");
        });

        document.getElementById("lib-btn-confirm-delete").addEventListener("click", async () => {
            if (!ui.currentLiability) return;
            const btn = document.getElementById("lib-btn-confirm-delete");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/refund-liability/${ui.currentLiability.liability_id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const result = await res.json();
                closeModal("lib-delete-modal");
                closeModal("lib-detail-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(result.message || "Passivo estornado com sucesso.");
            } catch {
                showAlert("Erro ao estornar o passivo.");
            } finally {
                btn.disabled = false;
            }
        });

        // Formulário: Registrar Ativo
        const raForm = document.getElementById("ra-form");
        const raValue = document.getElementById("ra-value");
        raValue.addEventListener("input", function () {
            this.value = formatCurrencyInput(this.value);
        });
        raForm.querySelectorAll(".input, .select-input, .textarea-input").forEach((el) => {
            const clear = () => {
                el.classList.remove("is-invalid");
                const err = document.getElementById("err-" + el.id);
                if (err) err.textContent = "";
            };
            el.addEventListener("input", clear);
            el.addEventListener("change", clear);
        });

        raForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            raForm.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
            raForm.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));

            const fail = (id, msg) => {
                const el = document.getElementById(id);
                const err = document.getElementById("err-" + id);
                if (el) el.classList.add("is-invalid");
                if (err) err.textContent = msg;
                return false;
            };

            let ok = true;
            const name = document.getElementById("ra-name").value.trim();
            const rawVal = raValue.value.trim().replace(/[^\d,-]/g, "").replace(",", ".");
            const numVal = parseFloat(rawVal);
            const floating = document.getElementById("ra-floating").value.trim();
            const ev = document.getElementById("ra-event").value.trim();
            const cls = document.getElementById("ra-class").value.trim();
            const status = document.getElementById("ra-status").value.trim();
            const acqDate = document.getElementById("ra-date").value.trim();
            const pay = document.getElementById("ra-payment").value.trim();
            const inst = document.getElementById("ra-installment").value.trim();
            const desc = document.getElementById("ra-description").value.trim();

            if (name.length < 3) ok = fail("ra-name", "Informe um nome com ao menos 3 caracteres.");
            if (Number.isNaN(numVal) || numVal <= 0) ok = fail("ra-value", "Informe um valor maior que zero.");
            if (!floating) ok = fail("ra-floating", "Selecione a classificação.");
            if (!ev) ok = fail("ra-event", "Selecione o evento.");
            if (!cls) ok = fail("ra-class", "Selecione a classe.");
            if (!status) ok = fail("ra-status", "Selecione o status.");
            if (!acqDate) ok = fail("ra-date", "Informe a data de aquisição.");
            if (!pay) ok = fail("ra-payment", "Selecione a forma de pagamento.");
            if (!inst) ok = fail("ra-installment", "Selecione o parcelamento.");
            if (desc.length > 255) ok = fail("ra-description", "Máximo de 255 caracteres.");
            if (!ok) return;

            const btn = document.getElementById("ra-submit");
            const btnTxt = document.getElementById("ra-submit-text");
            btn.disabled = true;
            btnTxt.textContent = "Registrando...";

            try {
                const res = await fetch(`/dashboard/register/asset/${cnpj}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cnpj,
                        event: ev,
                        classe: cls,
                        name,
                        floating,
                        localization: document.getElementById("ra-location").value.trim() || "Não informada",
                        acquisitionDate: acqDate,
                        acquisitionValue: rawVal,
                        status,
                        description: desc || "Sem observações.",
                        installment: inst,
                        payment_method: pay
                    })
                });

                if (res.ok) {
                    raForm.reset();
                    await refreshSnapshot();
                    showSuccess("Ativo registrado", "Ativo registrado e contabilizado com sucesso.", "assets", "Ver lista de ativos");
                } else {
                    const errData = await res.json().catch(() => ({}));
                    showAlert(errData.message || "Não foi possível registrar o ativo.");
                }
            } catch {
                showAlert("Erro de conexão ao enviar os dados. Tente novamente.");
            } finally {
                btn.disabled = false;
                btnTxt.textContent = "Registrar ativo";
            }
        });

        // Formulário: Registrar Passivo
        const rlForm = document.getElementById("rl-form");
        const rlValue = document.getElementById("rl-value");
        rlValue.addEventListener("input", function () {
            this.value = formatCurrencyInput(this.value);
        });
        rlForm.querySelectorAll(".input, .select-input, .textarea-input").forEach((el) => {
            const clear = () => {
                el.classList.remove("is-invalid");
                const err = document.getElementById("err-" + el.id);
                if (err) err.textContent = "";
            };
            el.addEventListener("input", clear);
            el.addEventListener("change", clear);
        });

        rlForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            rlForm.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
            rlForm.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));

            const fail = (id, msg) => {
                const el = document.getElementById(id);
                const err = document.getElementById("err-" + id);
                if (el) el.classList.add("is-invalid");
                if (err) err.textContent = msg;
                return false;
            };

            let ok = true;
            const name = document.getElementById("rl-name").value.trim();
            const rawVal = rlValue.value.trim().replace(/[^\d,-]/g, "").replace(",", ".");
            const numVal = parseFloat(rawVal);
            const floating = document.getElementById("rl-floating").value.trim();
            const ev = document.getElementById("rl-event").value.trim();
            const cls = document.getElementById("rl-class").value.trim();
            const emission = document.getElementById("rl-emission").value.trim();
            const expiration = document.getElementById("rl-expiration").value.trim();
            const status = document.getElementById("rl-status").value.trim();
            const pay = document.getElementById("rl-payment").value.trim();
            const inst = document.getElementById("rl-installment").value.trim();
            const desc = document.getElementById("rl-description").value.trim();

            if (name.length < 3) ok = fail("rl-name", "Informe ao menos 3 caracteres.");
            if (Number.isNaN(numVal) || numVal <= 0) ok = fail("rl-value", "Informe um valor maior que zero.");
            if (!floating) ok = fail("rl-floating", "Selecione a classificação.");
            if (!ev) ok = fail("rl-event", "Selecione o evento.");
            if (!cls) ok = fail("rl-class", "Selecione a categoria.");
            if (!emission) ok = fail("rl-emission", "Informe a data de emissão.");
            if (!expiration) ok = fail("rl-expiration", "Informe a data de vencimento.");
            else if (emission && expiration < emission) ok = fail("rl-expiration", "O vencimento não pode ser anterior à emissão.");
            if (!status) ok = fail("rl-status", "Selecione a situação.");
            if (!pay) ok = fail("rl-payment", "Selecione a forma de pagamento.");
            if (!inst) ok = fail("rl-installment", "Selecione o parcelamento.");
            if (desc.length > 255) ok = fail("rl-description", "Máximo de 255 caracteres.");
            if (!ok) return;

            const btn = document.getElementById("rl-submit");
            const btnTxt = document.getElementById("rl-submit-text");
            btn.disabled = true;
            btnTxt.textContent = "Registrando...";

            try {
                const res = await fetch(`/dashboard/register/liability/${cnpj}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        cnpj,
                        event: ev,
                        classe: cls,
                        payment_method: pay,
                        installment: inst,
                        floating,
                        status,
                        name,
                        value: rawVal,
                        emission_date: emission,
                        expiration_date: expiration,
                        description: desc || "Sem observações."
                    })
                });

                if (res.ok) {
                    rlForm.reset();
                    await refreshSnapshot();
                    showSuccess("Passivo registrado", "Passivo registrado e contabilizado com sucesso.", "liabilities", "Ver passivos");
                } else {
                    const errData = await res.json().catch(() => ({}));
                    showAlert(errData.message || "Não foi possível registrar o passivo.");
                }
            } catch {
                showAlert("Erro de conexão ao enviar os dados. Tente novamente.");
            } finally {
                btn.disabled = false;
                btnTxt.textContent = "Registrar passivo";
            }
        });

        // Livro Diário: busca e agrupamento
        document.getElementById("jrn-search").addEventListener("input", renderJournalGroups);
        document.querySelectorAll("[data-jrn-filter]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.jrnFilter = btn.dataset.jrnFilter;
                document.querySelectorAll("[data-jrn-filter]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderJournalGroups();
            });
        });
        document.querySelectorAll("[data-jrn-group]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.jrnGroup = btn.dataset.jrnGroup;
                document.querySelectorAll("[data-jrn-group]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderJournalGroups();
            });
        });

        // Balancete: busca e recorte
        document.getElementById("tb-search").addEventListener("input", renderTrialBalancePeriods);
        document.querySelectorAll("[data-tb-view]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.tbView = btn.dataset.tbView;
                document.querySelectorAll("[data-tb-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderTrialBalancePeriods();
            });
        });

        // Razonete: busca e recorte
        document.getElementById("raz-search").addEventListener("input", renderRazonetes);
        document.querySelectorAll("[data-raz-view]").forEach((btn) => {
            btn.addEventListener("click", () => {
                ui.razView = btn.dataset.razView;
                document.querySelectorAll("[data-raz-view]").forEach((b) => b.classList.toggle("is-active", b === btn));
                renderRazonetes();
            });
        });

        // Balanço Patrimonial: seletor de competência
        const bsSelect = document.getElementById("bs-period-select");
        bsSelect.addEventListener("change", () => {
            ui.bsMode = bsSelect.value;
            renderBalanceSheetBody();
        });

        // DRE: sanfonas expansíveis
        document.querySelectorAll(".dre-toggle").forEach((btn) => {
            btn.addEventListener("click", () => {
                const list = btn.nextElementSibling;
                if (!list) return;
                const collapsed = list.classList.toggle("is-collapsed");
                btn.setAttribute("aria-expanded", String(!collapsed));
            });
        });

        // Permissões: busca CPF, edição e remoção
        const cpfInput = document.getElementById("auth-cpf-search");
        cpfInput.addEventListener("input", (e) => {
            e.target.value = maskCPFInput(e.target.value);
        });

        document.getElementById("auth-add-btn").addEventListener("click", async () => {
            const digits = cpfInput.value.replace(/\D/g, "");
            if (!verifyCPF(digits)) {
                showAlert("Informe um CPF válido (11 dígitos) para buscar o usuário.");
                return;
            }
            const btn = document.getElementById("auth-add-btn");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/company/${cnpj}/authorization`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "search", data: { cpf: digits, permission: "viewer" } })
                });
                const data = await res.json();
                if (data.result) {
                    ui.authEditMode = false;
                    ui.authTargetCpf = digits;
                    document.getElementById("auth-perm-title").textContent = "Conceder acesso";
                    document.getElementById("auth-perm-name").value = data.result.fullname || "Usuário localizado";
                    document.getElementById("auth-perm-cpf").value = formatCPF(digits);
                    document.getElementById("auth-perm-role").value = "viewer";
                    openModal("auth-perm-modal");
                } else {
                    showAlert(data.message || "Nenhum usuário cadastrado com este CPF.");
                }
            } catch {
                showAlert("Erro ao consultar o CPF. Tente novamente.");
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById("auth-tbody").addEventListener("click", (e) => {
            const editBtn = e.target.closest("[data-auth-edit]");
            if (editBtn) {
                ui.authEditMode = true;
                ui.authTargetCpf = String(editBtn.dataset.authEdit || "").replace(/\D/g, "");
                document.getElementById("auth-perm-title").textContent = "Alterar nível de acesso";
                document.getElementById("auth-perm-name").value = editBtn.dataset.authName || "";
                document.getElementById("auth-perm-cpf").value = formatCPF(ui.authTargetCpf);
                document.getElementById("auth-perm-role").value = editBtn.dataset.authRole || "viewer";
                openModal("auth-perm-modal");
                return;
            }
            const delBtn = e.target.closest("[data-auth-del]");
            if (delBtn) {
                ui.authTargetCpf = String(delBtn.dataset.authDel || "").replace(/\D/g, "");
                const uName = delBtn.dataset.authName || "este usuário";
                document.getElementById("auth-remove-text").textContent =
                    `Deseja revogar o acesso de ${uName} ao painel desta empresa?`;
                openModal("auth-remove-modal");
            }
        });

        document.getElementById("auth-btn-confirm-perm").addEventListener("click", async () => {
            const permission = document.getElementById("auth-perm-role").value;
            const action = ui.authEditMode ? "update_permission" : "add";
            const btn = document.getElementById("auth-btn-confirm-perm");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/company/${cnpj}/authorization`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action, data: { cpf: ui.authTargetCpf, permission } })
                });
                const data = await res.json();
                closeModal("auth-perm-modal");
                cpfInput.value = "";
                if (res.ok) await refreshSnapshot();
                showAlert(data.message || "Permissão salva com sucesso.");
            } catch {
                showAlert("Erro ao atualizar a permissão.");
            } finally {
                btn.disabled = false;
            }
        });

        document.getElementById("auth-btn-confirm-remove").addEventListener("click", async () => {
            const btn = document.getElementById("auth-btn-confirm-remove");
            btn.disabled = true;
            try {
                const res = await fetch(`/dashboard/company/${cnpj}/authorization`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "delete", data: { cpf: ui.authTargetCpf } })
                });
                const data = await res.json();
                closeModal("auth-remove-modal");
                if (res.ok) await refreshSnapshot();
                showAlert(data.message || "Acesso revogado com sucesso.");
            } catch {
                showAlert("Erro ao revogar o acesso.");
            } finally {
                btn.disabled = false;
            }
        });
    }

    // =========================================================
    // Inicialização síncrona sobre o JSON embutido (0ms wait)
    // =========================================================
    document.addEventListener("DOMContentLoaded", () => {
        const snapEl = document.getElementById("initialSnapshot");
        if (snapEl && snapEl.textContent) {
            try {
                store = JSON.parse(snapEl.textContent);
            } catch (err) {
                console.error("Erro ao ler snapshot inicial:", err);
            }
        }

        window.history.replaceState({ view: activeView }, "", window.location.pathname);
        bindEvents();
        renderAllViews();
        switchView(activeView, { pushHistory: false });
    });
})();
