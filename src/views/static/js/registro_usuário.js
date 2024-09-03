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
    .then(response => response.json())
    .then(data => {
        if (data.verify === "True") {
            alert('Usuário registrado com sucesso!');
        } else {
            alert('Erros: ' + data.erros.join(', '));
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});

function validateCPF(cpf) {
    // Adicionar aqui a lógica de validação do CPF no frontend, se necessário.
    return cpf.length === 11;
}
