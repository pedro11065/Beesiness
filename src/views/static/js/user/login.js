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
            console.error('Falha no login');
            window.location.href = '/user/login';
        }
    })
    .catch(error => {
        console.error('Erro ao fazer login:', error);
        window.location.href = '/user/login';
    });
});
