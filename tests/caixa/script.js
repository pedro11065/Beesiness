// Obtém os elementos do DOM
const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

// Abre a caixa flutuante
openModalBtn.onclick = function() {
    modal.style.display = "block";
}

// Fecha a caixa flutuante quando o "x" é clicado
closeModalBtn.onclick = function() {
    modal.style.display = "none";
}

// Fecha a caixa flutuante quando clicamos fora dela
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
}
