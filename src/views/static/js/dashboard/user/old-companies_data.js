document.addEventListener('DOMContentLoaded', async function () {
    const loadingElement = document.getElementById('loading');
    const container = document.getElementById('resultado');
    const newCompanyButton = document.getElementById('newCompanyButton');

    // Exibe o elemento de carregamento
    loadingElement.style.display = 'block';

    // Ação ao clicar no botão de nova empresa
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
        loadingElement.style.display = 'none'; // Esconde o loader

        if (data.relação) {
            const simbolosAcesso = {
                'creator': '/static/images/dashboard/public/crown.png', 
                'editor': '/static/images/dashboard/public/employee.png', 
                'checker': '/static/images/dashboard/public/employee.png', 
                'viewer': '/static/images/dashboard/public/employee.png'
            };

            
            data.nomes.forEach((nome, index) => {
                const empresaDiv = document.createElement('div');
                const cnpj = data.cnpjs[index];  // Pega o CNPJ correspondente

                empresaDiv.className = 'company';
                empresaDiv.style.cursor = 'pointer';

                // Ação ao clicar no botão de alguma empresa
                empresaDiv.addEventListener('click', function () {
                    window.location.href = `/dashboard/company/${cnpj}`;  // Redireciona para a URL com o CNPJ
                });

                const nivelAcesso = data['nivel de acesso'][index]
                const simbolosImagem = simbolosAcesso[nivelAcesso]
                empresaDiv.innerHTML = `
                    <div class="company-data">
                        <img src="${simbolosImagem}" alt="${nivelAcesso} icon" class="icon-simbolo"/>
                        <h2 class="nome-empresa">${nome}</h2>
                    </div>
                    <img class="icon" src="/static/images/dashboard/public/next.png" alt="Configurações">
                `;

                container.appendChild(empresaDiv); // Adiciona o div ao container
            });
        } else {
            const noRelationDiv = document.createElement('div');
            noRelationDiv.className = 'company-data-error';
            noRelationDiv.innerHTML = `
                <div>
                    <h2>Aparentemente você não está relacionado a nenhuma empresa! :(</h2>
                </div>
            `;
            container.appendChild(noRelationDiv);
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
        loadingElement.style.display = 'none'; // Esconde o loader em caso de erro

        const errorDiv = document.createElement('div');
        errorDiv.className = 'company';
        errorDiv.innerHTML = `
            <div>
                <h1>Erro ao pesquisar pelas empresas relacionadas à sua conta, sentimos muito :(</h1>
            </div>
        `;
        container.appendChild(errorDiv);
    }
});
