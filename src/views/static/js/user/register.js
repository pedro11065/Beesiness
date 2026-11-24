document.addEventListener("DOMContentLoaded", function () {
    const formRegister = document.getElementById("registerForm");
    const registerButton = formRegister.querySelector(".register-btn");
    const buttonLabel = registerButton.querySelector(".btn-label");
    const termsCheckbox = document.getElementById("flexCheckChecked");
    const passwordInput = document.getElementById("password");
    const cpfInput = document.getElementById("cpf");

    // Habilita o botão apenas após aceite dos termos
    termsCheckbox.addEventListener("change", function () {
        registerButton.disabled = !termsCheckbox.checked;
    });

    // Alternar visibilidade de senha
    document.querySelectorAll(".toggle-pw").forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = document.getElementById(btn.dataset.target);
            if (!target) return;
            const show = target.type === "password";
            target.type = show ? "text" : "password";
            btn.classList.toggle("is-showing", show);
            btn.setAttribute("aria-label", show ? "Ocultar senha" : "Mostrar senha");
        });
    });

    // Feedback em tempo real dos requisitos da senha
    const ruleMap = {
        len: (v) => v.length >= 8,
        upper: (v) => /[A-Z]/.test(v),
        lower: (v) => /[a-z]/.test(v),
        num: (v) => /[0-9]/.test(v),
        spec: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(v)
    };
    passwordInput.addEventListener("input", () => {
        const val = passwordInput.value;
        document.querySelectorAll("#pwRules [data-rule]").forEach((li) => {
            const check = ruleMap[li.dataset.rule];
            if (check) li.classList.toggle("is-met", check(val));
        });
    });

    // Máscara de CPF
    cpfInput.addEventListener("input", function () {
        this.value = formatCPF(this.value);
    });

    // Limpa erro do campo conforme digita
    formRegister.querySelectorAll(".input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            const errId = input.id === "name" ? "name" : input.id;
            const errEl = document.getElementById(errId + "-error");
            if (errEl) errEl.textContent = "";
        });
    });

    // Modal de Termos & Política de Privacidade
    const modal = document.getElementById("modal");
    const modalHeader = modal.querySelector(".modal-header");
    const modalBody = modal.querySelector(".modal-body");
    const modalClose = document.getElementById("modalClose");
    const termsConditionsLink = document.querySelector(".terms-conditions");
    const privacyPolicyLink = document.querySelector(".privacy-policy");

    function openModal(title, content) {
        modalHeader.innerHTML = title;
        modalBody.innerHTML = content;
        modal.hidden = false;
        modalClose.focus();
    }

    function closeModal() {
        modal.hidden = true;
    }

    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !modal.hidden) closeModal();
    });

    termsConditionsLink.addEventListener("click", () => {
        const termsContent = `
        <h4>Termos e Condições</h4>
        <p>Estes Termos e Condições regem a utilização do site Beesiness. Ao acessar ou utilizar nosso site, você concorda com estes termos. Se você não concordar com algum dos termos aqui descritos, você não deve usar o site.</p>

        <h4>Seção I - Uso do Site</h4>
        <p>O uso do site Beesiness é permitido apenas para fins legais e de acordo com as condições aqui descritas. Você se compromete a não utilizar o site para atividades ilícitas ou que possam prejudicar a integridade do nosso serviço.</p>

        <h4>Seção II - Direitos de Propriedade Intelectual</h4>
        <p>Todo o conteúdo fornecido pelas empresas usuárias do site Beesiness, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio, compilações de dados e qualquer outro material, permanece sob a propriedade intelectual das respectivas empresas. O Beesiness não reivindica direitos sobre o conteúdo criado e enviado por você. Contudo, ao submeter conteúdo ao nosso site, você concede ao Beesiness uma licença não exclusiva, transferível, sublicenciável e isenta de royalties para usar, reproduzir, modificar, adaptar, publicar e exibir esse conteúdo em conexão com o funcionamento do site e seus serviços.</p>

        <h4>Seção III - Limitação de Responsabilidade</h4>
        <p>O Beesiness não se responsabiliza por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou da incapacidade de uso do site. O uso do site é feito por sua conta e risco.</p>

        <h4>Seção IV - Modificações nos Termos</h4>
        <p>Reservamo-nos o direito de modificar estes Termos e Condições a qualquer momento, sem aviso prévio. Recomendamos que você consulte esta seção regularmente para se manter informado sobre eventuais alterações.</p>

        <h4>Seção V - Links para Sites Externos</h4>
        <p>Nosso site pode conter links para sites de terceiros. Não nos responsabilizamos pelo conteúdo, práticas de privacidade ou termos de uso de tais sites externos. Recomendamos que você revise as políticas de cada site que acessar.</p>

        <h4>Seção VI - Legislação Aplicável</h4>
        <p>Estes Termos e Condições serão regidos e interpretados de acordo com as leis do Brasil. Qualquer disputa que surgir em relação a estes termos será submetida ao foro competente da comarca de Santos, renunciando a qualquer outro, por mais privilegiado que seja.</p>

        <h4>Atualizações</h4>
        <p>Estes Termos e Condições foram atualizados pela última vez em 02/11/2024 e poderão ser modificados a qualquer momento, sem aviso prévio.</p>
        `;
        openModal("<h2>Termos &amp; Condições</h2>", termsContent);
    });

    privacyPolicyLink.addEventListener("click", () => {
        const privacyPolicyContent = `
        <h4>Política de Privacidade</h4>
        <p>Dados pessoais são todas as informações que possam identificar uma pessoa. Alguns desses dados são considerados sensíveis, como convicções religiosas, estado de saúde, vida sexual, origem racial ou étnica, opiniões políticas, dados genéticos ou biométricos, e afiliações a sindicatos ou organizações religiosas, filosóficas ou políticas.</p>

        <h4>Seção I - Informações Gerais</h4>
        <p>Esta política de privacidade descreve como ocorre o tratamento dos dados pessoais de quem acessa nosso site, explicando quais dados são coletados, com que finalidade, e como os visitantes podem controlar ou deletar suas informações. Este documento está em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/18), o Marco Civil da Internet (Lei 12.965/14), e o Regulamento da UE n. 2016/6790, estando sujeito a alterações conforme novas regulamentações.</p>
        <p>As informações coletadas visam melhorar sua experiência no site, garantindo uma navegação mais vantajosa e assertiva. A confidencialidade dos dados pessoais é fundamental, e continuamente otimizamos nossos processos para mantê-los seguros e alinhados com as normas vigentes.</p>

        <h4>Seção II - Coleta de Dados</h4>
        <p>Os dados pessoais dos visitantes podem ser coletados nas seguintes situações:</p>
        <ul>
            <li><strong>Cadastro no site:</strong> Dados como e-mail, nome, CPF, data de nascimento, entre outros, podem ser solicitados.</li>
            <li><strong>Navegação:</strong> Durante a navegação, podem ser coletados dados como palavras-chave, navegador utilizado, IP da rede, etc.</li>
            <li><strong>Integração com terceiros:</strong> Ao logar via Google, Facebook ou outras plataformas, a coleta de dados é autorizada diretamente por esses serviços.</li>
        </ul>
        <p>Para envio de newsletters ou avisos por e-mail, cookies podem ser utilizados para personalizar o conteúdo e melhorar a experiência do usuário.</p>

        <h4>Seção III - Aceite</h4>
        <p>Ao utilizar nosso site, o usuário confirma que aceita esta política de privacidade. Reservamo-nos o direito de modificar esta política sem aviso prévio, por isso recomendamos consultas regulares para manter-se atualizado.</p>

        <h4>Seção IV - Links para Sites Externos</h4>
        <p>Nosso site pode conter links para sites externos. Esta política de privacidade não se aplica a esses sites; recomendamos que os usuários consultem as políticas de privacidade de cada site acessado.</p>

        <h4>Cookies</h4>
        <p>O site utiliza cookies para armazenar informações como as preferências dos usuários. Os cookies podem ser gerenciados nas configurações do navegador ou através de softwares específicos. Desativar cookies pode impactar a experiência de navegação, especialmente em sites que exigem login para áreas restritas.</p>

        <h4>Atualizações</h4>
        <p>Esta política de privacidade foi atualizada pela última vez em 02/11/2024 e poderá ser modificada a qualquer momento, sem aviso prévio.</p>
        `;
        openModal("<h2>Política de Privacidade</h2>", privacyPolicyContent);
    });

    // Envio do formulário de registro
    formRegister.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateForm()) return;

        registerButton.disabled = true;
        if (buttonLabel) buttonLabel.textContent = "Criando conta...";

        const registerData = {
            fullName: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            cpf: cpfInput.value.replace(/\D/g, ""),
            birthDate: document.getElementById("birthDate").value,
            password: passwordInput.value,
            confirmPassword: document.getElementById("confirmPassword").value
        };

        try {
            const response = await fetch("/user/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData)
            });

            if (!response.ok) {
                throw new Error("Erro na resposta da API: " + response.statusText);
            }

            const data = await response.json();

            if (data.register) {
                window.location.href = "/user/login";
                return;
            }

            if (data.cpf_error) {
                displayError("cpf", "CPF já está registrado.");
            }
            if (data.email_error) {
                displayError("email", "E-mail já está registrado.");
            }
        } catch (error) {
            console.error("Erro ao registrar usuário:", error);
            displayError("message", "Ocorreu um erro inesperado ao criar sua conta. Tente novamente.");
        } finally {
            registerButton.disabled = !termsCheckbox.checked;
            if (buttonLabel) buttonLabel.textContent = "Criar minha conta";
        }
    });
});

