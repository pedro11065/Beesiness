// Código para alternar o modo escuro/claro
const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Alterna o ícone do botão
    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = '☀️'; // Ícone de sol para Light Mode
    } else {
        toggleButton.textContent = '🌙'; // Ícone de lua para Dark Mode
    }
});


/*
function clearErrors() {
    var errorFields = document.querySelectorAll('.error');
    errorFields.forEach(function (errorField) {
        errorField.textContent = ''; // Limpa os erros anteriores
    });
}

function displayError(fieldId, message) {
    var errorField = document.getElementById(fieldId + '-error');
    if (errorField) {
        errorField.textContent = message;
    }
}

function validateForm() {
    clearErrors(); // Limpa os erros antes de validar

    var email = document.getElementById('email').value.trim();

    var isValid = true;
    
    // Validação de e-mail
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError('email', 'E-mail inválido.');
        isValid = false;
    }
}

document.getElementById('registroForm').addEventListener('submit', function (e) {
    if (!validateForm()) {
        e.preventDefault(); // Previne o envio do formulário se houver erros
    }
});

*/