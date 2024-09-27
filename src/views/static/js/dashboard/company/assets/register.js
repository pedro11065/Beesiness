document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('AssetForm');
    const submitButton = document.querySelector('.register-button');

    // Função para extrair o CNPJ da URL
    function getCnpjFromUrl() {
        const url = window.location.pathname;  // Obtém o caminho da url.
        const parts = url.split('/');  // Divide a url pelas barras.
        return parts[parts.length - 1];  // Vai retornar a última parte dividida.
    }

    const cnpj = getCnpjFromUrl();

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Evita o comportamento padrão do formulário

        const eventValue = document.getElementById('event').value.trim();
        const classeValue = document.getElementById('classe').value.trim();
        const name = document.getElementById('Name').value.trim();
        const localization = document.getElementById('Localization').value.trim();
        const acquisitionDate = document.getElementById('acquisition_date').value;
        const acquisitionValue = document.getElementById('acquisition_value').value.trim();
        const status = document.getElementById('status').value;
        const description = document.getElementById('description').value.trim();

        const formData = {
            event: eventValue,
            classe: classeValue,
            name: name,
            localization: localization,
            acquisitionDate: acquisitionDate,
            acquisitionValue: acquisitionValue,
            status: status,
            description: description
        };

        try {
            const response = await fetch(`/dashboard/register/asset/${cnpj}`, {
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
