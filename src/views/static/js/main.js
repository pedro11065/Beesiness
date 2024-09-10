// Código para alternar o modo escuro/claro

const toggleButton = document.getElementById('dark-mode-toggle');
const body = document.body;

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Alterna o ícone do botão
    toggleButton.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
});