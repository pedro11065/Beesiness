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
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Obtém os valores dos campos de entrada
    const username = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Cria o objeto com os dados que serão enviados
    const loginData = {
        "email": username,
        "senha": password
    };

    try {
        // Envia a requisição POST para o backend
        const response = await fetch('/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        // Verifica se a resposta foi bem-sucedida
        if (response.ok) {
            const result = await response.json();
            console.log('Login bem-sucedido:', result);
            // Redirecionar ou realizar outra ação
        } else {
            console.error('Erro no login:', response.statusText);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
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