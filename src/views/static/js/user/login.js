const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = '☀️'; 
    } else {
        toggleButton.textContent = '🌙'; 
    }
});

const loginForm = document.getElementById('loginForm');

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
        console.log('Dados recebidos da API:', data);
        console.log('Valor específico:', data.login);

        if (data.company && data.login) {
            console.log('ambos True');
            window.location.href = "/dashboard/";
            
        }
        else if (data.login) {
            console.log('login true');
            window.location.href = "/dashboard/new_user";
        }           
    })
    .catch(error => {
        console.error('Erro ao fazer login:');

        window.location.href = '/user/login';
    });
});