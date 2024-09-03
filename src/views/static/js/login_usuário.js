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
    .then(response => {
        // Log da resposta bruta para inspeção
        console.log('Response:', response);
        
        // Verifica se a resposta é um erro (status não está na faixa 2xx)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        // Retorna a resposta como JSON para o próximo .then
        return response.json();
    })    
    .then(data => {
        // Verifica se a resposta contém um erro
        if (data.error) {
            console.error('Erro:', data.error); // Lida com a mensagem de erro
        } else {
            console.log('Sucesso:', data); // Lida com dados de sucesso
            window.location.href = 'dashboard';
        }
        })
        .catch(error => {
            // Captura e loga qualquer erro que ocorrer
            console.error('Erro:', error);
            window.location.href = 'user-login'; //pelo menos por quanto já que não há como mostrar o erro de "Senha inválida" ou "CPF/email inválido"
        });
    });