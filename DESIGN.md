# DESIGN.md — Carlos Mendes Despachante

Sistema visual codificado. Este documento é a **fonte de verdade** para decisões
de design na landing page. Antes de mudar CSS, leia (e atualize) este arquivo.

**Stack visual:** vanilla HTML + CSS + JS, sem frameworks, sem libs de UI.
**Tokens:** todos definidos em `:root` em `assets/css/style.css` (64 tokens).
**Público:** proprietários de veículos em todo o Brasil (30-65 anos).

---

## 1. Princípios

| # | Princípio | O que significa na prática |
|---|-----------|----------------------------|
| 1 | **Clareza acima de tudo** | Uma ideia por seção. Hierarquia tipográfica > decoração. |
| 2 | **Confiança silenciosa** | Azul escuro + âmbar como acento. Sem vermelhos, sem roxos, sem gradientes gritantes. |
| 3 | **Respirar é profissional** | 64-96px entre seções no desktop. Cards com 24-32px de padding interno. |
| 4 | **CTA sempre óbvio** | Verde WhatsApp ou laranja âmbar. Nunca mais de 1 CTA primário por viewport. |
| 5 | **Performance é estética** | Sem libs, sem webfonts desnecessárias, sem imagens decorativas pesadas. |
| 6 | **Mobile-first no detalhe** | Touch targets ≥ 44px, texto ≥ 16px, contraste AA mínimo. |

---

## 2. Paleta de cores

### 2.1 Tokens atuais (em uso)

| Token | Hex | Uso |
|-------|-----|-----|
| `--cor-primaria` | `#1B3A6B` | Azul institucional — hero, footer, seções dark |
| `--cor-secundaria` | `#2563EB` | Azul vivo — links, hover em elementos claros |
| `--cor-destaque` | `#F59E0B` | Âmbar — palavra-chave ("resolvida"), CTAs secundários |
| `--cor-fundo` | `#F8F9FC` | Quase-branco — fundo geral do body |
| `--cor-fundo-alt` | `#EEF2F8` | Azul bem claro — seções claras alternadas |
| `--cor-superficie` | `#FFFFFF` | Cards, modais, acordeão |
| `--cor-texto` | `#111827` | Texto principal (corpo em seções claras) |
| `--cor-texto-suave` | `#6B7280` | Legendas, metadados |
| `--cor-borda` | `#E5E7EB` | Divisórias, bordas de input |
| `--cor-sucesso` | `#16A34A` | Confirmações (foco no WhatsApp) |
| `--cor-erro` | `#DC2626` | Validação de formulário |

### 2.2 Tokens a adicionar (gaps identificados)

| Token | Valor proposto | Uso |
|-------|----------------|-----|
| `--texto-em-dark` | `#F8F9FC` | Texto em seções dark (replica `--cor-fundo` para consistência) |
| `--texto-em-dark-suave` | `rgba(248,249,252,.72)` | Legendas em seções dark |
| `--superficie-tint-primaria` | `rgba(27,58,107,.06)` | Card ou hover state sobre fundo `--cor-primaria` |
| `--superficie-tint-destaque` | `rgba(245,158,11,.12)` | Card ou hover state com tom âmbar |
| `--destaque-hover` | `#D97706` | Estado hover do âmbar (escurece 10%) |
| `--destaque-soft` | `#FDE68A` | Background suave para badges âmbar |
| `--sucesso-hover` | `#15803D` | Estado hover do verde WhatsApp |
| `--borda-em-dark` | `rgba(255,255,255,.12)` | Divisórias em seções dark |
| `--borda-foco` | `#2563EB` | Outline de focus visível (a11y) |
| `--overlay-modal` | `rgba(15,23,42,.6)` | Backdrop de modal (se vier a existir) |

### 2.3 Regra de ouro

- **Seções dark** (fundo `--cor-primaria`): usar `--texto-em-dark` e `--texto-em-dark-suave`. Nunca usar `--cor-texto` (preto) sobre azul.
- **Seções claras** (fundo `--cor-fundo` ou `--cor-fundo-alt`): usar `--cor-texto`. Nunca usar `--texto-em-dark` em claro.
- **CTA primário** = sempre WhatsApp verde (`--cor-sucesso`).
- **CTA secundário** = outline âmbar (`--cor-destaque`) ou botão-fantasma branco.
- **Nunca** usar hex cru fora de `:root`. Se aparecer hex em algum seletor, é bug.

