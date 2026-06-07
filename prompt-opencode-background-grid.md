# Prompt para OpenCode — Background Grid Blueprint Animado

```
Você precisa implementar um background grid blueprint animado para o site inteiro (não apenas hero).

CONTEXTO
O site usa HTML + CSS + JS vanilla.
O fundo deve ser um grid técnico estilo blueprint com animação suave.
Referência visual: grid azul escuro (#1B3A6B) + linhas brancas em movimento diagonal sutil.

REQUISITOS

1. FUNDO GLOBAL
Aplicar o grid blueprint em todo o <body> ou criar um pseudo-elemento ::before no body.

2. GRID VISUAL
• Cor base: #1B3A6B (azul escuro primário do site)
• Linhas finas: brancas ou azul claro com opacity baixa
• Grid padrão: espaçamento de 40-50px
• Linhas principais (a cada 4-5 grids): ligeiramente mais visíveis
• Linhas secundárias: muito sutis (opacity 0.08-0.12)

3. ANIMAÇÃO
• Movimento diagonal suave (direção: canto superior-esquerdo para canto inferior-direito)
• Velocidade: lenta, mas perceptível (~15-20 segundos para completar uma volta)
• Efeito: parecido com scroll suave, não piscante
• Usar CSS @keyframes ou background-position animation

4. IMPLEMENTAÇÃO
Opção A: CSS puro (recomendado)
- Usar background-image com SVG data URI para o padrão do grid
- Animar com background-position
- Aplicar ao body ou criar div.background-grid posicionado fixed

Opção B: Canvas (se necessário para qualidade premium)
- Usar canvas com requestAnimationFrame
- Desenhar grid proceduralmente
- Aplicar ao body como background

5. CSS VARIÁVEIS
Manter consistência com as variáveis do projeto:
--cor-primaria: #1B3A6B
--cor-destaque: #F59E0B
(Usar estas, não hardcode)

6. RESPONSIVIDADE
O grid deve ser invisível em mobile (<768px) ou ter opacidade reduzida (opacity 0.03-0.05).
Em desktop: opacity 0.10-0.15 para as linhas secundárias.

7. Z-INDEX
O grid deve estar ABAIXO de todo o conteúdo.
Position: fixed, inset: 0, z-index: -1 (ou similar).
Garantir que não atrapalhe interação com elementos.

8. PERFORMANCE
• Usar GPU acceleration (transform: translate3d ou will-change)
• Evitar repaints desnecessários
• Testar em mobile e desktop
• Se usar canvas, implementar requestAnimationFrame com eficiência

EXEMPLO DE VISUAL
Grid estilo blueprint:
- Linhas finas diagonais em movimento suave
- Muito espaço negativo (grid não competir com conteúdo)
- Sensação de "profundidade técnica"
- Minimalista, elegante, corporativo

ARQUIVO A EDITAR
Modificar: assets/css/style.css (ou criar assets/css/background.css se preferir)
Se usar canvas: adicionar em assets/js/main.js

TESTE FINAL
Validar em:
- Diferentes navegadores (Chrome, Firefox, Safari, Edge)
- Mobile e desktop
- Scroll da página (grid continua animando)
- Sem bug de performance ou flicker

ENTREGA
Enviar apenas o CSS + JS necessário para implementar este background.
Não tocar em outras seções do site.
```

---

Se preferir uma implementação com shader (tipo a imagem enviada), mande um prompt diferente e direi.
