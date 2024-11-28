document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const loading = document.getElementById('loading');

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    const cnpj = getCnpjFromUrl();

    loading.style.display = 'flex';
    main.style.display = 'none';

    try {
        const response = await fetch(`/dashboard/balance-sheet/${cnpj}`, {
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

    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
})