const confirmModal = document.getElementById('confirm-modal');
const alertModal = document.getElementById('alert-modal');
const editModal = document.getElementById('edit-modal');

document.addEventListener('DOMContentLoaded', async function () {
        const main = document.getElementById('main');
        const loading = document.getElementById('loading');

        loading.style.display = 'flex';
        main.style.display = 'none';
        
        try {
            const cnpj = getCnpjFromUrl();
            const loading = document.getElementById('loading');
            const loader = document.getElementById('loader');
            const main = document.getElementById('main');
            const dataContainer = document.getElementById('data-container');
            const tableHead = document.querySelector('.data-table thead');
        
            loading.style.display = 'block';
            loader.style.display = 'block';
            main.style.display = 'none';
        
            const response = await fetch(`/dashboard/assets/${cnpj}`, {
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
            loader.style.display = 'none';
            main.style.display = 'block';
        
            // Limpar conteúdo anterior
            dataContainer.innerHTML = '';
        
            if (data.value && data.value.length === 1 && data.value[0].name === '#!@cash@!#') {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.innerHTML = '<h1>Nenhum dado encontrado.</h1>';
                main.appendChild(errorDiv);
            } else if (data.value && data.value.length > 0) {
                tableHead.classList.remove('hidden');
        
                data.value.forEach(asset => {
                    if (asset.name !== '#!@cash@!#') {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td class="limited-text name">${asset.asset_id}</td>
                            <td class="limited-text name">${asset.name}</td>
                            <td>${asset.event}</td>
                            <td>${asset.class}</td>
                            <td>${formatValueToMoney(asset.value)}</td>
                            <td>${asset.installment}</td>
                            <td class="limited-text">${asset.location}</td>
                            <td>${asset.acquisition_date}</td>
                            <td>${asset.status}</td>
                            <td class="limited-text">${asset.description}</td>
                            <td>${asset.creation_date}</td>
                            <td>${asset.creation_time}</td>
                        `;
                        dataContainer.appendChild(row);
        
                        console.log(asset)
                        row.addEventListener('click', function () {
                            document.getElementById('name').innerText = asset.name;
                            document.getElementById('event').innerText = asset.event;
                            document.getElementById('class').innerText = asset.class;
                            document.getElementById('value').innerText = asset.value;
                            document.getElementById('installment').innerText = asset.installment;
                            document.getElementById('location').innerText = asset.location;
                            document.getElementById('acquisition_date').innerText = asset.creation_date;
                            document.getElementById('status').innerText = asset.status;
                            document.getElementById('floating').innerText = asset.floating ? 'Sim' : 'Não';
                            document.getElementById('description').innerText = asset.description;
                            document.getElementById('creation').innerText = `${asset.status} - ${asset.creation_date}`;
                            document.getElementById('uuid').innerText = asset.asset_id;
                        
                            document.getElementById('modal').style.display = 'block';
                        });
                    }
                });
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error';
                errorDiv.innerHTML = '<h1>Nenhum dado encontrado.</h1>';
                main.appendChild(errorDiv);
            }
        } catch (error) {
            console.error('Erro ao carregar os dados:', error);
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

function formatDateToBrazilian(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function formatValueToMoney(valueStr) {
    const valueNum = parseFloat(valueStr);
    return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CashName(nameStr) {
    return nameStr === '#!@cash@!#' ? 'Caixa' : nameStr;
}


/* Dropdown */
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

/* Modal de delete */
function deleteAsset(event) {
    event.stopPropagation();

    confirmModal.style.display = 'block';

    const dropdown = event.currentTarget.nextElementSibling;
    if (dropdown) dropdown.style.display = 'none';

    const assetId = document.getElementById('uuid').innerText;

    const status = document.getElementById('status').innerText;

    if (status.trim().toLowerCase().includes('estornado')) {
        document.getElementById('body-content').innerText = 'Este ativo já foi estornado uma vez.';
        document.getElementById('alert-modal').style.display = 'block';

        confirmModal.style.display = 'none';
        return;
    }

    const yesButton = document.querySelector('.btn.sim');

    document.querySelector('.btn.sim').onclick = async function () {
        try {   
            yesButton.disabled = true;
            yesButton.style.cursor = 'not-allowed';

            const response = await fetch(`/dashboard/refund-asset/${assetId}`, {
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

/* Editar */
document.querySelector('.btn.cancel-delete').onclick = function () {
    confirmModal.style.display = 'none';
};

document.querySelector('#alert-modal .btn.fechar').onclick = function () {
    const confirmModalVisible = confirmModal.style.display === 'block';
    alertModal.style.display = 'none';
    if (confirmModalVisible) location.reload();
};

/* Editar */
function openEditModal() {
    editModal.style.display = 'block';

    const name = document.getElementById('name').innerText;
    const oldValue = document.getElementById('value').innerText;

    document.getElementById('edit-name').value = name;
    document.getElementById('old_value').value = oldValue;
    document.getElementById('new_value').value = '';
}

function closeEditModal() {
    editModal.style.display = 'none';
}

async function confirmEdit() {
    const newValue = parseFloat(document.getElementById('new_value').value);
    const oldValue = parseFloat(document.getElementById('old_value').value);
    const assetId = document.getElementById('uuid').innerText;

    if (isNaN(newValue) || newValue <= 0 || newValue >= oldValue) {
        document.getElementById('body-content').innerText = 'Por favor, insira um valor maior que 0 e menor que o valor atual.';
        alertModal.style.display = 'block';
        return;
    }

    // Enviar requisição para atualizar o valor do ativo
    try {
        const response = await fetch(`/dashboard/update-asset/${assetId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ new_value: newValue })
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('body-content').innerText = result.message;
            alertModal.style.display = 'block';
            closeEditModal();
        } else {
            throw new Error(result.message || 'Erro ao atualizar o valor.');
        }
    } catch (error) {
        document.getElementById('body-content').innerText = error.message;
        alertModal.style.display = 'block';
    }
}

/* Modal de vender */
function sellAsset(event) {
    event.stopPropagation();

    // Mostrar modal de venda
    const sellModal = document.getElementById('sell-modal');
    sellModal.style.display = 'block';

    const dropdown = event.currentTarget.nextElementSibling;
    if (dropdown) dropdown.style.display = 'none';

    const assetId = document.getElementById('uuid').innerText;

    // Botão "Sim" do modal de venda
    const confirmSellButton = document.querySelector('.btn.confirm-sell');

    confirmSellButton.onclick = async function () {
        try {
            confirmSellButton.disabled = true;
            confirmSellButton.style.cursor = 'not-allowed';

            const response = await fetch(`/dashboard/sell-asset/${assetId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                document.getElementById('body-content').innerText = result.message;
                document.getElementById('alert-modal').style.display = 'block';

                sellModal.style.display = 'none';
                document.getElementById('modal').style.display = 'none';
            } else {
                throw new Error(result.message || 'Erro ao vender o ativo.');
            }
        } catch (error) {
            document.getElementById('body-content').innerText = error.message;
            document.getElementById('alert-modal').style.display = 'block';
        } finally {
            confirmSellButton.disabled = false;
            confirmSellButton.style.cursor = 'pointer';
        }
    };

    // Botão "Não" do modal de venda
    document.querySelector('.btn.cancel-sell').onclick = function () {
        sellModal.style.display = 'none';
    };
}
