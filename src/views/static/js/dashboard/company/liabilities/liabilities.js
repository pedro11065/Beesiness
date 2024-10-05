document.addEventListener('DOMContentLoaded', async function () {

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

        if (data.value.length > 0) {
            console.log(data.value);

            const dataContainer = document.getElementById('data-container');
            dataContainer.innerHTML = ''; // Limpar o conteúdo anterior, se houver

            data.value.forEach(liabilities => {
                const LiabilitiesDiv = document.createElement('section');
                LiabilitiesDiv.className = 'data-group';
                LiabilitiesDiv.style.cursor = 'pointer';

                // Preencher o conteúdo do AssetDiv com os dados do ativo
                LiabilitiesDiv.innerHTML = `
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.liability_id}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${CashName(liabilities.name)}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.event}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.class}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${formatValueToMoney(liabilities.value)}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.emission_date}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.expiration_date}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.payment_method}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.status}</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>${liabilities.description}</p></div></div>
                `;

                // Adicionar o AssetDiv ao container
                dataContainer.appendChild(LiabilitiesDiv);

                // Adiciona evento de clique ao AssetDiv para abrir o modal
                LiabilitiesDiv.addEventListener('click', function () {
                    const details = Array.from(LiabilitiesDiv.children).map(child => child.innerText);
                    const modalContent = `
                        <main class="model-main">
                            <header class="model-header">Detalhes do Ativo</header>
                            <article class="model-container">
                                <div class="model-box"><h5>ID: ${details[0]}</h5></div>
                                <div class="model-box"><h5>Nome: ${details[1]}</h5></div>
                                <div class="model-box"><h5>Evento: ${details[2]}</h5></div>
                                <div class="model-box"><h5>Categoria: ${details[3]}</h5></div>
                                <div class="model-box"><h5>Valor: ${details[4]}</h5></div>
                                <div class="model-box"><h5>Data de Emissão: ${details[5]}</h5></div>
                                <div class="model-box"><h5>Data de Vencimento: ${details[6]}</h5></div>
                                <div class="model-box"><h5>Forma de Pagamento: ${details[7]}</h5></div>
                                <div class="model-box"><h5>Status: ${details[8]}</h5></div>
                                <div class="model-box"><h5>Descrição: ${details[9]}</h5></div>
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

function CashName(nameStr) {
    return nameStr === '#!@cash@!#' ? 'Caixa' : nameStr;
}
