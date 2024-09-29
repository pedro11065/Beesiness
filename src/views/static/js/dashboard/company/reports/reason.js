document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const loadingElement = document.getElementById('loading');
    const container = document.getElementById('monthContainer');

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
        main.style.display = 'inline-block';
        if (data.historic) {   

            data.name.forEach((i, index) => {
                console.log(i,index);
            });

            for (let i = 0; i < data.name.length; i++) { //para cada valor dentro de name(poderia ser qualquer outro valor, é só para saber a quantidade )
                
                const empresaDiv = document.createElement('div');  // Pega o CNPJ correspondente
                const class_ = data.class_[i];
                const company_id = data.company_id[i];
                const creation_date = data.creation_date[i];
                const creation_time = data.creation_time[i];
                const date = data.date[i];
                const error = data.error[i];
                const event_ = data.event[i];
                const historic = data.historic[i];
                const historic_id = data.historic_id[i];
                const name = data.name[i]; 
                const patrimony_id = data.patrimony_id[i];
                const redirect_url = data.redirect_url[i];
                const type = data.type[i];
                const user_id = data.user_id[i];
                const value = data.value[i];
                
                const dayDiv = document.createElement('div');

                dayDiv.className = 'day-container';
                dayDiv.style.cursor = 'pointer';

                empresaDiv.addEventListener('click', function (){
                    window.location.href = `/dashboard/${type}/${patrimony_id}` });

                dayDiv.innerHTML = `
                    <header class="title-container">
                        <div class="title-box">
                            <h3>${creation_date}</h3>
                        </div>
                        <div class="title-box">
                            <h3>${value}</h3>
                        </div>
                    </header>
        
                    <div class="description-container">
                        <div class="description-box">
                            <h4>${event_} - ${class_} - ${name}</h4>
                        </div>
                        <div class="description-box">
                            <h4>Pedro Henrique Silva Quixabeira - Dono</h4>
                        </div>
                    </div>
                `;

                container.appendChild(dayDiv); // Adiciona o div ao container
            };

        }
        
        else{
            container.style.display = 'none';
            const noDataDiv = document.createElement('div');
            noDataDiv.innerHTML = `<div class="error"><h1>Sem dados disponíveis.</h1></div>`;
            main.appendChild(noDataDiv);
        }

    } catch (error) {
        console.error('Erro ao carregar os dados',error);
        loadingElement.style.display = 'none';
        main.style.display = 'inline-block'
        container.style.display = 'none';
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
});