function clearErrors() {
    document.querySelectorAll(".msg-error, .alert-error").forEach((el) => {
        el.textContent = "";
    });
    document.querySelectorAll(".input.is-invalid").forEach((el) => {
        el.classList.remove("is-invalid");
    });
}

function displayError(fieldId, message) {
    const errorField = document.getElementById(fieldId + "-error");
    if (errorField) {
        errorField.textContent = message;
    }
    const input = document.getElementById(fieldId);
    if (input) {
        input.classList.add("is-invalid");
    }
}

function validateForm() {
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const cpf = document.getElementById("cpf").value.replace(/\D/g, "");
    const rawBirthDate = document.getElementById("birthDate").value;
    let isValid = true;

    if (name.length < 3) {
        displayError("name", "Informe seu nome completo.");
        isValid = false;
    } else if (name.length > 255) {
        displayError("name", "Nome muito longo.");
        isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError("email", "Informe um e-mail válido.");
        isValid = false;
    }

    const birthDate = formatDateToBrazilian(rawBirthDate);
    const birthDatePattern = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    if (!birthDate || !birthDatePattern.test(birthDate)) {
        displayError("birthDate", "Informe uma data válida.");
        isValid = false;
    } else if (!isAtLeast18(birthDate)) {
        displayError("birthDate", "Você deve ter pelo menos 18 anos.");
        isValid = false;
    }

    if (cpf.length !== 11 || !verifyCPF(cpf)) {
        displayError("cpf", "CPF inválido.");
        isValid = false;
    }

    if (password.length < 8) {
        displayError("password", "Mínimo de 8 caracteres.");
        isValid = false;
    } else if (!/[A-Z]/.test(password)) {
        displayError("password", "Inclua ao menos uma letra maiúscula.");
        isValid = false;
    } else if (!/[a-z]/.test(password)) {
        displayError("password", "Inclua ao menos uma letra minúscula.");
        isValid = false;
    } else if (!/[0-9]/.test(password)) {
        displayError("password", "Inclua ao menos um número.");
        isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(password)) {
        displayError("password", "Inclua ao menos um caractere especial.");
        isValid = false;
    } else if (/\s/.test(password)) {
        displayError("password", "A senha não pode conter espaços.");
        isValid = false;
    } else if (password !== confirmPassword) {
        displayError("confirmPassword", "As senhas não coincidem.");
        isValid = false;
    }

    return isValid;
}

function isAtLeast18(birthDate) {
    const [day, month, year] = birthDate.split("/").map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    const monthDiff = today.getMonth() + 1 - month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
        age--;
    }
    return age >= 18;
}

function formatCPF(value) {
    value = value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
    return value;
}

function formatDateToBrazilian(dateStr) {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
}

function verifyCPF(strCPF) {
    if (/(.)\1{10}/.test(strCPF)) return false;

    let soma = 0;
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(strCPF.substring(i - 1, i), 10) * (11 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(strCPF.substring(9, 10), 10)) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(strCPF.substring(i - 1, i), 10) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(strCPF.substring(10, 11), 10);
}
