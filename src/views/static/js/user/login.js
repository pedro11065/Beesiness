document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginButton = loginForm.querySelector(".login-btn");

    // Evento de envio do formulário
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Desabilita o botão de envio e altera o texto para "Aguarde..."
        loginButton.disabled = true;
        loginButton.textContent = "Aguarde...";
        
        clearErrors();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const loginData = {
            "email": email,
            "senha": password
        };

        try {
            const response = await fetch('/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
            }

            const data = await response.json();

            if (data.login) {
                window.location.href = data.redirect_url; // Redirecionamento em caso de sucesso
            } else {
                displayError('message', 'E-mail ou senha está incorreto.');
            }
        } catch (error) {
            console.error('Erro ao fazer login de usuário:', error);
            displayError('message', 'Um erro inesperado ocorreu, sentimos muito.');
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Acesse";
        }
    });
});

// Função para limpar mensagens de erro
function clearErrors() {
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(function (errorField) {
        errorField.textContent = ''; // Limpa os erros anteriores
    });
}

// Função para exibir mensagem de erro
function displayError(fieldId, message) {
    const errorField = document.getElementById(fieldId + '-error');
    if (errorField) {
        errorField.textContent = message;
    }
}