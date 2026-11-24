let isEditMode = false;
let rawTargetCpf = "";
let reloadAfterAlert = false;

function getCnpjFromUrl() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 2] || "";
}

const cnpj = getCnpjFromUrl();

function formatCPF(raw) {
    const d = String(raw || "").replace(/\D/g, "").slice(0, 11);
    if (d.length !== 11) return raw || "";
    return d.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

function maskCPFInput(val) {
    let v = String(val || "").replace(/\D/g, "").slice(0, 11);
    v = v.replace(/^(\d{3})(\d)/, "$1.$2");
    v = v.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1-$2");
    return v;
}

function verifyCPF(strCPF) {
    if (strCPF.length !== 11 || /(.)\1{10}/.test(strCPF)) return false;

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

function showAlert(message, shouldReload = false) {
    reloadAfterAlert = shouldReload;
    document.getElementById("alert-message").textContent = message;
    document.getElementById("alert-modal").classList.add("is-open");
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("modal");
    const confirmModal = document.getElementById("confirm-modal");
    const alertModal = document.getElementById("alert-modal");
    const cpfSearch = document.getElementById("cpf-search");
    const addBtn = document.getElementById("add-button");

    // Formata os CPFs exibidos na tabela
    document.querySelectorAll(".cpf-cell").forEach((td) => {
        td.textContent = formatCPF(td.textContent.trim());
    });

    cpfSearch.addEventListener("input", (e) => {
        e.target.value = maskCPFInput(e.target.value);
    });

    document.querySelectorAll(".cancelar").forEach((b) => {
        b.addEventListener("click", () => modal.classList.remove("is-open"));
    });
    document.querySelectorAll(".nao").forEach((b) => {
        b.addEventListener("click", () => confirmModal.classList.remove("is-open"));
    });
    document.getElementById("btnCloseAuthAlert").addEventListener("click", () => {
        alertModal.classList.remove("is-open");
        if (reloadAfterAlert) window.location.reload();
    });

    [modal, confirmModal].forEach((m) => {
        m.addEventListener("click", (e) => {
            if (e.target === m) m.classList.remove("is-open");
        });
    });

    // Buscar usuário por CPF antes de abrir o modal de permissão
    addBtn.addEventListener("click", async () => {
        const digits = cpfSearch.value.replace(/\D/g, "");
        if (!verifyCPF(digits)) {
            showAlert("Informe um CPF válido (11 dígitos) para buscar o usuário.");
            return;
        }

        addBtn.disabled = true;
        try {
            const res = await fetch(`/dashboard/company/${cnpj}/authorization`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "search", data: { cpf: digits, permission: "viewer" } })
            });
            const data = await res.json();

            if (data.result) {
                isEditMode = false;
                rawTargetCpf = digits;
                document.getElementById("permModalTitle").textContent = "Conceder acesso";
                document.getElementById("name").value = data.result.fullname || "Usuário localizado";
                document.getElementById("cpf").value = formatCPF(digits);
                document.getElementById("permission").value = "viewer";
                modal.classList.add("is-open");
            } else {
                showAlert(data.message || "Nenhum usuário cadastrado com este CPF.");
            }
        } catch (err) {
            console.error("Erro ao buscar CPF:", err);
            showAlert("Erro ao consultar o CPF. Tente novamente.");
        } finally {
            addBtn.disabled = false;
        }
    });

    // Botões de editar papel na tabela
    document.querySelectorAll("[data-edit-cpf]").forEach((btn) => {
        btn.addEventListener("click", () => {
            isEditMode = true;
            rawTargetCpf = String(btn.dataset.editCpf || "").replace(/\D/g, "");
            document.getElementById("permModalTitle").textContent = "Alterar nível de acesso";
            document.getElementById("name").value = btn.dataset.editName || "";
            document.getElementById("cpf").value = formatCPF(rawTargetCpf);
            document.getElementById("permission").value = btn.dataset.editRole || "viewer";
            modal.classList.add("is-open");
        });
    });

    // Salvar adição ou alteração
    document.getElementById("btnConfirmPerm").addEventListener("click", async () => {
        const permission = document.getElementById("permission").value;
        const action = isEditMode ? "update_permission" : "add";
        const btn = document.getElementById("btnConfirmPerm");
        btn.disabled = true;

        try {
            const res = await fetch(`/dashboard/company/${cnpj}/authorization`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, data: { cpf: rawTargetCpf, permission } })
            });
            const data = await res.json();
            modal.classList.remove("is-open");
            showAlert(data.message || "Permissão salva com sucesso.", true);
        } catch (err) {
            console.error("Erro ao salvar permissão:", err);
            showAlert("Erro ao atualizar a permissão.");
        } finally {
            btn.disabled = false;
        }
    });

    // Botões de remover usuário
    document.querySelectorAll("[data-delete-cpf]").forEach((btn) => {
        btn.addEventListener("click", () => {
            rawTargetCpf = String(btn.dataset.deleteCpf || "").replace(/\D/g, "");
            const userName = btn.dataset.deleteName || "este usuário";
            document.getElementById("confirmDeleteText").textContent =
                `Deseja revogar o acesso de ${userName} ao painel desta empresa?`;
            confirmModal.classList.add("is-open");
        });
    });

    document.getElementById("btnConfirmRemove").addEventListener("click", async () => {
        const btn = document.getElementById("btnConfirmRemove");
        btn.disabled = true;
        try {
            const res = await fetch(`/dashboard/company/${cnpj}/authorization`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "delete", data: { cpf: rawTargetCpf } })
            });
            const data = await res.json();
            confirmModal.classList.remove("is-open");
            showAlert(data.message || "Acesso revogado com sucesso.", true);
        } catch (err) {
            console.error("Erro ao remover usuário:", err);
            showAlert("Erro ao revogar o acesso.");
        } finally {
            btn.disabled = false;
        }
    });
});
