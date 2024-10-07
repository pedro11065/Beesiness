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

    loading.style.display = 'block';
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

        // Preencher a seção de informações
        const info_box_group = document.createElement('section');
        info_box_group.className = 'info_box_group';
        info_box_group.innerHTML = `
            <div class="info_box">
                <!-- Saldo atual -->
                <div class="info_box_title">
                    Saldo Atual
                </div>
                <div class="info_box_description">
                    ${formatValueToMoney(data.cash_now)}
                </div>
            </div>
            <div class="info_box" id="liabilities_box">
                <!-- Quantidade de ativos -->
                <div class="info_box_title">
                    Quantidade de Ativos
                </div>
                <div class="info_box_description">
                    ${data.assets_quant}
                </div>
            </div>
            <div class="info_box" id="assets_box">
                <!-- Quantidade de passivos -->
                <div class="info_box_title">
                    Quantidade de Passivos
                </div>
                <div class="info_box_description">
                    ${data.liabilities_quant}
                </div>
            </div>
            <div class="info_box">
                <!-- Patrimônio -->
                <div class="info_box_title">
                    Patrimônio
                </div>
                <div class="info_box_description">
                    ${formatValueToMoney(data.patrimony)}
                </div>
            </div>
        `;
        info_box_container.appendChild(info_box_group);

        const liabilities_box = document.getElementById('liabilities_box');
        liabilities_box.addEventListener('click', function () {
            window.location.href = `/dashboard/assets/${cnpj}`;
        });

        const assets_box = document.getElementById('assets_box');
        assets_box.addEventListener('click', function () {
            window.location.href = `/dashboard/liabilities/${cnpj}`;
        });

        // Criar o gráfico de fluxo de caixa com base nos dias da semana
        const balanceData = {
            labels: Object.keys(data.cash_historic), // Dias da semana
            values: Object.values(data.cash_historic) // Valores do fluxo de caixa por dia
        };

        // Chamar a função que cria o gráfico de saldo
        CashHistoryChart(balanceData);

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
});

// Função para criar o gráfico de saldo
function CashHistoryChart(data) {
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
        labels: data.labels,
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

const assetsLiabilitiesData = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio'],
    assets: [3000, 4000, 2500, 4500, 5000], // Valores dos ativos
    liabilities: [1000, 1500, 2000, 1000, 1500] // Valores dos passivos
};

// Inicializar os gráficos com os dados de exemplo
CashHistoryChart(balanceData);
createAssetsLiabilitiesChart(assetsLiabilitiesData);

