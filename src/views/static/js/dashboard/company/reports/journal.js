document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');

    const cnpj = getCnpjFromUrl();
    main.style.display = 'none';
    loading.style.display = 'block';

    try {
        const response = await fetch(`/dashboard/journal/${cnpj}`, {
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
            // Agrupar os itens por mês
            const groupedByMonth = {};

            data.historic.forEach(item => {
                const month = new Date(item.creation_date).toLocaleString('pt-BR', { month: 'long' });
                if (!groupedByMonth[month]) {
                    groupedByMonth[month] = [];
                }
                groupedByMonth[month].push(item);
            });

            // Criar month-container para cada mês
            Object.keys(groupedByMonth).forEach(month => {
                const monthDiv = document.createElement('section');
                monthDiv.className = 'month-container';

                console.log(groupedByMonth[0])

                let MonthValue = 0; 

                groupedByMonth[month].forEach(item => {
                    // Verifica se o item.name não é igual a '#!@cash@!#'
                    if (item.name !== '#!@cash@!#') {
                        MonthValue += parseFloat(item.value); 
                    }
                });

                const value = formatValueToMoney(MonthValue);

                monthDiv.innerHTML = `
             
                <header class="month-title-container" id="month-title-container">
            
                    <article class="month-title-box">
        
                        <div class="month-box">
                            <h1>${month.charAt(0).toUpperCase() + month.slice(1)}</h1>
                        </div>
        
                        <div class="month-box">
                            <h1>${value}</h1>
                        </div>
        
                    </article>
    
                </header>
                `;

                // Adicionar os dias desse mês
                groupedByMonth[month].forEach(item => {
                    if(item.name != '#!@cash@!#'){

                        const dayDiv = document.createElement('article');
                        dayDiv.className = 'day-container';
                        dayDiv.style.cursor = 'pointer';
    
                        dayDiv.addEventListener('click', function () {
                            sessionStorage.setItem('patrimonioData', JSON.stringify(item)); 
    
                            window.location.href = `/dashboard/${cnpj}/${item.type}/${item.patrimony_id}`;
                        });
    
                        dayDiv.innerHTML = `
                            <header class="title-container">
                                <div class="title-box">
                                    <h3>${formatDateToBrazilian(item.creation_date)} - ${getFormattedTime(item.creation_time)}</h3>
                                </div>
                                <div class="title-box">
                                    <h3>${formatValueToMoney(item.value)}</h3>
                                </div>
                            </header>
                    
                            <div class="description-container">
                                <div class="description-box">
                                    <h4>${item.event} - ${item.class} - ${item.name}</h4>
                                </div>
                                <div class="description-box">
                                    <h4>${item.user_id} - Dono</h4>
                                </div>
                            </div>
                        `;
    
                        monthDiv.appendChild(dayDiv);
                    }                 
                });

                main.appendChild(monthDiv);
            });

        } else {
            const noDataDiv = document.createElement('div');
            noDataDiv.innerHTML = `<div class="error"><h1>Sem dados disponíveis.</h1></div>`;
            main.appendChild(noDataDiv);
        }

    } catch (error) {
        console.error('Erro ao carregar os dados', error);
        loading.style.display = 'none';
        main.style.display = 'inline-block';
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
});

function getCnpjFromUrl() {
    const url = window.location.pathname;
    const parts = url.split('/');
    return parts[parts.length - 1];
}

function formatDateToBrazilian(dateStr) { // Converte de YYYY-MM-DD para DD/MM/YYYY
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

function getFormattedTime(creationTime) {
    const date = new Date(creationTime);

    const offset = -3; // Definindo o fuso horário como -3
    const localTime = new Date(date.getTime() + offset * 60 * 60 * 1000); // Converte o horário para GMT-3

    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(localTime.getUTCSeconds()).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`; // Retorna o horário formatado como HH:MM:SS
}
