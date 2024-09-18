/**
 *      PEDRO!!!!
 *      Você pode usar esse mesmo código várias vezes, então é só colar e copiar e fazer as alterações.
 *      Apos alterar, lembra de excluir os comentários pra não ficar poluido, valeu é nóis.
 */


document.addEventListener("DOMContentLoaded", function () {
     // Substitua o registroForm para o novo nome do formulário que está no html
    const registerForm = document.getElementById("registroForm");
    // 'O .register-btn' é o nome da classe que está ao lado do submit, é essa classe que é responsável pelo estado do botão ser alterado (ATENÇÃO: O CSS PRECISA TER A CLASSE DEFINIDA, COM AS CORES E ETC!!!)
    const registerButton = registerForm.querySelector(".register-btn"); 

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return
        }

        registerButton.disabled = true;
        registerButton.textContent = "Aguarde...";

        clearErrors();

        // Aqui, você vai buscar o nome das variáveis, então vai acrescentando o quanto quiser.
        const fullName = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
        const birthDate = document.getElementById('birthDate').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Tá vendo que tem 'fullName: fullName'? O primeiro fullName é o nome da variável que vamos mandar para o backend, então se estivesse:
        // 'ChimbinhasChamps: fullName', eu iria ter que pegar o valor através do ChimbinhasChamps lá no backend. Por isso, preferi deixar o nome igual mesmo.
        const registerData = {
            fullName: fullName,
            email: email,
            cpf: cpf,
            birthDate: birthDate,
            password: password,
            confirmPassword: confirmPassword
        };

        try {
            // Esse '/user/register' você altera de acordo com o url do site, você já deve saber disso.
            const response = await fetch('/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerData)
            });

            if (!response.ok) {
                throw new Error('Erro na resposta da API: ' + response.statusText);
            }

            const data = await response.json();

            if (data.register) {
                // Nessa parte você decide, se vai redirecionar o usuário ou só vai apagar os dados que ele digitou quando clica em gravar
                // Caso você deseja apagar, vai precisar fazer o código para isso.

                // Caso só queira redirecionar:
                window.location.href = '/user/login'; // Mude para a tela desejada!!
                return;
            } else {
                /*
                Nessa parte você adiciona os erros! Por ser customizável e depender das classes no html, siga o padrão.
                
                Aviso:
                    O .cpf_error vem direto do back-end, direto do jsonify, então quanto mais erros, mais coisas o jsonify precisará mandar.
                Exemplo:
                    return jsonify({"register": False, "cpf_error": cpf_error, "email_error": email_error}), 200
                */
                if (data.cpf_error) {
                    displayError('cpf', 'CPF já está registrado.');
                }

                if (data.email_error) {
                    displayError('email', 'Email já está registrado.');
                }
            }

        } catch (error) {
            // Aqui é só se tiver algum erro grave, algo como o banco de dados não funcionando ou sei lá, não é muito necessário, mas é sempre bom retornar alguma coisa.
            console.error('Erro ao registrar usuário:', error);
            //displayError('message', 'Um erro inesperado ocorreu, sentimos muito.');
        } finally {
            // Mesmo que o comando dê erro ou funcione, o botão irá voltar ao normal depois.
            registerButton.disabled = false;
            registerButton.textContent = "Registrar"; // ALTERE O NOME DO BOTÃO SE NÃO VAI FICAR DIFERENTE QUANDO ELE VOLTAR DO AGUARDE...
        }
    });
});

function clearErrors() {
    const errorFields = document.querySelectorAll('.error');
    errorFields.forEach(function (errorField) {
        errorField.textContent = ''; // Limpa os erros anteriores
    });
}

function displayError(fieldId, message) {
    const errorField = document.getElementById(fieldId + '-error');
    if (errorField) {
        errorField.textContent = message;
    }
}