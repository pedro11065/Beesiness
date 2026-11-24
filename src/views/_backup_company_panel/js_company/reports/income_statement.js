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
        console.log(data)


        const BruteRevenue = document.getElementById('brute_revenue');
        const DeductionsRevenue = document.getElementById('deductions_revenue');
        const SellCosts = document.getElementById('sell_costs');
        const OperationalCosts = document.getElementById('operational_costs');
  



        //RECEITA OPERACIONAL BRUTA---------------------------------------------------------------------------

        document.getElementById('brute_revenue_total').textContent = `${formatValueToMoney(data.brute_revenue_float)}`;

        Object.keys(data.brute_revenue).forEach(i => {  

            const BruteRevenueDiv = document.createElement('li');
            BruteRevenueDiv.className = 'data-list';
            BruteRevenueDiv.innerHTML = `
            
            <li class="data-item">
                ${data.brute_revenue[i].name}
                <div class="data-value" id="vendas-produtos">${formatValueToMoney(data.brute_revenue[i].value)}</div>
            </li>`
                
            BruteRevenue.appendChild(BruteRevenueDiv);


        });




        //DEDUÇÕES DA RECEITA BRUTA---------------------------------------------------------------------------

        document.getElementById('deductions_revenue_total').textContent = `${formatValueToMoney(data.deductions_revenue_float)}`;
        if (data.deductions_revenue_float >= 0){
            document.getElementById('deductions_revenue_total').style.color = "green";
        }
        else{
            document.getElementById('deductions_revenue_total').style.color = "red";
        }

        Object.keys(data.deductions_revenue).forEach(i => {  

            const DeductionsRevenueDiv = document.createElement('li');
            DeductionsRevenueDiv.className = 'data-list';
            DeductionsRevenueDiv.innerHTML = `
            
            <li class="data-item">
                ${data.brute_revenue[i].name}
                <div class="data-value" id="vendas-produtos">${formatValueToMoney(data.deductions_revenue[i].value)}</div>
            </li>`
                
            DeductionsRevenue.appendChild(DeductionsRevenueDiv);

        });     




        //RESULTADO OPERACIONAL BRUTO---------------------------------------------------------------------------

        document.getElementById('result_revenue_total').textContent = `${formatValueToMoney(data.result_revenue)}`;
        if (data.result_revenue >= 0){
            document.getElementById('result_revenue_total').style.color = "green";
        }
        else{
            document.getElementById('result_revenue_total').style.color = "red";
        }



        //CUSTOS DAS VENDAS---------------------------------------------------------------------------

        document.getElementById('sell_costs_total').textContent = `${formatValueToMoney(data.sell_costs_float)}`;
 
        Object.keys(data.sell_costs).forEach(i => {  

            const SellCostsDiv = document.createElement('li');
            SellCostsDiv.className = 'data-list';
            SellCostsDiv.innerHTML = `
            
            <li class="data-item">
                ${data.sell_costs[i].name}
                <div class="data-value" id="vendas-produtos">${formatValueToMoney(data.sell_costs[i].value)}</div>
            </li>`
                
            SellCosts.appendChild(SellCostsDiv);

        });



        //RESULTADO OPERACIONAL LÍQUIDO--------------------------------------------------------------------------
        document.getElementById('result_operational_costs_total').textContent = `${formatValueToMoney(data.result_operational_costs)}`;
        if (data.result_operational_costs >= 0){
            document.getElementById('result_operational_costs_total').style.color = "green";
        }
        else{
            document.getElementById('result_operational_costs_total').style.color = "red";
        }



        //DESPESAS OPERACIONAIS---------------------------------------------------------------------------

        document.getElementById('operational_costs_total').textContent = `${formatValueToMoney(data.operational_costs_float)}`;

        Object.keys(data.operational_costs).forEach(i => {  

            const SellCostsDiv = document.createElement('li');
            SellCostsDiv.className = 'data-list';
            SellCostsDiv.innerHTML = `
            
            <li class="data-item">
                ${data.operational_costs[i].name}
                <div class="data-value" id="vendas-produtos">${formatValueToMoney(data.operational_costs[i].value)}</div>
            </li>`
                
            OperationalCosts.appendChild(SellCostsDiv);

        });



         //Lucro/Prejuízo operacional---------------------------------------------------------------------------

         document.getElementById('loss_profit_total').textContent = `${formatValueToMoney(data.loss_profit)}`;
         if (data.loss_profit >= 0){
            document.getElementById('loss_profit_total').style.color = "green";
        }
        else{
            document.getElementById('loss_profit_total').style.color = "red";
        }


        loading.style.display = 'none';
        main.style.display = 'flex';
        //---------------------------------------------------------------------------


    } catch (error) {
        const errorDiv = document.createElement('div');
        errorDiv.innerHTML = `<div class="error"><h1>Erro ao procurar as informações.</h1></div>`;
        main.appendChild(errorDiv);
    }
});



function formatValueToMoney(valueStr) {
    const valueNum = parseFloat(valueStr);
    return valueNum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}