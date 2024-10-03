document.addEventListener('DOMContentLoaded', () => {
    const patrimonio = JSON.parse(sessionStorage.getItem('patrimonioData'));
    const infoContainer = document.getElementById("info-container");

    if (patrimonio) {
        document.getElementById("nome-patrimonio").innerText = patrimonio.name || "Nome Desconhecido";

        Object.entries(patrimonio).forEach(([key, value]) => {
            if (!['company_id', 'historic_id', 'user_id', 'name'].includes(key)) {
                const infoItem = createInfoItem(key, value);
                infoContainer.appendChild(infoItem);
            }
        });

        setValueColor(patrimonio.type);
    } else {
        console.error('Nenhum dado de patrimônio encontrado no sessionStorage.');
    }
});

// Cria um elemento de informação (info-item) com rótulo e valor
function createInfoItem(key, value) {
    const infoItemDiv = document.createElement('div');
    infoItemDiv.className = 'info-item';

    const label = document.createElement('label');
    label.textContent = formatLabel(key);

    const valueDiv = document.createElement('div');
    valueDiv.className = 'value';
    valueDiv.textContent = formatValue(key, value);

    infoItemDiv.appendChild(label);
    infoItemDiv.appendChild(valueDiv);
    return infoItemDiv;
}

// Define a cor do valor baseado no tipo do patrimônio
function setValueColor(type) {
    const valorElement = document.querySelector('.value');
    valorElement.style.color = type === 'asset' ? 'green' : 'red';
}

// Formata a chave para um rótulo mais legível
function formatLabel(key) {
    const labelMap = {
        name: "Nome do Patrimônio",
        value: "Valor 💲",
        status: "Status",
        class: "Classe",
        creation_date: "Data 📅",
        localizacao: "Localização 📍",
        event: "Descrição",
    };
    return labelMap[key] || formatDefaultLabel(key);
}

// Formata a chave para um formato padrão (caso não esteja no labelMap)
function formatDefaultLabel(key) {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
}

// Formata o valor com base na chave
function formatValue(key, value) {
    switch (key) {
        case 'value':
            return formatValueToMoney(value);
        case 'creation_date':
            return formatDateToBrazilian(value);
        default:
            return value || "Valor Desconhecido"; // Valor padrão
    }
}

// Converte data de YYYY-MM-DD para DD/MM/YYYY
function formatDateToBrazilian(dateStr) {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
    return `${day} de ${month} de ${year}`;
}

// Formata o valor como moeda brasileira
function formatValueToMoney(valueStr) {
    const valueNum = parseFloat(valueStr);
    return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
