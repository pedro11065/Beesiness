document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const menu = document.getElementById('menu-container');
    const month = document.getElementById('month-container');
    const loading = document.getElementById('loading');
    const monthYearSelect = document.getElementById('month-year-select');  // Corrigido para o ID correto do select

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    const cnpj = getCnpjFromUrl();

    loading.style.display = 'flex';
    main.style.display = 'none';
    menu.style.display = 'none';

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
        console.log(data);

        // Coletar no data.dates, os últimos dois valores do mês e ano para mostrar. Como retorna: [ "2024-11-06", "2024-11-25" ]

        loading.style.display = 'none';
        main.style.display = 'flex';
        menu.style.display = 'flex';

    } catch (error) {
        loading.style.display = 'none';
        month.style.display = 'none';
        main.style.display = 'flex';

        console.log(error);

        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
});
