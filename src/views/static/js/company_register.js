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

function formatCNPJ(value) {
    value = value.replace(/\D/g, ''); // Remove caracteres não numéricos
    value = value.replace(/^(\d{2})(\d)/, '$1.$2'); // Adiciona o primeiro ponto
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3'); // Adiciona o segundo ponto
    value = value.replace(/\.(\d{3})(\d)/, '.$1/$2'); // Adiciona a barra
    value = value.replace(/(\d{4})(\d)/, '$1-$2'); // Adiciona o hífen
    return value;
}

document.getElementById('cnpj').addEventListener('input', function (e) {
    this.value = formatCNPJ(this.value);
});

function validaCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14) return false;

    // Elimina CNPJs inválidos conhecidos
    if (/^(\d)\1+$/.test(cnpj)) return false;

    // Validação do CNPJ
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;

    return true;
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

function validateCompanyForm() {
    clearErrors(); // Limpa os erros antes de validar

    var companyName = document.getElementById('nomeEmpresa').value.trim();
    var email = document.getElementById('email').value.trim();
    var password = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;
    var cnpj = document.getElementById('cnpj').value.replace(/\D/g, ''); // Remove a máscara

    var isValid = true;

    // Validação de nome da empresa
    if (companyName.length < 3) {
        displayError('nomeEmpresa', 'Nome da empresa muito curto.');
        isValid = false;
    }

    // Validação de e-mail
    var emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError('email', 'E-mail inválido.');
        isValid = false;
    }

    // Validação de CNPJ
    if (cnpj.length !== 14 || !validaCNPJ(cnpj)) {
        displayError('cnpj', 'CNPJ inválido.');
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

document.getElementById('registroEmpresaForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Impede o envio padrão do formulário

    if (!validateCompanyForm()) {
        return; // Não envia os dados se houver erros
    }
    {
        const companyName = document.getElementById('nomeEmpresa').value.trim();
        const email= document.getElementById('email').value.trim();
        const cnpj = document.getElementById('cnpj').value.replace(/\D/g, '');
        const password= document.getElementById('password').value;
        const confirmPassword= document.getElementById('confirmPassword').value;

    }

    const dados = {
        "nome": companyName,
        "cnpj": cnpj,
        "email": email,
        "senha": password
    };

    fetch('/company-register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        // Manipule a resposta do servidor aqui
            
        // Pode redirecionar ou mostrar uma mensagem de sucesso
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});
