/* THE ALCHEMIST — the living liquid.
   A single full-screen WebGL1 fragment shader: domain-warped noise inside a
   round vessel seen from above, tinted by the three leading flavours, veiled
   by smoke, dotted with rising bubbles, and stirrable with the pointer. */

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform float uSmoke;
uniform float uFizz;
uniform float uScale;
uniform float uSharp;
uniform float uFlow;
uniform vec3 uStir;
uniform float uPour;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5; mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = m * p; a *= 0.5; }
  return v;
}
mat2 rot(float a){ float c = cos(a); float s = sin(a); return mat2(c, -s, s, c); }

void main(){
  float m = min(uRes.x, uRes.y);
  vec2 p = (gl_FragCoord.xy - 0.5 * uRes) / m;
  float r = length(p);
  const float R = 0.43;
  float t = uTime * uFlow;

  vec2 d = p - uStir.xy;
  float sw = uStir.z * exp(-dot(d, d) * 12.0);
  vec2 q0 = uStir.xy + rot(sw * 2.8) * d;

  float wr = (0.55 - r) * (0.9 + 0.6 * sin(t * 0.21)) + t * 0.06 + uPour * 3.2 * (0.5 - r);
  vec2 w = rot(wr) * q0;
  vec2 s = w * uScale;

  vec2 q = vec2(fbm(s + vec2(0.0, t * 0.11)), fbm(s + vec2(5.2, 1.3) - vec2(t * 0.09, 0.0)));
  vec2 rr = vec2(fbm(s + 3.6 * q + vec2(1.7, 9.2) + t * 0.13), fbm(s + 3.6 * q + vec2(8.3, 2.8) - t * 0.10));
  float f = fbm(s + 3.4 * rr);
  float k = clamp(pow(clamp(f * 1.3, 0.0, 1.0), uSharp), 0.0, 1.0);

  vec3 col = mix(uA, uB, smoothstep(0.12, 0.88, k));
  col = mix(col, uC, smoothstep(0.35, 1.0, length(q) * 0.9) * 0.7);
  float vein = smoothstep(0.035, 0.0, abs(rr.x - 0.55));
  col += vein * 0.22 * mix(uB, vec3(1.0), 0.55);
  col *= 0.78 + 0.42 * smoothstep(0.35, 0.95, f);

  float sm = fbm(w * 3.2 + 2.2 * q + vec2(t * 0.05, -t * 0.04));
  col = mix(col, vec3(0.19, 0.11, 0.25), uSmoke * smoothstep(0.42, 0.8, sm) * 0.85);
  col = mix(col, col * vec3(0.8, 0.74, 0.9), uSmoke * 0.35);

  col *= mix(1.0, 0.5, smoothstep(0.08, R, r) * 0.7);

  float bub = 0.0;
  for (int L = 0; L < 2; L++) {
    float fl = float(L);
    float sc = 13.0 + fl * 10.0;
    vec2 g = w * sc + fl * 7.3;
    vec2 id = floor(g);
    vec2 fp = fract(g) - 0.5;
    float h = hash(id + fl * 3.1);
    float on = step(h, uFizz * 0.8);
    vec2 off = (vec2(hash(id + 1.7), hash(id + 4.3)) - 0.5) * 0.5;
    float life = fract(uTime * (0.22 + h * 0.5) + h * 7.0);
    float rad = 0.07 + 0.2 * life * (0.4 + 0.6 * hash(id + 9.1));
    float dd = length(fp - off);
    float disc = smoothstep(rad, rad - 0.05, dd);
    float core = smoothstep(rad - 0.05, rad - 0.12, dd);
    bub += on * (disc - core * 0.65) * sin(life * 3.14159);
  }
  col += bub * 0.6 * mix(vec3(1.0), uB, 0.15);

  float ring = (1.0 - uPour) * R;
  col += uPour * smoothstep(0.03, 0.0, abs(r - ring)) * 0.5;

  vec2 n = r > 0.0001 ? p / r : vec2(0.0);
  float band = smoothstep(R - 0.012, R - 0.03, r) * smoothstep(R - 0.085, R - 0.04, r);
  col += band * 0.55 * smoothstep(0.1, 0.9, dot(n, vec2(-0.7071, 0.7071)));
  float glint = smoothstep(0.075, 0.0, length(p - vec2(-0.2, 0.22)));
  col += glint * 0.28;

  float inside = smoothstep(R + 0.002, R - 0.002, r);
  float rim = smoothstep(0.006, 0.0, abs(r - R));
  col = mix(col, vec3(1.0, 0.94, 1.0), rim * 0.85);

  float hr = max(r - R, 0.0);
  float halo = exp(-hr * 11.0) * 0.42 * (1.0 - inside);
  vec3 hc = mix(uA, uB, 0.45);
  float wall = (1.0 - inside) * smoothstep(R + 0.03, R + 0.021, r) * 0.32;

  vec3 fc = col * inside + hc * halo + vec3(1.0, 0.93, 1.0) * wall + vec3(1.0, 0.94, 1.0) * rim * (1.0 - inside);
  float fa = clamp(inside + halo + wall + rim, 0.0, 1.0);
  fc += (hash(gl_FragCoord.xy + fract(uTime * 7.0) * 100.0) - 0.5) * 0.06 * fa;
  gl_FragColor = vec4(fc, fa);
}`;

const lerp = (a, b, k) => a + (b - a) * k;

export class Liquid {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.reduced = !!opts.reduced;
    this.onFail = opts.onFail || (() => {});
    this.ok = false;
    this.running = false;
    this.time = 9.5;
    this.last = 0;
    this.quality = 1;
    this.slow = 0;
    this.frames = 0;
    this.stirS = { x: 0, y: 0, z: 0 };
    this.pour = 0;
    this.cur = null;
    this.tgt = null;
    this._raf = 0;
    let gl = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    } catch (e) { gl = null; }
    if (!gl) return;
    this.gl = gl;
    const prog = this._program(VERT, FRAG);
    if (!prog) return;
    this.prog = prog;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    this.u = {};
    ['uRes', 'uTime', 'uA', 'uB', 'uC', 'uSmoke', 'uFizz', 'uScale', 'uSharp', 'uFlow', 'uStir', 'uPour'].forEach((n) => { this.u[n] = gl.getUniformLocation(prog, n); });
    gl.clearColor(0, 0, 0, 0);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); this.stop(); this.ok = false; this.onFail(); }, false);
    this.ok = true;
    this.resize();
    if ('ResizeObserver' in window) {
      this._ro = new ResizeObserver(() => { this.resize(); if (!this.running) this.draw(); });
      this._ro.observe(canvas);
    }
  }

  _program(vs, fs) {
    const gl = this.gl;
    const mk = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
      return sh;
    };
    const v = mk(gl.VERTEX_SHADER, vs);
    const f = mk(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) return null;
    const p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return null;
    return p;
  }

  resize() {
    if (!this.ok) return;
    const rect = this.canvas.getBoundingClientRect();
    const small = innerWidth < 760;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    // the liquid is soft — render a touch under native resolution
    const scale = dpr * 0.8 * this.quality;
    const w = Math.max(64, Math.round(rect.width * scale));
    const h = Math.max(64, Math.round(rect.height * scale));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
  }

  /* target: { a:[r,g,b], b, c, smoke, fizz, scale, sharp, flow } */
  set(target) {
    this.tgt = target;
    if (!this.cur) this.cur = JSON.parse(JSON.stringify(target));
    if (this.reduced) { this.cur = JSON.parse(JSON.stringify(target)); this.draw(); }
    else if (!this.running) this.draw();
  }

  stir(x, y, amount) {
    this.stirS.x = x;
    this.stirS.y = y;
    this.stirS.z = Math.max(-3, Math.min(3, this.stirS.z + amount));
    if (this.reduced || !this.running) { this.draw(); }
  }

  pulse() { this.pour = 1; if (this.reduced) { this.pour = 0; this.draw(); } }

  start() {
    if (!this.ok || this.running || this.reduced) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now) => {
      if (!this.running) return;
      const dt = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.step(dt);
      this.draw();
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }

  stop() { this.running = false; cancelAnimationFrame(this._raf); }

  step(dt) {
    this.time += dt;
    const k = 1 - Math.exp(-dt * 2.6);
    const c = this.cur; const t = this.tgt;
    if (c && t) {
      for (const key of ['a', 'b', 'c']) for (let i = 0; i < 3; i++) c[key][i] = lerp(c[key][i], t[key][i], k);
      for (const key of ['smoke', 'fizz', 'scale', 'sharp', 'flow']) c[key] = lerp(c[key], t[key], k);
    }
    this.stirS.z *= Math.exp(-dt * 1.4);
    this.pour = Math.max(0, this.pour - dt * 0.7);
    // adaptive quality: if frames are consistently slow, render fewer pixels
    this.frames++;
    if (dt > 0.03) this.slow++;
    if (this.frames >= 90) {
      if (this.slow > 45 && this.quality > 0.55) { this.quality *= 0.8; this.resize(); }
      this.frames = 0; this.slow = 0;
    }
  }

  draw() {
    if (!this.ok || !this.cur) return;
    const gl = this.gl; const u = this.u; const c = this.cur;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uTime, this.time);
    gl.uniform3fv(u.uA, c.a);
    gl.uniform3fv(u.uB, c.b);
    gl.uniform3fv(u.uC, c.c);
    gl.uniform1f(u.uSmoke, c.smoke);
    gl.uniform1f(u.uFizz, c.fizz);
    gl.uniform1f(u.uScale, c.scale);
    gl.uniform1f(u.uSharp, c.sharp);
    gl.uniform1f(u.uFlow, c.flow);
    gl.uniform3f(u.uStir, this.stirS.x, this.stirS.y, this.stirS.z);
    gl.uniform1f(u.uPour, this.pour);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
