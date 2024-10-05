document.addEventListener('DOMContentLoaded', async function () {
    loading.style.display = 'block';
    main.style.display = 'none';
    try {
        const cnpj = getCnpjFromUrl(); // Obter o CNPJ da URL
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
        main.style.display = 'flex';

        if (data.value && data.value.length > 0) {
            console.log(data.value);

            const dataContainer = document.getElementById('data-container');
            dataContainer.innerHTML = ''; // Limpar o conteúdo anterior, se houver

            data.value.forEach(asset => {
                const AssetDiv = document.createElement('section');
                AssetDiv.className = 'data-group';
                AssetDiv.style.cursor = 'pointer';

                // Preencher o conteúdo do AssetDiv com os dados do ativo
                AssetDiv.innerHTML = `
                    <div class="data-out-box"><div class="data-box"><p>${asset.asset_id}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${CashName(asset.name)}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.event}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.class}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${formatValueToMoney(asset.value)}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.location}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.acquisition_date}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.status}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.description}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.creation_date}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${asset.creation_time}</p></div></div>
                `;

                // Adicionar o AssetDiv ao container
                dataContainer.appendChild(AssetDiv);

                // Adiciona evento de clique ao AssetDiv para abrir o modal
                AssetDiv.addEventListener('click', function () {
                    const details = Array.from(AssetDiv.children).map(child => child.innerText);
                    const modalContent = `
                        <main class="model-main">
                            <header class="model-header">Detalhes do Ativo</header>
                            <article class="model-container">
                                <div class="model-box"><h5>ID: ${details[0]}</h5></div>
                                <div class="model-box"><h5>Nome: ${details[1]}</h5></div>
                                <div class="model-box"><h5>Evento: ${details[2]}</h5></div>
                                <div class="model-box"><h5>Categoria: ${details[3]}</h5></div>
                                <div class="model-box"><h5>Valor: ${details[4]}</h5></div>
                                <div class="model-box"><h5>Data de Aquisição: ${details[5]}</h5></div>
                                <div class="model-box"><h5>Localização: ${details[6]}</h5></div>
                                <div class="model-box"><h5>Status: ${details[7]}</h5></div>
                                <div class="model-box"><h5>Descrição: ${details[8]}</h5></div>
                                <div class="model-box"><h5>Data de criação: ${details[9]}</h5></div>
                                <div class="model-box"><h5>Horário de criação: ${details[10]}</h5></div>
                            </article>
                        </main>
                    `;

                    // Limpa o conteúdo anterior do modal e exibe o novo conteúdo
                    const modal = document.getElementById('modal');
                    modal.querySelector('.modal-content').innerHTML = modalContent;
                    modal.style.display = 'block';
                });
            });

        } else {
            console.error('Nenhum ativo encontrado!');
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }

    // Configurações do modal
    const closeModalBtn = document.getElementById('closeModalBtn');
    closeModalBtn.addEventListener('click', function () {
        const modal = document.getElementById('modal');
        modal.style.display = 'none';
    });

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
