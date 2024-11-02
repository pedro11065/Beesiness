const balanceChartCanvas = document.getElementById('balanceChartCanvas').getContext('2d');
const assetsLiabilitiesChartCanvas = document.getElementById('assetsLiabilitiesChartCanvas').getContext('2d');

let balanceChart;
let assetsLiabilitiesChart;

function scrollCarousel(direction) {
    const carousel = document.querySelector(".carousel-wrapper"); // Ajuste aqui: selecione corretamente o contêiner que rola
    const scrollAmount = 400; // Define uma quantidade fixa para rolagem

    // Rolar horizontalmente com base na direção
    if (direction === 1) {
        carousel.scrollLeft += scrollAmount; // Rola para a direita
    } else {
        carousel.scrollLeft -= scrollAmount; // Rola para a esquerda
    }
}

function getCnpjFromUrl() {
    const url = window.location.pathname;
    const parts = url.split('/');
    return parts[parts.length - 1];
}

function formatValueToMoney(valueStr) {
    const valueNum = parseFloat(valueStr);
    return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function CashName(nameStr) {
    return nameStr === '#!@cash@!#' ? 'Caixa' : nameStr;
}

document.addEventListener('DOMContentLoaded', async function () {
    const main = document.getElementById('main');
    const info_box_container = document.getElementById('info_box_container');
    const loading = document.getElementById('loading'); // Certifique-se de que a variável loading está definida

    loading.style.display = 'flex';
    main.style.display = 'none';

    try {
        const cnpj = getCnpjFromUrl(); // Obter o CNPJ da URL
        const response = await fetch(`/dashboard/company/${cnpj}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        loading.style.display = 'none';
        main.style.display = 'block';

        document.getElementById('value_day').textContent = `${formatValueToMoney(data.value_today.toFixed(2))}`;
        // Atualiza o valor da semana
        document.getElementById('value_week').textContent = `${formatValueToMoney(data.value_week.toFixed(2))}`;
        // Atualiza o valor do mês
        document.getElementById('value_month').textContent = `${formatValueToMoney(data.value_week.toFixed(2))}`;
        // Saldo
        document.getElementById('cash_now').textContent = `${formatValueToMoney(data.cash_now)}`;
        // Patrimônio
        document.getElementById('patrimony').textContent = `${formatValueToMoney(data.patrimony)}`; 
        // Quantidade de passivos
        document.getElementById('liabilities_quant').textContent = `${data.liabilities_quant}`;
        // Quantidade de ativos
        document.getElementById('assets_quant').textContent = `${data.assets_quant}`;
        // Quantidade de entradas
        document.getElementById('count_entrys').textContent = `${data.count_entrys}`;
        // Quantidade de saídas
        document.getElementById('count_exits').textContent = `${data.count_exits}`;
        // Total de saídas
        document.getElementById('values_entrys').textContent = `${formatValueToMoney(data.values_entrys)}`;
        // Total de saídas
        document.getElementById('values_exits').textContent = `${formatValueToMoney(data.values_exits)}`;




        // Preencher a seção de informações
        

        const liabilities_box = document.getElementById('assets_box');
        liabilities_box.addEventListener('click', function () {
            window.location.href = `/dashboard/assets/${cnpj}`;
        });

        const assets_box = document.getElementById('liabilities_box');
        assets_box.addEventListener('click', function () {
            window.location.href = `/dashboard/liabilities/${cnpj}`;
        });

        // Criar o gráfico de fluxo de caixa com base nos dias da semana
        const balanceData = {
            labels: Object.keys(data.cash_historic), // Dias da semana
            values: Object.values(data.cash_historic) // Valores do fluxo de caixa por dia
        };

        const assetsLiabilitiesData = {
            labels: data.assets_dates_list || data.liabilities_dates_list,  // Use a lista de datas correta
            assets: data.assets_count, 
            liabilities: data.liabilities_count
        };

        // Chamar a função que cria o gráfico de saldo
        createBalanceChart(balanceData);
        createAssetsLiabilitiesChart(assetsLiabilitiesData);

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
});

// Função para criar o gráfico de saldo
function createBalanceChart(data) {
    // Verifique se o gráfico já existe e, se sim, destrua-o
    if (balanceChart) {
        balanceChart.destroy(); // Destrói o gráfico existente
    }

    const chartData = {
        labels: data.labels,
        datasets: [{
            label: 'Saldo',
            data: data.values,
            backgroundColor: 'rgba(255, 204, 0, 0.5)', // Cor do fundo do gráfico
            borderColor: 'rgba(255, 204, 0, 1)', // Cor da linha do gráfico
            borderWidth: 1
        }]
    };

    const config = {
        type: 'bar', // Tipo do gráfico (pode ser 'line', 'bar', etc.)
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true // Iniciar o eixo Y em zero
                }
            }
        }
    };

    balanceChart = new Chart(balanceChartCanvas, config); // Criar o gráfico
}

// Função para criar o gráfico de ativos e passivos
function createAssetsLiabilitiesChart(data) {
    const chartData = {
        datasets: [{
            label: 'Ativos',
            data: data.assets,
            backgroundColor: 'rgba(0, 255, 0, 0.5)', // Cor do fundo dos ativos
            borderColor: 'rgba(0, 255, 0, 1)', // Cor da linha dos ativos
            borderWidth: 1
        }, {
            label: 'Passivos',
            data: data.liabilities,
            backgroundColor: 'rgba(255, 0, 0, 0.5)', // Cor do fundo dos passivos
            borderColor: 'rgba(255, 0, 0, 1)', // Cor da linha dos passivos
            borderWidth: 1
        }]
    };

    const config = {
        type: 'line', // Tipo do gráfico
        data: chartData,
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };

    assetsLiabilitiesChart = new Chart(assetsLiabilitiesChartCanvas, config);
}

// Dados de exemplo para os gráficos
const balanceData = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'], // Meses ou períodos
    values: [1200, 1900, 3000, 5000, 7000] // Valores do saldo
};


// Funções para alternar entre gráficos
function showWeekly() {
    // Lógica para mostrar gráficos semanais
}

function showMonthly() {
    // Lógica para mostrar gráficos mensais
}

function showYearly() {
    // Lógica para mostrar gráficos anuais
}
