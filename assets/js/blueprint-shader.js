    /* =============================================
       BLUEPRINT SHADER GRID — port vanilla JS

       Equivalente funcional do BlueprintShaderGrid.tsx
       (WebGL2 grid blueprint animado com mesh gradient,
        vignette, ASCII glyphs, dither, noise).

       API:
         <section class="shader-bg">...</section>

       O módulo:
         - Auto-disable em low-power (<4 cores)
         - Auto-disable em prefers-reduced-motion
         - Roda em QUALQUER tamanho de viewport (sem threshold mobile)
         - Limita a 3 instâncias simultâneas
         - Pausa RAF quando a seção está fora da viewport
       ============================================== */
(function () {
    "use strict";

    /* ========= GLSL ========= */
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
      m[8]=3;m[9]=11;m[10]=1;m[11]=9;m[12]=15;m[13]=7;m[14]=11;m[15]=5;
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

    void mainImage(out vec4 fragColor, in vec2 fragCoord)
    {
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

      float thin  = gridLineAA (uvAnim, GRID_SCALE, THIN_WIDTH);
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

    /* ========= Config ========= */
    const MAX_INSTANCES = 3;
    const LOW_POWER_CORES = 4;

    /* ========= Helpers ========= */
    const isLowPower = () =>
        navigator.hardwareConcurrency && navigator.hardwareConcurrency < LOW_POWER_CORES;
    const prefersReducedMotion = () =>
        window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function safeCompile(gl, type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        const ok = gl.getShaderParameter(sh, gl.COMPILE_STATUS);
        const log = gl.getShaderInfoLog(sh) || "";
        return { shader: ok ? sh : null, log };
    }
    function safeLink(gl, vs, fs) {
        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        const ok = gl.getProgramParameter(prog, gl.LINK_STATUS);
        const log = gl.getProgramInfoLog(prog) || "";
        return { program: ok ? prog : null, log };
    }
    function drawError(gl, msg) {
        console.error("[BlueprintShader]", msg);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clearColor(0.2, 0.0, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    /* ========= Mount em um container ========= */
    function mountShader(container) {
        const canvas = document.createElement("canvas");
        canvas.className = "shader-bg__canvas";
        canvas.setAttribute("aria-hidden", "true");
        container.appendChild(canvas);

        // Força o navegador a aplicar layout antes de medir.
        // Sem isso, canvas.clientWidth/Height podem ser 0 se o container
        // ainda não tiver sido renderizado (especialmente em mobile).
        void container.offsetHeight;

        const gl = canvas.getContext("webgl2", { premultipliedAlpha: false });
        if (!gl) {
            console.warn("[BlueprintShader] WebGL2 não suportado; usando fallback CSS");
            return;
        }

        // Define dimensões iniciais imediatamente (sem esperar rAF/ResizeObserver)
        // — previne canvas com width/height = 0 que não renderiza nada.
        const dpr0 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
        const initialW = Math.max(1, Math.floor((canvas.clientWidth || container.clientWidth || window.innerWidth) * dpr0));
        const initialH = Math.max(1, Math.floor((canvas.clientHeight || container.clientHeight || window.innerHeight) * dpr0));
        canvas.width = initialW;
        canvas.height = initialH;
        gl.viewport(0, 0, initialW, initialH);

        let disposed = false;
        let vao = null, vbo = null, program = null;
        let ro = null;
        let resizeScheduled = false;
        let rafId = null;
        let visible = true;

        const startRef = { value: performance.now() };
        const frameRef = { value: 0 };
        const mouseRef = { x: 0, y: 0, l: 0, r: 0 };

        const getDpr = () => {
            const sys = window.devicePixelRatio || 1;
            return Math.max(1, Math.min(2, sys));
        };

        function applySize() {
            resizeScheduled = false;
            if (disposed) return;
            const dpr = getDpr();
            // Fallback: se o canvas ainda não tem layout, usa o container
            const cssW = Math.max(1, (canvas.clientWidth || container.clientWidth || window.innerWidth) | 0);
            const cssH = Math.max(1, (canvas.clientHeight || container.clientHeight || window.innerHeight) | 0);
            const w = Math.max(1, Math.floor(cssW * dpr));
            const h = Math.max(1, Math.floor(cssH * dpr));
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

        const onMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            mouseRef.y = Math.max(0, Math.min(rect.height - (e.clientY - rect.top), rect.height));
        };
        const onDown = (e) => {
            if (e.button === 0) mouseRef.l = 1;
            if (e.button === 2) mouseRef.r = 1;
        };
        const onUp = (e) => {
            if (e.button === 0) mouseRef.l = 0;
            if (e.button === 2) mouseRef.r = 0;
        };
        const onCtxMenu = (e) => e.preventDefault();
        const onContextLost = (ev) => {
            ev.preventDefault();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        };
        const onContextRestored = () => {
            scheduleSize();
            startRef.value = performance.now();
            frameRef.value = 0;
            if (!rafId && visible) rafId = requestAnimationFrame(tick);
        };

        vao = gl.createVertexArray();
        vbo = gl.createBuffer();
        if (!vao || !vbo) {
            drawError(gl, "Failed to create VAO/VBO");
            return;
        }
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        const { shader: vs, log: vsLog } = safeCompile(gl, gl.VERTEX_SHADER, VERT_SRC);
        if (!vs) {
            drawError(gl, "Vertex compile error:\n" + vsLog);
            return;
        }
        const { shader: fs, log: fsLog } = safeCompile(gl, gl.FRAGMENT_SHADER, SHADER_SRC);
        if (!fs) {
            drawError(gl, "Fragment compile error:\n" + fsLog);
            gl.deleteShader(vs);
            return;
        }
        const linked = safeLink(gl, vs, fs);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!linked.program) {
            drawError(gl, "Program link error:\n" + linked.log);
            return;
        }
        program = linked.program;

        const uResolution = gl.getUniformLocation(program, "iResolution");
        const uTime = gl.getUniformLocation(program, "iTime");
        const uFrame = gl.getUniformLocation(program, "iFrame");
        const uMouse = gl.getUniformLocation(program, "iMouse");

        ro = new ResizeObserver(scheduleSize);
        ro.observe(canvas);
        scheduleSize();

        canvas.addEventListener("mousemove", onMove);
        canvas.addEventListener("mousedown", onDown);
        canvas.addEventListener("mouseup", onUp);
        canvas.addEventListener("contextmenu", onCtxMenu);
        canvas.addEventListener("webglcontextlost", onContextLost);
        canvas.addEventListener("webglcontextrestored", onContextRestored);

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    visible = entry.isIntersecting;
                    if (visible && !rafId) {
                        startRef.value = performance.now();
                        rafId = requestAnimationFrame(tick);
                    } else if (!visible && rafId) {
                        cancelAnimationFrame(rafId);
                        rafId = null;
                    }
                });
            },
            { rootMargin: "100px" }
        );
        io.observe(container);

        function tick(now) {
            if (disposed) return;
            if (gl.isContextLost()) {
                rafId = requestAnimationFrame(tick);
                return;
            }
            const t = (now - startRef.value) / 1000;
            frameRef.value += 1;

            try {
                gl.useProgram(program);
                if (resizeScheduled) applySize();

                const dpr = getDpr();
                const w = canvas.width, h = canvas.height;

                if (uResolution) gl.uniform3f(uResolution, w, h, dpr);
                if (uTime) gl.uniform1f(uTime, t);
                if (uFrame) gl.uniform1i(uFrame, frameRef.value);
                if (uMouse) gl.uniform4f(uMouse, mouseRef.x * dpr, mouseRef.y * dpr, mouseRef.l, mouseRef.r);

                gl.bindVertexArray(vao);
                gl.drawArrays(gl.TRIANGLES, 0, 3);
            } catch (err) {
                drawError(gl, (err && err.message) || String(err));
            }

            rafId = requestAnimationFrame(tick);
        }
        rafId = requestAnimationFrame(tick);

        container._blueprintCleanup = function () {
            disposed = true;
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            io.disconnect();
            canvas.removeEventListener("mousemove", onMove);
            canvas.removeEventListener("mousedown", onDown);
            canvas.removeEventListener("mouseup", onUp);
            canvas.removeEventListener("contextmenu", onCtxMenu);
            canvas.removeEventListener("webglcontextlost", onContextLost);
            canvas.removeEventListener("webglcontextrestored", onContextRestored);
            if (ro) {
                try { ro.disconnect(); } catch (e) { /* noop */ }
                ro = null;
            }
            try { if (vbo) gl.deleteBuffer(vbo); } catch (e) { /* noop */ }
            try { if (vao) gl.deleteVertexArray(vao); } catch (e) { /* noop */ }
            try { if (program) gl.deleteProgram(program); } catch (e) { /* noop */ }
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        };
    }

    /* ========= Boot ========= */
    function init() {
        if (isLowPower() || prefersReducedMotion()) {
            console.info("[BlueprintShader] Desligado (low-power / reduced-motion). Fallback CSS ativo.");
            return;
        }
        if (!document.createElement("canvas").getContext) {
            console.warn("[BlueprintShader] Canvas API indisponível. Fallback CSS ativo.");
            return;
        }

        const containers = Array.from(document.querySelectorAll(".shader-bg"));
        const limited = containers.slice(0, MAX_INSTANCES);
        if (containers.length > MAX_INSTANCES) {
            console.warn(
                "[BlueprintShader] Limite de " + MAX_INSTANCES + " instâncias; ignorando " +
                (containers.length - MAX_INSTANCES) + " extras."
            );
        }
        limited.forEach(mountShader);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.BlueprintShader = { mount: mountShader, maxInstances: MAX_INSTANCES };
})();
