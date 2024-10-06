document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    function formatDateToBrazilian(dateStr) {
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('pt-BR', { month: 'long' });
        const year = date.getFullYear();
        return `${day} de ${month} de ${year}`;
    }

    function formatValueToMoney(mode, valueStr) {
        if (valueStr != 0 && mode == 0) {
            const valueNum = parseFloat(valueStr);
            return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }

        if (mode == 1) {
            const valueNum = parseFloat(valueStr);
            return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        
        return '----';
    }

    function CashName(nameStr) {
        return nameStr === '#!@cash@!#' ? 'Caixa' : nameStr;
    }

    const cnpj = getCnpjFromUrl();

    loading.style.display = 'block';
    main.style.display = 'none';

    try {
        const response = await fetch(`/dashboard/balance/${cnpj}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        console.log(data);

        loading.style.display = 'none';
        main.style.display = 'flex';

        if (data.historic) {
            const groupedByDay = {};

            // Agrupar dados por data e classe
            data.historic.forEach(item => {
                //const day = item.date; // Usa a data definida pelo usuário de quando o item foi lançado.
                const day = item.creation_date; // Usa a data do dia de criação para o agrupamento.
                
                if (!groupedByDay[day]) {
                    groupedByDay[day] = {};
                }

                if (!groupedByDay[day][item.class]) {
                    groupedByDay[day][item.class] = {
                        credit: 0,
                        debit: 0,
                        name: CashName(item.class),
                        events: []
                    };
                }

                // Somar os débitos e créditos do mesmo dia e classe
                groupedByDay[day][item.class].credit += parseFloat(item.credit);
                groupedByDay[day][item.class].debit += parseFloat(item.debit);
                groupedByDay[day][item.class].events.push(item);
            });

            const groupedByMonth = {};

            Object.keys(groupedByDay).forEach(day => {
                const creationDate = new Date(day);
                const month = creationDate.toLocaleString('pt-BR', { month: 'long' });
                const formattedDay = formatDateToBrazilian(day);

                if (!groupedByMonth[month]) {
                    groupedByMonth[month] = {};
                }

                groupedByMonth[month][formattedDay] = groupedByDay[day];
            });

            Object.keys(groupedByMonth).forEach(month => {
                const monthDiv = document.createElement('section');
                monthDiv.className = 'month-container';

                monthDiv.innerHTML = `
                    <header class="month-title-container" id="month-title-container">
                        <article class="month-title-box">
                            <div class="month-box">
                                <h1>${month.charAt(0).toUpperCase() + month.slice(1)}</h1>
                            </div>
                            <div class="month-box">
                                <h1> R$ ---</h1>
                            </div>
                        </article>
                    </header>
                `;

                let totalDebito = 0, totalCredito = 0;

                Object.keys(groupedByMonth[month]).forEach(day => {
                    const dayDiv = document.createElement('article');
                    dayDiv.className = 'day-container';

                    const dailyData = Object.values(groupedByMonth[month][day]);

                    const dailyDebito = dailyData.reduce((acc, item) => acc + item.debit, 0);
                    const dailyCredito = dailyData.reduce((acc, item) => acc + item.credit, 0);

                    totalDebito += dailyDebito;
                    totalCredito += dailyCredito;

                    dayDiv.innerHTML = `
                        <header class="day-title-container">
                            <div class="title-box">
                                <h3>${day}</h3>
                            </div>
                            <div class="title-box">
                                <h3>${formatValueToMoney(1, Math.abs(dailyDebito - dailyCredito))}</h3>
                            </div>
                        </header>
                    `;

                    const balanceDiv = document.createElement('main');
                    balanceDiv.className = 'balance-container';

                    balanceDiv.innerHTML = `
                        <section class="accounts-container">
                            <header class="account-title">
                                <h2>Conta</h2>
                            </header>
                            ${dailyData.map(item => `
                                <div class="data_box">${item.name}</div>
                            `).join('')}
                            <div class="data_box total-row">Total</div>
                        </section>

                        <section class="accounts-container">
                            <header class="debtor-title">
                                <h2>Débito</h2>
                            </header>
                            ${dailyData.map(item => `
                                <div class="data_box">${formatValueToMoney(0, item.debit)}</div>
                            `).join('')}
                            <div class="data_box total-row">${formatValueToMoney(0, dailyDebito)}</div>
                        </section>

                        <section class="accounts-container">
                            <header class="creditor-title">
                                <h2>Crédito</h2>
                            </header>
                            ${dailyData.map(item => `
                                <div class="data_box">${formatValueToMoney(0, item.credit)}</div>
                            `).join('')}
                            <div class="data_box total-row">${formatValueToMoney(0, dailyCredito)}</div>
                        </section>
                    `;

                    dayDiv.appendChild(balanceDiv);
                    monthDiv.appendChild(dayDiv);
                });

                main.appendChild(monthDiv);
            });
        }
    } catch (error) {
        console.error(error);
    }
});
