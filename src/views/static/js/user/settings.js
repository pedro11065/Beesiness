document.addEventListener("DOMContentLoaded", function () {
    const settingsForm = document.getElementById("settingsForm");
    const saveButton = document.getElementById("saveBtn");
    const saveBtnText = document.getElementById("saveBtnText");
    const cpfField = document.getElementById("cpf");
    const newPasswordField = document.getElementById("new_password");
    const profileCpf = document.getElementById("profileCpf");
    const successBanner = document.getElementById("settingsSuccess");
    const alertBanner = document.getElementById("settingsAlert");

    // Formata CPF inicial no campo e no cartão lateral
    cpfField.value = formatCPF(cpfField.value);
    if (profileCpf) profileCpf.textContent = formatCPF(profileCpf.textContent);

    cpfField.addEventListener("input", function () {
        this.value = formatCPF(this.value);
    });

    // Botões mostrar/ocultar senha
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

    // Indicadores em tempo real para nova senha
    const ruleMap = {
        len: (v) => v.length >= 8,
        upper: (v) => /[A-Z]/.test(v),
        lower: (v) => /[a-z]/.test(v),
        num: (v) => /[0-9]/.test(v),
        spec: (v) => /[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(v)
    };
    newPasswordField.addEventListener("input", () => {
        const val = newPasswordField.value;
        document.querySelectorAll("#pwRules [data-rule]").forEach((li) => {
            const fn = ruleMap[li.dataset.rule];
            if (fn) li.classList.toggle("is-met", fn(val));
        });
    });

    // Limpa erro do campo conforme o usuário digita
    settingsForm.querySelectorAll(".input").forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            const errEl = document.getElementById(input.id + "-error");
            if (errEl) errEl.textContent = "";
            alertBanner.hidden = true;
        });
    });

    settingsForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        successBanner.hidden = true;
        alertBanner.hidden = true;

        if (!validateForm()) return;

        saveButton.disabled = true;
        saveBtnText.textContent = "Salvando...";

        const settingsData = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            cpf: cpfField.value.trim().replace(/\D/g, ""),
            password: document.getElementById("password").value,
            new_password: newPasswordField.value
        };

        try {
            const response = await fetch("/user/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settingsData)
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || "Erro na resposta da API");
            }

            if (data.success) {
                // Atualiza resumo lateral e cabeçalho imediatamente
                document.getElementById("profileName").textContent = settingsData.name;
                document.getElementById("profileEmail").textContent = settingsData.email;
                document.getElementById("profileCpf").textContent = formatCPF(settingsData.cpf);
                document.getElementById("profileInitial").textContent = (settingsData.name[0] || "U").toUpperCase();

                const headerName = document.querySelector(".mh-username");
                const headerAvatar = document.querySelector(".mh-avatar");
                if (headerName) headerName.textContent = settingsData.name;
                if (headerAvatar) headerAvatar.textContent = (settingsData.name[0] || "U").toUpperCase();

                // Limpa campos de senha após salvar
                document.getElementById("password").value = "";
                newPasswordField.value = "";
                document.getElementById("confirm_password").value = "";
                document.querySelectorAll("#pwRules [data-rule]").forEach((li) => li.classList.remove("is-met"));

                successBanner.textContent = "Alterações salvas com sucesso!";
                successBanner.hidden = false;
                window.scrollTo({ top: 0, behavior: "smooth" });
                return;
            }

            if (data.password_error) {
                displayError("password", "Senha atual incorreta.");
            }
            if (data.cpf_error) {
                displayError("cpf", "Este CPF já está vinculado a outra conta.");
            }
            if (data.email_error) {
                displayError("email", "Este e-mail já está vinculado a outra conta.");
            }
            if (data.message && !data.password_error && !data.cpf_error && !data.email_error) {
                alertBanner.textContent = data.message;
                alertBanner.hidden = false;
            }
        } catch (error) {
            console.error("Erro ao salvar configurações:", error);
            alertBanner.textContent = "Não foi possível salvar suas alterações agora. Tente novamente.";
            alertBanner.hidden = false;
        } finally {
            saveButton.disabled = false;
            saveBtnText.textContent = "Salvar alterações";
        }
    });
});

function clearErrors() {
    document.querySelectorAll(".error").forEach((el) => {
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
    const cpf = document.getElementById("cpf").value.trim().replace(/\D/g, "");
    const password = document.getElementById("password").value;
    const newPassword = document.getElementById("new_password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    let isValid = true;

    if (name.length < 3) {
        displayError("name", "Informe seu nome completo (mínimo 3 caracteres).");
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

    if (cpf.length !== 11 || !verifyCPF(cpf)) {
        displayError("cpf", "Informe um CPF válido.");
        isValid = false;
    }

    if (newPassword || confirmPassword) {
        if (newPassword.length < 8) {
            displayError("new_password", "Mínimo de 8 caracteres.");
            isValid = false;
        } else if (!/[A-Z]/.test(newPassword)) {
            displayError("new_password", "Inclua ao menos uma letra maiúscula.");
            isValid = false;
        } else if (!/[a-z]/.test(newPassword)) {
            displayError("new_password", "Inclua ao menos uma letra minúscula.");
            isValid = false;
        } else if (!/[0-9]/.test(newPassword)) {
            displayError("new_password", "Inclua ao menos um número.");
            isValid = false;
        } else if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\];'`~]/.test(newPassword)) {
            displayError("new_password", "Inclua ao menos um caractere especial.");
            isValid = false;
        } else if (/\s/.test(newPassword)) {
            displayError("new_password", "A senha não pode conter espaços.");
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            displayError("confirm_password", "A confirmação não coincide com a nova senha.");
            isValid = false;
        }
    }

    if (!password) {
        displayError("password", "Informe sua senha atual para confirmar as alterações.");
        isValid = false;
    }

    return isValid;
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

function formatCPF(value) {
    value = String(value || "").replace(/\D/g, "").slice(0, 11);
    value = value.replace(/^(\d{3})(\d)/, "$1.$2");
    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
    return value;
}
