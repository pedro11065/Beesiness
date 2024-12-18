document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('AssetForm');
    const submitButton = document.querySelector('.register-button');
    const submitButtonTxt = document.getElementById('register-button-text');

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

        submitButton.disabled = true;
        submitButtonTxt.textContent = "Aguarde..."


        const eventValue = document.getElementById('event').value.trim();
        const floating = document.getElementById('floating').value.trim();
        const classeValue = document.getElementById('class').value.trim();
        const name = document.getElementById('name').value.trim();
        const localization = document.getElementById('localization').value.trim() || 'Descrição não adicionada.';
        const acquisitionDate = document.getElementById('acquisition_date').value.trim();
        const acquisitionValue = document.getElementById('acquisition_value').value.trim().replace(/[^\d,-]/g, '').replace(',', '.'); 
        const status = document.getElementById('status').value.trim();
        const payment_method = document.getElementById('payment_method').value.trim();
        const installment = document.getElementById('installment').value.trim();
        const description = document.getElementById('description').value.trim() || 'Descrição não adicionada.';

        const formData = {
            cnpj: cnpj,
            event: eventValue,
            classe: classeValue,
            name: name,
            floating: floating,
            localization: localization,
            acquisitionDate: acquisitionDate,
            acquisitionValue: acquisitionValue,
            status: status,
            description: description,
            installment: installment,
            payment_method: payment_method
        };

        try {
            const response = await fetch(`/dashboard/register/asset/${cnpj}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                openSuccessModal('Ativo registrado com sucesso!');
            } else {
                const errorData = await response.json();
                openAlertModal(`Erro: ${errorData.message || 'Não foi possível registrar o ativo.'}`);
                submitButton.disabled = false;
                submitButtonTxt.textContent = "Registrar";
            }
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            openAlertModal('Erro ao enviar dados. Tente novamente mais tarde.');
            submitButton.disabled = false;
            submitButtonTxt.textContent = "Registrar";
        }
    });

    function validateForm() {
        const eventValue = document.getElementById('event').value.trim();
        const classeValue = document.getElementById('class').value.trim();
        const name = document.getElementById('name').value.trim();
        const localization = document.getElementById('localization').value.trim();
        const acquisitionDate = document.getElementById('acquisition_date').value.trim();
        const acquisitionValue = document.getElementById('acquisition_value').value.trim().replace(/[^\d,-]/g, '').replace(',', '.');
        const status = document.getElementById('status').value.trim();
        const description = document.getElementById('description').value.trim();
        const floating = document.getElementById('floating').value.trim();

        // Verifica se os campos obrigatórios estão vazios
        if (!eventValue || !classeValue || !name || !acquisitionDate || !acquisitionValue || !status || !floating ) {
            openAlertModal('Campo obrigatório não preenchido.');
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
        if (isNaN(acquisitionValue) || acquisitionValue <= 0) {
            openAlertModal('Valor inválido.');
            return false;
        }

        // Validação de descrição
        if (description.length > 255) { // Limite de caracteres para descrição
            openAlertModal(`Descrição muito longa (máx. 255 caracteres).\nVocê digitou ${description.length} caracteres!`);
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

    document.getElementById('acquisition_value').addEventListener('input', function (e) {
        this.value = formatMoney(this.value);
    });

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
