document.addEventListener('DOMContentLoaded', function() {
    const patrimonio = {
        nomePatrimonio: "Patrimônio Exemplo",
        valor: 500000,
        tipo: 'ativo', 
        status: 'Disponível',
        data: '15/09/2023',
        localizacao: 'São Paulo, SP',
        descricao: 'Um imóvel residencial no centro da cidade.'
    };
  
    document.getElementById("nome-patrimonio").innerText = patrimonio.nomePatrimonio;
    document.getElementById('valor').textContent = `R$ ${patrimonio.valor.toLocaleString()}`;
    document.getElementById('status').textContent = patrimonio.status;
    document.getElementById('data').textContent = patrimonio.data;
    document.getElementById('localizacao').textContent = patrimonio.localizacao;
    document.getElementById('descricao').textContent = patrimonio.descricao;
  
    if (patrimonio.tipo === 'ativo') {
        document.getElementById('valor').style.color = 'green';
    } else {
        document.getElementById('valor').style.color = 'red';
    }
});