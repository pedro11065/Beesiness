document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const menu = document.getElementById('menu-container');
    const month = document.getElementById('month-container');
    const loading = document.getElementById('loading');

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

        // Função genérica para processar os dados
        function processCategories(data, filter = null) {
            const result = {};

            for (const category in data) {
                result[category] = {};

                data[category].forEach(item => {
                    // Aplica o filtro, se definido (ex.: "Capital Social" para patrimônio)
                    if (item.name !== '#!@cash@!#' && (!filter || filter(item))) {
                        if (result[category][item.class]) {
                            result[category][item.class] += item.value;
                        } else {
                            result[category][item.class] = item.value;
                        }
                    }
                });
            }

            return result;
        }

        // Atualizar o DOM com resultados processados
        function updateHtmlWithResults(results, sectionSelector) {
            const section = document.querySelector(sectionSelector);

            if (!section) return;

            for (const category in results) {
                // Encontre o item de categoria baseado no título, incluindo qualquer variação
                const categoryElement = Array.from(
                    section.querySelectorAll('.category-item')
                ).find(item => {
                    const h3Text = item.querySelector('h3').textContent.toLowerCase();
                    return h3Text.includes(category.replace('_', ' ').toLowerCase());
                });

                if (categoryElement) {
                    const ul = categoryElement.querySelector('.data-list');
                    ul.innerHTML = ''; // Limpa os itens anteriores

                    for (const className in results[category]) {
                        const li = document.createElement('li');
                        li.classList.add('data-item');
                        li.textContent = `${className}: ${formatValueToMoney(0,results[category][className])}`;
                        ul.appendChild(li);
                    }
                }
            }
        }

        // Processar e exibir os dados de ativos
        const processedAssets = processCategories(data.assets);
        updateHtmlWithResults(processedAssets, '.financial-container .category-container');

        const totalAtivo = sumValues(processedAssets);
        document.getElementById('total-ativo').textContent = `${formatValueToMoney(0,totalAtivo.toFixed(2))}`;

        // Processar e exibir os dados de passivos
        const processedLiabilities = processCategories(data.liabilities);
        updateHtmlWithResults(processedLiabilities, '.second-category-container .category-container');

        const totalPassivo = sumValues(processedLiabilities);
        document.getElementById('total-passivo').textContent = `${formatValueToMoney(0,totalPassivo.toFixed(2))}`;

        // Processar e exibir os dados de patrimônio (filtrando apenas "Capital Social")
        const processedPatrimony = processCategories(data.assets, item => item.event === 'Capital Social');
        console.log(processedPatrimony);
        updateHtmlWithResults(processedPatrimony, '.second-category-container .patrimony-title');

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

function sumValues(data) {
    let total = 0;
    for (const category in data) {
        for (const item in data[category]) {
            total += data[category][item];
        }
    }
    return total;
}

function formatValueToMoney(mode, valueStr) {
    if (valueStr != 0 && mode == 0) {
        const valueNum = parseFloat(valueStr);
        return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    if (mode == 1) {
        const valueNum = parseFloat(valueStr);
        return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    return '----';
}