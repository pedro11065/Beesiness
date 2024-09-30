/*

ALTERAÇÕES QUE AINDA FALTAM:
É necessário confirmar a autenticidade do CPF.

Caso a pessoa deseje alterar outros dados, será necessário inserir a nova senha de qualquer forma?

Também é preciso verificar se o CPF e o e-mail informados já estão registrados no site.
*/


document.addEventListener("DOMContentLoaded", function () {
    const settingsForm = document.getElementById("settingsForm");
    const saveButton = document.querySelector(".save-btn");
    const modalBackdropSettings = document.getElementById("modalBackdropSettings");
    const dialog = document.getElementById("dialog");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    const cpfField = document.getElementById('cpf');
    cpfField.value = formatCPF(cpfField.value);

    document.getElementById('cpf').addEventListener('input', function (e) {
        this.value = formatCPF(this.value);
    });

    // Impede o envio do formulário automaticamente
    settingsForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário
    });

    saveButton.addEventListener('click', async () => {
        const isValid = await validateForm();

        if (isValid) {
            dialog.setAttribute('open', true);
            modalBackdropSettings.style.display = "flex"; 
        }
    });
    
    // Botão de cancelar
    cancelBtn.addEventListener('click', () => {
        modalBackdropSettings.style.display = "none";
    });

    // Botão de confirmar
    confirmBtn.addEventListener('click', async () => {
        modalBackdropSettings.style.display = "none";
        await sendData();
    });

    // Ele fecha o modal se clicar no fundo
    modalBackdropSettings.addEventListener('click', (event) => {
        if (event.target === modalBackdropSettings) {
            modalBackdropSettings.style.display = "none";
        }
    });
});


// Envio de dados para o backend
async function sendData() {
    const saveButton = document.querySelector(".save-btn");
    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";

    const settingsData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        cpf: document.getElementById('cpf').value.trim().replace(/\D/g, ''),
        password: document.getElementById('password').value,
        new_password: document.getElementById('new_password').value
    };

    try {
        const response = await fetch('/user/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settingsData)
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        if (data.success) {
            window.location.reload();
        } else {
            displayError('password', 'Senha incorreta.');

            // Precisa de outros erros aqui, e-mail ou cpf já cadastrado.
        }
            
        
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Salvar Alterações";
    }
}


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

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim().replace(/\D/g, '');
    const password = document.getElementById('password').value;
    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;

    let isValid = true;

    // Valida se os campos estão vázios
    if (password.length == 0 || new_password.length == 0 || confirm_password.length == 0 || cpf.length == 0 || email.length == 0 || name.length == 0) {
        isValid = false;
    }

    // Validação de nome
    if (name.length < 3) {
        displayError('name', 'Nome muito curto.');
        isValid = false;
    }

    // Validação de e-mail
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError('email', 'E-mail inválido.');
        isValid = false;
    }

    // Validação de CPF
    if (cpf.length !== 11 || !verifyCPF(cpf)) {
        displayError('cpf', 'CPF inválido.');
        isValid = false;
    }

    // Validação de senha nova e confirmação de senha
    if (new_password && confirm_password && new_password !== confirm_password) {
        displayError('new_password', 'As senhas não coincidem.');
        isValid = false;
    }

    return isValid;
}

function verifyCPF(strCPF) {
    let Soma;
    let Resto;
    Soma = 0;

    if (strCPF === "00000000000") return false;

    for (let i = 1; i <= 9; i++) {
        Soma += parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }

    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (let i = 1; i <= 10; i++) {
        Soma += parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if (Resto === 10 || Resto === 11) Resto = 0;
    if (Resto !== parseInt(strCPF.substring(10, 11))) return false;

    return true;
}

function formatCPF(value) {
    value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = value.replace(/^(\d{3})(\d)/, '$1.$2'); // Adiciona o primeiro ponto
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3'); // Adiciona o segundo ponto
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2'); // Adiciona o hífen
    return value;
}