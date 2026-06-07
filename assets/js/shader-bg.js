(function () {
  'use strict';

  /* =============================================
     Fragment Shader — Blueprint Grid WebGL2
  ============================================== */
  const SHADER_SRC = `#version 300 es
  precision highp float;

  out vec4 fragColor;
  in vec2 v_uv;

  uniform vec3  iResolution;
  uniform float iTime;
  uniform int   iFrame;
  uniform vec4  iMouse;

  const float GRID_SCALE   = 18.0;
  const float MAJOR_STEP   = 4.0;
  const float THIN_WIDTH   = 0.010;
  const float MAJOR_WIDTH  = 0.018;
  const float SCROLL_SPEED = 0.02;

  const float VIGNETTE_AMT = 0.28;
  const float MESH_AMT     = 0.85;
  const float NOISE_AMT    = 0.030;
  const float DITHER_DARK  = 0.010;
  const float DITHER_LIGHT = 0.004;

  const float ASCII_AMT    = 0.23;
  const float ASCII_SCALE  = 26.0;
  const float ASCII_EVERY  = 2.0;

  mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

  float bayer4(vec2 p){
    ivec2 ip = ivec2(int(mod(p.x,4.0)), int(mod(p.y,4.0)));
    int idx = ip.y*4 + ip.x;
    int m[16]; m[0]=0;m[1]=8;m[2]=2;m[3]=10;m[4]=12;m[5]=4;m[6]=14;m[7]=6;
    m[8]=3;m[9]=11;m[10]=1;m[11]=9;m[12]=15;m[13]=7;m[14]=13;m[15]=5;
    return float(m[idx]) / 15.0;
  }

  float hash21(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
  float vnoise(vec2 p){
    vec2 i=floor(p), f=fract(p);
    float a=hash21(i), b=hash21(i+vec2(1,0)), c=hash21(i+vec2(0,1)), d=hash21(i+vec2(1,1));
    vec2 u=f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  float gridLineAA(vec2 uv, float scale, float width){
    vec2 g = abs(fract(uv*scale) - 0.5);
    float d = min(g.x, g.y);
    float aa = fwidth(d);
    return 1.0 - smoothstep(width, width + aa, d);
  }
  float majorGridAA(vec2 uv, float scale, float stepN, float width){
    float sMajor = max(1.0, scale/stepN);
    return gridLineAA(uv, sMajor, width);
  }

  vec3 meshGradient(vec2 uv){
    vec2 p0=vec2(-0.70,-0.45), p1=vec2(0.75,-0.35), p2=vec2(-0.65,0.65), p3=vec2(0.80,0.55);
    vec3 c0=vec3(0.05,0.10,0.26);
    vec3 c1=vec3(0.08,0.16,0.36);
    vec3 c2=vec3(0.03,0.09,0.22);
    vec3 c3=vec3(0.10,0.20,0.40);
    float e=2.0;
    float w0=pow(1.0/(0.2+distance(uv,p0)),e);
    float w1=pow(1.0/(0.2+distance(uv,p1)),e);
    float w2=pow(1.0/(0.2+distance(uv,p2)),e);
    float w3=pow(1.0/(0.2+distance(uv,p3)),e);
    float ws=w0+w1+w2+w3;
    return (c0*w0+c1*w1+c2*w2+c3*w3)/ws;
  }

  float sdLineX(vec2 p, float w){ return 1.0 - smoothstep(w, w+fwidth(p.y), abs(p.y)); }
  float sdLineY(vec2 p, float w){ return 1.0 - smoothstep(w, w+fwidth(p.x), abs(p.x)); }
  float sdDiag1(vec2 p, float w){ float d=abs(p.x+p.y)/sqrt(2.0); return 1.0 - smoothstep(w, w+fwidth(d), d); }
  float sdDiag2(vec2 p, float w){ float d=abs(p.x-p.y)/sqrt(2.0); return 1.0 - smoothstep(w, w+fwidth(d), d); }
  float sdDot (vec2 p, float r){ float d=length(p); return 1.0 - smoothstep(r, r+fwidth(d), d); }

  float asciiGlyph(vec2 cellUV, float level){
    vec2 p=cellUV; float w=0.11, r=0.10;
    float g0=sdDot(p,r), g1=sdLineX(p,w), g2=sdLineY(p,w),
          g3=max(sdLineX(p,w),sdLineY(p,w)),
          g4=sdDiag1(p,w), g5=sdDiag2(p,w),
          g6=max(sdDiag1(p,w),sdDiag2(p,w)),
          g7=max(sdLineX(p,w), max(sdLineY(p,w), g6));
    float m=0.;
    m=mix(m,g0, smoothstep(0.00,0.12,level)*(1.0-step(level,0.12)));
    m=mix(m,g1, smoothstep(0.12,0.28,level)*(1.0-step(level,0.28)));
    m=mix(m,g2, smoothstep(0.28,0.44,level)*(1.0-step(level,0.44)));
    m=mix(m,g3, smoothstep(0.44,0.60,level)*(1.0-step(level,0.60)));
    m=mix(m,g4, smoothstep(0.60,0.72,level)*(1.0-step(level,0.72)));
    m=mix(m,g5, smoothstep(0.72,0.84,level)*(1.0-step(level,0.84)));
    m=mix(m,g6, smoothstep(0.84,0.94,level)*(1.0-step(level,0.94)));
    m=mix(m,g7, smoothstep(0.94,1.00,level));
    return clamp(m,0.0,1.0);
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2  R = iResolution.xy;
    float t = iTime;
    vec2 uv = (fragCoord - 0.5*R) / max(R.y, 1.0);

    vec3 baseDeep = vec3(0.03,0.06,0.12);
    vec3 baseTint = vec3(0.05,0.09,0.18);
    float vgrad   = smoothstep(-0.92, 0.55, -uv.y);
    vec3  bg      = mix(baseDeep, baseTint, vgrad);
    bg            = mix(bg, meshGradient(uv), MESH_AMT);
    float rad     = length(uv);
    float vig     = pow(1.0 - VIGNETTE_AMT * rad, 1.0);
    bg           *= clamp(vig, 0.0, 1.0);

    vec2 scrollDir = normalize(vec2(1.0, -0.55));
    vec2 uvAnim    = uv + SCROLL_SPEED * t * scrollDir;

    float thin  = gridLineAA(uvAnim, GRID_SCALE, THIN_WIDTH);
    float major = majorGridAA(uvAnim, GRID_SCALE, MAJOR_STEP, MAJOR_WIDTH);

    vec3 lineThin  = vec3(0.58,0.66,0.95);
    vec3 lineMajor = vec3(0.78,0.84,1.00);

    vec3 col = bg
             + lineThin  * thin  * 0.25
             + lineMajor * major * 0.52;

    vec2 uMajor = uvAnim * (GRID_SCALE / MAJOR_STEP);
    vec2 idx    = floor(uMajor + 0.5);
    float selX = 1.0 - step(0.001, abs(fract(idx.x / ASCII_EVERY)));
    float selY = 1.0 - step(0.001, abs(fract(idx.y / ASCII_EVERY)));
    float asciiLineSel = max(selX, selY);

    if (ASCII_AMT > 0.001) {
      vec2 aUV   = uv * ASCII_SCALE;
      vec2 cellF = fract(aUV) - 0.5;
      float lvl  = clamp(dot(col, vec3(0.2126,0.7152,0.0722)), 0.0, 1.0);
      float glyph = asciiGlyph(cellF, lvl);
      float nearMajor = major;
      float asciiMask = asciiLineSel * nearMajor;
      vec3 asciiColor = mix(vec3(0.50,0.70,1.0), meshGradient(uv), 0.25);
      col = mix(col, col + asciiColor * glyph * 0.30, ASCII_AMT * asciiMask);
    }

    float n = vnoise(fragCoord*0.6 + vec2(t*12.0, -t*9.0));
    col += (n - 0.5) * NOISE_AMT;

    float luma = dot(col, vec3(0.2126,0.7152,0.0722));
    float dAmt = mix(DITHER_DARK, DITHER_LIGHT, luma);
    col += (bayer4(fragCoord) - 0.5) * dAmt;

    col = tanh(col);
    fragColor = vec4(col, 1.0);
  }

  void main(){ mainImage(fragColor, gl_FragCoord.xy); }
  `;

  const VERT_SRC = `#version 300 es
  precision highp float;
  layout(location=0) in vec2 a_pos;
  out vec2 v_uv;
  void main(){
    v_uv = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
  `;

  /* =============================================
     shouldRunShader — detecta mobile e low-CPU
  ============================================== */
  function shouldRunShader() {
    if (window.innerWidth < 768) return false;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return false;
    return true;
  }

  /* =============================================
     initShaderOnCanvas — monta o WebGL2 num
     canvas específico (independente por instância)
  ============================================== */
  function initShaderOnCanvas(canvas) {
    var gl = canvas.getContext('webgl2', { premultipliedAlpha: false });
    if (!gl) {
      console.warn('[BlueprintShaderGrid] WebGL2 não suportado neste browser.');
      return null;
    }

    var disposed = false;
    var rafId = null;
    var vao = null;
    var vbo = null;
    var program = null;
    var ro = null;
    var resizeScheduled = false;
    var mouse = { x: 0, y: 0, l: 0, r: 0 };
    var startTime = performance.now();
    var frameCount = 0;

    function getDpr() {
      return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    }

    function applySize() {
      resizeScheduled = false;
      if (disposed) return;
      var dpr = getDpr();
      var cssW = Math.max(1, canvas.clientWidth | 0);
      var cssH = Math.max(1, canvas.clientHeight | 0);
      var w = Math.max(1, Math.floor(cssW * dpr));
      var h = Math.max(1, Math.floor(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function scheduleSize() {
      if (resizeScheduled) return;
      resizeScheduled = true;
      requestAnimationFrame(applySize);
    }

    function safeCompile(type, src) {
      var sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('[BlueprintShaderGrid] Shader compile error:', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    }

    function safeLink(vs, fs) {
      var prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.error('[BlueprintShaderGrid] Program link error:', gl.getProgramInfoLog(prog));
        gl.deleteProgram(prog);
        return null;
      }
      return prog;
    }

    // --- Geometry ---
    vao = gl.createVertexArray();
    vbo = gl.createBuffer();
    if (!vao || !vbo) { console.error('[BlueprintShaderGrid] Falha ao criar VAO/VBO'); return null; }
    gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // --- Shaders ---
    var vs = safeCompile(gl.VERTEX_SHADER, VERT_SRC);
    var fs = safeCompile(gl.FRAGMENT_SHADER, SHADER_SRC);
    if (!vs || !fs) { if (vs) gl.deleteShader(vs); if (fs) gl.deleteShader(fs); return null; }
    program = safeLink(vs, fs);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!program) return null;

    var uResolution = gl.getUniformLocation(program, 'iResolution');
    var uTime       = gl.getUniformLocation(program, 'iTime');
    var uFrame      = gl.getUniformLocation(program, 'iFrame');
    var uMouse      = gl.getUniformLocation(program, 'iMouse');

    // --- Mouse tracking local ao canvas ---
    function onMove(e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      mouse.y = Math.max(0, Math.min(rect.height - (e.clientY - rect.top), rect.height));
    }
    function onDown(e) { if (e.button === 0) mouse.l = 1; if (e.button === 2) mouse.r = 1; }
    function onUp(e)   { if (e.button === 0) mouse.l = 0; if (e.button === 2) mouse.r = 0; }
    function onCtxMenu(e) { e.preventDefault(); }
    function onContextLost(ev) {
      ev.preventDefault();
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
    function onContextRestored() {
      scheduleSize();
      startTime = performance.now();
      frameCount = 0;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    canvas.addEventListener('mousemove',           onMove);
    canvas.addEventListener('mousedown',           onDown);
    canvas.addEventListener('mouseup',             onUp);
    canvas.addEventListener('contextmenu',         onCtxMenu);
    canvas.addEventListener('webglcontextlost',    onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    // --- Resize observer ---
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(scheduleSize);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', scheduleSize, { passive: true });
    }
    scheduleSize();

    // --- RAF loop ---
    function tick(now) {
      if (disposed) return;
      if (gl.isContextLost()) { rafId = requestAnimationFrame(tick); return; }

      var t = (now - startTime) / 1000;
      frameCount++;

      try {
        gl.useProgram(program);
        if (resizeScheduled) applySize();

        var dpr = getDpr();
        var w = canvas.width, h = canvas.height;

        if (uResolution) gl.uniform3f(uResolution, w, h, dpr);
        if (uTime)       gl.uniform1f(uTime, t);
        if (uFrame)      gl.uniform1i(uFrame, frameCount);
        if (uMouse)      gl.uniform4f(uMouse, mouse.x * dpr, mouse.y * dpr, mouse.l, mouse.r);

        gl.bindVertexArray(vao);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      } catch (err) {
        console.error('[BlueprintShaderGrid] Draw error:', err);
      }

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // --- Cleanup ---
    return function dispose() {
      disposed = true;
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      canvas.removeEventListener('mousemove',            onMove);
      canvas.removeEventListener('mousedown',            onDown);
      canvas.removeEventListener('mouseup',              onUp);
      canvas.removeEventListener('contextmenu',          onCtxMenu);
      canvas.removeEventListener('webglcontextlost',     onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      if (ro) { try { ro.disconnect(); } catch(e){} ro = null; }
      try { if (vbo) gl.deleteBuffer(vbo); } catch(e){}
      try { if (vao) gl.deleteVertexArray(vao); } catch(e){}
      try { if (program) gl.deleteProgram(program); } catch(e){}
    };
  }

  /* =============================================
     Custom Element — <blueprint-shader-grid>

     Atributos HTML:
       height   — CSS height do container (padrão: "auto")
       min-height — CSS min-height (opcional)

     O children do elemento fica em uma div
     sobreposta ao canvas (z-index: 2).
  ============================================== */
  var BlueprintShaderGrid = (function() {

    // Estilo base injetado uma única vez
    var styleInjected = false;
    function injectBaseStyle() {
      if (styleInjected) return;
      styleInjected = true;
      var style = document.createElement('style');
      style.id = 'blueprint-shader-grid-styles';
      style.textContent = [
        'blueprint-shader-grid {',
        '  display: block;',
        '  position: relative;',
        '  width: 100%;',
        '  overflow: hidden;',
        '}',
        'blueprint-shader-grid > .bsg-canvas {',
        '  position: absolute;',
        '  inset: 0;',
        '  width: 100%;',
        '  height: 100%;',
        '  display: block;',
        '  pointer-events: none;',
        '}',
        'blueprint-shader-grid > .bsg-content {',
        '  position: relative;',
        '  z-index: 2;',
        '  width: 100%;',
        '  min-height: inherit;',
        '}',
        /* Fallback para mobile: fundo sólido quando shader está desabilitado */
        '@media (max-width: 767px) {',
        '  blueprint-shader-grid {',
        '    background-color: #0d1829;',
        '  }',
        '}',
      ].join('\n');
      document.head.appendChild(style);
    }

    function BlueprintShaderGridElement() {
      var el = HTMLElement.call(this);
      return el;
    }
    BlueprintShaderGridElement.prototype = Object.create(HTMLElement.prototype);
    BlueprintShaderGridElement.prototype.constructor = BlueprintShaderGridElement;

    BlueprintShaderGridElement.prototype.connectedCallback = function() {
      injectBaseStyle();

      var self = this;
      var h = self.getAttribute('height') || 'auto';
      var minH = self.getAttribute('min-height') || '';

      // Aplica dimensões ao container
      self.style.height = h;
      if (minH) self.style.minHeight = minH;
      if (!minH && h === 'auto') self.style.minHeight = '400px';

      // Background sólido de fallback (o canvas vai por cima)
      self.style.backgroundColor = '#0d1829';

      // Cria canvas do shader
      var canvas = document.createElement('canvas');
      canvas.className = 'bsg-canvas';
      self._canvas = canvas;

      // Cria wrapper de conteúdo e move filhos para dentro
      var content = document.createElement('div');
      content.className = 'bsg-content';
      self._content = content;

      // Move filhos existentes para dentro do content wrapper
      while (self.firstChild) {
        content.appendChild(self.firstChild);
      }

      // Monta a estrutura: canvas abaixo, content em cima
      self.appendChild(canvas);
      self.appendChild(content);

      // Inicializa o shader (respeitando mobile e low-CPU)
      self._dispose = null;
      if (shouldRunShader()) {
        // Pequeno delay para garantir que o layout está pronto
        requestAnimationFrame(function() {
          requestAnimationFrame(function() {
            if (!self._disposed) {
              self._dispose = initShaderOnCanvas(canvas);
            }
          });
        });
      }
    };

    BlueprintShaderGridElement.prototype.disconnectedCallback = function() {
      this._disposed = true;
      if (this._dispose) {
        this._dispose();
        this._dispose = null;
      }
    };

    return BlueprintShaderGridElement;
  })();

  /* =============================================
     Registro do Custom Element
  ============================================== */
  if ('customElements' in window) {
    customElements.define('blueprint-shader-grid', BlueprintShaderGrid);
  } else {
    console.warn('[BlueprintShaderGrid] customElements não suportado neste browser.');
  }

})();
