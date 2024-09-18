
//todo sistema que gera resposta da API está em: src\controller\dashboard\functions\user_companies.py

document.addEventListener('DOMContentLoaded', async function () {
    const loadingElement = document.getElementById('loading');
    const container = document.getElementById('resultado');
    const newCompanyButton = document.getElementById('newCompanyButton');

    // Exibe o elemento de carregamento
    loadingElement.style.display = 'block';

    try {
        const response = await fetch('/dashboard/user/api');

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        loadingElement.style.display = 'none'; // Esconde o loader

        if (data.relação) {
            data.nomes.forEach((nome, index) => {
                const empresaDiv = document.createElement('div');
                empresaDiv.className = 'company';
                empresaDiv.innerHTML = `
                    <div class="company-data">
                        <h1>${nome}</h1>
                        <p>Cargo: ${data['nivel de acesso'][index]}</p>
                    </div>
                    <img class="icon" src="/static/images/dashboard/public/next.png" alt="Configurações">
                `;
                container.appendChild(empresaDiv);
            });
        } else {
            const noRelationDiv = document.createElement('div');
            noRelationDiv.className = 'company-data-error';
            noRelationDiv.innerHTML = `
                <div>
                    <p>Aparentemente você não está relacionado a nenhuma empresa! :(</p>
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

    // Ação ao clicar no botão de nova empresa
    newCompanyButton.addEventListener('click', function () {
        window.location.href = '/company/register'; // Redireciona para a página de registro
    });
});

    /*
        Contas para teste:
            - Relacionado a duas empresas:
                silvinho@gmail.com
                PedroPy13.
            - Relacionado a uma empresa:
                pedrohenriquesilvaquixabeira@gmail.com
                PedroPy13.
            - Relacionado a nenhuma empresa:
                banana@gmail.com
                Pedro12504.


                                !!!!!
        Não importa a quantidade de empresas, sempre mexa com os indices.
                                !!!!!

        EXEMPLOS:
            - silvinho@gmail.com
                {
                    "Quantidade": 2,
                    "cnpjs": [                  // vem uma uma lista
                        "45039237000114",
                        "60509239000547"
                    ],
                    "nivel de acesso": [        // vem uma uma lista
                        "creator",
                        "creator"
                    ],
                    "nomes": [                  // vem uma uma lista
                        "Sistema Brasileiro de Televisão L.T.D.A",
                        "Radio e Televisão Bandeirantes L.T.D.A"
                    ],
                    "relação": true
                }

            - pedrohenriquesilvaquixabeira@gmail.com
                {
                    "Quantidade": 1,
                    "cnpjs": [
                        "00280273000218"
                    ],
                    "nivel de acesso": [
                        "creator"
                    ],
                    "nomes": [
                        "Samsung Electronics Co., Ltd."
                    ],
                    "relação": true
                }

            - banana@gmail.com
                {
                    "relação": false
                }

*/

