let CTB = null;
async function carregarCTB() {
  if (CTB) return CTB;
  const res = await fetch('assets/data/ctb.json');
  CTB = await res.json();
  return CTB;
}

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
            const placa    = document.getElementById('contato-placa')?.value.trim().toUpperCase() || '';
            const renavam  = document.getElementById('contato-renavam')?.value.trim() || '';
            const servico  = document.getElementById('contato-servico')?.value          || '';
            const mensagem = document.getElementById('contato-mensagem')?.value.trim() || '';

            const servicoLabels = {
                transferencia:  'Transferência de Veículo',
                licenciamento:  'Licenciamento Anual (CRLV)',
                emplacamento:   'Emplacamento Novo',
                multas:         'Regularização de Multas',
                'segunda-via':  'Segunda Via de Documentos',
                inventario:     'Inventário de Veículo',
                'cnh-renovacao': 'Renovação de CNH',
                'cnh-primeira':  'Primeira Habilitação',
                'cnh-adicao':    'Adição de Categoria',
                'cnh-recurso':   'Recurso de Suspensão/Cassação',
                'cnh-segunda-via': 'Segunda Via de CNH',
                outro:          'Outro assunto',
            };

            const servicoTexto = servicoLabels[servico] || servico || 'Não informado';

            const linhas = [
                `Olá! Vim pelo site e gostaria de um atendimento.`,
                ``,
                `*Serviço:* ${servicoTexto}`,
                placa ? `*Placa:* ${placa}` : '',
                renavam ? `*RENAVAM:* ${renavam}` : '',
                `*Nome:* ${nome || 'Não informado'}`,
                `*Telefone:* ${telefone || 'Não informado'}`,
                mensagem ? `*Mensagem:* ${mensagem}` : '',
            ].filter(l => l !== undefined && l !== '');

            const texto = linhas.join('\n');
            const url   = `https://wa.me/5521995462016?text=${encodeURIComponent(texto)}`;

            window.open(url, '_blank', 'noopener');
        });

        const whatsappBtn = contatoForm.querySelector('.contato-btn--whatsapp');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', function (e) {
                e.preventDefault();
                const placaVal   = document.getElementById('contato-placa')?.value.trim().toUpperCase() || '';
                const renavamVal = document.getElementById('contato-renavam')?.value.trim() || '';
                const servicoVal = document.getElementById('contato-servico')?.value || '';
                const msgVal     = document.getElementById('contato-mensagem')?.value.trim() || '';
                const servicoTxt = servicoLabels[servicoVal] || servicoVal || '';

                const parts = ['Olá, vim pelo site.'];
                if (servicoTxt) parts.push(`Serviço: ${servicoTxt}.`);
                if (placaVal)   parts.push(`Placa: ${placaVal}.`);
                if (renavamVal) parts.push(`RENAVAM: ${renavamVal}.`);
                if (msgVal)     parts.push(msgVal);

                const textoWA = parts.join(' ');
                const urlWA   = `https://wa.me/5521995462016?text=${encodeURIComponent(textoWA)}`;
                window.open(urlWA, '_blank', 'noopener');
            });
        }
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
  const TIPOS   = { leve:'Leve', media:'Média', grave:'Grave', gravissima:'Gravíssima' };
  const CORES_INFRA = {
    leve:     { bg:'#0f2a1a', color:'#22c55e' },
    media:    { bg:'#2a1a00', color:'#F5A623' },
    grave:    { bg:'#2a0a0a', color:'#ef4444' },
    gravissima:{ bg:'#3a0000', color:'#ff6b6b' },
  };
  const WA_NUM = '5521995462016';
  const counts = { leve:0, media:0, grave:0, gravissima:0 };

  function $(id){ return document.getElementById(id); }

  function calcular(){
    const pontos  = CTB.cnh.pontos;
    const valores = CTB.cnh.valores;
    const total     = Object.keys(counts).reduce((s,k)=>s+counts[k]*pontos[k],0);
    const totalM    = Object.values(counts).reduce((s,v)=>s+v,0);
    const valor     = Object.keys(counts).reduce((s,k)=>s+counts[k]*valores[k],0);
    const recorriveis = Math.ceil(totalM*0.7);
    const ptsRecurso  = Math.round(Object.keys(counts).reduce((s,k)=>s+Math.ceil(counts[k]*0.7)*pontos[k],0));
    const posRecurso  = Math.max(0, total-ptsRecurso);
    const pct         = Math.min(100, Math.round(total/20*100));
    const faltam      = Math.max(0, 20-total);

    const ptsEl = $('sim-pron-pts');
    ptsEl.textContent = total;
    ptsEl.style.color = total===0?'#22c55e':total<10?'#F5A623':'#ef4444';

    $('sim-pron-recorriveis').textContent = recorriveis;
    $('sim-pron-valor').textContent       = valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
    const posEl = $('sim-pron-pos');
    posEl.textContent = posRecurso+' pts';
    posEl.style.color = posRecurso<15?'#22c55e':posRecurso<20?'#F5A623':'#ef4444';

    const barra = $('sim-pron-barra');
    barra.style.width      = pct+'%';
    barra.style.background = pct<50?'#22c55e':pct<80?'#F5A623':'#ef4444';
    $('sim-pron-faltam').textContent = total===0
      ?'Sem pontos registrados'
      :faltam>0?`Faltam ${faltam} pts para suspensão`:'⚠ Limite atingido';

    const badge = $('sim-pron-badge');
    const badgeMap = [
      [0,   'Regular',  '#0f2a1a','#22c55e'],
      [9,   'Atenção',  '#2a1a00','#F5A623'],
      [19,  'Risco',    '#2a0a0a','#ef4444'],
      [Infinity,'Suspenso','#3a0000','#ff6b6b'],
    ];
    const bs = badgeMap.find(([lim])=>total<=lim)||badgeMap[badgeMap.length-1];
    badge.textContent       = bs[1];
    badge.style.background  = bs[2];
    badge.style.color       = bs[3];

    const infraWrap  = $('sim-pron-infra-wrap');
    const infraLista = $('sim-pron-infra-lista');
    if(totalM>0){
      infraWrap.style.display='block';
      infraLista.innerHTML = Object.keys(counts)
        .filter(k=>counts[k]>0)
        .map(k=>`
          <div class="sim-pron-infra-item">
            <span class="sim-pron-infra-tipo">${TIPOS[k]}</span>
            <div class="sim-pron-infra-right">
              <span class="sim-pron-infra-qtd">${counts[k]}x</span>
              <span class="sim-pron-infra-pts"
                style="background:${CORES_INFRA[k].bg};color:${CORES_INFRA[k].color}">
                ${counts[k]*CTB.cnh.pontos[k]} pts
              </span>
            </div>
          </div>`).join('');
    } else {
      infraWrap.style.display='none';
    }

    const alertaEl  = $('sim-pron-alerta');
    const alertaTxt = $('sim-pron-alerta-txt');
    const alertaIcon= $('sim-pron-alerta-icon');
    const ctaEl     = $('sim-pron-cta');

    if(total===0){
      alertaEl.style.display='none';
      ctaEl.style.display='none';
    } else {
      alertaEl.style.display='flex';
      ctaEl.style.display='inline-flex';
      if(total<10){
        alertaEl.style.background='#0f2a1a';
        alertaEl.style.color='#22c55e';
        alertaIcon.style.color='#22c55e';
        alertaTxt.innerHTML=`<strong>CNH dentro do limite.</strong> Ainda há margem, mas vale recorrer agora enquanto há tempo.`;
      } else if(total<20){
        alertaEl.style.background='#2a1a00';
        alertaEl.style.color='#F5A623';
        alertaIcon.style.color='#F5A623';
        alertaTxt.innerHTML=`<strong>Zona de risco.</strong> Faltam apenas ${faltam} ponto(s) para a suspensão. Qualquer nova infração pode ser decisiva.`;
      } else {
        alertaEl.style.background='#2a0a0a';
        alertaEl.style.color='#ef4444';
        alertaIcon.style.color='#ef4444';
        alertaTxt.innerHTML=`<strong>Suspensão iminente.</strong> Você ultrapassou o limite legal. O DETRAN pode notificar a qualquer momento.`;
      }
      const msg = `Olá! Fiz a simulação no site e tenho ${total} pontos na CNH. Gostaria de analisar meu caso.`;
      ctaEl.href = `https://wa.me/${WA_NUM}?text=${encodeURIComponent(msg)}`;
    }

    Object.keys(counts).forEach(k=>{
      const card = document.getElementById('sim-card-'+k);
      if(card) card.classList.toggle('sim-mc--ativo', counts[k]>0);
    });
  }

  async function iniciar(){
    CTB = await carregarCTB();
    const section = document.getElementById('simulador');
    if(!section) return;

    section.querySelectorAll('.sim-mc-btn').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const tipo  = btn.dataset.tipo;
        const delta = parseInt(btn.dataset.delta,10);
        counts[tipo] = Math.max(0, counts[tipo]+delta);
        document.getElementById('sim-v-'+tipo).textContent = counts[tipo];
        calcular();
      });
    });

    calcular();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();

