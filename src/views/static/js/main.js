const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Alterna o ícone do botão
    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = '☀️'; // Ícone de sol para Light Mode
    } else {
        toggleButton.textContent = '🌙'; // Ícone de lua para Dark Mode
    }
});
