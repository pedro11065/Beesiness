document.addEventListener('DOMContentLoaded', async function () {
    const loadingElement = document.getElementById('loading');
    const container = document.getElementById('resultado');

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    const cnpj = getCnpjFromUrl();
    loadingElement.style.display = 'block';

    try {
        const response = await fetch(`/dashboard/reason/${cnpj}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();

        loadingElement.style.display = 'none';
        container.innerHTML = ''; // Limpa o conteúdo anterior

        /* O data já está retornando os dados!

        {'liabilities': [{'liability_id': '3ae51350-2c72-4fba-8376-ee42fc91bb3f', 'company_id': '6f5d426b-e51d-414c-977d-7018a0f24d22', 'user_id': '0bd67ec8-be32-4e12-928f-b0a445241bf3',
        'name': 'Um bagulho', 'event': 'Leilão', 'class': 'Veículos', 'value': '5 reais e um brinde', 'emission_date': datetime.date(2024, 5, 23),
        'expiration_date': datetime.date(2034, 10, 23), 'payment_method': 'Doado', 'description': 'Um bagulho muito louco!', 'status': 'Danificado'}],
        'assets': [{'asset_id': '0288e336-803e-4882-b94f-951be1efe021', 'company_id': '6f5d426b-e51d-414c-977d-7018a0f24d22', 'user_id': '0bd67ec8-be32-4e12-928f-b0a445241bf3',
        'name': 'Terrenão tops mil grau', 'event': 'Leilão', 'class': 'Terreno', 'value': '50 milhões', 'location': 'Caixa prego, 123',
        'acquisition_date': datetime.date(6666, 6, 6), 'description': 'Terreno muito louco no caixa prego.', 'status': 'Vendido'}]}
                                                                                                                                                                            */
        
        // Trate os dados nessa região, fazendo um if se existe liabilities e assets. (data.liabilities.length e data.assets.length)

       if (data.message) {
            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `<h1>${data.message}</h1>`;
            container.appendChild(messageDiv);
        } else {
            // Trata os resultados aqui dentro

            const messageDiv = document.createElement('div');
            messageDiv.innerHTML = `<h1>Seus dados foram encontrados, agora falta o html ser feito!</h1>`;
            container.appendChild(messageDiv);
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        loadingElement.style.display = 'none';

        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<h1>Erro ao carregar informações.</h1>`;
        container.appendChild(errorDiv);
    }
});
