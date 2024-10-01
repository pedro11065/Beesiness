document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registroForm");
    const registerButton = registerForm.querySelector(".register-btn");

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Chama a função de validação
        if (!validateForm()) {
            return;
        }

        // Desabilita o botão de envio e altera o texto para "Aguarde..."
        registerButton.disabled = true;
        registerButton.textContent = "Aguarde...";

        clearErrors();

        const fullName = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const birthDate = document.getElementById('birthDate').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const registerData = {
            fullName: fullName,
            email: email,
            cpf: cpf,
            birthDate: birthDate,
            password: password,
            confirmPassword: confirmPassword
        };

        try {
            const response = await fetch('/user/register', { // Faz a requisição POST
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
            }

            const data = await response.json();

            if (data.register) {
                window.location.href = '/user/login'; // Redireciona em caso de sucesso
                return;
            } else {
                if (data.cpf_error) {
                    displayError('cpf', 'CPF já está registrado.');
                }

                if (data.email_error) {
                    displayError('email', 'Email já está registrado.');
                }
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            displayError('message', 'Um erro inesperado ocorreu, sentimos muito.');
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "Registrar";
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
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove a máscara
    var birthDate = document.getElementById('birthDate').value;

    var isValid = true;

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

    // Validação de data de nascimento no formato DD/MM/YYYY
    birthDate = formatDateToBrazilian(birthDate); // Converter a data de nascimento YYYY/MM/DD para o formato DD/MM/YYYY
    const birthDatePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!birthDatePattern.test(birthDate)) {
        displayError('birthDate', 'Data de nascimento inválida. Use o formato DD/MM/YYYY.');
        isValid = false;
    }

    // Validação de CPF
    if (cpf.length !== 11 || !verifyCPF(cpf)) {
        displayError('cpf', 'CPF inválido.');
        isValid = false;
    }

    // Validação de senha
    if (password !== confirmPassword) {
        displayError('confirmPassword', 'As senhas não coincidem.');
        isValid = false;
    } else {
        // Apenas o primeiro erro de senha será mostrado
        if (password.length < 8) {
            displayError('password', 'A senha deve ter um mínimo de 8 dígitos.');
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos uma letra maiúscula.');
            isValid = false;
        } else if (!/[a-z]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos uma letra minúscula.');
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos um número.');
            isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos um caractere especial.');
            isValid = false;
        } else if (/\s/.test(password)) {
            displayError('password', 'A senha não pode conter espaços.');
            isValid = false;
        }
    }

    return isValid;
}

function formatCPF(value) {
    value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = value.replace(/^(\d{3})(\d)/, '$1.$2'); // Adiciona o primeiro ponto
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3'); // Adiciona o segundo ponto
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2'); // Adiciona o hífen
    return value;
}

document.getElementById('cpf').addEventListener('input', function (e) {
    this.value = formatCPF(this.value);
});

function formatDateToBrazilian(dateStr) {
    // Converte de YYYY-MM-DD para DD/MM/YYYY
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function verifyCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;

    if(/(.)\1{10}/.test(strCPF)) return false;

    for (var i = 1; i <= 9; i++) {
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) {
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;

    return true;
}
