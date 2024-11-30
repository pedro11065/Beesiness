/** Correções necessárias:
 *  - Mês no month-box precisa estar de acordo com o selecionado.
 *  - O capital social deve ficar em patrimônio líquido.
 *  - Quando não há nada selecionado, ele pedirá para selecionar algo primeiro.
 */

document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const menu = document.getElementById('menu-container');
    const loading = document.getElementById('loading');
    const monthYearSelect = document.getElementById('month-year-select');

    // Formatar data no formato "MM/YYYY"
    const formatDateToMonthYear = (dateString) => {
        const [year, month] = dateString.split('-');
        return `${month}/${year}`;
    };

    // Preencher as opções de mês/ano no menu
    const populateMonthYearOptions = (dates) => {
        const uniqueMonths = Array.from(new Set(dates.map(formatDateToMonthYear))).sort((a, b) => {
            const [monthA, yearA] = a.split('/').map(Number);
            const [monthB, yearB] = b.split('/').map(Number);
            return yearA === yearB ? monthA - monthB : yearA - yearB;
        });

        uniqueMonths.forEach(monthYear => {
            const option = document.createElement('option');
            option.value = monthYear;
            option.textContent = monthYear;
            monthYearSelect.appendChild(option);
        });
    };

    // Filtrar os dados pelo mês/ano
    const filterDataByMonthYear = (data, monthYear) => {
        const [selectedMonth, selectedYear] = monthYear.split('/').map(Number);
        return data.filter(item => {
            const [year, month] = item.date.split('-').map(Number);
            return year === selectedYear && month === selectedMonth;
        });
    };

    // Atualizar o DOM com os resultados
    const updateHtmlWithResults = (data, sectionSelector) => {
        const section = document.querySelector(sectionSelector);
        if (!section) return;

        section.querySelectorAll('.category-item').forEach(categoryItem => {
            const categoryName = categoryItem.querySelector('.category-title h3').textContent.trim().toLowerCase();
            const ul = categoryItem.querySelector('.data-list');
            ul.innerHTML = ''; // Limpar a lista

            if (!data[categoryName]) return;

            const createListItem = (key, value) => {
                const li = document.createElement('li');
                li.classList.add('data-item');
                li.textContent = `${key}: ${formatValueToMoney(0, value)}`; // Pedro: Se quiser mudar a box dos valores, fica nessa parte.
                ul.appendChild(li);
            };

            // Adicionar itens ao DOM
            Object.entries(data[categoryName]).forEach(([key, value]) => {
                if (typeof value === 'object') {
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        if (subKey !== '#!@cash@!#' && typeof subValue === 'number') {
                            createListItem(subKey, subValue);
                        }
                    });
                } else if (key !== '#!@cash@!#' && typeof value === 'number') {
                    createListItem(key, value);
                }
            });
        });
    };

    // Processar dados agrupando-os por categorias
    const processCategories = (data) => {
        return data.reduce((grouped, item) => {
            if (item.name === '#!@cash@!#') return grouped; // Ignorar itens específicos
            const category = item.class.toLowerCase();
            if (!grouped[category]) grouped[category] = {};
            grouped[category][item.name] = (grouped[category][item.name] || 0) + item.value;
            return grouped;
        }, {});
    };

    // Soma os valores das categorias
    const sumValues = (data) => {
        return Object.values(data).reduce((total, category) => {
            return total + Object.values(category).reduce((sum, value) => {
                if (typeof value === 'object') {
                    return sum + Object.values(value).reduce((subSum, subValue) => subSum + (typeof subValue === 'number' ? subValue : 0), 0);
                }
                return sum + (typeof value === 'number' ? value : 0);
            }, 0);
        }, 0);
    };

    // Exibir dados filtrados no DOM
    const displayFilteredData = (filteredAssets, filteredLiabilities) => {
        const processedAssets = {
            circulante: processCategories(filteredAssets.circulante),
            nao_circulante: processCategories(filteredAssets.nao_circulante)
        };

        const processedLiabilities = {
            circulante: processCategories(filteredLiabilities.circulante),
            nao_circulante: processCategories(filteredLiabilities.nao_circulante)
        };
        
        console.log(processedAssets)
        console.log(processedLiabilities)

        // Atualizar os ativos e passivos no DOM
        updateHtmlWithResults(processedAssets, '.financial-container .category-container');
        updateHtmlWithResults(processedLiabilities, '.second-category-container .category-container');

        // Atualizar os totais
        document.getElementById('total-ativo').textContent = formatValueToMoney(0, sumValues(processedAssets));
        document.getElementById('total-passivo').textContent = formatValueToMoney(0, sumValues(processedLiabilities));
    };

    // Função principal com chamada à API e inicialização
    try {
        const cnpj = getCnpjFromUrl();

        loading.style.display = 'flex';
        main.style.display = 'none';
        menu.style.display = 'none';

        const response = await fetch(`/dashboard/balance-sheet/${cnpj}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error('Erro na resposta da API: ' + response.statusText);

        const data = await response.json();

        populateMonthYearOptions(data.dates);

        monthYearSelect.addEventListener('change', function () {
            const selectedMonthYear = this.value;

            const filteredAssets = {
                circulante: filterDataByMonthYear(data.assets.circulante, selectedMonthYear),
                nao_circulante: filterDataByMonthYear(data.assets.nao_circulante, selectedMonthYear)
            };

            const filteredLiabilities = {
                circulante: filterDataByMonthYear(data.liabilities.circulante, selectedMonthYear),
                nao_circulante: filterDataByMonthYear(data.liabilities.nao_circulante, selectedMonthYear)
            };

            displayFilteredData(filteredAssets, filteredLiabilities);
        });

        loading.style.display = 'none';
        main.style.display = 'flex';
        menu.style.display = 'flex';
    } catch (error) {
        console.error(error);
        loading.style.display = 'none';
        main.style.display = 'flex';
        main.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
    }
});

const getCnpjFromUrl = () => {
    const url = window.location.pathname;
    const parts = url.split('/');
    return parts[parts.length - 1];
};

const formatValueToMoney = (mode, value) => {
    return mode === 0 && value ? parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '----';
};
