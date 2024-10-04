document.querySelector('#search-button').addEventListener('click', function() {
    const cpf = document.querySelector('#cpf-search').value.replace(/\D/g, '');
    alert('Buscar CPF: ' + cpf);
});

document.querySelector('#add-button').addEventListener('click', function() {
    const cpf = document.querySelector('#cpf-search').value.replace(/\D/g, '');
    alert('Adicionar usuário: ' + cpf);
});

document.querySelector('#cpf-search').addEventListener('input', function (e) {
    let cpf = e.target.value.replace(/\D/g, '');

    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d)/, '$1.$2');
    cpf = cpf.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    e.target.value = cpf;
});
