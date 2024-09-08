
    let pPressCount = 0;

    document.addEventListener('keydown', function(event) {
        // Verifica se a tecla pressionada é "P" ou "p"
        if (event.key.toLowerCase() === 'p') {
            pPressCount++;
        } else {
            pPressCount = 0;  // Reseta o contador se qualquer outra tecla for pressionada
        }

        // Se a tecla "P" for pressionada 3 vezes
        if (pPressCount === 3) {
            const pedroCard = document.getElementById('pedro-card');
            const pedroPhoto = document.getElementById('pedro-photo');
            const h3 = pedroCard.querySelector('h3');
            const p = pedroCard.querySelector('p');

            // Adiciona classe fade-out para começar a transição de saída
            h3.classList.add('fade-out');
            p.classList.add('fade-out');
            pedroPhoto.classList.add('fade-out');

            // Após um pequeno delay (mesmo tempo da transição), mudar o conteúdo
            setTimeout(function() {
                h3.textContent = 'Pedro Gayxabeira, Diretor de Logística';
                p.textContent = 'Pedro Gayxabeira é nosso Diretor de Logística e um dos desenvolvedores back-end.';
                pedroPhoto.src = 'pedro_logistica.jpeg';  // Altere para o caminho da nova foto
                pedroPhoto.alt = 'Pedro Gayxabeira';

                // Remove a classe fade-out e adiciona a fade-in para a transição de entrada
                h3.classList.remove('fade-out');
                p.classList.remove('fade-out');
                pedroPhoto.classList.remove('fade-out');

                h3.classList.add('fade-in');
                p.classList.add('fade-in');
                pedroPhoto.classList.add('fade-in');
            }, 500); // 500ms para coincidir com o tempo da transição no CSS

            pPressCount = 0;  // Reseta o contador após ativar o easter egg
        }
    });

