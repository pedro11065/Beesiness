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

// Código para enviar os dados do formulário de login para a API
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const dados = {
        "email_cpf": username,
        "senha": password
    };

    fetch('/api/user_login', { //http://localhost:5000/api/user_login
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sucesso:', data);
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

