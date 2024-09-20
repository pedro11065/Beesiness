document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('AssetForm');
    const submitButton = document.querySelector('.register-button');

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault(); // Evita o comportamento padrão do formulário

        // Coleta os dados dos campos
        const eventValue = document.getElementById('event').value.trim();
        const classValue = document.getElementById('class').value.trim();
        const name = document.getElementById('Name').value.trim();
        const localization = document.getElementById('Localization').value.trim();
        const acsitionDate = document.getElementById('acsition_date').value;
        const acsitionValue = document.getElementById('acsition_value').value.trim();
        const status = document.getElementById('status').value;
        const description = document.getElementById('description').value.trim();

        // Cria um objeto com os dados
        const formData = {
            event: eventValue,
            class: classValue,
            name: name,
            localization: localization,
            acsitionDate: acsitionDate,
            acsitionValue: acsitionValue,
            status: status,
            description: description
        };

        try {
            // Envia os dados para a API
            const response = await fetch('/dashboard/register-asset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Manipulação após sucesso, se necessário
                alert('Ativo registrado com sucesso!');
                form.reset(); // Opcional: Reseta o formulário
            } else {
                // Manipulação de erro
                const errorData = await response.json();
                alert(`Erro: ${errorData.message || 'Não foi possível registrar o ativo.'}`);
            }
        } catch (error) {
            // Manipulação de erro
            console.error('Erro ao enviar dados:', error);
            alert('Erro ao enviar dados. Tente novamente mais tarde.');
        }
    });
});
