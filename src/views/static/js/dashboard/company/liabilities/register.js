document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('LiabilityForm');
    const submitButton = document.querySelector('.register-button');

    // Função para extrair o CNPJ da URL
    function getCnpjFromUrl() {
        const url = window.location.pathname;  // Obtém o caminho da url.
        const parts = url.split('/');  // Divide a url pelas barras.
        return parts[parts.length - 1];  // Retorna a última parte dividida.
    }

    const cnpj = getCnpjFromUrl();

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return; // Se a validação falhar, não envia o formulário
        }

        const eventvalue = document.getElementById('event').value.trim();
        const classvalue = document.getElementById('class').value.trim();
        const payment_method = document.getElementById('payment_method').value.trim();
        const status = document.getElementById('status').value.trim();
        const name = document.getElementById('name').value.trim();
        const value = document.getElementById('value').value.trim().replace(/[^\d,-]/g, '').replace(',', '.');
        const emission_date = document.getElementById('emission_date').value.trim();
        const expiration_date = document.getElementById('expiration_date').value.trim();
        const description = document.getElementById('description').value.trim() || 'Descrição não adicionada.';

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
        
        try {
            const response = await fetch(`/dashboard/register/liability/${cnpj}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                openSuccessModal('Passivo registrado com sucesso!');
            } else {
                const errorData = await response.json();
                openAlertModal(`Erro: ${errorData.message || 'Não foi possível registrar o passivo.'}`);
            }
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            openAlertModal('Erro ao enviar dados. Tente novamente mais tarde.');
        }
    });

    function validateForm() {
        const eventvalue = document.getElementById('event').value.trim();
        const classvalue = document.getElementById('class').value.trim();
        const payment_method = document.getElementById('payment_method').value.trim();
        const status = document.getElementById('status').value.trim();
        const name = document.getElementById('name').value.trim();
        const value = document.getElementById('value').value.trim().replace(/[^\d,-]/g, '').replace(',', '.');
        const emission_date = document.getElementById('emission_date').value.trim();
        const expiration_date = document.getElementById('expiration_date').value.trim();
        const description = document.getElementById('description').value.trim();

        // Verifica se os campos obrigatórios estão vazios
        if (!eventvalue || !classvalue || !payment_method || !status || !name || !value || !emission_date || !expiration_date ) {
            openSuccessModal('Campo obrigatório não preenchido.');
            return false;
        }

        // Validação de nome
        if (name.length < 3) {
            openAlertModal('Nome muito curto.');
            return false;
        } else if (name.length > 255) {
            openAlertModal('Nome muito longo.');
            return false;
        }

        // Validação de valor (precisa ser um número)
        if (isNaN(value) || value <= 0) {
            openAlertModal('Valor inválido.');
            return false;
        }

        // Validação de datas
        if (new Date(emission_date) > new Date(expiration_date)) {
            openAlertModal('A data de vencimento deve ser posterior à data de emissão.');
            return false;
        }

        // Validação de descrição
        if (description.length > 500) { // Limite de caracteres para descrição
            openAlertModal('Descrição muito longa (máx. 500 caracteres).');
            return false;
        }

        return true; // Todos os campos são válidos
    }

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

    // Função para abrir o modal
    function openAlertModal(message) {
        const modal = document.getElementById('alert-modal');
        const modalMessage = document.getElementById('alert-message');

        modalMessage.textContent = message;
        modal.style.display = 'block';

        // Fecha ao clicar fora da área do modal
        window.onclick = function(event) {
            if (event.target == modal) {
                closeModal();
            }
        };
    }

    // Função para abrir o modal de sucesso
    function openSuccessModal(message) {
        const modal = document.getElementById('success-modal');
        const successMessage = document.getElementById('success-message');

        successMessage.textContent = message;
        modal.style.display = 'block';

        const closeButton = modal.querySelector('.fechar');
        closeButton.onclick = function() {
            closeModal();
            window.location.href = `/dashboard/company/${cnpj}`;
        };

        // Fecha ao clicar fora da área do modal
        window.onclick = function(event) {
            if (event.target == modal) {
                closeModal();
                window.location.href = `/dashboard/company/${cnpj}`;
            }
        };
    }


    function closeModal() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    document.querySelectorAll('.fechar').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.querySelector('.close').addEventListener('click', closeModal);
});
