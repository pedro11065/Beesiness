document.addEventListener("DOMContentLoaded", function () {
    const FormRegister = document.getElementById("registerForm");
    const registerButton = FormRegister.querySelector(".register-btn");

    // Checar caixa
    const termsCheckbox = document.getElementById('flexCheckChecked');
    termsCheckbox.addEventListener('change', function() {
        registerButton.disabled = !termsCheckbox.checked;
    });

    // Modal
    const termsConditionsLink = document.querySelector('.terms-conditions');
    const privacyPolicyLink = document.querySelector('.privacy-policy');

    // Função para abrir o modal com conteúdo específico
    function openModal(title, content) {
        const modal = document.querySelector('.modal');
        const modalBody = document.querySelector('.modal-body');
        const modalHeader = document.querySelector('.modal-header');
        
        modalHeader.innerHTML = title;
        modalBody.innerHTML = content;
        modal.style.display = 'block';
    }

    // Adiciona os event listeners para abrir o modal
    termsConditionsLink.addEventListener('click', () => {
        const termsContent = `
        <h4><b>Termos e Condições</b></h4>
        <p>Estes Termos e Condições regem a utilização do site Beesiness. Ao acessar ou utilizar nosso site, você concorda com estes termos. Se você não concordar com algum dos termos aqui descritos, você não deve usar o site.</p>

        <h4><b>Seção I - Uso do Site</b></h4>
        <p>O uso do site Beesiness é permitido apenas para fins legais e de acordo com as condições aqui descritas. Você se compromete a não utilizar o site para atividades ilícitas ou que possam prejudicar a integridade do nosso serviço.</p>

        <h4><b>Seção II - Direitos de Propriedade Intelectual</b></h4>
        <p>Todo o conteúdo fornecido pelas empresas usuárias do site Beesiness, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio, compilações de dados e qualquer outro material, permanece sob a propriedade intelectual das respectivas empresas. O Beesiness não reivindica direitos sobre o conteúdo criado e enviado por você. Contudo, ao submeter conteúdo ao nosso site, você concede ao Beesiness uma licença não exclusiva, transferível, sublicenciável e isenta de royalties para usar, reproduzir, modificar, adaptar, publicar e exibir esse conteúdo em conexão com o funcionamento do site e seus serviços.</p>

        <h4><b>Seção III - Limitação de Responsabilidade</b></h4>
        <p>O Beesiness não se responsabiliza por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de uso do site. O uso do site é feito por sua conta e risco.</p>

        <h4><b>Seção IV - Modificações nos Termos</b></h4>
        <p>Reservamo-nos o direito de modificar estes Termos e Condições a qualquer momento, sem aviso prévio. Recomendamos que você consulte esta seção regularmente para se manter informado sobre eventuais alterações.</p>

        <h4><b>Seção V - Links para Sites Externos</b></h4>
        <p>Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelo conteúdo, práticas de privacidade ou termos de uso de tais sites externos. Recomendamos que você revise as políticas de cada site que acessar.</p>

        <h4><b>Seção VI - Legislação Aplicável</b></h4>
        <p>Estes Termos e Condições serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa que surgir em relação a estes termos será submetida ao foro competente da comarca de Santos, renunciando a qualquer outro, por mais privilegiado que seja.</p>

        <h4><b>Atualizações</b></h4>
        <p>Estes Termos e Condições foram atualizados pela última vez em 02/11/2024 e poderão ser modificados a qualquer momento, sem aviso prévio.</p>
    `;

        openModal('<h2>Termos & Condições</h2>', termsContent);
    });

    privacyPolicyLink.addEventListener('click', () => {
        const privacyPolicyContent = `
        <h4><b>Política de Privacidade</b></h4>
        <p>Dados pessoais são todas as informações que possam identificar uma pessoa. Alguns desses dados são considerados sensíveis, como convicções religiosas, estado de saúde, vida sexual, origem racial ou étnica, opiniões políticas, dados genéticos ou biométricos, e afiliações a sindicatos ou organizações religiosas, filosóficas ou políticas.</p>

        <h4><b>Seção I - Informações Gerais</b></h4>
        <p>Esta política de privacidade descreve como ocorre o tratamento dos dados pessoais de quem acessa nosso site, explicando quais dados são coletados, com que finalidade, e como os visitantes podem controlar ou deletar suas informações. Este documento está em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/18), o Marco Civil da Internet (Lei 12.965/14), e o Regulamento da UE n. 2016/6790, estando sujeito a alterações conforme novas regulamentações.</p>
        <p>As informações coletadas visam melhorar sua experiência no site, garantindo uma navegação mais vantajosa e assertiva. A confidencialidade dos dados pessoais é fundamental, e continuamente otimizamos nossos processos para mantê-los seguros e alinhados com as normas vigentes.</p>

        <h4><b>Seção II - Coleta de Dados</b></h4>
        <p>Os dados pessoais dos visitantes podem ser coletados nas seguintes situações:</p>
        <ul>
            <li><strong>Cadastro no site:</strong> Dados como e-mail, nome, cpf, data de nascimento, entre outros, podem ser solicitados.</li>
            <li><strong>Navegação:</strong> Durante a navegação, podem ser coletados dados como palavras-chave, navegador utilizado, IP da rede, etc.</li>
            <li><strong>Integração com terceiros:</strong> Ao logar via Google, Facebook ou outras plataformas, a coleta de dados é autorizada diretamente por esses serviços.</li>
        </ul>
        <p>Para envio de newsletters ou avisos por e-mail, cookies podem ser utilizados para personalizar o conteúdo e melhorar a experiência do usuário.</p>

        <h4><b>Seção III - Aceite</b></h4>
        <p>Ao utilizar nosso site, o usuário confirma que aceita esta política de privacidade. Reservamo-nos o direito de modificar esta política sem aviso prévio, por isso recomendamos consultas regulares para manter-se atualizado.</p>

        <h4><b>Seção IV - Links para Sites Externos</b></h4>
        <p>Nosso site pode conter links para sites externos. Esta política de privacidade não se aplica a esses sites; recomendamos que os usuários consultem as políticas de privacidade de cada site acessado.</p>

        <h4><b>Cookies</b></h4>
        <p>O site utiliza cookies para armazenar informações como as preferências dos usuários. Os cookies podem ser gerenciados nas configurações do navegador ou através de softwares específicos. Desativar cookies pode impactar a experiência de navegação, especialmente em sites que exigem login para áreas restritas.</p>

        <h4><b>Atualizações</b></h4>
        <p>Esta política de privacidade foi atualizada pela última vez em 02/11/2024 e poderá ser modificada a qualquer momento, sem aviso prévio.</p>
        `;

        openModal('<h2>Política de Privacidade</h2>', privacyPolicyContent);
    });

    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        const modal = document.querySelector('.modal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Formulário do registro
    FormRegister.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }

        registerButton.disabled = true;
        registerButton.textContent = "Aguarde...";

        const fullName = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const birthDate = document.getElementById('birthDate').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const registerData = {
            fullName: fullName,
            email: email,
            cpf: cpf,
            birthDate: birthDate,
            password: password,
            confirmPassword: confirmPassword
        };

        try {
            const response = await fetch('/user/register', { // Faz a requisição POST
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
               body: JSON.stringify(registerData)
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
            }

            const data = await response.json();

            if (data.register) {
                window.location.href = '/user/login'; // Redireciona em caso de sucesso
                return;
            } else {
                if (data.cpf_error) {
                    displayError('cpf', 'CPF já está registrado.');
                }

                if (data.email_error) {
                    displayError('email', 'Email já está registrado.');
                }
            }
        } catch (error) {
            console.error('Erro ao registrar usuário:', error);
            displayError('message', 'Um erro inesperado ocorreu, sentimos muito.');
        } finally {
            registerButton.disabled = false;
            registerButton.textContent = "Registrar";
        }
    });

    
    document.getElementById('login-btn').addEventListener('click', function() {
        window.location.href = '/user/login';
    });
});