---

## 3. Tipografia

### 3.1 Font pairing (mantido)

| Função | Fonte | Por quê |
|--------|-------|---------|
| Display (títulos) | **Sora** | Geométrica com humanismo sutil; transmite modernidade + seriedade |
| Corpo (parágrafos, UI) | **DM Sans** | Excelente legibilidade em corpo; usada por Linear, Figma |

**Não trocar para Inter/Plus Jakarta** — Sora + DM Sans já é um pairing forte e está carregado.

### 3.2 Escala (1.25 — major third, mantida)

| Token | px | Uso |
|-------|----|----|
| `--texto-xs` | 12 | Badges, micro-meta (ex.: "PROCESSO SIMPLES") |
| `--texto-sm` | 14 | Legendas, labels, testemunho cargo |
| `--texto-base` | 16 | Corpo, inputs, botões |
| `--texto-lg` | 18 | Sub-títulos, hero subtítulo (mobile) |
| `--texto-xl` | 20 | Sub-títulos (desktop) |
| `--texto-2xl` | 24 | Títulos de card (ex.: nome do serviço) |
| `--texto-3xl` | 30 | Section title (mobile) |
| `--texto-4xl` | 36 | Section title (tablet) / hero h1 (mobile) |
| `--texto-5xl` | 48 | Hero h1 (desktop) |

### 3.3 Pesos

- `--peso-normal` (400): corpo, parágrafos
- `--peso-medio` (500): labels, botões, nav
- `--peso-semibold` (600): sub-títulos, autor de testemunho
- `--peso-bold` (700): títulos de card, testemunho quote
- `--peso-extrabold` (800): h1 do hero, h2 de seção, números decorativos (01, 02...)

### 3.4 Line-heights

- `--linha-apertada` (1.2): títulos, h1, números decorativos
- `--linha-normal` (1.5): corpo de parágrafo, botões, labels
- `--linha-folgada` (1.75): sub-descrições longas, FAQ respostas

### 3.5 Regra de ouro

- **Máximo 2 pesos por seção** (ex.: bold no h2 + normal no parágrafo). Misturar 3+ pesos polui.
- **Italic só em destaque de ênfase** dentro de títulos (ex.: "quem *já resolveu*"). Usar `<em>`.
- **Tracking aberto** (letter-spacing 0.08em ou mais) **só** em uppercase pequeno (eyebrow/badge).

---

## 4. Espaçamento

### 4.1 Escala (mantida, 4-96px)

| Token | px | Uso típico |
|-------|----|-----------|
| `--espaco-1` | 4 | Quase nada (gap em ícone + label) |
| `--espaco-2` | 8 | Gap em linha de meta (ex.: "200+ avaliações · 10 anos") |
| `--espaco-3` | 12 | Padding interno de badge |
| `--espaco-4` | 16 | Gap entre label e input, padding de botão pequeno |
| `--espaco-5` | 20 | Gap entre ícone e título de card |
| `--espaco-6` | 24 | Padding interno de card (mobile), gap entre CTAs |
| `--espaco-8` | 32 | Padding interno de card (desktop) |
| `--espaco-10` | 40 | Margin entre sub-grupos |
| `--espaco-12` | 48 | Gap entre título de seção e conteúdo |
| `--espaco-16` | 64 | Padding vertical de sub-bloco |
| `--espaco-20` | 80 | Padding vertical de seção (mobile) |
| `--espaco-24` | 96 | Padding vertical de seção (desktop) |

### 4.2 Padding de seção

- `--padding-secao` = `var(--espaco-20)` (80px mobile) / `var(--espaco-24)` (96px desktop)
- **Nunca** padding de seção menor que 64px no desktop — deixa a página "apertada".

### 4.3 Container

- `--container-max`: 1200px (mantido). Considerar 1280px se a hero ou serviços pedirem mais ar.
- `--container-texto`: 720px — largura máxima de parágrafos para legibilidade (65-75 chars/linha).

---

## 5. Raios, sombras, elevação

### 5.1 Raios (mantido)

