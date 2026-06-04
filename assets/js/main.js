(function () {
    'use strict';

    function initHeader() {
        const header = document.getElementById('header');
        if (!header) return;

        const SCROLL_THRESHOLD = 60;
        let ticking = false;

        function updateHeader() {
            if (window.scrollY > SCROLL_THRESHOLD) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        }, { passive: true });

        updateHeader();
    }

    function initRevealOnScroll() {
        const targets = document.querySelectorAll('.reveal');
        if (!targets.length) return;
        if (!('IntersectionObserver' in window)) {
            targets.forEach(function (el) { el.classList.add('visivel'); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visivel');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        targets.forEach(function (el) { observer.observe(el); });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initRevealOnScroll();
    });
})();

(function initProcessoTimeline() {
    const section = document.querySelector('.processo-section');
    const linhaFill = document.getElementById('processo-linha-fill');
    const reveals = document.querySelectorAll('.processo-reveal');
    if (!section) return;
    const lineObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            if (linhaFill) linhaFill.classList.add('active');
            lineObserver.disconnect();
        }
    }, { threshold: 0.3 });
    lineObserver.observe(section);
    const stepObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay || '0') * 120;
                setTimeout(() => entry.target.classList.add('visible'), delay);
                stepObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => stepObserver.observe(el));
})();
