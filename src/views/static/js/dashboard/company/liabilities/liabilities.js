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
                    document.getElementById('name').innerText = liabilities.name; // Nome
                    document.getElementById('event').innerText = liabilities.event; // Evento
                    document.getElementById('class').innerText = liabilities.class; // Classe
                    document.getElementById('value').innerText = liabilities.value; // Valor
                    document.getElementById('installment').innerText = liabilities.installment; // Parcelas
                    document.getElementById('emission_date').innerText = liabilities.emission_date; // Data de Emissão
                    document.getElementById('expiration_date').innerText = liabilities.expiration_date; // Data de Vencimento
                    document.getElementById('payment_method').innerText = liabilities.payment_method; // Forma de Pagamento
                    document.getElementById('status').innerText = liabilities.status; // Status
                    document.getElementById('description').innerText = liabilities.description; // Descrição
                    document.getElementById('creation').innerText = `${liabilities.status} - ${liabilities.creation_date}`; // Data e Horário de Criação
                    document.getElementById('uuid').innerText = liabilities.liability_id; // ID

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

// Eventos e funções para deletar o passivo.
const confirmModal = document.getElementById('confirm-modal');

document.addEventListener('click', function (event) {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    
    dropdowns.forEach(dropdown => {
        // Verifica se o clique foi fora do dropdown ou do botão
        if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) { 
            dropdown.style.display = 'none';
        }
    });
});

function toggleDropdown(event) {
    event.stopPropagation();

    const dropdown = event.currentTarget.nextElementSibling;
    if (dropdown) dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
}

function deleteLiability(event) {
    event.stopPropagation();

    confirmModal.style.display = 'block';

    const dropdown = event.currentTarget.nextElementSibling;
    if (dropdown) dropdown.style.display = 'none';

    const liabilityId = document.getElementById('uuid').innerText;

    const status = document.getElementById('status').innerText;

    if (status.trim().toLowerCase().includes('estornado')) {
        document.getElementById('body-content').innerText = 'Este passivo já foi estornado uma vez.';
        document.getElementById('alert-modal').style.display = 'block';

        confirmModal.style.display = 'none';
        return;
    }

    const yesButton = document.querySelector('.btn.sim');

    document.querySelector('.btn.sim').onclick = async function () {
        try {   
            yesButton.disabled = true;
            yesButton.style.cursor = 'not-allowed';

            const response = await fetch(`/dashboard/refund-liability/${liabilityId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById('body-content').innerText = result.message;
                document.getElementById('alert-modal').style.display = 'block';
                
                confirmModal.style.display = 'none';
                document.getElementById('modal').style.display = 'none';
            } else {
                throw new Error(result.message || 'Erro ao deletar o ativo.');
            }
        } catch (error) {
            document.getElementById('body-content').innerText = error.message;
            document.getElementById('alert-modal').style.display = 'block';
        } finally {
            yesButton.disabled = false;
            yesButton.style.cursor  = 'pointer';
        }
    };
}

document.querySelector('.btn.nao').onclick = function () {
    confirmModal.style.display = 'none';
};

document.querySelector('#alert-modal .fechar').onclick = function () {
    document.getElementById('alert-modal').style.display = 'none';
    location.reload();
};