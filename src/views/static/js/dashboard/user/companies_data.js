
//todo sistema que gera resposta da API está em: src\controller\dashboard\functions\user_companies.py

document.addEventListener('DOMContentLoaded', function() {

    const loadingElement = document.getElementById('loading');
    loadingElement.style.display = 'block';

    fetch('/dashboard/user/api')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('resultado');
            loadingElement.style.display = 'none';

            if (data.relação) {

                data.nomes.forEach((nome, index) => {
                    const empresaDiv = document.createElement('div');
                    empresaDiv.className = 'company';
                    empresaDiv.innerHTML = `

                        <div class="company-data">
                            <h1>${nome}</h1>
                             <p>Cargo: ${data['nivel de acesso'][index]}</p>
                         </div>
                        <img class="icon" src="/static/images/dashboard/public/next.png" alt="Configurações"> </a>                 
                    `;
                    container.appendChild(empresaDiv);
                });
            } else {
                const empresaDiv = document.createElement('div');
                empresaDiv.className = 'company-data-error';
                empresaDiv.innerHTML = `

                        <div>
                            <p>Aparentemente você não está relacionado a nenhuma empresa! :(</p>
                         </div>            
                    `;
                    container.appendChild(empresaDiv);
            }
        })
        .catch(error => {
            console.error('Erro ao carregar os dados:', error);
            const empresaDiv = document.createElement('div');
            empresaDiv.className = 'company';
            empresaDiv.innerHTML = `

                
                        <div>
                            <h1>Erro ao pesquisar pelas empresas relacionadas a sua conta :(</h1>
                         </div>            
                    `;
                    container.appendChild(empresaDiv);
        });



    document.getElementById('newCompanyButton').addEventListener('click', function() {
    // Ação ao clicar no div
    window.location.href = '/company/register'; // Substitua pelo caminho correto
  });

}); 
    /*

    contas para teste:

    relacionado a duas empresas:
        silvinho@gmail.com
        PedroPy13.

    relacionado a uma empresa:
        pedrohenriquesilvaquixabeira@gmail.com
        PedroPy13.

    relacionado a nenhuma empresa:
        banana@gmail.com
        Pedro12504.


     // independente da quantidade, se tiver algum valor, vai vim em lista, brinque com indices

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

