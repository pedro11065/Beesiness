const cnpj = getCnpjFromUrl()
let isEditMode = false; // Essa variável que define se o modal está no modo de edição ou adição

// Funções de Utilidade
function getCnpjFromUrl() {
    const url = window.location.pathname;  // Obtém o caminho da URL
    const parts = url.split('/');  // Divide a URL pelas barras
    return parts[parts.length - 2];  // Retorna a penúltima parte da URL
}

function verifyCPF(strCPF) {
    var Soma;
    var Resto;
    Soma = 0;

    if (/(.)\1{10}/.test(strCPF)) return false;

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


// Funções de Ação
function openEditModal(fullname, cpf, permission) {
    isEditMode = true;

    document.getElementById('name').value = fullname;
    document.getElementById('cpf').value = cpf;
    document.getElementById('permission').value = permission;

    document.getElementById('modal').style.display = 'block';

    // Fecha o dropdown
    const dropdown = event.target.closest('td').querySelector('.dropdown-menu');
    dropdown.style.display = 'none';
}

function openAlertModal(message) {
    document.getElementById('alert-message').textContent = message;
    document.getElementById('alert-modal').style.display = 'block';
}

document.querySelector('.btn.confirmar').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';

    const cpf = document.getElementById('cpf').value;
    const permission = document.getElementById('permission').value;

    const action = isEditMode ? 'update_permission' : 'add';

    fetch(`/dashboard/company/${cnpj}/authorization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, data: { cpf, permission } })
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                openAlertModal(data.message)
            }

            window.location.reload();
        })
        .catch(error => console.error('Erro ao atualizar permissão:', error));
});

document.querySelector('.btn.cancelar').addEventListener('click', function () {
    document.getElementById('modal').style.display = 'none';
});

document.querySelector('.btn.nao').onclick = function () {
    document.getElementById('confirm-modal').style.display = 'none';
};

document.getElementById('add-button').addEventListener('click', function () {
    const cpf = document.getElementById('cpf-search').value.replace(/\D/g, '');

    if (cpf.length !== 11 || !verifyCPF(cpf)) {
        openAlertModal('Por favor, insira um CPF válido.');
        return;
    }

    isEditMode = false;

    document.getElementById('cpf').value = cpf;
    document.getElementById('name').placeholder = 'Ao confirmar, o nome do usuário será adicionado automaticamente.';
    document.getElementById('permission').value = 'viewer'

    document.getElementById('modal').style.display = 'block';
});

document.querySelector('#alert-modal .fechar').addEventListener('click', function () {
    document.getElementById('alert-modal').style.display = 'none';
});

document.querySelector('#cpf-search').addEventListener('input', function (e) {
    let cpf = e.target.value.replace(/\D/g, '');

    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    e.target.value = cpf;
});

function deleteUser(cpf) {
    document.getElementById('confirm-modal').style.display = 'block';

    document.querySelector('.btn.sim').onclick = function () {
        fetch(`/dashboard/company/${cnpj}/authorization`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', data: { cpf: cpf } }) // Usando o CPF passado como argumento
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    openAlertModal(data.message);
                }

                window.location.reload();
            })
            .catch(error => console.error('Erro ao deletar o usuário:', error));

        document.getElementById('confirm-modal').style.display = 'none';
    };
}

document.addEventListener('click', function () {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.style.display = 'none';
    });
});

function toggleDropdown(event) {
    event.stopPropagation();

    const dropdown = event.target.closest('td').querySelector('.dropdown-menu');
    dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'block' : 'none';
}