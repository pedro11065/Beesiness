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
            data.historic.forEach((item) => {
                // Dados retornados pelo data.historic fazendo um forEach por cada item:
                console.log(item)

                /* item:

                "historic_id": item[0],
                "company_id": item[1],
                "user_id": item[2],
                "patrimony_id": item[3],
                "name": item[4],
                "event": item[5],
                "class": item[6],
                "value": item[7],
                "date": item[8],
                "type": item[9],
                "creation_date": item[10],
                "creation_time": item[11]
                */
                
                const dayDiv = document.createElement('div');
                dayDiv.className = 'day-container';
                dayDiv.style.cursor = 'pointer';

                dayDiv.addEventListener('click', function (){
                    window.location.href = `/dashboard/${item.type}/${item.patrimony_id}`;
                });
                
                dayDiv.innerHTML = `
                    <header class="title-container">
                        <div class="title-box">
                            <h3>${formatDateToBrazilian(item.creation_date)} - ${item.creation_time}</h3>
                        </div>
                        <div class="title-box">
                            <h3>${item.value}</h3>
                        </div>
                    </header>
            
                    <div class="description-container">
                        <div class="description-box">
                            <h4>${item.event} - ${item.class} - ${item.name}</h4>
                        </div>
                        <div class="description-box">
                            <h4>${item.user_id} - Dono</h4>
                        </div>
                    </div>
                `;
        
                container.appendChild(dayDiv);
            });
        } else {
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

function formatDateToBrazilian(dateStr) {
    // Converte de YYYY-MM-DD para DD/MM/YYYY
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
