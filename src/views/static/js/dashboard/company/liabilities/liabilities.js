document.addEventListener('DOMContentLoaded', function () {
    console.log("Script carregado!"); // Verifica se o script foi carregado

    const dataGroups = document.querySelectorAll('.data-group');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    dataGroups.forEach(group => {
        group.addEventListener('click', function () {
            const details = Array.from(group.children).map(child => child.innerText);
            const modalContent = `

            <main class="model-main">
                <header class="model-header">Detalhes do passivo</header>
                <article class="model-container">
                    <div class="model-box"><h5>ID: ${details[0]}</h5></div>
                    <div class="model-box"><h5>Nome: ${details[1]}</h5></div>
                    <div class="model-box"><h5>Evento: ${details[2]}</h5></div>
                    <div class="model-box"><h5>Categoria: ${details[3]}</h5></div>
                    <div class="model-box"><h5>Valor: ${details[4]}</h5></div>
                    <div class="model-box"><h5>Data de emissão: ${details[5]}</h5></div>
                    <div class="model-box"><h5>Data de vencimento: ${details[6]}</h5></div>
                    <div class="model-box"><h5>Forma de pagamento: ${details[7]}</h5></div>
                    <div class="model-box"><h5>Status: ${details[8]}</h5></div>
                    <div class="model-box"><h5>Descrição: ${details[9]}</h5></div>
                </article>
            </main>

            `;
            
            // Limpa o conteúdo anterior do modal
            modal.querySelector('.modal-content').innerHTML = '';
            modal.querySelector('.modal-content').innerHTML = modalContent;
            modal.style.display = 'block';
        });
    });

    closeModalBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});



document.addEventListener('DOMContentLoaded', async function () {

    try {
        const response = await fetch('??????', {
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
            

                const AssetDiv = document.createElement('section');

                AssetDiv.className = 'data-group';
                AssetDiv.style.cursor = 'pointer';

                AssetDiv.addEventListener('click', function () {


                    AssetDiv.innerHTML = `

                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>------/p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>
                    <div class="data-out-box"><div class="data-box"><p>-----</p></div></div>

                `;

                data-container.appendChild(AssetDiv); 
            });
            
        } else {
            console.error('Nenhum ativo encotrado!');
        }
    } catch (error) {
        console.error('Erro ao carregar os dados:', error);

    }
});
