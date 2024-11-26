document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const loading = document.getElementById('loading');

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

    function generatePDF() {
        /*
            Há um pequeno problema: Os traços, as vezes eles são tão grandes que vão sozinhos para outra página do pdf.
            Ele não mostra o container: day-container
        */
        const element = document.getElementById('main'); // O elemento que desejamos converter em PDF
        const options = {
            margin: 0.5,
            filename: 'balancete.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(element).set(options).save();

        //Botão chamando função: <button onclick="generatePDF()">Gerar PDF</button>
    }


    const cnpj = getCnpjFromUrl();

    loading.style.display = 'flex';
    main.style.display = 'none';

    try {
        const response = await fetch(`/dashboard/trial-balance/${cnpj}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        console.log(data)

        loading.style.display = 'none';
        main.style.display = 'flex';

        //groupedByDay(data);
        groupedByMonth(data)

        const daybtn = document.getElementById('day-btn');
        const monthbtn = document.getElementById('month-btn');
        const yearbtn = document.getElementById('year-btn');



        daybtn.addEventListener('click', async (event) => {
            event.preventDefault();
            main.innerHTML = '';
            groupedByDay(data)

        });

        monthbtn.addEventListener('click', async (event) => {
            event.preventDefault();
            main.innerHTML = '';
            groupedByMonth(data)


        });


        yearbtn.addEventListener('click', async (event) => {
            event.preventDefault();

        });

    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }



    function groupedByDay(data) { // Agrupando por dia

        if (data.historic) {
            const groupedByDay = {};

            // Agrupar dados por data e classe
            data.historic.forEach(item => {
                const day = item.date; // Usa a data definida pelo usuário de quando o item foi lançado.
                //const day = item.creation_date; // Usa a data do dia de criação para o agrupamento.

                if (!groupedByDay[day]) {
                    groupedByDay[day] = {};
                }

                if (!groupedByDay[day][item.name]) {
                    groupedByDay[day][item.name] = {
                        credit: 0,
                        debit: 0,
                        name: CashName(item.name),
                        events: []
                    };
                }

                const credit = parseFloat(item.credit) || 0;
                const debit = parseFloat(item.debit) || 0;

                // Somar os débitos e créditos do mesmo dia e classe
                groupedByDay[day][item.name].credit += credit;
                groupedByDay[day][item.name].debit += debit;
                groupedByDay[day][item.name].events.push(item);
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
                    console.log(dailyData.map(item => item.name))
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
        } else {
            const noDataDiv = document.createElement('div');
            noDataDiv.innerHTML = `<div class="error"><h1>Sem dados disponíveis.</h1></div>`;
            main.appendChild(noDataDiv);
        }
    }

    function groupedByMonth(data) {
        if (data.historic) {
            const ByMonth = {};

            // Agrupar dados por mês e classe
            data.historic.forEach(item => {
                const creationDate = new Date(item.date); // Usa a data de criação para o agrupamento
                const month = creationDate.toLocaleString('pt-BR', { month: 'long' });

                if (!ByMonth[month]) {
                    ByMonth[month] = {
                        credit: 0,
                        debit: 0,
                        accounts: {}
                    };
                }

                if (!ByMonth[month].accounts[item.name]) {
                    ByMonth[month].accounts[item.name] = {
                        credit: 0,
                        debit: 0,
                        name: CashName(item.name),
                        events: []
                    };
                }

                // Somar os débitos e créditos do mês e da classe
                ByMonth[month].accounts[item.name].credit += parseFloat(item.credit);
                ByMonth[month].accounts[item.name].debit += parseFloat(item.debit);
                ByMonth[month].accounts[item.name].events.push(item);

                // Somar os totais mensais
                ByMonth[month].credit += parseFloat(item.credit);
                ByMonth[month].debit += parseFloat(item.debit);
            });

            // Exibir os dados agrupados por mês
            Object.keys(ByMonth).forEach(month => {
                const monthDiv = document.createElement('section');
                monthDiv.className = 'month-container';

                // Exibir título do mês
                monthDiv.innerHTML = `
                <header class="month-title-container" id="month-title-container">
                        <div class="month-box">
                            <h1>${month.charAt(0).toUpperCase() + month.slice(1)}</h1>
                        </div>
                        <div class="month-box">
                            <h1>${formatValueToMoney(1, ByMonth[month].credit - ByMonth[month].debit)}</h1>
                        </div>
                </header>
            `;

                // Variáveis para somar o total de débito e crédito do mês
                let totalDebito = 0, totalCredito = 0;

                const balanceDiv = document.createElement('main');
                balanceDiv.className = 'balance-container'; // OBS: Adicionar o fundo: day-container, contudo, quebra os dados.
                balanceDiv.id = 'balance-container';

                // Seção de contas
                const accountEntries = Object.values(ByMonth[month].accounts);
                balanceDiv.innerHTML = `
                <section class="accounts-container">
                    <header class="account-title">
                        <h2>Conta</h2>
                    </header>
                    ${accountEntries.map(account => `
                        <div class="data_box">${account.name}</div>
                    `).join('')}
                    <div class="data_box total-row">Total</div>
                </section>

                <section class="accounts-container">
                    <header class="debtor-title">
                        <h2>Débito</h2>
                    </header>
                    ${accountEntries.map(account => {
                    totalDebito += account.debit;
                    return `<div class="data_box">${formatValueToMoney(0, account.debit)}</div>`;
                }).join('')}
                    <div class="data_box total-row">${formatValueToMoney(0, totalDebito)}</div>
                </section>

                <section class="accounts-container">
                    <header class="creditor-title">
                        <h2>Crédito</h2>
                    </header>
                    ${accountEntries.map(account => {
                    totalCredito += account.credit;
                    return `<div class="data_box">${formatValueToMoney(0, account.credit)}</div>`;
                }).join('')}
                    <div class="data_box total-row">${formatValueToMoney(0, totalCredito)}</div>
                </section>
            `;

                monthDiv.appendChild(balanceDiv);
                main.appendChild(monthDiv);
            });
        } else {
            const noDataDiv = document.createElement('div');
            noDataDiv.innerHTML = `<div class="error"><h1>Sem dados disponíveis.</h1></div>`;
            main.appendChild(noDataDiv);
        }
    }
    // O que faz os botões funcionarem.
});
