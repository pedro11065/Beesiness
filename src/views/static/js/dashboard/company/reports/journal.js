document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const loading = document.getElementById('loading');
    const cnpj = getCnpjFromUrl();
    main.style.display = 'none';
    loading.style.display = 'flex';

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
        console.log(data)

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
                            fillModal(data, item); // Preenche o modal com os dados do ativo ou passivo
                        });
    
                        dayDiv.innerHTML = `
                            <header class="title-container">
                                <div class="title-box">
                                    <h3>${formatDateToBrazilian(item.creation_date)} - ${item.creation_time}</h3>
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

function fillModal(data, item) {
    const modalTitle = document.getElementById('modalTitle');
    modalTitle.innerText = item.type === 'asset' ? 'Detalhes do Ativo' : 'Detalhes do Passivo';

    const fullItem = item.type === 'asset' 
        ? data.assets.find(asset => asset.asset_id === item.patrimony_id) 
        : data.liabilities.find(liability => liability.liability_id === item.patrimony_id);

    if (!fullItem) {
        console.error('Item não encontrado');
        return;
    }

    document.getElementById('name').innerText = fullItem.name; // Nome
    document.getElementById('event').innerText = fullItem.event; // Evento
    document.getElementById('class').innerText = fullItem.class; // Classe
    document.getElementById('value').innerText = formatValueToMoney(fullItem.value); // Valor
    document.getElementById('status').innerText = fullItem.status; // Status
    document.getElementById('description').innerText = fullItem.description; // Descrição
    document.getElementById('creation').innerText = `${fullItem.creation_date} - ${fullItem.creation_time}`; // Data e Horário de Criação

    /*
        Caso queira colocar o UUID do usuário nas informações:

        - No html definir:
                <label id="userIdLabel" style="display: none;">UUID do Usuário:</label>
                <p id="user_id" style="display: none;"></p>
        - No javascript definir:
                document.getElementById('user_id').innerText = fullItem.user_id; // UUID do usuário
                document.getElementById('userIdLabel').style.display = 'block'; 
                document.getElementById('user_id').style.display = 'block';
    */

    // Limpar campos que podem ser usados apenas para ativos ou passivos
    document.getElementById('payment_method').style.display = 'none';
    document.getElementById('paymentMethodLabel').style.display = 'none';
    document.getElementById('location').style.display = 'none';
    document.getElementById('locationLabel').style.display = 'none';
    document.getElementById('emission_date').style.display = 'none';
    document.getElementById('expiration_date').style.display = 'none';
    document.getElementById('emissionDates').style.display = 'none';
    document.getElementById('acquisitionLabel').style.display = 'none';
    document.getElementById('acquisition_date').style.display = 'none';

    if (item.type === 'liability') {
         // UUID do item
        document.getElementById('uuid').innerText = fullItem.liability_id

        // Forma de Pagamento
        if (fullItem.payment_method) {
            document.getElementById('payment_method').innerText = fullItem.payment_method;
            document.getElementById('payment_method').style.display = 'block';
            document.getElementById('paymentMethodLabel').style.display = 'block';
        }

        // Data de Emissão
        if (fullItem.emission_date) {
            document.getElementById('emission_date').innerText = fullItem.emission_date;
            document.getElementById('emission_date').style.display = 'block';
        }

        // Data de Vencimento
        if (fullItem.expiration_date) {
            document.getElementById('expiration_date').innerText = fullItem.expiration_date;
            document.getElementById('expiration_date').style.display = 'block';
        }

        document.getElementById('emissionDates').style.display = 'block';

    } else {
        document.getElementById('uuid').innerText = fullItem.asset_id // ID

        // Localização
        if (fullItem.location) {
            document.getElementById('location').innerText = fullItem.location;
            document.getElementById('location').style.display = 'block';
            document.getElementById('locationLabel').style.display = 'block';
        }
    
        // Data de Aquisição
        if (fullItem.acquisition_date) {
            document.getElementById('acquisition_date').innerText = fullItem.acquisition_date;
            document.getElementById('acquisition_date').style.display = 'block';
            document.getElementById('acquisitionLabel').style.display = 'block';
        }
    }

    document.getElementById('modal').style.display = 'block';
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