function clearErrors() {
    document.querySelectorAll('.error').forEach(errorField => {
        errorField.textContent = '';
    });
}

function displayError(fieldId, message) {
    const errorField = document.getElementById(fieldId + '-error');
    if (errorField) {
        errorField.textContent = message;
    }
}

function validateForm() {
    clearErrors(); // Limpa os erros antes de validar

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const cpf = document.getElementById('cpf').value.replace(/\D/g, ''); // Remove a máscara
    const birthDate = document.getElementById('birthDate').value;
    let isValid = true;

    // Validação de nome
    if (name.length < 3) {
        displayError('name', 'Nome muito curto.');
        isValid = false;
    }

    if (name.length > 255) {
        displayError('name', 'Nome muito longo.');
        isValid = false;
    }

    // Validação de e-mail
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError('email', 'E-mail inválido.');
        isValid = false;
    }

    // Validação de data de nascimento no formato DD/MM/YYYY
    birthDate = formatDateToBrazilian(birthDate); // Converter a data de nascimento YYYY/MM/DD para o formato DD/MM/YYYY
    const birthDatePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!birthDatePattern.test(birthDate)) {
        displayError('birthDate', 'Data de nascimento inválida. Use o formato DD/MM/YYYY.');
        isValid = false;
    }

    // Validação de CPF
    if (cpf.length !== 11 || !verifyCPF(cpf)) {
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

function verifyCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;

    if(/(.)\1{10}/.test(strCPF)) return false;

    for (var i = 1; i <= 9; i++) {
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(9, 10))) return false;

    Soma = 0;
    for (var i = 1; i <= 10; i++) {
        Soma = Soma + parseInt(strCPF.substring(i - 1, i)) * (12 - i);
    }

    Resto = (Soma * 10) % 11;

    if ((Resto == 10) || (Resto == 11)) Resto = 0;
    if (Resto != parseInt(strCPF.substring(10, 11))) return false;

    return true;
}  
