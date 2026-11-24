document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const main_temporario = document.getElementById('main_temporario'); 
    const menu = document.getElementById('menu-container');
    const monthYearSelect = document.getElementById('month-year-select');

    // Formatar data no formato "MM/YYYY"
    const formatDateToMonthYear = (dateString) => {
        const [year, month] = dateString.split('-');
        return `${month}/${year}`;
    };

    // Preencher as opções de mês/ano no menu
    const populateMonthYearOptions = (dates) => {
        const uniqueMonths = [...new Set(dates.map(formatDateToMonthYear))].sort((a, b) => {
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
        return Object.fromEntries(Object.entries(data).map(([key, values]) => [
            key, filterEntriesByDate(values, selectedYear, selectedMonth)
        ]));
    };

    // Filtrar entradas com base no mês/ano
    const filterEntriesByDate = (values, year, month) => {
        const filtered = {};
        Object.entries(values).forEach(([name, transactions]) => {
            if (Array.isArray(transactions)) {
                const filteredTransactions = transactions.filter(({ date }) => {
                    const [dataYear, dataMonth] = date.split('-').map(Number);
                    return dataYear === year && dataMonth === month;
                });
                if (filteredTransactions.length > 0) filtered[name] = filteredTransactions;
            } else {
                filtered[name] = transactions;
            }
        });
        return filtered;
    };

    // Atualizar o DOM com os resultados
    const updateHtmlWithResults = (data, sectionSelector, isPatrimony = false) => {
        const section = document.querySelector(sectionSelector);
        if (!section) return;
    
        const renderDataList = (ul, data) => {
            ul.innerHTML = '';
            Object.entries(data).forEach(([key, transactions]) => {
                if (Array.isArray(transactions)) {
                    const totalValue = transactions.reduce((sum, { value }) => sum + value, 0);
                    const li = document.createElement('li');
                    li.classList.add('data-item');
                    li.textContent = `${key}: ${formatValueToMoney(0, totalValue)}`;
                    ul.appendChild(li);
                } else if (typeof transactions === 'object') {
                    Object.entries(transactions).forEach(([subcategory, subcategoryTransactions]) => {
                        const li = document.createElement('li');
                        li.classList.add('data-item');
                        const totalSubcategoryValue = subcategoryTransactions.reduce((sum, { value }) => sum + value, 0);
                        li.textContent = `${subcategory}: ${formatValueToMoney(0, totalSubcategoryValue)}`;
                        ul.appendChild(li);
                    });
                }
            });
        };
    
        if (isPatrimony) {
            const ul = section.querySelector('.data-list');
            renderDataList(ul, data);
        } else {
            section.querySelectorAll('.category-item').forEach(categoryItem => {
                const categoryName = categoryItem.querySelector('.category-title h3').textContent.trim().toLowerCase();
                const ul = categoryItem.querySelector('.data-list');
                if (data[categoryName]) renderDataList(ul, data[categoryName]);
            });
        }
    };

    const displayFilteredData = (data) => {
        updateHtmlWithResults(data.assets, '.first-category-container .category-container'); // Ativos
        updateHtmlWithResults(data.liabilities, '.second-category-container .category-container'); // Passivos
        updateHtmlWithResults(data.patrimony, '.patrimony-section', true); // Patrimônio líquido

        const totalAtivo = sumValues(data.assets);
        document.getElementById('total-ativo').textContent = formatValueToMoney(0, totalAtivo);

        const totalPassivo = sumValues(data.liabilities);
        const totalPatrimonio = sumValues(data.patrimony);

        const totalPassivoPatrimonio = totalPassivo + totalPatrimonio;
        document.getElementById('total-passivo-patrimonio').textContent = formatValueToMoney(0, totalPassivoPatrimonio);
    };

    // Função para somar os valores considerando a estrutura dos dados
    const sumValues = (data) => {
        return Object.values(data).reduce((total, category) => {
            if (typeof category === 'object') {
                return total + Object.values(category).reduce((sum, transactions) => {
                    if (Array.isArray(transactions)) {
                        return sum + transactions.reduce((transactionSum, { value }) => transactionSum + (typeof value === 'number' ? value : 0), 0);
                    }
                    return sum;
                }, 0);
            }
            return total;
        }, 0);
    };

    // Função principal com chamada à API e inicialização
    try {
        const cnpj = getCnpjFromUrl();
    
        main_temporario.style.display = 'flex';
        menu.style.display = 'flex';
        main.style.display = 'none';
    
        const response = await fetch(`/dashboard/balance-sheet/${cnpj}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
    
        if (!response.ok) throw new Error('Erro na resposta da API: ' + response.statusText);
    
        const data = await response.json();
        console.log(data);
    
        populateMonthYearOptions(data.dates);
    
        monthYearSelect.addEventListener('change', function () {
            const selectedMonthYear = this.value;
            const [selectedMonth, selectedYear] = selectedMonthYear.split('/');
            const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
            const monthName = monthNames[parseInt(selectedMonth, 10) - 1];
    
            document.querySelector('#month-container .month-box h1').textContent = monthName;
    
            const filteredData = {
                assets: filterDataByMonthYear(data.assets, selectedMonthYear),
                liabilities: filterDataByMonthYear(data.liabilities, selectedMonthYear),
                patrimony: filterDataByMonthYear(data.patrimony, selectedMonthYear)
            };
    
            console.log(filteredData);
            displayFilteredData(filteredData);
    
            main_temporario.style.display = 'none';
            main.style.display = 'flex';
            menu.style.display = 'flex';
        });
    
    } catch (error) {
        console.error(error);
        main_temporario.style.display = 'none';
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
    if (mode === 0 && value && !isNaN(value)) {
        return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return '- - -';  // Retorna '----' se o valor não for válido
};
