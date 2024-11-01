document.addEventListener('DOMContentLoaded', async function () {
    loading.style.display = 'flex';
    main.style.display = 'none';
    
    try {    
        const cnpj = getCnpjFromUrl(); // Obter o CNPJ da URL
        const response = await fetch(`/dashboard/liabilities/${cnpj}`, {
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
            const dataContainer = document.getElementById('data-container');
            dataContainer.innerHTML = ''; // Limpar o conteúdo anterior, se houver
            
            const tableContainer = document.querySelector('.table-container');
            tableContainer.style.display = 'block';

            data.historic.forEach(liabilities => {
                const row = document.createElement('tr');
                
                // Preencher o conteúdo do AssetDiv com os dados do passivo
                row.innerHTML = `
                    <td class="limited-text name">${liabilities.liability_id}</td>
                    <td class="limited-text name">${CashName(liabilities.name)}</td>
                    <td>${liabilities.event}</td>
                    <td>${liabilities.class}</td>
                    <td>${formatValueToMoney(liabilities.value)}</td>
                    <td>${liabilities.installment}</td>
                    <td>${liabilities.emission_date}</td>
                    <td>${liabilities.expiration_date}</td>
                    <td>${liabilities.payment_method}</td>
                    <td>${liabilities.status}</td>
                    <td class="limited-text">${liabilities.description}</td>
                    <td>${liabilities.creation_date}</td>
                    <td>${liabilities.creation_time}</td>
                `;

                dataContainer.appendChild(row);

                // Adiciona evento de clique ao row para abrir o modal
                row.addEventListener('click', function () {
                    const details = Array.from(row.children).map(child => child.innerText);
                    console.log(details)
                    document.getElementById('uuid').innerText = details[0]; // ID
                    document.getElementById('name').innerText = details[1]; // Nome
                    document.getElementById('event').innerText = details[2]; // Evento
                    document.getElementById('class').innerText = details[3]; // Classe
                    document.getElementById('value').innerText = details[4]; // Valor
                    document.getElementById('installment').innerText = liabilities.installment; // Parcelas
                    document.getElementById('emission_date').innerText = liabilities.emission_date; // Data de Emissão
                    document.getElementById('expiration_date').innerText = liabilities.expiration_date; // Data de Vencimento
                    document.getElementById('payment_method').innerText = liabilities.payment_method; // Forma de Pagamento
                    document.getElementById('status').innerText = details[8]; // Status
                    document.getElementById('description').innerText = liabilities.description; // Descrição
                    document.getElementById('creation').innerText = `${details[10]} - ${details[11]}`; // Data e Horário de Criação

                    document.getElementById('modal').style.display = 'block';
                });
            });
        } else {
            const noDataDiv = document.createElement('div');
            noDataDiv.className = 'error';
            noDataDiv.innerHTML = '<h1>Sem dados disponíveis.</h1>';
            main.appendChild(noDataDiv);
        }
    } catch (error) {
        console.log(error)
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.innerHTML = '<h1>Erro ao procurar as informações.</h1>';
        main.appendChild(errorDiv);
    }

    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', function (event) {
        const modal = document.getElementById('modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Funções auxiliares
function getCnpjFromUrl() {
    const url = window.location.pathname;
    const parts = url.split('/');
    return parts[parts.length - 1];
}

function formatValueToMoney(valueStr) {
    const valueNum = parseFloat(valueStr);
    return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CashName(nameStr) {
    return nameStr === '#!@cash@!#' ? 'Caixa' : nameStr;
}