| Token | px | Uso |
|-------|----|----|
| `--raio-sm` | 6 | Botões pequenos, badges |
| `--raio-md` | 8 | Inputs, botões médios |
| `--raio-lg` | 12 | Cards de serviço, depoimentos |
| `--raio-xl` | 16 | Cards grandes, modal |
| `--raio-full` | 9999 | Pílulas (WhatsApp CTA, "Falar agora") |

**Regra:** cards = `--raio-lg` ou `--raio-xl`. Botões = `--raio-md` ou `--raio-full` (escolher UM por tipo de botão e manter).

### 5.2 Sombras (mantido)

| Token | Uso |
|-------|-----|
| `--sombra-sm` | Hover sutil em links, leve elevação |
| `--sombra-md` | Cards em repouso (seções claras) |
| `--sombra-lg` | Cards em hover, botão primário em hover |
| `--sombra-xl` | Modal, dropdown |

**Regra:** seções dark **não usam** sombra — o contraste do fundo já cria separação. Usar borda sutil (`--borda-em-dark`) ou tom da superfície.

### 5.3 Hierarquia de elevação (do mais baixo ao mais alto)

1. Texto sobre fundo
2. Superfície (card em repouso)
3. Card com sombra-md
4. Card com sombra-lg (hover)
5. Header sticky
6. Modal / overlay

---

## 6. Motion

### 6.1 Durações e easings (mantido)

| Token | Valor | Uso |
|-------|-------|-----|
| `--transicao-rapida` | 150ms ease | Hover de botão, mudança de cor |
| `--transicao-normal` | 250ms ease | Hover de card, transição de link |
| `--transicao-lenta` | 400ms ease | Reveal on scroll, troca de seção |

### 6.2 Padrões

- **Reveal on scroll** (`.reveal` + `.visivel`): fade + translateY(16px → 0) em 400ms, sem delay entre elementos do mesmo grupo (a não ser que seja carrossel).
- **Hover de card**: `transform: translateY(-4px)` + `--sombra-lg` em 250ms.
- **Hover de botão primário**: brilho sutil (filter brightness 1.05) em 150ms — **sem** transform.
- **Acento de hover em link**: sublinhado anima de `width: 0` para `width: 100%` da esquerda para a direita em 250ms.
- **Header sticky**: ao rolar > 60px, ganha `box-shadow: var(--sombra-md)` em 250ms.

### 6.3 O que evitar

- Transições > 600ms (parece travado).
- `transform: scale()` em hover de texto (causa repintura).
- Animação infinita no fundo (distrai).
- `cubic-bezier` custom — `ease` resolve 95% dos casos.

---

## 7. Breakpoints

| Nome | px | Colunas típicas |
|------|----|----|
| (mobile) | 0-639 | 1 coluna, padding 24px |
| `sm` | 640 | 2 colunas em grids pequenos |
| `md` | 768 | Container começa a limitar, hero text cresce |
| `lg` | 1024 | Header horizontal, 2 colunas em diferenciais/contato |
| `xl` | 1280 | 3 colunas em serviços, max-width do container |
| (wide) | 1440+ | Mesmo que xl, mais respiro lateral |

**Padrão do projeto:** mobile-first, com `@media (min-width: …)` e os tokens `--espaco-*` crescendo em cada nível.

---

## 8. Componentes

### 8.1 Botão primário (WhatsApp / CTA)

- Background: `--cor-sucesso`
- Texto: branco, `--texto-base`, `--peso-semibold`
- Padding: `--espaco-3` vertical × `--espaco-6` horizontal
- Radius: `--raio-full` (pílula)
- Hover: background `--sucesso-hover`, brilho sutil
- Ícone opcional à esquerda (WhatsApp logo SVG inline, 18×18)

### 8.2 Botão secundário (outline)

- Background: transparente
- Borda: 1.5px solid `currentColor` (ou cor herdada)
- Texto: cor da seção
- Hover: background `currentColor` com opacidade 8% (usar `--superficie-tint-*`)

### 8.3 Botão ghost (link disfarçado)

- Sem background, sem borda
- Texto com sublinhado animado no hover (ver §6.2)

### 8.4 Card de serviço

- Background: `--superficie-tint-primaria` em seção dark / `--cor-superficie` em seção clara
- Padding: `--espaco-6` (mobile) / `--espaco-8` (desktop)
- Radius: `--raio-lg`
- Hover: `translateY(-4px)` + `--sombra-lg`
- Estrutura interna: ícone (40×40, âmbar) + título (`--texto-xl`, bold) + descrição (`--texto-sm`, suave) + lista de sub-itens (`--texto-xs`)

