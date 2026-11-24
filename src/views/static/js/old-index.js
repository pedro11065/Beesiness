function ShowFeature1() {
    const elemento = document.getElementById('feature-section-1');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeature1);

function ShowFeature2() {
    const elemento = document.getElementById('feature-section-2');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeature2);

function ShowFeature3() {
    const elemento = document.getElementById('feature-section-3');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeature3);

function ShowFeature4() {
    const elemento = document.getElementById('feature-section-4');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeature4);
function ShowFeature5() {
    const elemento = document.getElementById('feature-section-5');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeature5);
function ShowFeature6() {
    const elemento = document.getElementById('feature-section-6');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeature6);

function ShowFeatureBtn() {
    const elemento = document.getElementById('feature-btn-container');
    const posicao = elemento.getBoundingClientRect().top;
    const alturaJanela = window.innerHeight;

    if (posicao < alturaJanela) {
        elemento.classList.add('visible');
    }
}

window.addEventListener('scroll', ShowFeatureBtn);