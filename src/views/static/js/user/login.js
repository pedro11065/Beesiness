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

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault(); 

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginData = {
        "email": email,
        "senha": password
    };

    fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.login) {
            window.location.href = data.redirect_url;
        } else {
            displayError('message', 'E-mail ou senha está incorreto.')
        }
    })
    .catch(error => {
        console.error('Erro ao fazer login:', error);
        displayError('message', 'Um erro inesperado ocorreu, sentimos muito.')
    });
});