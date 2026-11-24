document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registroEmpresaForm");
    const registerButton = registerForm ? registerForm.querySelector(".register-btn") : null;
    if (!registerForm || !registerButton) return;

    const buttonLabel = registerButton.querySelector(".btn-label");
    const passwordInput = document.getElementById("password");
    const cnpjInput = document.getElementById("cnpj");

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

    // Requisitos de senha em tempo real
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

    // Máscara de CNPJ
    cnpjInput.addEventListener("input", function () {
        this.value = formatCNPJ(this.value);
    });

    // Limpa erro do campo ao digitar
    registerForm.querySelectorAll(".input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            const errId = input.id === "name" ? "nomeEmpresa" : input.id;
            const errEl = document.getElementById(errId + "-error");
            if (errEl) errEl.textContent = "";
        });
    });

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!validateCompanyForm()) return;

        registerButton.disabled = true;
        if (buttonLabel) buttonLabel.textContent = "Registrando...";

        const registerData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            cnpj: cnpjInput.value.replace(/\D/g, ""),
            password: passwordInput.value
        };

        try {
            const response = await fetch("/company/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(registerData)
            });

            if (!response.ok) {
                throw new Error("Erro na resposta da API: " + response.statusText);
            }

            const data = await response.json();

            if (data.register) {
                window.location.href = "/dashboard/user";
                return;
            }

            if (data.cnpj_error) {
                displayError("cnpj", "Este CNPJ já está registrado.");
            }
            if (data.email_error) {
                displayError("email", "Este e-mail já está registrado.");
            }
        } catch (error) {
            console.error("Erro ao registrar empresa:", error);
            displayError("message", "Ocorreu um erro inesperado ao registrar a empresa. Tente novamente.");
        } finally {
            registerButton.disabled = false;
            if (buttonLabel) buttonLabel.textContent = "Registrar empresa";
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
    const inputId = fieldId === "nomeEmpresa" ? "name" : fieldId;
    const input = document.getElementById(inputId);
    if (input) {
        input.classList.add("is-invalid");
    }
}

function validateCompanyForm() {
    clearErrors();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const cnpj = document.getElementById("cnpj").value.replace(/\D/g, "");
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    let isValid = true;

    if (name.length < 3) {
        displayError("nomeEmpresa", "Informe um nome com pelo menos 3 caracteres.");
        isValid = false;
    } else if (name.length > 40) {
        displayError("nomeEmpresa", "O nome deve ter no máximo 40 caracteres.");
        isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
        displayError("email", "Informe um e-mail válido.");
        isValid = false;
    }

    if (cnpj.length !== 14 || !validaCNPJ(cnpj)) {
        displayError("cnpj", "CNPJ inválido.");
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

function formatCNPJ(value) {
    value = value.replace(/\D/g, "").slice(0, 14);
    value = value.replace(/^(\d{2})(\d)/, "$1.$2");
    value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1/$2");
    value = value.replace(/(\d{4})(\d)/, "$1-$2");
    return value;
}

function validaCNPJ(cnpj) {
    cnpj = cnpj.replace(/\D/g, "");
    if (cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;

    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    const digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0), 10)) return false;

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digitos.charAt(1), 10);
}
