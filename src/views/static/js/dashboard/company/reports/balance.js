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
        console.log(data)

        loading.style.display = 'none';
        main.style.display = 'flex';

        if (data.historic) {

            const groupedByClass = {};

            // Agrupar dados por class e somar debit e credit
            data.historic.forEach(item => {
                if (!groupedByClass[item.class]) {
                    groupedByClass[item.class] = {
                        credit: 0,
                        debit: 0,
                        name: CashName(item.class),
                        events: []
                    };
                }
                groupedByClass[item.class].credit += parseFloat(item.credit);
                groupedByClass[item.class].debit += parseFloat(item.debit);
                groupedByClass[item.class].events.push(item);
            });

            const groupedByMonth = {};

            Object.values(groupedByClass).forEach(item => {
                const creationDate = item.events[0].creation_date; // Usa a data do primeiro evento para o agrupamento
                const month = new Date(creationDate).toLocaleString('pt-BR', { month: 'long' });
                const day = formatDateToBrazilian(creationDate);

                if (!groupedByMonth[month]) {
                    groupedByMonth[month] = {};
                }

                if (!groupedByMonth[month][day]) {
                    groupedByMonth[month][day] = [];
                }

                groupedByMonth[month][day].push({
                    class: item.name,
                    credit: item.credit,
                    debit: item.debit
                });
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
                                <h1>R$ - - -</h1>
                            </div>
                        </article>
                    </header>
                `;

                let totalDebito = 0, totalCredito = 0;

                Object.keys(groupedByMonth[month]).forEach(async day => {
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
                                <h3>${formatValueToMoney(1, dailyDebito - dailyCredito)}</h3>
                            </div>
                        </header>
                    `;

                    const balanceDiv = document.createElement('main');
                    balanceDiv.className = 'balance-container';

                    const a = await groupedByMonth[month][day].map(item => console.log(item))
                    console.log(a)

                    balanceDiv.innerHTML = `
                        <section class="accounts-container">
                            <header class="account-title">
                                <h2>Conta</h2>
                            </header>
                            ${groupedByMonth[month][day].map(item =>`
                                <div class="data_box">${item.class}</div>
                            `).join('')}
                            <div class="data_box total-row">Total</div>
                        </section>

                        <section class="accounts-container">
                            <header class="debtor-title">
                                <h2>Débito</h2>
                            </header>
                            ${groupedByMonth[month][day].map(item => `
                                <div class="data_box">${formatValueToMoney(0, item.debit)}</div>
                            `).join('')}
                            <div class="data_box total-row">${formatValueToMoney(0, dailyDebito)}</div>
                        </section>

                        <section class="accounts-container">
                            <header class="creditor-title">
                                <h2>Crédito</h2>
                            </header>
                            ${groupedByMonth[month][day].map(item => `
                                <div class="data_box">${formatValueToMoney(0, item.credit)}</div>
                            `).join('')}
                            <div class="data_box total-row">${formatValueToMoney(0, dailyCredito)}</div>
                        </section>
                    `;

                    dayDiv.appendChild(balanceDiv);
                    monthDiv.appendChild(dayDiv);
                });

                // Cálculo do saldo final do mês: Débito - Crédito
                const saldoMes = totalDebito - totalCredito;

                // Atualizar o valor no segundo month-box
                const monthBoxes = monthDiv.querySelectorAll('.month-box h1');
                monthBoxes[1].textContent = formatValueToMoney(1, saldoMes);

                main.appendChild(monthDiv);
            });
        } else {
            console.error('Nenhum ativo encontrado!');
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
});

function generatePDF() {
    /*
        Há um pequeno problema: Os traços, as vezes eles são tão grandes que vão sozinhos para outra página do pdf.
    */
    const element = document.getElementById('main'); // O elemento que desejamos converter em PDF
    const options = {
        margin:       0.5,
        filename:     'balancete.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().from(element).set(options).save();

    
    //Botão chamando função: <button onclick="generatePDF()">Gerar PDF</button>
}
