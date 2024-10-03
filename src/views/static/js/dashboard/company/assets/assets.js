document.addEventListener('DOMContentLoaded', async function () {


    newCompanyButton.addEventListener('click', function () {
        window.location.href = '/company/register'; // Redireciona para a página de registro
    });

    try {
        const response = await fetch('/dashboard/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();

        if (data.relação) {

                const empresaDiv = document.createElement('div');

                empresaDiv.className = 'company';
                empresaDiv.style.cursor = 'pointer';

                empresaDiv.addEventListener('click', function () {


                empresaDiv.innerHTML = `


                `;

                container.appendChild(empresaDiv); // Adiciona o div ao container
            });
        } else {
            console.error('Nenhum ativo encotrado!');
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);

    }
});
