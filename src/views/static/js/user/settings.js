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
        event.preventDefault();
    });

    saveButton.addEventListener('click', async () => {
        const isValid = await validateForm();
        if(!isValid) return;
        Swal.fire({
            text: "Você deseja continuar?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#71E167",
            cancelButtonColor: "#DC5D5D",
            confirmButtonText: "Sim",
            cancelButtonText: "Cancelar"
          }).then(async (result) => {
            if (result.isConfirmed) {
                    await sendData();
            }
          });
    });
});


// Envio de dados para o backend
async function sendData() {
    const saveButton = document.querySelector(".save-btn");
    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";
    saveButton.style.cursor = 'not-allowed';
    saveButton.style.opacity = '0.5';

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
            Swal.fire({
                icon: "success",
                text: "Os dados foram salvos com sucesso.",
                showConfirmButton: false,
                timer: 5000
              });

            window.location.reload();
        } else {
            if (data.cpf_error) {
                displayError('cpf', 'CPF já está registrado.');
            }

            if (data.email_error) {
                displayError('email', 'Email já está registrado.');
            }

            if (data.email_error) {
                displayError('password_error', 'Senha incorreta.');
            }
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
    const cpf = document.getElementById('cpf').value.trim().replace(/\D/g, ''); // Remove a máscara
    const password = document.getElementById('password').value;
    const new_password = document.getElementById('new_password').value;
    const confirm_password = document.getElementById('confirm_password').value;

    let isValid = true;

    // Verifica se os campos obrigatórios estão vazios
    if (!name || !email || !cpf || !password) {
        isValid = false;
    }

    // Validação de nome
    if (name.length < 3) {
        displayError('name', 'Nome muito curto.');
        isValid = false;
    }

    if (name.length > 255) {
        displayError('name', 'Nome muito longo.');
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

    // Validação de senha nova (se informada)
    if (new_password) {
        if (new_password.length < 8) {
            displayError('new_password', 'A senha deve ter no mínimo 8 caracteres.');
            isValid = false;
        } else if (!/[A-Z]/.test(new_password)) {
            displayError('new_password', 'A senha deve conter ao menos uma letra maiúscula.');
            isValid = false;
        } else if (!/[a-z]/.test(new_password)) {
            displayError('new_password', 'A senha deve conter ao menos uma letra minúscula.');
            isValid = false;
        } else if (!/[0-9]/.test(new_password)) {
            displayError('new_password', 'A senha deve conter ao menos um número.');
            isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(new_password)) {
            displayError('new_password', 'A senha deve conter ao menos um caractere especial.');
            isValid = false;
        } else if (/\s/.test(new_password)) {
            displayError('new_password', 'A senha não pode conter espaços.');
            isValid = false;
        }

        // Validação de confirmação de senha
        if (new_password !== confirm_password) {
            displayError('new_password', 'As senhas não coincidem.');
            isValid = false;
        }
    }

    return isValid;
}

function verifyCPF(strCPF) {
    let Soma;
    let Resto;
    Soma = 0;

    if(/(.)\1{10}/.test(strCPF)) return false;

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