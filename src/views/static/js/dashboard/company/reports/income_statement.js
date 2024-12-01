document.addEventListener('DOMContentLoaded', async function () {
    const categoryTitles = document.querySelectorAll('.category-title');
    
    categoryTitles.forEach(title => {
        title.addEventListener('click', () => {
            const dataList = title.nextElementSibling;
            dataList.classList.toggle('collapsed');
        });
    });

    const main = document.getElementById('main');
    const loading = document.getElementById('loading');

    function getCnpjFromUrl() {
        const url = window.location.pathname;
        const parts = url.split('/');
        return parts[parts.length - 1];
    }

    const cnpj = getCnpjFromUrl();

    loading.style.display = 'flex';
    main.style.display = 'none';

    try {
        const response = await fetch(`/dashboard/income-statement/${cnpj}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json();
        console.log(data);

        /*
        - Passivos (classe):
            Compra
            Concessão
            Entrada de Caixa
            Investimento
            Leilão
            Pagamento
            Permuta
            Restituição Judicial
            Troca
            Venda
        - Eventos dos Passivos:
            Capital Social
            Concessão de crédito
            Conta a pagar
            Empréstimo
            Financiamento
            Fornecedor
            Imposto a pagar
            Juros
            Leasing
            Multa
            Outro
            Prestação de serviços
            Processos judiciais
            Salário a pagar

        - Ativos (classe):
            Ações
            Banco
            Caixa
            Contas a Receber
            Equipamentos
            Espaços
            Estoque
            Imóveis
            Infraestrutura
            Intangíveis
            Investimento
            Licenças
            Maquinário
            Matérias-Primas
            Mobília
            Outro
            Patentes
            Tecnologia e TI
            Terreno
            Veículos
        - Eventos dos Ativos:
            Aquisição
            Compra
            Concessão
            Entrada de Caixa
            Herança
            Incorporação
            Investimento
            Leilão
            Permuta
            Produção Interna
            Restituição Judicial
            Serviço
            Transferência
            Troca
            Venda
        */

        loading.style.display = 'none';
        main.style.display = 'flex';

    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
});
