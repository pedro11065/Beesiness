document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('LiabilityForm');
    const submitButton = document.querySelector('.register-button');

    // Função para extrair o CNPJ da URL
    function getCnpjFromUrl() {
        const url = window.location.pathname;  // Obtém o caminho da url.
        const parts = url.split('/');  // Divide a url pelas barras.
        return parts[parts.length - 1];  // Vai retornar a última parte dividida.
    }

    const cnpj = getCnpjFromUrl();

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const eventvalue = document.getElementById('event').value.trim();
        const classvalue = document.getElementById('class').value.trim();
        const payment = document.getElementById('payment').value.trim();
        const status = document.getElementById('status').value.trim();
        const name = document.getElementById('name').value.trim();
        const value = document.getElementById('value').value.trim();
        const emission_date = document.getElementById('emission_date').value.trim();
        const pay_date = document.getElementById('pay_date').value;
        
        const description = document.getElementById('description').value.trim();

        const formData = {
            cnpj: cnpj,
            event: eventvalue,
            class: classvalue,
            payment: payment,
            status: status,
            name: name,
            value: value,
            emission_date: emission_date,
            pay_date: pay_date,
            description: description
        };

        try {
            const response = await fetch(`/dashboard/register/liability/${cnpj}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Ativo registrado com sucesso!');
                form.reset(); // Opcional: Reseta o formulário
            } else {
                const errorData = await response.json();
                alert(`Erro: ${errorData.message || 'Não foi possível registrar o ativo.'}`);
            }
        } catch (error) {
            console.error('Erro ao enviar dados:', error);
            alert('Erro ao enviar dados. Tente novamente mais tarde.');
        }
    });
});
