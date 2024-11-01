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
        
                        row.addEventListener('click', function () {
                            const details = Array.from(row.children).map(child => child.innerText);
                            console.log(details)
                        
                            document.getElementById('uuid').innerText = details[0];
                            document.getElementById('name').innerText = details[1];
                            document.getElementById('event').innerText = details[2];
                            document.getElementById('class').innerText = details[3];
                            document.getElementById('value').innerText = details[4];
                            document.getElementById('installment').innerText = asset.installment;
                            document.getElementById('location').innerText = asset.location;
                            document.getElementById('acquisition_date').innerText = asset.creation_date;
                            document.getElementById('status').innerText = asset.status;
                            document.getElementById('description').innerText = details[8];
                            document.getElementById('creation').innerText = `${details[9]} - ${details[10]}`;
                        
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
    const day = date.getDate().toString().padStart(2, '0'); // Obtém o dia e formata para 2 dígitos
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Obtém o mês e formata para 2 dígitos
    const year = date.getFullYear(); // Obtém o ano
    return `${day}/${month}/${year}`;
}

function formatValueToMoney(valueStr) {
    const valueNum = parseFloat(valueStr);
    return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CashName(nameStr) {
    return nameStr === '#!@cash@!#' ? 'Caixa' : nameStr;
}


// document.addEventListener('click', function (event) {
//     const dropdowns = document.querySelectorAll('.dropdown-menu');
    
//     dropdowns.forEach(dropdown => {
//         if (!dropdown.contains(event.target) && !dropdown.previousElementSibling.contains(event.target)) { // Verifica se o clique foi fora do dropdown ou do botão
//             dropdown.style.display = 'none';
//         }
//     });
// });

// function toggleDropdown(event) {
//     event.stopPropagation();

//     const dropdown = event.currentTarget.nextElementSibling; // Pega o próximo elemento que é o dropdown
//     if (dropdown) {
//         dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
//     }
// }
