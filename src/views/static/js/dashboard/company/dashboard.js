const balanceChartCanvas = document.getElementById('balanceChartCanvas').getContext('2d');
const assetsLiabilitiesChartCanvas = document.getElementById('assetsLiabilitiesChartCanvas').getContext('2d');

let balanceChart;
let assetsLiabilitiesChart;



function scrollCarousel(direction) {
    const carousel = document.querySelector(".carousel-wrapper"); // Ajuste aqui: selecione corretamente o contêiner que rola
    const scrollAmount = 400; // Define uma quantidade fixa para rolagem (200px)

    // Rolar horizontalmente com base na direção
    if (direction === 1) {
        carousel.scrollLeft += scrollAmount; // Rola para a direita
    } else {
        carousel.scrollLeft -= scrollAmount; // Rola para a esquerda
    }
}
// Função para criar o gráfico de saldo
function createBalanceChart(data) {
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
createBalanceChart(balanceData);
createAssetsLiabilitiesChart(assetsLiabilitiesData);

// Funções para alternar entre gráficos
function showWeekly() {
    // Atualizar dados do gráfico semanal
    alert("Mostrando gráfico semanal.");
}

function showMonthly() {
    // Atualizar dados do gráfico mensal
    alert("Mostrando gráfico mensal.");
}

function showYearly() {
    // Atualizar dados do gráfico anual
    alert("Mostrando gráfico anual.");
}