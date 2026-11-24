document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const loading = document.getElementById('loading');
    const dayBtn = document.getElementById('day-btn');
    const monthBtn = document.getElementById('month-btn');

    let currentView = 'month'; // Default view is by month

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    function formatValueToMoney(value) {
        if(value <= 0) return '---';
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    // Agrupa por mês, depois por dia dentro de cada mês
    function groupByMonthAndDay(data) {
        const grouped = {};
        const processEntries = (entries, type) => {
            Object.keys(entries).forEach(account => {
                entries[account].forEach(item => {
                    const date = new Date(item.date);
                    date.setHours(date.getHours() + 3); // Ajuste para o horário de Brasília
                    const month = date.toLocaleString('pt-BR', { month: 'long' });
                    const day = date.getDate();

                    if (!grouped[month]) {
                        grouped[month] = {};
                    }

                    if (!grouped[month][day]) {
                        grouped[month][day] = { accounts: {}, totalAssets: 0, totalLiabilities: 0 };
                    }

                    if (!grouped[month][day].accounts[account]) {
                        grouped[month][day].accounts[account] = { debit: 0, credit: 0 };
                    }

                    if (type === 'assets') {
                        grouped[month][day].accounts[account].debit += item.value;
                        grouped[month][day].totalAssets += item.value;
                    } else {
                        grouped[month][day].accounts[account].credit += item.value;
                        grouped[month][day].totalLiabilities += item.value;
                    }
                });
            });
        };

        processEntries(data.assets, 'assets');
        processEntries(data.liabilities, 'liabilities');
        return grouped;
    }

    function groupByMonth(data) {
        const grouped = {};
        const processEntries = (entries, type) => {
            Object.keys(entries).forEach(account => {
                entries[account].forEach(item => {
                    const date = new Date(item.date);
                    date.setHours(date.getHours() + 3); // Ajuste para o horário de Brasília
                    const month = date.toLocaleString('pt-BR', { month: 'long' });

                    if (!grouped[month]) {
                        grouped[month] = { accounts: {}, totalAssets: 0, totalLiabilities: 0 };
                    }

                    if (!grouped[month].accounts[account]) {
                        grouped[month].accounts[account] = { debit: 0, credit: 0 };
                    }

                    if (type === 'assets') {
                        grouped[month].accounts[account].debit += item.value;
                        grouped[month].totalAssets += item.value;
                    } else {
                        grouped[month].accounts[account].credit += item.value;
                        grouped[month].totalLiabilities += item.value;
                    }
                });
            });
        };

        processEntries(data.assets, 'assets');
        processEntries(data.liabilities, 'liabilities');
        return grouped;
    }

    function renderDataByMonthAndDay(groupedData) {
        main.innerHTML = ''; // Limpa o conteúdo antes de renderizar

        console.log(groupedData)

        Object.keys(groupedData).forEach(month => {
            const monthDiv = document.createElement('section');
            monthDiv.className = 'month-container';

            // Cabeçalho do mês
            monthDiv.innerHTML = `
                <header class="month-title-container">
                    <div class="month-box">
                        <h1>${month.charAt(0).toUpperCase() + month.slice(1)}</h1>
                    </div>
                </header>
            `;

            // Agrupar os dados por dia
            Object.keys(groupedData[month]).forEach(day => {
                const { accounts, totalAssets, totalLiabilities } = groupedData[month][day];
                const dayDiv = document.createElement('section');
                dayDiv.className = 'day-container';

                // Cabeçalho do dia
                dayDiv.innerHTML = `
                    <header class="day-title-container">
                        <div class="day-box">
                            <h2>Dia ${day.padStart(2, '0')}</h2>
                        </div>
                    </header>
                `;

                // Corpo do dia
                function renderAccounts(accounts, totalAssets, totalLiabilities) {
                    return `
                        <section class="accounts-container">
                            <header class="account-title">
                                <h2>Contas</h2>
                            </header>
                            ${Object.entries(accounts)
                                .map(([name, { debit, credit }]) => `
                                    <div class="data_box">${name}</div>
                                `).join('')}
                            <div class="data_box total-row">Total</div>
                        </section>

                        <section class="accounts-container">
                            <header class="debtor-title">
                                <h2>Débito</h2>
                            </header>
                            ${Object.entries(accounts)
                                .map(([name, { debit }]) => `
                                    <div class="data_box">${formatValueToMoney(debit)}</div>
                                `).join('')}
                            <div class="data_box total-row">${formatValueToMoney(totalAssets)}</div>
                        </section>

                        <section class="accounts-container">
                            <header class="creditor-title">
                                <h2>Crédito</h2>
                            </header>
                            ${Object.entries(accounts)
                                .map(([name, { credit }]) => `
                                    <div class="data_box">${formatValueToMoney(credit)}</div>
                                `).join('')}
                            <div class="data_box total-row">${formatValueToMoney(totalLiabilities)}</div>
                        </section>
                    `;
                }

                const balanceDiv = document.createElement('main');
                balanceDiv.className = 'balance-container';
                balanceDiv.innerHTML = renderAccounts(accounts, totalAssets, totalLiabilities);
                dayDiv.appendChild(balanceDiv);
                monthDiv.appendChild(dayDiv);
            });

            main.appendChild(monthDiv);
        });
    }

    function renderDataByMonth(groupedData) {
        main.innerHTML = ''; // Limpa o conteúdo antes de renderizar

        Object.keys(groupedData).forEach(month => {
            const { accounts, totalAssets, totalLiabilities } = groupedData[month];
            const monthDiv = document.createElement('section');
            monthDiv.className = 'month-container';

            // Cabeçalho do mês
            monthDiv.innerHTML = `
                <header class="month-title-container">
                    <div class="month-box">
                        <h1>${month.charAt(0).toUpperCase() + month.slice(1)}</h1>
                    </div>
                    <div class="month-box">
                        <h1>${formatValueToMoney(totalAssets - totalLiabilities)}</h1>
                    </div>
                </header>
            `;

            function renderAccounts(accounts, totalAssets, totalLiabilities) {
                return `
                    <section class="accounts-container">
                        <header class="account-title">
                            <h2>Contas</h2>
                        </header>
                        ${Object.entries(accounts)
                            .map(([name, { debit, credit }]) => `
                                <div class="data_box">${name}</div>
                            `).join('')}
                        <div class="data_box total-row">Total</div>
                    </section>

                    <section class="accounts-container">
                        <header class="debtor-title">
                            <h2>Débito</h2>
                        </header>
                        ${Object.entries(accounts)
                            .map(([name, { debit }]) => `
                                <div class="data_box">${formatValueToMoney(debit)}</div>
                            `).join('')}
                        <div class="data_box total-row">${formatValueToMoney(totalAssets)}</div>
                    </section>

                    <section class="accounts-container">
                        <header class="creditor-title">
                            <h2>Crédito</h2>
                        </header>
                        ${Object.entries(accounts)
                            .map(([name, { credit }]) => `
                                <div class="data_box">${formatValueToMoney(credit)}</div>
                            `).join('')}
                        <div class="data_box total-row">${formatValueToMoney(totalLiabilities)}</div>
                    </section>
                `;
            }

            const balanceDiv = document.createElement('main');
            balanceDiv.className = 'balance-container';
            balanceDiv.innerHTML = renderAccounts(accounts, totalAssets, totalLiabilities);
            monthDiv.appendChild(balanceDiv);
            main.appendChild(monthDiv);
        });
    }

    async function fetchData() {
        try {
            const cnpj = getCnpjFromUrl();
            const response = await fetch(`/dashboard/trial-balance/${cnpj}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
    
    
            const data = await response.json();

            loading.style.display = 'none';

            // Agrupar os dados de acordo com a visualização escolhida
            let groupedData;
            if (currentView === 'month') {
                groupedData = groupByMonth(data);
                renderDataByMonth(groupedData);
            } else {
                groupedData = groupByMonthAndDay(data);
                renderDataByMonthAndDay(groupedData);
            }
        } catch (error) {
            console.error("Erro ao carregar os dados:", error);
        }
    }

    dayBtn.addEventListener('click', () => {
        currentView = 'day';
        fetchData();
    });

    monthBtn.addEventListener('click', () => {
        currentView = 'month';
        fetchData();
    });

    // Inicializa a página com os dados do mês
    fetchData();
});
