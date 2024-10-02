document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('LiabilityForm');
    const submitButton = document.querySelector('.register-button');

    // Função para extrair o CNPJ da URL
    function getCnpjFromUrl() {
        const url = window.location.pathname;  // Obtém o caminho da url.
        const parts = url.split('/');  // Divide a url pelas barras.
        return parts[parts.length - 1];  // Vai retornar a última parte dividida.
    }

    const cnpj = getCnpjFromUrl();

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const eventvalue = document.getElementById('event').value.trim();
        const classvalue = document.getElementById('class').value.trim();
        const payment_method = document.getElementById('payment_method').value.trim();
        const status = document.getElementById('status').value.trim();
        const name = document.getElementById('name').value.trim();
        const value = document.getElementById('value').value.trim().replace(/[^\d,-]/g, '').replace(',', '.');
        const emission_date = document.getElementById('emission_date').value.trim();
        const expiration_date = document.getElementById('expiration_date').value.trim();
        
        const description = document.getElementById('description').value.trim();

        const formData = {
            cnpj: cnpj,
            event: eventvalue,
            classe: classvalue,
            payment_method: payment_method,
            status: status,
            name: name,
            value: value,
            emission_date: emission_date,
            expiration_date: expiration_date,
            description: description
        };
        console.log(formData)
        try {
            const response = await fetch(`/dashboard/register/liability/${cnpj}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Passivo registrado com sucesso!');
                window.location.href = `/dashboard/company/${cnpj}`;
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.message || 'Não foi possível registrar o passivo.'}`);
            }
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            alert('Erro ao enviar dados. Tente novamente mais tarde.');
        }
    });
});

function formatMoney(value) {
    value = value.replace(/\D/g, '');
    const numericValue = parseFloat(value) / 100;

    if (isNaN(numericValue)) {
        return 'R$ 0,00';
    }

    const result = new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL', 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    }).format(numericValue);

    return result;
}

document.getElementById('value').addEventListener('input', function (e) {
    this.value = formatMoney(this.value);
});

function clearErrors() {
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(function (errorField) {
        errorField.textContent = ''; // Limpa os erros anteriores
    });
}

function displayError(fieldId, message) {
    const errorField = document.getElementById(fieldId + '-error');
    if (errorField) {
        errorField.textContent = message;
    }
}

function validateForm() {
    clearErrors(); // Limpa os erros antes de validar

    const eventvalue = document.getElementById('event').value.trim();
    const classvalue = document.getElementById('class').value.trim();
    const payment_method = document.getElementById('payment_method').value.trim();
    const status = document.getElementById('status').value.trim();
    const name = document.getElementById('name').value.trim();
    const value = document.getElementById('value').value.trim().replace(/[^\d,-]/g, '').replace(',', '.');
    const emission_date = document.getElementById('emission_date').value.trim();
    const expiration_date = document.getElementById('expiration_date').value.trim();
    const description = document.getElementById('description').value.trim();

    let isValid = true;

    // Verifica se os campos obrigatórios estão vazios
    if (!eventvalue || !classvalue || !payment_method || !status || !name || !value || !emission_date || !expiration_date || !description) {
        isValid = false;
        displayError('event', 'Campo obrigatório.');
        displayError('class', 'Campo obrigatório.');
        displayError('payment_method', 'Campo obrigatório.');
        displayError('status', 'Campo obrigatório.');
        displayError('name', 'Campo obrigatório.');
        displayError('value', 'Campo obrigatório.');
        displayError('emission_date', 'Campo obrigatório.');
        displayError('expiration_date', 'Campo obrigatório.');
        displayError('description', 'Campo obrigatório.');
    }

    // Validação de nome
    if (name.length < 3) {
        displayError('name', 'Nome muito curto.');
        isValid = false;
    } else if (name.length > 255) {
        displayError('name', 'Nome muito longo.');
        isValid = false;
    }

    // Validação de valor (precisa ser um número)
    if (isNaN(value) || value <= 0) {
        displayError('value', 'Valor inválido.');
        isValid = false;
    }

    // Validação de datas
    if (new Date(emission_date) > new Date(expiration_date)) {
        displayError('expiration_date', 'A data de vencimento deve ser posterior à data de emissão.');
        isValid = false;
    }

    // Validação de descrição
    if (description.length > 500) { // Limite de caracteres para descrição
        displayError('description', 'Descrição muito longa (máx. 500 caracteres).');
        isValid = false;
    }

    return isValid;
}