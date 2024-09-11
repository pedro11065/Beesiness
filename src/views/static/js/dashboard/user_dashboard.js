
//todo sistema que gera resposta da API está em: src\controller\dashboard\functions\user_companies.py
function displayError(fieldId, message) {
    const errorField = document.getElementById(fieldId + '-error');
    if (errorField) {
        errorField.textContent = message;
    }
}

async function getData()
{
    try {
        const response = await fetch('/dashboard/api',{ method: 'GET',}); //vai chamar a API pela url dela

        if (!response.ok) // Se a resposta não for 200 (codigo http)
        {
            throw new Error('Erro na resposta da API: ' + response.statusText);
        }

        const data = await response.json(); // Se for, a resposta vai se tornar a variável data

        if (data.relação) 
        {
            console.log("Você não está relacionado a nenhuma empresa.") 
            displayError('message', 'Você não está relacionado a nenhuma empresa.'); //uma função que robei de um dos js q o thiago criou, ele usa para mostrar coisas no html para o usuário, romendo dar uma olhada em outros arquivos para se inspirar
            //Código do que vai acontecer se não tiver nenhuma relação
        } 
        else 
        {
            console.log("Você está relacionado ",data.relação, "empresa(s).") 
            //O código do que vai acontecer se houver uma ou mais empresas relacionadas ao usuário
        }
    } catch (error) 
    {
        console.error('Erro ao fazer chamar a API:', error);
        displayError('message', 'Um erro inesperado ocorreu, sentimos muito.');
        //Se der um erro na API
    }

    /*

    contas para teste:

    relacionado a duas empresas:
        silvinho@gmail.com
        PedroPy13.

    relacionado a uma empresa:
        pedrohenriquesilvaquixabeira@gmail.com
        PedroPy13.

    relacionado a nenhuma empresa:
        banana@gmail.com
        Pedro12504.


     // independente da quantidade, se tiver algum valor, vai vim em lista, brinque com indices

     - silvinho@gmail.com
     {
        "Quantidade": 2,
        "cnpjs": [                  // vem uma uma lista
            "45039237000114",
            "60509239000547"
        ],
        "nivel de acesso": [        // vem uma uma lista
            "creator",
            "creator"
        ],
        "nomes": [                  // vem uma uma lista
            "Sistema Brasileiro de Televisão L.T.D.A",
            "Radio e Televisão Bandeirantes L.T.D.A"
        ],
        "relação": true
    }

    - pedrohenriquesilvaquixabeira@gmail.com
    {
        "Quantidade": 1,
        "cnpjs": [
            "00280273000218"
        ],
        "nivel de acesso": [
            "creator"
        ],
        "nomes": [
            "Samsung Electronics Co., Ltd."
        ],
        "relação": true
    }

    - banana@gmail.com
    {
        "relação": false
    }

    */


}