// Fallback para navegadores sem suporte a CSS Scroll-Driven Animations.
// Nos navegadores compatíveis, todas as animações são feitas em CSS (animation-timeline).
(function () {
    const supportsSDA = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (supportsSDA || reduceMotion) return;

    document.documentElement.classList.add('no-sda');

    // Revelação ao entrar na tela
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    const bar = document.querySelector('.scroll-progress');
    const steps = document.querySelector('.steps');
    const fill = document.querySelector('.steps-fill');
    const marquee = document.querySelector('.marquee');
    const track = document.querySelector('.marquee-track');

    const clamp = (v) => Math.min(1, Math.max(0, v));

    function onScroll() {
        const vh = window.innerHeight;
        const max = document.documentElement.scrollHeight - vh;
        if (bar && max > 0) bar.style.transform = 'scaleX(' + window.scrollY / max + ')';

        if (steps && fill) {
            const r = steps.getBoundingClientRect();
            fill.style.transform = 'scaleX(' + clamp((vh * 0.8 - r.top) / (vh * 0.5)) + ')';
        }

        if (marquee && track) {
            const r = marquee.getBoundingClientRect();
            const p = clamp((vh - r.top) / (vh + r.height));
            track.style.transform = 'translateX(' + (-38 * p) + '%)';
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();
