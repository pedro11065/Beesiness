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

    function formatValueToMoney(valueStr) {
        const valueNum = parseFloat(valueStr);
        return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const cnpj = getCnpjFromUrl();
    loading.style.display = 'flex';
    main.style.display = 'none';

    try {
        const response = await fetch(`/dashboard/razonete/${cnpj}`, {
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
                const date = new Date(item.creation_date);
                const month = date.toLocaleString('pt-BR', { month: 'long' });
                const day = formatDateToBrazilian(item.creation_date);

                // Agrupando por mês
                if (!groupedByMonth[month]) {
                    groupedByMonth[month] = {};
                }

                // Agrupando por dia
                if (!groupedByMonth[month][day]) {
                    groupedByMonth[month][day] = { items: [], groupedByClass: {} };
                }

                groupedByMonth[month][day].items.push(item);

                // Agrupando por classe
                if (!groupedByMonth[month][day].groupedByClass[item.class]) {
                    groupedByMonth[month][day].groupedByClass[item.class] = {
                        credit: 0,
                        debit: 0,
                        items: []
                    };
                }
                groupedByMonth[month][day].groupedByClass[item.class].credit += item.credit;
                groupedByMonth[month][day].groupedByClass[item.class].debit += item.debit;

                // Armazenando item para exibição futura
                if (item.credit > 0) {
                    groupedByMonth[month][day].groupedByClass[item.class].items.push({ type: 'credit', value: item.credit });
                } else {
                    groupedByMonth[month][day].groupedByClass[item.class].items.push({ type: 'debit', value: item.debit });
                }
            });

            Object.keys(groupedByMonth).forEach(month => {
                const monthDiv = document.createElement('section');
                monthDiv.className = 'month-container';

                monthDiv.innerHTML = 
                    `<header class="month-title-container">
                        <article class="month-title-box">
                            <div class="month-box">
                                <h1>${month.charAt(0).toUpperCase() + month.slice(1)}</h1>
                            </div>
                        </article>
                    </header>`;

                Object.keys(groupedByMonth[month]).forEach(day => {
                    const dayDiv = document.createElement('article');
                    dayDiv.className = 'day-container';

                    dayDiv.innerHTML = 
                        `<header class="day-title-container">
                            <div class="title-box">
                                <h3>${day}</h3>
                            </div>
                        </header>`;

                    const balanceDiv = document.createElement('main');
                    balanceDiv.className = 'balance-container';

                    // Agrupando por classe e mostrando créditos e débitos
                    for (const className in groupedByMonth[month][day].groupedByClass) {
                        const classData = groupedByMonth[month][day].groupedByClass[className];

                        const classDiv = document.createElement('div');
                        classDiv.className = 'class-container';

                        const totalCredit = classData.items.filter(item => item.type === 'credit').reduce((acc, item) => acc + item.value, 0);
                        const totalDebit = classData.items.filter(item => item.type === 'debit').reduce((acc, item) => acc + item.value, 0);
                        const difference = totalCredit - totalDebit >= 0 ? totalCredit - totalDebit : totalDebit - totalCredit;

                        classDiv.innerHTML = `
                        <h4 class="class-name">${className}</h4>
                        <div class="values-container">
                            <div class="debit-container">
                                ${classData.items.filter(item => item.type === 'debit').map(item => `
                                    <div class="value-item debit">${formatValueToMoney(item.value)}</div>
                                `).join('')}
                            </div>
                            <div class="credit-container">
                                ${classData.items.filter(item => item.type === 'credit').map(item => `
                                    <div class="value-item credit">${formatValueToMoney(item.value)}</div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="total-line-above"></div>
                        <div class="total-container">
                            <div class="total-values-container">
                            <div class="debit-total-container">
                                <div class="total-values debit-total">${formatValueToMoney(totalDebit)}</div>
                            </div>
                            <div class="credit-total-container">
                                <div class="total-values credit-total">${formatValueToMoney(totalCredit)}</div>
                            </div>
                        </div>
                             <div class="difference-container">
                                <div class="difference-value">${formatValueToMoney(difference)}</div>
                            </div>
                        </div>
                        `;

                        balanceDiv.appendChild(classDiv);

                    }

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
    } catch (error) {
        console.log(error)
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
});
