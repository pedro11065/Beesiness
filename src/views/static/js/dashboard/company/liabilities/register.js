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
    value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = (value / 100).toFixed(2); // Converte para duas casas decimais
    value = value.replace('.', ',');
    return `R$ ${value}`;
}

document.getElementById('value').addEventListener('input', function (e) {
    this.value = formatMoney(this.value);
});

/*
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

    const emission_date = document.getElementById('emission_date').value.trim();
    const expiration_date = document.getElementById('expiration_date').value.trim();

    var isValid = true

    emission_date = formatDateToBrazilian(emission_date); // Converter a data de nascimento YYYY/MM/DD para o formato DD/MM/YYYY
    expiration_date = formatDateToBrazilian(emission_date); // Converter a data de nascimento YYYY/MM/DD para o formato DD/MM/YYYY
    const birthDatePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

    if (!birthDatePattern.test(emission_date)) {
        displayError('emission_date', 'Data de nascimento inválida. Use o formato DD/MM/YYYY.');
        isValid = false;
    }

    if (!birthDatePattern.test(expiration_date)) {
        displayError('expiration_date', 'Data de nascimento inválida. Use o formato DD/MM/YYYY.');
        isValid = false;
    }

    return isValid;

    function formatDateToBrazilian(dateStr) {
        // Converte de YYYY-MM-DD para DD/MM/YYYY
        const date = new Date(dateStr);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }    
}

*/
