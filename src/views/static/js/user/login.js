document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");
    const loginButton = loginForm.querySelector(".login-section-button");
    const buttonLabel = loginButton.querySelector(".btn-label");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // Alternar visibilidade da senha
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

    // Limpar estado inválido ao digitar
    [emailInput, passwordInput].forEach((input) => {
        input.addEventListener("input", () => {
            input.classList.remove("is-invalid");
            const fieldErr = document.getElementById(input.id + "-error");
            if (fieldErr) fieldErr.textContent = "";
        });
    });

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        clearErrors();

        let identifier = emailInput.value.trim();
        const password = passwordInput.value;

        let hasFieldError = false;
        if (!identifier) {
            displayError("email", "Informe seu e-mail ou CPF.");
            emailInput.classList.add("is-invalid");
            hasFieldError = true;
        }
        if (!password) {
            displayError("password", "Informe sua senha.");
            passwordInput.classList.add("is-invalid");
            hasFieldError = true;
        }
        if (hasFieldError) return;

        // Se o usuário digitou um CPF com pontuação (sem @), envia apenas os 11 dígitos
        if (!identifier.includes("@")) {
            const digits = identifier.replace(/\D/g, "");
            if (digits.length === 11) identifier = digits;
        }

        loginButton.disabled = true;
        if (buttonLabel) buttonLabel.textContent = "Entrando...";

        try {
            const response = await fetch("/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: identifier, senha: password })
            });

            if (!response.ok) {
                throw new Error("Erro na resposta da API: " + response.statusText);
            }

            const data = await response.json();

            if (data.login) {
                window.location.href = data.redirect_url;
                return;
            }

            displayError("message", "E-mail/CPF ou senha incorretos.");
            emailInput.classList.add("is-invalid");
            passwordInput.classList.add("is-invalid");
        } catch (error) {
            console.error("Erro ao fazer login de usuário:", error);
            displayError("message", "Não foi possível entrar agora. Tente novamente em instantes.");
        } finally {
            loginButton.disabled = false;
            if (buttonLabel) buttonLabel.textContent = "Entrar na conta";
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
}
