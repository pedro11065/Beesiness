// Código para alternar o modo escuro/claro

const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    toggleButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙'; // Alterna o ícone do botão
});