// =============================================
// TAB SWITCHING — Central de Simuladores
// =============================================
(function initTabs() {
  var tabs = document.querySelectorAll('.sim-tab');
  var paineis = document.querySelectorAll('.sim-painel');
  if (!tabs.length || !paineis.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var alvo = tab.getAttribute('aria-controls');

      tabs.forEach(function (t) {
        t.classList.remove('sim-tab--ativo');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('sim-tab--ativo');
      tab.setAttribute('aria-selected', 'true');

      paineis.forEach(function (p) {
        if (p.id === alvo) {
          p.removeAttribute('hidden');
          p.classList.add('sim-painel--ativo');
        } else {
          p.setAttribute('hidden', '');
          p.classList.remove('sim-painel--ativo');
        }
      });

      var secao = document.getElementById('simulador');
      if (secao) secao.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

// =============================================
// ABAS DE DOCUMENTOS NECESSÁRIOS
// =============================================
(function initDocTabs() {
  var tabs = document.querySelectorAll('.doc-tab');
  var paineis = document.querySelectorAll('.doc-painel');
  if (!tabs.length || !paineis.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var alvo = tab.getAttribute('aria-controls');

      tabs.forEach(function (t) {
        t.classList.remove('doc-tab--ativo');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('doc-tab--ativo');
      tab.setAttribute('aria-selected', 'true');

      paineis.forEach(function (p) {
        if (p.id === alvo) {
          p.removeAttribute('hidden');
          p.classList.add('doc-painel--ativo');
        } else {
          p.setAttribute('hidden', '');
          p.classList.remove('doc-painel--ativo');
        }
      });
    });
  });
})();

// =============================================
// SIMULADOR DE CUSTO DE TRANSFERÊNCIA
// =============================================
(function initTransferencia() {
  var btn = document.getElementById('transf-calcular');
  if (!btn) return;

  var WA_NUM = '5521995462016';
  var MULTA_ATRASO_TRANSF = 130.16;
  var PRAZO_DIAS = 30;

  /* Taxas DETRAN-RJ 2025 */
  var TAXA_DETRAN = 154.36;
  var VISTORIA    = 176.21;
  var HONOR_MIN   = 350;
  var HONOR_MAX   = 550;

  function fmt(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function isRJ(v) { return v === 'RJ'; }

  function isForaRJ(v) { return v && v !== 'RJ'; }

  function labelEstado(v) {
    var map = { RJ: 'Rio de Janeiro', SP: 'São Paulo', MG: 'Minas Gerais', ES: 'Espírito Santo', outros: 'Outro estado' };
    return map[v] || v;
  }

  btn.addEventListener('click', async function () {
    CTB = await carregarCTB();
    var valorRaw = parseFloat(document.getElementById('transf-valor').value) || 0;
    var origem   = document.getElementById('transf-origem').value;
    var destino  = document.getElementById('transf-destino').value;
    var ano      = document.getElementById('transf-ano').value;
    var dataCompraRaw = document.getElementById('transf-data-compra').value;

    if (valorRaw <= 0) {
      document.getElementById('transf-valor').focus();
      return;
    }

    var itcmd = valorRaw * CTB.transferencia.itcmd_rj;
    var multaAtraso = 0;
    if (ano === 'antigo') multaAtraso = MULTA_ATRASO_TRANSF;

    var taxaDetran = TAXA_DETRAN + multaAtraso;
    var vistoria = VISTORIA;
    var honorarios = HONOR_MIN;
    var prazo, avisoTxt;
    var avisoEl = document.getElementById('transf-aviso-interestadual');
    var avisoTxtEl = document.getElementById('transf-aviso-interestadual-txt');

    var dentroRJ = isRJ(origem) && isRJ(destino);

    if (dentroRJ) {
      /* Cenário 1: RJ → RJ */
      prazo = '5 a 10 dias úteis';
      avisoTxt = '';
    } else if (isForaRJ(origem) && isRJ(destino)) {
      /* Cenário 2: Outro estado → RJ */
      prazo = '10 a 20 dias úteis';
      avisoTxt = '<strong>Veículo de outro estado</strong> exige vistoria obrigatória e pode precisar de baixa no DETRAN de origem.';
    } else if (isRJ(origem) && isForaRJ(destino)) {
      /* Cenário 3: RJ → Outro estado */
      prazo = '7 a 15 dias úteis';
      avisoTxt = '<strong>A baixa é feita no DETRAN-RJ.</strong> O registro no estado de destino é feito pelo despachante local ou pela parte compradora.';
    } else {
      /* Cenário 4: Qualquer → Qualquer (ambos fora RJ) */
      prazo = '10 a 20 dias úteis';
      avisoTxt = '<strong>Transferência interestadual.</strong> Processo pode envolver baixa no estado de origem e registro no estado de destino.';
    }

    var total = itcmd + taxaDetran + vistoria + honorarios;

    document.getElementById('transf-taxa-detran').textContent = fmt(itcmd) + ' + ' + fmt(taxaDetran);
    document.getElementById('transf-vistoria').textContent = fmt(vistoria);
    document.getElementById('transf-honorarios').textContent = fmt(honorarios) + ' a ' + fmt(HONOR_MAX);
    document.getElementById('transf-total').textContent = fmt(total) + ' a ' + fmt(itcmd + taxaDetran + vistoria + HONOR_MAX);
    document.getElementById('transf-prazo').textContent = prazo;

    if (avisoTxt) {
      avisoEl.style.display = 'flex';
      avisoTxtEl.innerHTML = avisoTxt;
    } else {
      avisoEl.style.display = 'none';
    }

    var res = document.getElementById('transf-resultado');
    res.style.display = 'block';

    /* Monta mensagem WhatsApp com placa/estado */
    var nomeEstado = labelEstado(origem);
    function montarMsgWA(diasLabel) {
      var linhas = [
        'Olá! Fiz a simulação de transferência no site.',
        'Serviço: Transferência de Veículo',
        'Origem: ' + nomeEstado + ' → Destino: ' + labelEstado(destino),
        'Valor do veículo: ' + fmt(valorRaw),
        'Custo total estimado: ' + fmt(total) + ' a ' + fmt(itcmd + taxaDetran + vistoria + HONOR_MAX),
        'Prazo estimado: ' + prazo,
      ];
      if (diasLabel) linhas.push('Dias restantes para transferir: ' + diasLabel);
      linhas.push('Gostaria de um orçamento exato.');
      return linhas.join('\n');
    }

    if (dataCompraRaw) {
        var dataCompra = new Date(dataCompraRaw + 'T00:00:00');
        var hoje = new Date();
        hoje.setHours(0,0,0,0);
        var vencPrazo = new Date(dataCompra);
        vencPrazo.setDate(vencPrazo.getDate() + PRAZO_DIAS);
        var diffMs = vencPrazo - hoje;
        var diasRestantes = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        var diasEl = document.getElementById('transf-dias-prazo');
        var multaEl = document.getElementById('transf-multa-atraso');
        var cronEl  = document.getElementById('transf-cronometro');
        var cronBarra = document.getElementById('transf-cron-barra');
        var cronLabel = document.getElementById('transf-cron-label');
        var cronFim   = document.getElementById('transf-cron-fim');
        var alertaPrazo    = document.getElementById('transf-alerta-prazo');
        var alertaPrazoTxt = document.getElementById('transf-alerta-prazo-txt');
        var alertaPrazoIcon = document.getElementById('transf-alerta-prazo-icon');

        var nomesMes = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        var vencStr = nomesMes[vencPrazo.getMonth()] + ' / ' + vencPrazo.getFullYear();

        diasEl.textContent = diasRestantes > 0 ? diasRestantes + ' dias' : 'VENCIDO';
        diasEl.style.color = diasRestantes > 10 ? '#22c55e' : diasRestantes > 0 ? '#F5A623' : '#ef4444';
        multaEl.textContent = diasRestantes <= 0 ? 'R$ 130,16 + 4 pts na CNH' : '—';
        multaEl.style.color = diasRestantes <= 0 ? '#ef4444' : '#94a3b8';

        cronEl.style.display = 'block';
        cronFim.textContent = vencStr;

        var pct = diasRestantes > 0 ? Math.max(5, Math.min(100, (diasRestantes / PRAZO_DIAS) * 100)) : 0;
        cronBarra.style.width = pct + '%';
        cronBarra.style.background = diasRestantes > 10 ? '#22c55e' : diasRestantes > 0 ? '#F5A623' : '#ef4444';

        if (diasRestantes <= 0) {
            cronLabel.textContent = 'Prazo vencido — transferência em atraso';
            alertaPrazo.style.display = 'flex';
            alertaPrazo.style.background = '#2a0a0a';
            alertaPrazo.style.color = '#ef4444';
            alertaPrazoIcon.style.color = '#ef4444';
            alertaPrazoTxt.innerHTML = '<strong>Prazo encerrado.</strong> Você está sujeito a multa de R$ 130,16 e 4 pontos na CNH. Regularize agora para evitar bloqueio do documento.';
        } else if (diasRestantes <= 5) {
            cronLabel.textContent = 'Urgente — faltam ' + diasRestantes + ' dia(s)';
            alertaPrazo.style.display = 'flex';
            alertaPrazo.style.background = '#2a0a0a';
            alertaPrazo.style.color = '#ef4444';
            alertaPrazoIcon.style.color = '#ef4444';
            alertaPrazoTxt.innerHTML = '<strong>Prazo crítico.</strong> Faltam apenas ' + diasRestantes + ' dia(s). Qualquer atraso gera multa de R$ 130,16 + 4 pontos na CNH.';
        } else if (diasRestantes <= 10) {
            cronLabel.textContent = 'Atenção — faltam ' + diasRestantes + ' dias';
            alertaPrazo.style.display = 'flex';
            alertaPrazo.style.background = '#2a1a00';
            alertaPrazo.style.color = '#F5A623';
            alertaPrazoIcon.style.color = '#F5A623';
            alertaPrazoTxt.innerHTML = '<strong>Prazo curto.</strong> Faltam ' + diasRestantes + ' dias para o vencimento. Inicie o processo agora para evitar multa.';
        } else {
            cronLabel.textContent = 'Faltam ' + diasRestantes + ' dias para o prazo';
            alertaPrazo.style.display = 'none';
        }

        document.getElementById('transf-cta').href = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(montarMsgWA(diasRestantes > 0 ? diasRestantes : 'VENCIDO'));
    } else {
        document.getElementById('transf-cronometro').style.display = 'none';
        document.getElementById('transf-alerta-prazo').style.display = 'none';
        document.getElementById('transf-dias-prazo').textContent = '—';
        document.getElementById('transf-multa-atraso').textContent = '—';
        document.getElementById('transf-cta').href = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(montarMsgWA(null));
    }
  });
})();

// =============================================
// SIMULADOR DE RECURSO DE MULTA
// =============================================
(function initRecurso() {
  var btn = document.getElementById('recurso-calcular');
  if (!btn) return;

  var WA_NUM = '5521995462016';
  var PRAZO_JARI = 30;

  function fmt(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function fmtDate(d) {
    var nomesMes = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return d.getDate() + ' de ' + nomesMes[d.getMonth()] + ' de ' + d.getFullYear();
  }

  btn.addEventListener('click', function () {
    var dataNotif = document.getElementById('recurso-data-notif').value;
    var valorInput = document.getElementById('recurso-valor').value;
    var status = document.getElementById('recurso-status').value;

    if (!dataNotif) {
      document.getElementById('recurso-data-notif').focus();
      return;
    }
    if (!valorInput || parseFloat(valorInput) <= 0) {
      document.getElementById('recurso-valor').focus();
      return;
    }

    var valorMulta = parseFloat(valorInput);
    var data = new Date(dataNotif + 'T00:00:00');
    var hoje = new Date();
    var diffMs = hoje - data;
    var diasDesdeNotif = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    var diasRestantes = Math.max(0, PRAZO_JARI - diasDesdeNotif);
    var dataPrazoFim = new Date(data);
    dataPrazoFim.setDate(dataPrazoFim.getDate() + PRAZO_JARI);

    var descontoDisponivel = 0;
    var economia = valorMulta;
    var instancia = '';

    if (status === 'nao_paga') {
      descontoDisponivel = valorMulta * 0.2;
      economia = valorMulta;
      instancia = 'JARI — 1ª Instância';
    } else if (status === 'paga_sem_desconto') {
      economia = valorMulta;
      instancia = 'JARI — 1ª Instância';
    } else {
      economia = valorMulta * 0.8;
      instancia = 'JARI — 1ª Instância';
    }

    if (diasRestantes <= 0) {
      instancia = 'JARI — 1ª Instância (verificar prazo com órgão)';
    }

    var pctBarra = Math.min(100, Math.max(0, (diasRestantes / PRAZO_JARI) * 100));
    var barraColor = '#22c55e';
    if (pctBarra < 50) barraColor = '#f59e0b';
    if (pctBarra < 20) barraColor = '#ef4444';

    document.getElementById('recurso-dias').textContent = diasRestantes;
    document.getElementById('recurso-prazo-fim').textContent = fmtDate(dataPrazoFim);
    document.getElementById('recurso-valor-display').textContent = fmt(valorMulta);
    document.getElementById('recurso-economia').textContent = fmt(economia);
    document.getElementById('recurso-desconto').textContent = fmt(descontoDisponivel);
    document.getElementById('recurso-instancia').textContent = instancia;
    document.getElementById('recurso-cron-label').textContent =
      diasRestantes > 0
        ? 'Prazo restante para recurso na JARI (' + diasRestantes + ' dias)'
        : 'Prazo expirado — verificar com órgão';
    document.getElementById('recurso-cron-barra').style.width = pctBarra + '%';
    document.getElementById('recurso-cron-barra').style.background = barraColor;
    document.getElementById('recurso-cron-fim').textContent = fmtDate(dataPrazoFim);

    var badge = document.getElementById('recurso-badge');
    var alerta = document.getElementById('recurso-alerta');
    var alertaTxt = document.getElementById('recurso-alerta-txt');
    var alertaIcon = document.getElementById('recurso-alerta-icon');

    if (diasRestantes <= 0) {
      badge.textContent = 'Expirado';
      badge.style.background = '#2a0a0a';
      badge.style.color = '#ef4444';
      alerta.style.display = 'flex';
      alerta.style.background = '#2a0a0a';
      alerta.style.color = '#ef4444';
      alertaIcon.style.stroke = '#ef4444';
      alertaTxt.innerHTML =
        '<strong>Prazo expirado.</strong> O prazo de 30 dias para recurso na JARI (' +
        fmtDate(dataPrazoFim) + ') já encerrou. Entre em contato com um despachante para avaliar as opções.';
    } else if (diasRestantes <= 10) {
      badge.textContent = 'Urgente';
      badge.style.background = '#2a1a0a';
      badge.style.color = '#f59e0b';
      alerta.style.display = 'flex';
      alerta.style.background = '#2a1a0a';
      alerta.style.color = '#f59e0b';
      alertaIcon.style.stroke = '#f59e0b';
      alertaTxt.innerHTML =
        '<strong>Prazo próximo.</strong> Restam apenas ' + diasRestantes +
        ' dias para apresentar o recurso na JARI. Não perca o prazo!';
    } else {
      badge.textContent = 'Dentro do prazo';
      badge.style.background = '#0f2a1a';
      badge.style.color = '#22c55e';
      alerta.style.display = 'none';
    }

    document.getElementById('recurso-resultado').style.display = 'block';

    var msg = 'Olá! Preciso de ajuda com um recurso de multa.\n' +
      'Data da notificação: ' + fmtDate(data) + '\n' +
      'Valor da multa: ' + fmt(valorMulta) + '\n' +
      'Dias restantes: ' + diasRestantes + '\n' +
      'Gostaria de uma análise do meu caso.';
    document.getElementById('recurso-cta').href = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg);
  });
})();

// =============================================
// SIMULADOR DE VENCIMENTO DO LICENCIAMENTO
// =============================================
(function initLicenciamento() {
  var btn = document.getElementById('licenc-calcular');
  if (!btn) return;

  var WA_NUM = '5521995462016';

  function fmt(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function diasNoMes(ano, mes) {
    return new Date(ano, mes, 0).getDate();
  }

  btn.addEventListener('click', async function () {
    CTB = await carregarCTB();
    var mes = parseInt(document.getElementById('licenc-mes').value, 10);
    var valorVenal = parseFloat(document.getElementById('licenc-valor').value) || 0;

    if (!mes) {
      document.getElementById('licenc-mes').focus();
      return;
    }

    var hoje = new Date();
    var anoAtual = hoje.getFullYear();
    var vencimento = new Date(anoAtual, mes - 1, diasNoMes(anoAtual, mes));

    if (vencimento < hoje) {
      vencimento = new Date(anoAtual + 1, mes - 1, diasNoMes(anoAtual + 1, mes));
    }

    var diffMs = vencimento - hoje;
    var dias = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    var mesesRestantes = Math.max(0, (vencimento.getFullYear() - hoje.getFullYear()) * 12 + (vencimento.getMonth() - hoje.getMonth()));

    var nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    var vencimentoStr = nomesMes[vencimento.getMonth()] + ' / ' + vencimento.getFullYear();

    var multa = 0;
    var ipvaAtraso = 0;
    if (dias <= 0) {
      multa = CTB.licenciamento.multa_atraso;
      if (valorVenal > 0) ipvaAtraso = valorVenal * CTB.licenciamento.ipva_taxa;
    }

    var totalAtraso = CTB.licenciamento.taxa_detran + multa + ipvaAtraso;

    document.getElementById('licenc-dias').textContent = dias > 0 ? dias + ' dias' : 'VENCIDO';
    document.getElementById('licenc-dias').style.color = dias > 30 ? '#22c55e' : dias > 0 ? '#F5A623' : '#ef4444';
    document.getElementById('licenc-vencimento').textContent = vencimentoStr;
    document.getElementById('licenc-taxa').textContent = fmt(CTB.licenciamento.taxa_detran);
    document.getElementById('licenc-multa').textContent = multa > 0 ? fmt(multa) + ' + juros' : '—';
    document.getElementById('licenc-ipva').textContent = ipvaAtraso > 0 ? fmt(ipvaAtraso) : '—';
    document.getElementById('licenc-total-atraso').textContent = fmt(totalAtraso);

    var badge = document.getElementById('licenc-badge');
    if (dias <= 0) {
      badge.textContent = 'Vencido';
      badge.style.background = '#3a0000';
      badge.style.color = '#ff6b6b';
    } else if (dias <= 30) {
      badge.textContent = 'Urgente';
      badge.style.background = '#2a0a0a';
      badge.style.color = '#ef4444';
    } else if (dias <= 90) {
      badge.textContent = 'Atenção';
      badge.style.background = '#2a1a00';
      badge.style.color = '#F5A623';
    } else {
      badge.textContent = 'Em dia';
      badge.style.background = '#0f2a1a';
      badge.style.color = '#22c55e';
    }

    var barraPct = dias > 0 ? Math.max(5, Math.min(100, (dias / 365) * 100)) : 0;
    var barra = document.getElementById('licenc-cron-barra');
    barra.style.width = barraPct + '%';
    barra.style.background = dias > 90 ? '#22c55e' : dias > 30 ? '#F5A623' : '#ef4444';
    document.getElementById('licenc-cron-fim').textContent = vencimentoStr;

    var labelDias = document.getElementById('licenc-cron-label');
    if (dias <= 0) {
      labelDias.textContent = 'Licenciamento vencido — regularize agora';
    } else if (dias === 1) {
      labelDias.textContent = 'Falta 1 dia para o vencimento';
    } else {
      labelDias.textContent = 'Faltam ' + dias + ' dias para o vencimento';
    }

    var alertaEl = document.getElementById('licenc-alerta');
    var alertaTxt = document.getElementById('licenc-alerta-txt');
    if (dias <= 0) {
      alertaEl.style.display = 'flex';
      alertaEl.style.background = '#2a0a0a';
      alertaEl.style.color = '#ef4444';
      alertaTxt.innerHTML = '<strong>Licenciamento vencido.</strong> Multa de ' + fmt(CTB.licenciamento.multa_atraso) + ' + juros e IPVA proporcional. O veículo pode ser recolhido a qualquer momento.';
    } else if (dias <= 30) {
      alertaEl.style.display = 'flex';
      alertaEl.style.background = '#2a1a00';
      alertaEl.style.color = '#F5A623';
      alertaTxt.innerHTML = '<strong>Prazo curto.</strong> Faltam apenas ' + dias + ' dias. Resolva agora para evitar multa e bloqueio do CRLV.';
    } else {
      alertaEl.style.display = 'none';
    }

    document.getElementById('licenc-resultado').style.display = 'block';

    var msg = 'Olá! Fiz a simulação de licenciamento no site.\nVencimento: ' + vencimentoStr + '\nDias restantes: ' + dias + '\nGostaria de regularizar.';
    document.getElementById('licenc-cta').href = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg);
  });
})();

(function() {
  var RESUME_MS = 10000;
  var timers = {};
  var colunas = document.querySelectorAll('.depoimentos-coluna-inner');
  if (!colunas.length) return;

  colunas.forEach(function(inner, i) {
    inner.addEventListener('click', function() {
      if (timers[i]) clearTimeout(timers[i]);
      inner.classList.add('paused');
      timers[i] = setTimeout(function() {
        inner.classList.remove('paused');
        delete timers[i];
      }, RESUME_MS);
    });
  });
})();
