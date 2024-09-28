document.addEventListener("DOMContentLoaded", function () {
    const settingsForm = document.getElementById("settingsForm");
    const saveButton = document.querySelector(".save-btn");

    // Evento de envio do formulário
    settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário

        const confirmed = confirm("Tem certeza de que deseja salvar as alterações?");
        if (!confirmed) {
            return; // Se o usuário não confirmar, cancela o envio
        }

        if (!validateForm()) {
            return; // Se a validação falhar, interrompe o envio
        }

        // Desabilita o botão de salvar e altera o texto para "Salvando..."
        saveButton.disabled = true;
        saveButton.textContent = "Salvando...";

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const password = document.getElementById('password').value;
        const new_password = document.getElementById('new_password').value;
        const confirm_password = document.getElementById('confirm_password').value;

        const settingsData = {
            name: name,
            email: email,
            cpf: cpf,
            password: password,
            new_password: new_password
        };

        try {
            const response = await fetch('/user/settings', { // Faz a requisição POST
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settingsData)
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
            }

            const data = await response.json();
            if (data.success) {
                alert("Alterações salvas com sucesso!");
                window.location.reload();
            } else {
                alert("Erro ao salvar alterações: " + data.message);
            }

        } catch (error) {
            console.error('Erro ao salvar alterações:', error);
            alert("Um erro inesperado ocorreu.");
        } finally {
            saveButton.disabled = false;
            saveButton.textContent = "Salvar Alterações";
        }
    });
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

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove a máscara
    const password = document.getElementById('password').value;
    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;

    let isValid = true;


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
    if (cpf.length !== 11 || !validaCPF(cpf)) {
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

function validaCPF(strCPF) {
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