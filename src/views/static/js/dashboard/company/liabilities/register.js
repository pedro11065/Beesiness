document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("LiabilityForm");
    const submitButton = document.getElementById("register-button");
    const submitButtonTxt = document.getElementById("register-button-text");
    const valueInput = document.getElementById("value");

    function getCnpjFromUrl() {
        const parts = window.location.pathname.split("/").filter(Boolean);
        return parts[parts.length - 1] || "";
    }

    const cnpj = getCnpjFromUrl();

    function formatCurrencyInput(raw) {
        const digits = String(raw || "").replace(/\D/g, "");
        if (!digits) return "";
        const num = parseFloat(digits) / 100;
        return num.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    valueInput.addEventListener("input", function () {
        this.value = formatCurrencyInput(this.value);
    });

    form.querySelectorAll(".input, .select-input, .textarea-input").forEach((el) => {
        const clear = () => {
            el.classList.remove("is-invalid");
            const err = document.getElementById("err-" + el.id);
            if (err) err.textContent = "";
        };
        el.addEventListener("input", clear);
        el.addEventListener("change", clear);
    });

    function setFieldError(id, msg) {
        const el = document.getElementById(id);
        const err = document.getElementById("err-" + id);
        if (el) el.classList.add("is-invalid");
        if (err) err.textContent = msg;
    }

    function clearErrors() {
        form.querySelectorAll(".is-invalid").forEach((el) => el.classList.remove("is-invalid"));
        form.querySelectorAll(".field-error").forEach((el) => (el.textContent = ""));
    }

    function openAlertModal(message) {
        document.getElementById("alert-message").textContent = message;
        document.getElementById("alert-modal").classList.add("is-open");
    }

    function openSuccessModal(message) {
        document.getElementById("success-message").textContent = message;
        document.getElementById("success-modal").classList.add("is-open");
    }

    document.querySelectorAll("#alert-modal .fechar, #alert-modal .close").forEach((btn) => {
        btn.addEventListener("click", () => {
            document.getElementById("alert-modal").classList.remove("is-open");
        });
    });

    function validateForm() {
        clearErrors();
        let ok = true;

        const name = document.getElementById("name").value.trim();
        const rawVal = valueInput.value.trim().replace(/[^\d,-]/g, "").replace(",", ".");
        const numVal = parseFloat(rawVal);
        const floating = document.getElementById("floating").value.trim();
        const eventValue = document.getElementById("event").value.trim();
        const classValue = document.getElementById("class").value.trim();
        const emissionDate = document.getElementById("emission_date").value.trim();
        const expirationDate = document.getElementById("expiration_date").value.trim();
        const status = document.getElementById("status").value.trim();
        const paymentMethod = document.getElementById("payment_method").value.trim();
        const installment = document.getElementById("installment").value.trim();
        const description = document.getElementById("description").value.trim();

        if (name.length < 3) {
            setFieldError("name", "Informe ao menos 3 caracteres.");
            ok = false;
        }
        if (Number.isNaN(numVal) || numVal <= 0) {
            setFieldError("value", "Informe um valor maior que zero.");
            ok = false;
        }
        if (!floating) {
            setFieldError("floating", "Selecione a classificação.");
            ok = false;
        }
        if (!eventValue) {
            setFieldError("event", "Selecione o evento.");
            ok = false;
        }
        if (!classValue) {
            setFieldError("class", "Selecione a categoria.");
            ok = false;
        }
        if (!emissionDate) {
            setFieldError("emission_date", "Informe a data de emissão.");
            ok = false;
        }
        if (!expirationDate) {
            setFieldError("expiration_date", "Informe a data de vencimento.");
            ok = false;
        } else if (emissionDate && expirationDate < emissionDate) {
            setFieldError("expiration_date", "O vencimento não pode ser anterior à emissão.");
            ok = false;
        }
        if (!status) {
            setFieldError("status", "Selecione a situação.");
            ok = false;
        }
        if (!paymentMethod) {
            setFieldError("payment_method", "Selecione a forma de pagamento.");
            ok = false;
        }
        if (!installment) {
            setFieldError("installment", "Selecione o parcelamento.");
            ok = false;
        }
        if (description.length > 255) {
            setFieldError("description", "Máximo de 255 caracteres.");
            ok = false;
        }

        return ok;
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        submitButton.disabled = true;
        submitButtonTxt.textContent = "Registrando...";

        const formData = {
            cnpj,
            event: document.getElementById("event").value.trim(),
            classe: document.getElementById("class").value.trim(),
            payment_method: document.getElementById("payment_method").value.trim(),
            installment: document.getElementById("installment").value.trim(),
            floating: document.getElementById("floating").value.trim(),
            status: document.getElementById("status").value.trim(),
            name: document.getElementById("name").value.trim(),
            value: valueInput.value.trim().replace(/[^\d,-]/g, "").replace(",", "."),
            emission_date: document.getElementById("emission_date").value.trim(),
            expiration_date: document.getElementById("expiration_date").value.trim(),
            description: document.getElementById("description").value.trim() || "Sem observações."
        };

        try {
            const response = await fetch(`/dashboard/register/liability/${cnpj}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                openSuccessModal("Passivo registrado e contabilizado com sucesso.");
            } else {
                const errData = await response.json().catch(() => ({}));
                openAlertModal(errData.message || "Não foi possível registrar o passivo.");
                submitButton.disabled = false;
                submitButtonTxt.textContent = "Registrar passivo";
            }
        } catch (error) {
            console.error("Erro ao enviar passivo:", error);
            openAlertModal("Erro de conexão ao enviar os dados. Tente novamente.");
            submitButton.disabled = false;
            submitButtonTxt.textContent = "Registrar passivo";
        }
    });
});
