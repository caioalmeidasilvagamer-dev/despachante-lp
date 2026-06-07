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

// =============================================
// SIMULADOR DE PONTOS NA CNH
// =============================================
(function () {
  const PONTOS  = { leve: 3, media: 4, grave: 5, gravissima: 7 };
  const VALORES = { leve: 88.38, media: 130.16, grave: 195.23, gravissima: 293.47 };
  const WA_NUM  = '5521995462016';

  const counts = { leve: 0, media: 0, grave: 0, gravissima: 0 };

  function $(id) { return document.getElementById(id); }

  function calcular() {
    const total       = Object.keys(counts).reduce((s, k) => s + counts[k] * PONTOS[k], 0);
    const totalMultas = Object.values(counts).reduce((s, v) => s + v, 0);
    const valor       = Object.keys(counts).reduce((s, k) => s + counts[k] * VALORES[k], 0);
    const recorriveis = Math.ceil(totalMultas * 0.7);
    const ptsRecurso  = Math.round(Object.keys(counts).reduce((s, k) => s + Math.ceil(counts[k] * 0.7) * PONTOS[k], 0));
    const posRecurso  = Math.max(0, total - ptsRecurso);
    const pct         = Math.min(100, Math.round((total / 20) * 100));
    const faltam      = Math.max(0, 20 - total);

    $('sim-total-pts').textContent   = total;
    $('sim-recorriveis').textContent = recorriveis;
    $('sim-pts-recurso').textContent = ptsRecurso;
    $('sim-valor-total').textContent = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const posEl = $('sim-pos-recurso');
    posEl.textContent = posRecurso + ' pts';
    posEl.className   = 'sim-stat-val ' + (posRecurso < 15 ? 'sim-green' : posRecurso < 20 ? 'sim-amber' : 'sim-red');

    const barra = $('sim-barra');
    barra.style.width      = pct + '%';
    barra.style.background = pct < 50 ? '#22c55e' : pct < 80 ? '#F5A623' : '#ef4444';

    const barraAria = $('sim-barra-aria');
    if (barraAria) barraAria.setAttribute('aria-valuenow', Math.min(total, 20));

    $('sim-faltam').textContent = total === 0
      ? 'Adicione multas para ver sua situação'
      : faltam > 0
        ? 'Faltam ' + faltam + ' ponto(s) para a suspensão'
        : 'Limite atingido — suspensão iminente';

    const statusEl = $('sim-status');
    const ctaEl    = $('sim-cta');
    let ctaTitulo  = '';
    let ctaSub     = '';
    let statusHTML = '';
    let msgWA      = '';

    if (total === 0) {
      statusHTML = `<div class="sim-status-card sim-status--ok">
        <span class="sim-status-icon" style="color:#22c55e" aria-hidden="true">✓</span>
        <div>
          <div class="sim-status-titulo" style="color:#22c55e">CNH regularizada</div>
          <div class="sim-status-desc" style="color:#86efac">Nenhuma infração registrada. Sua carteira está em dia.</div>
        </div>
      </div>`;
      ctaEl.classList.remove('sim-cta--visible');
    } else if (total < 10) {
      statusHTML = `<div class="sim-status-card sim-status--ok">
        <span class="sim-status-icon" style="color:#22c55e" aria-hidden="true">⚠</span>
        <div>
          <div class="sim-status-titulo" style="color:#22c55e">Situação tranquila por enquanto</div>
          <div class="sim-status-desc" style="color:#86efac">Você tem ${total} pontos. Ainda está distante do limite, mas vale recorrer agora enquanto há tempo.</div>
        </div>
      </div>`;
      ctaTitulo = 'Recorra agora antes que piore';
      ctaSub    = `Com ${recorriveis} multa(s) com chance de recurso, posso reduzir sua pontuação para ${posRecurso} pontos. Análise gratuita.`;
      msgWA     = `Olá! Fiz a simulação no site e tenho ${total} pontos na CNH. Gostaria de analisar o recurso das multas.`;
    } else if (total < 20) {
      statusHTML = `<div class="sim-status-card sim-status--aviso">
        <span class="sim-status-icon" style="color:#F5A623" aria-hidden="true">!</span>
        <div>
          <div class="sim-status-titulo" style="color:#F5A623">Atenção — zona de risco</div>
          <div class="sim-status-desc" style="color:#FCD34D">Você está com ${total} pontos. Faltam apenas ${faltam} ponto(s) para a suspensão. Qualquer nova infração pode ser fatal.</div>
        </div>
      </div>`;
      ctaTitulo = 'Situação crítica — aja agora';
      ctaSub    = `Posso analisar ${recorriveis} multa(s) com chance real de recurso e reduzir sua pontuação para ${posRecurso} pontos. Não espere mais.`;
      msgWA     = `Olá! Fiz a simulação no site e tenho ${total} pontos na CNH — zona de risco! Preciso urgente de ajuda com recurso de multas.`;
    } else {
      statusHTML = `<div class="sim-status-card sim-status--risco">
        <span class="sim-status-icon" style="color:#ef4444" aria-hidden="true">✕</span>
        <div>
          <div class="sim-status-titulo" style="color:#ef4444">CNH em risco de suspensão</div>
          <div class="sim-status-desc" style="color:#fca5a5">Você atingiu ${total} pontos — acima do limite legal de 20 pts. O DETRAN pode notificar a suspensão a qualquer momento.</div>
        </div>
      </div>`;
      ctaTitulo = 'Suspensão iminente — recurso urgente';
      ctaSub    = `Com ${recorriveis} multa(s) recorríveis posso reduzir sua pontuação para ${posRecurso} pontos e evitar a suspensão. Me chama agora.`;
      msgWA     = `URGENTE! Fiz a simulação no site e tenho ${total} pontos na CNH. Preciso de recurso urgente para evitar suspensão!`;
    }

    statusEl.innerHTML = statusHTML;

    if (total > 0) {
      $('sim-cta-titulo').textContent = ctaTitulo;
      $('sim-cta-sub').textContent    = ctaSub;
      $('sim-cta-btn').href           = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msgWA)}`;
      ctaEl.classList.add('sim-cta--visible');
    }
  }

  function iniciar() {
    const section = document.getElementById('simulador');
    if (!section) return;

    section.querySelectorAll('.sim-btn-cnt').forEach(btn => {
      btn.addEventListener('click', () => {
        const tipo  = btn.dataset.tipo;
        const delta = parseInt(btn.dataset.delta, 10);
        counts[tipo] = Math.max(0, counts[tipo] + delta);
        document.getElementById('sim-v-' + tipo).textContent = counts[tipo];
        calcular();
      });
    });

    const resetBtn = document.getElementById('sim-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        Object.keys(counts).forEach(k => {
          counts[k] = 0;
          document.getElementById('sim-v-' + k).textContent = '0';
        });
        calcular();
      });
    }

    calcular();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
