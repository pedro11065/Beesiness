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

    function formatValueToMoney(mode,valueStr) {
        if (valueStr != 0 && mode == 0) {
            const valueNum = parseFloat(valueStr);
            return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        if(mode == 1){
            const valueNum = parseFloat(valueStr);
            return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        return '----';
    }

    function CashName(nameStr) {
        return nameStr == '#!@cash@!#' ? 'Caixa' : nameStr;
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

        loading.style.display = 'none';
        main.style.display = 'flex';

        if (data.historic) {

            const groupedByMonth = {};

            data.historic.forEach(item => {
                const month = new Date(item.creation_date).toLocaleString('pt-BR', { month: 'long' });
                const day = formatDateToBrazilian(item.creation_date);

                if (!groupedByMonth[month]) {
                    groupedByMonth[month] = {};
                }

                if (!groupedByMonth[month][day]) {
                    groupedByMonth[month][day] = [];
                }

                groupedByMonth[month][day].push(item);
            });

            Object.keys(groupedByMonth).forEach(month => {
                const monthDiv = document.createElement('section');
                monthDiv.className = 'month-container';

                    monthDiv.innerHTML = `

                        <header class="month-title-container" id="month-title-container">
                            
                            <article class="month-title-box">

                                <div class="month-box">
                                    <h1>${month}</h1>
                                </div>

                                <div class="month-box">
                                    <h1>R$ ----</h1>
                                </div>

                            </article>

                        </header>
                    `;

                    let totalConta = 0, totalDebito = 0, totalCredito = 0;

                    Object.keys(groupedByMonth[month]).forEach(day => {

                        const dayDiv = document.createElement('article');
                        dayDiv.className = 'day-container';

                        const dailyDebito = groupedByMonth[month][day].reduce((acc, item) => acc + parseFloat(item.debit), 0);
                        const dailyCredito = groupedByMonth[month][day].reduce((acc, item) => acc + parseFloat(item.credit), 0);

                        totalDebito += dailyDebito;
                        totalCredito += dailyCredito;

                        dayDiv.innerHTML = `
                            <header class="day-title-container">
                                <div class="title-box">
                                    <h3>${day}</h3>
                                </div>
                                <div class="title-box">
                                    <h3>${formatValueToMoney(1,groupedByMonth[month][day].reduce((acc, item) => acc + parseFloat(item.debit), 0) - groupedByMonth[month][day].reduce((acc, item) => acc + parseFloat(item.credit), 0))}</h3>
                                </div>
                            </header>
                        `;

                        const balanceDiv = document.createElement('main');
                        balanceDiv.className = 'balance-container';

                        balanceDiv.innerHTML = `
                            <section class="accounts-container">
                                <header class="account-title">
                                    <h1>Conta</h1>
                                </header>
                                ${groupedByMonth[month][day].map(item => `
                                    <div class="data_box">${CashName(item.name)}</div>
                                `).join('')}
                                <!-- Adicionar linha final para total da Conta -->
                                <div class="data_box total-row">Total</div>
                            </section>

                            <section class="accounts-container">
                                <header class="debtor-title">
                                    <h1>Débito</h1>
                                </header>
                                ${groupedByMonth[month][day].map(item => `
                                    <div class="data_box">${formatValueToMoney(0,item.debit)}</div>
                                `).join('')}
                                <!-- Adicionar linha final para total de Débito -->
                                <div class="data_box total-row">${formatValueToMoney(0,dailyDebito)}</div>
                            </section>

                            <section class="accounts-container">
                                <header class="creditor-title">
                                    <h1>Crédito</h1>
                                </header>
                                ${groupedByMonth[month][day].map(item => `
                                    <div class="data_box">${formatValueToMoney(0,item.credit)}</div>
                                `).join('')}
                                <div class="data_box total-row">${formatValueToMoney(0,dailyCredito)}</div>
                            </section>
                        `;

                        dayDiv.appendChild(balanceDiv);
                    monthDiv.appendChild(dayDiv);
                });

                main.appendChild(monthDiv);
            });
        } else {
            console.error('Nenhum ativo encontrado!');
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
});