### 8.5 Card de depoimento

- Background: `--cor-superficie`
- Padding: `--espaco-8`
- Radius: `--raio-lg`
- Borda: 1px solid `--cor-borda` (sutil)
- Estrutura interna: 5 estrelas âmbar (SVG ou unicode ★) + quote (`--texto-base`, regular, aspas decorativas) + divisor + autor (avatar circular 40×40 + nome bold + cargo/meta)

### 8.6 Item de FAQ (acordeão)

- Wrapper: border-bottom 1px solid `--borda-em-dark` (em seção dark)
- Pergunta: botão com `--texto-lg`, `--peso-semibold`, padding `--espaco-5` × 0
- Ícone `+` à direita, vira `×` (rotaciona 45deg) quando aberto em 250ms
- Resposta: aparece com `max-height` animado + fade

### 8.7 Badge / Eyebrow (eyebrow text sobre título)

- Texto: `--texto-xs`, `--peso-semibold`, uppercase, letter-spacing 0.1em
- Cor: `--cor-destaque` (em seção clara) ou `--destaque-soft` (em seção dark)
- Margin-bottom: `--espaco-3`
- **Sempre** em uppercase — não usar como parágrafo.

### 8.8 Header sticky

- Posição: `fixed`, top 0, z-index `var(--z-fixo)`
- Estado padrão: transparente sobre hero dark
- Estado scrolled (> 60px): background `--cor-primaria` + `--sombra-md` + blur sutil no backdrop
- Altura: 72px (desktop) / 64px (mobile)
- Logo à esquerda, nav ao centro, CTA WhatsApp à direita

### 8.9 Footer

- Background: `--cor-primaria` (mesmo tom do hero)
- Padding vertical: `--espaco-16` (64px) — menos que seções normais
- 4 colunas em desktop, stack em mobile
- Coluna 1: logo + tagline
- Coluna 2: horário
- Coluna 3: contato
- Coluna 4: CTA WhatsApp + copyright + linha legal
- Divisor `1px solid --borda-em-dark` antes do copyright

---

## 9. Seções — design específico

### 9.1 Hero

- Background: `--cor-primaria` sólido (considerar gradiente radial sutil de `--cor-primaria` para tom mais escuro no canto)
- Padding top: 96px (compensa header fixo) + 64px
- Padding bottom: 96px
- Conteúdo: badge "Despachante de Trânsito · Todo o Brasil" + h1 (max 60 chars) + subtítulo (max 200 chars) + separador âmbar + 2 CTAs (primário WhatsApp + secundário "Ver serviços") + linha de métricas (3 itens, separador `·`)
- **Sem imagem decorativa grande** (assets/img está vazio); tipografia + métrica fazem o trabalho
- Hierarquia: h1 em `--peso-extrabold`, "resolvida" em itálico âmbar
- Mobile: tudo 1 coluna, h1 não passa de `--texto-4xl`

### 9.2 Serviços (NOSSOS SERVIÇOS)

- Background: `--cor-primaria` (mesmo do hero, cria ritmo)
- 6 cards em 3 colunas (desktop) / 2 (tablet) / 1 (mobile)
- Cada card: ícone âmbar + número "01-06" pequeno + título + descrição + lista de 3-4 sub-itens
- Botão "Ver todos os serviços" centralizado abaixo, outline âmbar, com seta →
- **Não** repetir a paleta do hero — usar `--superficie-tint-primaria` para cards (sutil elevação)

### 9.3 Como funciona (PROCESSO SIMPLES)

- Background: `--cor-primaria` (continua dark)
- Título centralizado: eyebrow + h2 ("Do contato à *entrega do documento*") + subtítulo
- Timeline horizontal com 3 passos + linha conectora âmbar
- Cada passo: ícone circular (64×64, fundo âmbar com 12% opacidade) + número pequeno no canto + título + descrição curta
- Mobile: stack vertical com linha conectora vertical à esquerda
- **Destaque visual:** a linha conectora anima de 0% para 100% de largura quando a seção entra em viewport (`#processo-linha-fill`)

### 9.4 Diferenciais (POR QUE NOS ESCOLHER)

