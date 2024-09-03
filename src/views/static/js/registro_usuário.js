document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const cpf = document.getElementById('cpf').value.trim().replace(/\D/g, '');
    const birthDate = document.getElementById('birthDate').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('As senhas não correspondem.');
        return;
    }

    if (!validateCPF(cpf)) {
        alert('CPF inválido.');
        return;
    }

    const data_de_nascimento = birthDate.split('-').reverse().join('/');

    const dados = {
        "nome": fullName,
        "cpf": cpf,
        "email": email,
        "senha": password,
        "data_de_nascimento": data_de_nascimento
    };

    fetch('/api/create_user_account', {
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
            window.location.href = 'user-login';
        }
        })
        .catch(error => {
            // Captura e loga qualquer erro que ocorrer
            console.error('Erro:', error);
            window.location.href = 'user-sign-up'; //pelo menos por quanto já que não há como mostrar o erro de "Senha inválida" ou "CPF/email inválido"
        });
    });

function validateCPF(cpf) {
    // Adicionar aqui a lógica de validação do CPF no frontend, se necessário.
    return cpf.length === 11;
}
