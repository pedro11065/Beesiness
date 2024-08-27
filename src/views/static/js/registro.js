// Código para enviar os dados do formulário para a API
document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    // Captura os dados dos campos
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const birthDate = document.getElementById('birthDate').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Verifica se a senha e a confirmação são iguais
    if (password !== confirmPassword) {
        alert('As senhas não correspondem.');
        return;
    }

    // Cria o objeto com os dados
    const dados = {
        "nome":fullName,
        "email":email,
        "senha":password,
        "datadenascimento":birthDate
    };

    console.log('Os dados:', dados);

    // Envia os dados para a API usando fetch
    fetch('/api/create_account', { //http://localhost:5000/api/create_account
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
