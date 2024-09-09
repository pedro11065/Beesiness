function formatCPF(value) {
    value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = value.replace(/^(\d{3})(\d)/, '$1.$2'); // Adiciona o primeiro ponto
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3'); // Adiciona o segundo ponto
    value = value.replace(/\.(\d{3})(\d)/, '.$1-$2'); // Adiciona o hífen
    return value;
}

document.getElementById('cpf').addEventListener('input', function (e) {
    this.value = formatCPF(this.value);
});

function formatDateToBrazilian(dateStr) {
    // Converte de YYYY-MM-DD para DD/MM/YYYY
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

function validaCPF(strCPF) {
    var Soma; // Armazena a soma dos cálculos
    var Resto; // Armazena o resto dos cálculos
    Soma = 0;

    if (strCPF == "00000000000") return false; //Verifica se é igual a 00000000000, se for retorna false

    for (var i = 1; i <= 9; i++) { // Inicia um for de 1 a 9, em que extrai o digito do cpf na posição i-1, converte para um inteiro que é multiplicado por (11-i)e o resultado é adicionado em Soma
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
 
    Resto = (Soma * 10) % 11; // Calcula o resto de Soma * 10 divido por 11 e armazena em Resto

    if ((Resto == 10) || (Resto == 11)) Resto = 0; // Se Resto for igual a 10 ou 11, Resto vira 0
    if (Resto != parseInt(strCPF.substring(9, 10))) return false; // Compara Resto com o décimo digito do cpf, se não é igual, retorna falso

    Soma = 0; //Soma vira 0 para a segunda validação
    for (var i = 1; i <= 10; i++) { // Inicia um for de 1 a 10, em que extrai um digito do cpf na posição i-1, converte em inteiro que é multiplicado por (12-i), resultado é adicionado a Soma
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11; // Calcula o resto de Soma * 10 dividido por 11 e armazena em resto

    if ((Resto == 10) || (Resto == 11)) Resto = 0; //Verifica se Resto é igual a 10 ou 11, se for é definido como 0
    if (Resto != parseInt(strCPF.substring(10, 11))) return false; //Compara resto com o digito 11 do cpf, se não for igual, retorna false

    return true; //Se o cpf passou por todas as verificações, é retornado true
}


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

function validateForm() {
    clearErrors(); // Limpa os erros antes de validar

    var name = document.getElementById('name').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove a máscara
    var birthDate = document.getElementById('birthDate').value; // Ajuste conforme necessário

    var isValid = true;

    // Validação de nome
    if (name.length < 3) {
        displayError('name', 'Nome muito curto.');
        isValid = false;
    }

    // Validação de e-mail
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError('email', 'E-mail inválido.');
        isValid = false;
    }

    // Validação de data de nascimento no formato DD/MM/YYYY
    birthDate = formatDateToBrazilian(birthDate); // Converter a data de nascimento YYYY/MM/DD para o formato DD/MM/YYYY
    var birthDatePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!birthDatePattern.test(birthDate)) {
        displayError('birthDate', 'Data de nascimento inválida. Use o formato DD/MM/YYYY.');
        isValid = false;
    }

    // Validação de CPF
    if (cpf.length !== 11 || !validaCPF(cpf)) {
        displayError('cpf', 'CPF inválido.');
        isValid = false;
    }

    // Validação de senha
    if (password !== confirmPassword) {
        displayError('confirmPassword', 'As senhas não coincidem.');
        isValid = false;
    } else {
        // Apenas o primeiro erro de senha será mostrado
        if (password.length < 8) {
            displayError('password', 'A senha deve ter um mínimo de 8 dígitos.');
            isValid = false;
        } else if (!/[A-Z]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos uma letra maiúscula.');
            isValid = false;
        } else if (!/[a-z]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos uma letra minúscula.');
            isValid = false;
        } else if (!/[0-9]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos um número.');
            isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            displayError('password', 'A senha deve conter ao menos um caractere especial.');
            isValid = false;
        } else if (/\s/.test(password)) {
            displayError('password', 'A senha não pode conter espaços.');
            isValid = false;
        }
    }

    return isValid;
}

document.getElementById("registroForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o comportamento padrão do formulário (evita o envio via GET)

    // Verifica se o formulário é válido
    if (!validateForm()) {
        return; // Interrompe o processo de envio se houver erros
    }

    // Coleta os dados do formulário
    const formData = new FormData(this);
    const cpfSemMascara = formData.get('cpf').replace(/\D/g, '');

    // Converte para um objeto para facilitar a manipulação
    const dados = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        cpf: cpfSemMascara,
        birthDate: formData.get('birthDate'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    };

    // Faz a requisição POST
    fetch('/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        // Processar a resposta do servidor
        if (data.register) {
            window.location.href = '/user/login'; // Redirecionar em caso de sucesso
            return;
        }
        
        if (data.cpf_error) {
            displayError('cpf', 'CPF já está registrado.');
        }
        
        if (data.email_error) {
            displayError('email', 'Email já está registrado.');
        } 
    })
    .catch(error => console.error('Erro:', error));
});