- Background: `--cor-fundo` (claro, contraste com seções dark acima)
- Layout 2 colunas em desktop:
  - Esquerda: aside com eyebrow + h2 + parágrafo + botão WhatsApp
  - Direita: lista numerada 01-04 com números grandes decorativos (em cinza claro, `--texto-5xl`, `--peso-extrabold`)
- Mobile: aside em cima, lista embaixo
- **Diferencial visual:** os números 01-04 são enormes e em cor suave (cinza claro), viram elemento gráfico

### 9.5 Depoimentos (DEPOIMENTOS)

- Background: `--cor-fundo-alt` (azul bem claro, transição suave para o dark da próxima)
- 3 cards de testemunho em grid
- Cada card: 5 estrelas âmbar + aspas decorativas grandes (em âmbar soft) + quote + divisor + autor
- **Variação sutil:** card do meio pode ter fundo `--cor-superficie` e os das pontas `--superficie-tint-primaria` (cria ritmo visual)

### 9.6 Contato + FAQ (FALE COM A GENTE)

- Background: `--cor-primaria` (dark, fecha o ciclo)
- Layout 2 colunas em desktop:
  - Esquerda: 5 perguntas em acordeão
  - Direita: 3 cards de contato (WhatsApp, E-mail, Horário) + botão "Falar agora no WhatsApp" grande + microcopy de segurança
- CTA WhatsApp repetido no fim (sticky opcional em mobile)
- **Atenção:** esta é a última seção antes do footer — deve fechar com chave de ouro, não ser um "mais do mesmo"

### 9.7 Footer

- Background: `--cor-primaria` (mesmo do hero/header)
- Separado do contato por divisor âmbar fino (1px solid `--cor-destaque`) — único separador colorido do site
- 4 colunas em desktop (logo, horário, contato, CTA)
- Bottom bar: copyright + linha legal (text-xs, texto-em-dark-suave)

---

## 10. Acessibilidade

- Contraste mínimo **AA** em todos os pares texto/fundo (verificar especialmente `--texto-em-dark-suave` sobre `--cor-primaria` — deve passar 4.5:1)
- Foco visível em todos os interativos (outline 2px solid `--borda-foco`, offset 2px)
- `prefers-reduced-motion`: desabilita reveal-on-scroll e anima o `max-height` do FAQ instantaneamente
- Botões com `aria-label` quando só têm ícone
- FAQ usa `<button>` + `aria-expanded` + `aria-controls`
- Imagens decorativas com `alt=""`; conteúdo com `alt` descritivo

---

## 11. O que NÃO fazer

- ❌ Não adicionar libs (Tailwind, Bootstrap, shadcn). É vanilla.
- ❌ Não usar hex/rgb cru fora de `:root`. Se precisar de uma cor nova, adicione um token.
- ❌ Não criar nova escala tipográfica. Se o tamanho não existe, use o mais próximo.
- ❌ Não usar mais de 1 fonte. Sora + DM Sans.
- ❌ Não usar vermelho para erro/alerta em destaque — usar `--cor-erro` com moderação.
- ❌ Não colocar emoji em UI de produção.
- ❌ Não criar sombra custom — usar uma das 4 existentes.
- ❌ Não usar `position: absolute` para layout principal (só para elementos decorativos).
- ❌ Não escrever hex/rgba inline dentro de `data:image/svg+xml`. Para tornar uma imagem decorativa token-driven, mova para `assets/svg/*.svg` e use `background-image: url(...)` apontando para o arquivo. Exceção atual: o grid pattern de hero/serviços (`stroke='rgba(255,255,255,0.04)'` no URL) — substituir só se redecorar essas seções.

---

## 12. Como aplicar este doc

1. **Antes de mudar CSS:** leia a seção relevante aqui. Se a mudança conflita com o doc, atualize o doc junto.
2. **Antes de adicionar componente novo:** verifique §8. Se não encaixa, proponha um padrão aqui primeiro.
3. **Antes de mudar paleta:** adicione o token em §2 e em `:root` no CSS.
4. **Antes de mudar tipografia:** atualize §3 e os tokens `--texto-*` no CSS.
5. **Em cada seção nova:** copie o padrão de §9 mais próximo e adapte.

**Manutenção:** este doc e `style.css` devem estar sempre em sincronia. Se um ficar para trás, a fonte de verdade volta a ser o CSS até o doc ser atualizado.
