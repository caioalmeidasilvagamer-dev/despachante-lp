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

    function initHero() {
        const hero = document.getElementById('hero');
        if (!hero) return;

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                hero.classList.add('hero--animado');
            });
        });
    }

    function initHeroCarousel() {
        const carousel = document.querySelector('.hero__cards');
        const dots = document.querySelectorAll('.hero__carousel-dot');
        if (!carousel || dots.length === 0) return;

        carousel.addEventListener('scroll', function () {
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            if (maxScroll <= 0) return;

            const percent = carousel.scrollLeft / maxScroll;
            let activeIndex = Math.round(percent * (dots.length - 1));

            dots.forEach((dot, index) => {
                if (index === activeIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }, { passive: true });
    }

    function initScrollAnim() {
        const targets = document.querySelectorAll('.anim');
        if (!targets.length) return;
        
        if (!('IntersectionObserver' in window)) {
            targets.forEach(function (el) { el.classList.add('visible'); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = parseInt(el.getAttribute('data-delay') || '0');
                    if (delay > 0) {
                        el.style.transitionDelay = (delay * 100) + 'ms';
                    }
                    el.classList.add('visible');
                    el.addEventListener('transitionend', function() {
                        el.style.willChange = 'auto';
                    }, { once: true });
                    observer.unobserve(el);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        targets.forEach(function (el) { observer.observe(el); });
    }

    function initMobileMenu() {
        const toggle = document.querySelector('.header__toggle');
        const nav = document.querySelector('.header__nav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', function () {
            const expanded = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', !expanded);
            nav.classList.toggle('header__nav--open');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu on link click
        nav.querySelectorAll('.header__nav-link').forEach(link => {
            link.addEventListener('click', () => {
                toggle.setAttribute('aria-expanded', 'false');
                nav.classList.remove('header__nav--open');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // =============================================
    // FORMULÁRIO DE CONTATO — redireciona para WhatsApp
    // =============================================
    function initContatoForm() {
        const contatoForm = document.getElementById('contato-form');

        if (!contatoForm) return;

        contatoForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const nome     = document.getElementById('contato-nome')?.value.trim()     || '';
            const telefone = document.getElementById('contato-telefone')?.value.trim() || '';
            const servico  = document.getElementById('contato-servico')?.value          || '';
            const mensagem = document.getElementById('contato-mensagem')?.value.trim() || '';

            const servicoLabels = {
                transferencia:  'Transferência de Veículo',
                licenciamento:  'Licenciamento Anual (CRLV)',
                emplacamento:   'Emplacamento Novo',
                multas:         'Regularização de Multas',
                'segunda-via':  'Segunda Via de Documentos',
                inventario:     'Inventário de Veículo',
                outro:          'Outro assunto',
            };

            const servicoTexto = servicoLabels[servico] || servico || 'Não informado';

            const linhas = [
                `Olá! Vim pelo site e gostaria de um atendimento.`,
                ``,
                `*Nome:* ${nome || 'Não informado'}`,
                `*Telefone:* ${telefone || 'Não informado'}`,
                `*Serviço:* ${servicoTexto}`,
                mensagem ? `*Mensagem:* ${mensagem}` : '',
            ].filter(l => l !== undefined);

            const texto = linhas.join('\n');
            const url   = `https://wa.me/5521995462016?text=${encodeURIComponent(texto)}`;

            window.open(url, '_blank', 'noopener');
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initRevealOnScroll();
        initScrollAnim();
        initHero();
        initHeroCarousel();
        initMobileMenu();
        initContatoForm();
    });
})();

(function initProcessoTimeline() {
    const section = document.querySelector('.processo-section');
    if (!section) return;

    const linhaFill  = document.getElementById('processo-linha-fill');
    const pulso1     = document.getElementById('processo-pulso-1');
    const pulso2     = document.getElementById('processo-pulso-2');
    const reveals    = document.querySelectorAll('.processo-reveal');

    const lineObs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting) return;
        if (linhaFill) linhaFill.classList.add('active');
        if (pulso1)    pulso1.classList.add('active');
        if (pulso2)    pulso2.classList.add('active');
        lineObs.disconnect();
    }, { threshold: 0.3 });

    lineObs.observe(section);

    const stepObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = parseInt(entry.target.dataset.delay || '0') * 130;
            setTimeout(() => entry.target.classList.add('visible'), delay);
            stepObs.unobserve(entry.target);
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => stepObs.observe(el));
})();
