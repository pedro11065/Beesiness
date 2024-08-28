// Código para enviar os dados do formulário para a API
document.getElementById('registroForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    // Captura os dados dos campos
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const cpf = document.getElementById('cpf').value;
    const birthDate = document.getElementById('birthDate').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    console.log(`Nome: ${fullName}`);
    console.log(`Email: ${email}`);
    console.log(`CPF: ${cpf}`);
    console.log(`Data de Nascimento: ${birthDate}`);
    console.log(`Senha: ${password}`);
    console.log(`Confirmar Senha: ${confirmPassword}`);

    // Deixando a data de nascimento no padrão brasileiro
    let data_americana = birthDate;
    const data_de_nascimento = data_americana.split('-').reverse().join('/');

    // Verifica se a senha e a confirmação são iguais
    if (password !== confirmPassword) {
        alert('As senhas não correspondem.');
        return;
    }

    // Cria o objeto com os dados
    const dados = {
        "nome": fullName,
        "cpf": cpf,
        "email": email,
        "senha": password,
        "data_de_nascimento": data_de_nascimento
    };

    console.log('Os dados:', dados);

    // Envia os dados para a API usando fetch
    fetch('/api/create_account', { //http://localhost:5000/api/create_user_account
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
