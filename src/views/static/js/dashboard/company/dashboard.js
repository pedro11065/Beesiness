document.addEventListener('DOMContentLoaded', async function () {

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    const cnpj = getCnpjFromUrl();
    try {
        const response = await fetch(`/dashboard/company/${cnpj}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();

        const container = document.getElementById('value-article'); // Seleciona o elemento container pelo ID
        const ValueDiv = document.createElement('div');

        ValueDiv.className = 'value-containner';

        ValueDiv.innerHTML = `
            <div class="value-box">
                <div class="value"><h3>Caixa atual: R$${data.value}</h3></div>
            </div>
        `;

        container.appendChild(ValueDiv); // Adiciona o div ao container

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
});
