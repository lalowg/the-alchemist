/* THE ALCHEMIST — page orchestration */
import { AXES, DEFAULT_MIX, FAMILIES, ELEMENTS, DRINKS, nameFor, recipeFor, readings, mixFromProfile, ranked } from './data.js';
import { Liquid } from './liquid.js';
import { glassSVG } from './glass.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const root = document.documentElement;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pad = (n) => String(n).padStart(2, '0');

const store = {
  get(k, d) { try { const v = sessionStorage.getItem('alchemist:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { sessionStorage.setItem('alchemist:' + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};

/* ------------------------------------------------------------------ */
/* Colour model for the shader                                          */
/* ------------------------------------------------------------------ */
const SHADE = {
  sweet: [1.0, 0.18, 0.53],
  sour: [1.0, 0.6, 0.05],
  bitter: [0.56, 0.07, 0.3],
  green: [0.0, 0.76, 0.66],
  smoke: [0.36, 0.27, 0.46],
  fizz: [0.95, 0.92, 1.0],
};
const WEIGHT = { sweet: 1, sour: 1, bitter: 1, green: 1, smoke: 0.55, fizz: 0.35 };
const AXIS = Object.fromEntries(AXES.map((a) => [a.key, a]));

function colourOrder(mix) {
  return AXES.map((a) => ({ key: a.key, w: mix[a.key] * WEIGHT[a.key] })).sort((x, y) => y.w - x.w);
}

function shaderTarget(mix) {
  const order = colourOrder(mix);
  const lift = mix.fizz * 0.025;
  const tone = (c) => c.map((v) => v + (1 - v) * lift);
  let a; let b; let c;
  if (order[0].w === 0) { a = [0.82, 0.88, 0.95]; b = [0.66, 0.78, 0.9]; c = [0.9, 0.92, 1]; }
  else {
    a = tone(SHADE[order[0].key]);
    b = tone(order[1].w > 0 ? SHADE[order[1].key] : SHADE[order[0].key].map((v) => v * 0.7));
    c = tone(order[2].w > 0 ? SHADE[order[2].key] : b.map((v) => Math.min(1, v * 1.15)));
  }
  return {
    a, b, c,
    smoke: mix.smoke / 10,
    fizz: mix.fizz / 10,
    scale: clamp(1.5 + mix.green * 0.06 - mix.sweet * 0.04, 1.0, 2.2),
    sharp: clamp(0.8 + mix.sour * 0.12 - mix.sweet * 0.03, 0.5, 2.0),
    flow: clamp(0.5 + mix.sour * 0.05 + mix.fizz * 0.04 - mix.bitter * 0.025 - mix.sweet * 0.015, 0.25, 1.3),
  };
}
const uiColours = (mix) => colourOrder(mix).slice(0, 3).map((o) => (o.w > 0 ? AXIS[o.key].colour : '#CDB8D9'));

/* ------------------------------------------------------------------ */
/* Composer state                                                       */
/* ------------------------------------------------------------------ */
const state = {
  mix: { ...DEFAULT_MIX },
  strength: 'zero',
  seed: 0,
  batch: store.get('batch', 1),
  name: '',
  log: store.get('log', []),
};

const stage = $('#stage');
const canvas = $('#liquid');
const fallback = $('.specimen-fallback');
const nameEl = $('[data-name]');
const formulaEl = $('[data-formula]');
const liveEl = $('[data-live]');
const statusEl = $('[data-status]');
const motionBtn = $('[data-motion]');

const liquid = new Liquid(canvas, {
  reduced,
  onFail() { root.classList.remove('has-gl'); root.classList.add('no-gl'); },
});
root.classList.add(liquid.ok ? 'has-gl' : 'no-gl');
if (reduced) motionBtn.hidden = true;

/* wheel around the specimen */
const wheelArcs = $('.wheel-arcs');
const wheelLabels = $('.wheel-labels');
const NS = 'http://www.w3.org/2000/svg';
const pt = (r, deg) => { const a = (deg * Math.PI) / 180; return [50 + r * Math.cos(a), 50 + r * Math.sin(a)]; };
const arcs = AXES.map((a, i) => {
  const start = -90 + i * 60 + 3; const end = start + 54;
  const [x0, y0] = pt(46.6, start); const [x1, y1] = pt(46.6, end);
  const bg = document.createElementNS(NS, 'path');
  bg.setAttribute('d', `M${x0.toFixed(2)} ${y0.toFixed(2)} A46.6 46.6 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`);
  bg.setAttribute('stroke', 'rgba(255,241,230,.12)');
  bg.setAttribute('stroke-width', '1.5');
  bg.setAttribute('stroke-linecap', 'round');
  bg.style.fill = 'none';
  const p = bg.cloneNode();
  p.setAttribute('stroke', a.colour);
  p.setAttribute('pathLength', '100');
  p.setAttribute('stroke-dasharray', '0 100');
  wheelArcs.append(bg, p);
  const [lx, ly] = pt(50.6, start + 27);
  const t = document.createElementNS(NS, 'text');
  t.setAttribute('x', lx.toFixed(2)); t.setAttribute('y', ly.toFixed(2));
  t.textContent = a.sym;
  wheelLabels.append(t);
  return p;
});

function scramble(el, text) {
  if (reduced) { el.textContent = text; return; }
  const glyphs = '△▽◇○✶+=◆';
  const start = performance.now();
  const dur = 520;
  cancelAnimationFrame(el._raf);
  const tick = (now) => {
    const k = Math.min(1, (now - start) / dur);
    const shown = Math.floor(text.length * k);
    let html = '';
    for (let i = 0; i < text.length; i++) {
      if (i < shown || text[i] === ' ') html += text[i];
      else html += `<span class="scr">${glyphs[(Math.random() * glyphs.length) | 0]}</span>`;
    }
    el.innerHTML = html;
    if (k < 1) el._raf = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  el._raf = requestAnimationFrame(tick);
}

let liveTimer = 0;
function render(opts = {}) {
  const { mix } = state;
  // dials
  AXES.forEach((a, i) => {
    const input = $(`#f-${a.key}`);
    if (+input.value !== mix[a.key]) input.value = mix[a.key];
    input.style.setProperty('--p', `${mix[a.key] * 10}%`);
    input.setAttribute('aria-valuetext', `${a.label} ${mix[a.key]} of 10`);
    $(`[data-out="${a.key}"]`).textContent = pad(mix[a.key]);
    arcs[i].setAttribute('stroke-dasharray', `${mix[a.key] * 10} 100`);
  });
  // liquid
  const tgt = shaderTarget(mix);
  liquid.set(tgt);
  const ui = uiColours(mix);
  fallback.style.setProperty('--fb-a', ui[0]);
  fallback.style.setProperty('--fb-b', ui[1]);
  fallback.style.setProperty('--fb-c', ui[2]);
  // readings
  const r = readings(mix);
  $('[data-read="vis"]').textContent = r.vis.toFixed(2);
  $('[data-read="turb"]').textContent = r.turb.toFixed(2);
  $('[data-read="bar"]').textContent = `${r.bar.toFixed(1)} bar`;
  $('[data-read="ph"]').textContent = `pH ${r.ph.toFixed(1)}`;
  // name + formula
  const n = nameFor(mix, state.seed);
  if (n.title !== state.name) {
    state.name = n.title;
    if (opts.instant) nameEl.textContent = n.title; else scramble(nameEl, n.title);
  }
  formulaEl.innerHTML = AXES.map((a) => `<span style="--c:${a.colour}"><span aria-hidden="true">${a.sym}<sub>${mix[a.key]}</sub></span><span class="sr-only">${a.label} ${mix[a.key]}</span></span>`).join('');
  $('[data-batch]').textContent = String(state.batch).padStart(3, '0');
  $('[data-attach]').textContent = n.title;
  // ticket
  const rec = recipeFor(mix, state.strength);
  const vals = { ...rec, mods: rec.mods.length ? rec.mods.join(', ') : 'None — it stands alone' };
  $$('[data-r]').forEach((dd) => {
    const v = vals[dd.dataset.r];
    if (dd.textContent !== v) {
      dd.textContent = v;
      if (!opts.instant && !reduced) { dd.classList.remove('flash'); void dd.offsetWidth; dd.classList.add('flash'); }
    }
  });
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => {
    const top = ranked(mix).slice(0, 2).map((x) => x.label.toLowerCase()).join(' and ');
    liveEl.textContent = `${n.title}. Led by ${top}. Glass: ${rec.glass}.`;
  }, opts.instant ? 0 : 700);
}

$$('.dials input[type="range"]').forEach((input) => {
  input.addEventListener('input', () => {
    state.mix[input.dataset.axis] = +input.value;
    render();
  });
});
$$('input[name="strength"]').forEach((r) => r.addEventListener('change', () => { state.strength = r.value; render(); }));

function setMix(mix, msg) {
  AXES.forEach((a) => { state.mix[a.key] = clamp(Math.round(mix[a.key]), 0, 10); });
  state.seed += 1;
  liquid.pulse();
  render();
  if (msg) say(msg);
}

let sayTimer = 0;
function say(msg) {
  statusEl.textContent = msg;
  clearTimeout(sayTimer);
  sayTimer = setTimeout(() => { statusEl.textContent = ''; }, 6000);
}

function randomMix() {
  const keys = AXES.map((a) => a.key);
  const lead = keys.splice((Math.random() * keys.length) | 0, 1)[0];
  const second = keys.splice((Math.random() * keys.length) | 0, 1)[0];
  const m = {};
  m[lead] = 7 + ((Math.random() * 4) | 0);
  m[second] = 4 + ((Math.random() * 5) | 0);
  keys.forEach((k) => { m[k] = Math.random() < 0.45 ? 0 : (Math.random() * 5) | 0; });
  return m;
}

$('[data-transmute]').addEventListener('click', () => {
  state.batch += 1;
  store.set('batch', state.batch);
  setMix(randomMix());
  say(`Batch ${String(state.batch).padStart(3, '0')} transmuted: ${state.name}.`);
});
$('[data-stir]').addEventListener('click', () => {
  liquid.stir(0, 0, 2.6);
  if (!liquid.ok) say('Stirring needs WebGL — the still specimen is showing instead.');
});
$('[data-save]').addEventListener('click', () => {
  const entry = { id: Date.now(), name: state.name, mix: { ...state.mix }, strength: state.strength, batch: state.batch };
  state.log = [entry, ...state.log.filter((e) => e.name !== entry.name)].slice(0, 8);
  store.set('log', state.log);
  renderLog();
  say(`Saved “${entry.name}” to your batch log on the shelf.`);
});
let paused = false;
motionBtn.addEventListener('click', () => {
  paused = !paused;
  motionBtn.setAttribute('aria-pressed', String(paused));
  motionBtn.textContent = paused ? 'Resume liquid' : 'Pause liquid';
  fallback.classList.toggle('is-paused', paused);
  if (paused) liquid.stop(); else if (heroVisible && !document.hidden) liquid.start();
});

/* pointer stirring */
let last = null;
function local(e) {
  const r = canvas.getBoundingClientRect();
  return { x: (e.clientX - r.left) / r.width - 0.5, y: 0.5 - (e.clientY - r.top) / r.height };
}
canvas.addEventListener('pointerdown', (e) => {
  const p = local(e);
  last = { ...p, t: performance.now(), moved: 0, down: true };
  liquid.stir(p.x, p.y, 0.5);
});
canvas.addEventListener('pointermove', (e) => {
  const p = local(e);
  if (!last) { last = { ...p, t: performance.now(), moved: 0, down: false }; return; }
  const a0 = Math.atan2(last.y, last.x); const a1 = Math.atan2(p.y, p.x);
  let da = a1 - a0;
  if (da > Math.PI) da -= Math.PI * 2;
  if (da < -Math.PI) da += Math.PI * 2;
  const dist = Math.hypot(p.x - last.x, p.y - last.y);
  const gain = last.down ? 3.2 : 0.8;
  liquid.stir(p.x, p.y, -da * gain + (last.down ? dist * 2 : 0));
  last = { ...p, t: performance.now(), moved: last.moved + dist, down: last.down };
});
const endStir = (e) => {
  if (last && last.down && last.moved < 0.02) { const p = local(e); liquid.stir(p.x, p.y, 1.4); }
  last = null;
};
canvas.addEventListener('pointerup', endStir);
canvas.addEventListener('pointercancel', () => { last = null; });
canvas.addEventListener('pointerleave', () => { last = null; });

/* run the liquid only while visible */
let heroVisible = true;
if ('IntersectionObserver' in window) {
  new IntersectionObserver((entries) => {
    heroVisible = entries[0].isIntersecting;
    if (heroVisible && !paused && !document.hidden) liquid.start(); else liquid.stop();
  }, { threshold: 0.02 }).observe(stage);
} else if (!paused) liquid.start();
document.addEventListener('visibilitychange', () => {
  if (document.hidden) liquid.stop(); else if (heroVisible && !paused) liquid.start();
});

render({ instant: true });

/* ------------------------------------------------------------------ */
/* Periodic table                                                       */
/* ------------------------------------------------------------------ */
const ptable = $('#ptable');
const detail = $('#el-detail');
const FAM = Object.fromEntries(FAMILIES.map((f) => [f.key, f]));
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI'];
let current = ELEMENTS.find((e) => e.sym === 'Yz');
let famFilter = 'all';

FAMILIES.forEach((f, i) => {
  const h = document.createElement('p');
  h.className = 'pt-group';
  h.style.setProperty('--c', f.colour);
  h.setAttribute('aria-hidden', 'true');
  h.innerHTML = `<span>${f.name}</span><i>${ROMAN[i]}</i>`;
  ptable.append(h);
});
let idx = 0;
for (let period = 1; period <= 3; period++) {
  FAMILIES.forEach((f) => {
    const el = ELEMENTS.find((e) => e.fam === f.key && e.period === period);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'el';
    b.dataset.sym = el.sym;
    b.dataset.fam = el.fam;
    b.style.setProperty('--c', f.colour);
    b.style.setProperty('--i', idx++);
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', `${el.name}, element ${el.n}, ${f.name}, period ${period}`);
    b.innerHTML = `<span class="el-n" aria-hidden="true">${el.n}</span><span class="el-dots" aria-hidden="true">${'<i></i>'.repeat(period)}</span><span class="el-sym" aria-hidden="true">${el.sym}</span><span class="el-name" aria-hidden="true">${el.name}</span>`;
    b.addEventListener('click', () => selectElement(el, true));
    ptable.append(b);
  });
}

function selectElement(el, animate) {
  current = el;
  const f = FAM[el.fam];
  $$('.el', ptable).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.sym === el.sym)));
  detail.style.setProperty('--c', f.colour);
  const set = (k, v) => { $(`[data-eld="${k}"]`, detail).textContent = v; };
  set('n', el.n); set('sym', el.sym); set('fam', `${f.name} · period ${el.period}`);
  set('name', el.name); set('note', el.note); set('use', el.use); set('pairs', el.pairs.join(', '));
  $('[data-eld="bars"]', detail).innerHTML = AXES.map((a, i) => `<div class="bar" style="--c:${a.colour}"><span>${a.label}</span><span class="bar-t"><i style="--w:${el.p[i] * 10}%"></i></span><b>${el.p[i]}</b></div>`).join('');
  if (animate && !reduced) { detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap'); }
}
selectElement(current, false);

$$('.el-filters .chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    famFilter = chip.dataset.fam;
    $$('.el-filters .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
    $$('.el', ptable).forEach((b) => b.classList.toggle('is-dim', famFilter !== 'all' && b.dataset.fam !== famFilter));
    if (famFilter !== 'all' && current.fam !== famFilter) {
      selectElement(ELEMENTS.find((e) => e.fam === famFilter && e.period === 2), true);
    }
  });
});

$('[data-dose]').addEventListener('click', () => {
  const p = mixFromProfile(current.p);
  const m = {};
  AXES.forEach((a) => { m[a.key] = state.mix[a.key] * 0.35 + p[a.key] * 0.65; });
  setMix(m, `Dosed with ${current.name}. The composer has been re-balanced.`);
  $('#compose').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  setTimeout(() => $(`#f-${current.fam}`).focus({ preventScroll: true }), reduced ? 0 : 700);
});

if (!reduced && 'IntersectionObserver' in window) {
  ptable.classList.add('pre');
  const pio = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    pio.disconnect();
    ptable.classList.remove('pre');
    ptable.classList.add('pop');
    setTimeout(() => ptable.classList.remove('pop'), ELEMENTS.length * 45 + 800);
  }, { threshold: 0.25 });
  pio.observe(ptable);
}

/* ------------------------------------------------------------------ */
/* Methods — sticky apparatus                                           */
/* ------------------------------------------------------------------ */
const apparatus = $('#apparatus');
const CAPS = {
  1: 'Clarify — curds settle and the liquid turns clear.',
  2: 'Infuse — under vacuum, leaves give up their flavour in minutes.',
  3: 'Ferment — a living culture feeds, breathes and lifts the drink.',
  4: 'Carbonate — chilled, sealed and charged with gas.',
};
const steps = $$('.step');
function setStep(n) {
  apparatus.setAttribute('data-step', n);
  steps.forEach((s) => s.classList.toggle('is-active', s.dataset.step === String(n)));
  $('[data-fig]').textContent = n;
  $('[data-figname]').textContent = CAPS[n];
}
if ('IntersectionObserver' in window) {
  const sio = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) setStep(+en.target.dataset.step); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach((s) => sio.observe(s));
} else steps.forEach((s) => s.classList.add('is-active'));

/* ------------------------------------------------------------------ */
/* Shelf                                                                */
/* ------------------------------------------------------------------ */
const track = $('#track');
const dialog = $('#drink-dialog');
let lastTrigger = null;
let dialogMix = null;
const formulaHTML = (mix) => AXES.map((a) => `<span style="--c:${a.colour}"><span aria-hidden="true">${a.sym}<sub>${mix[a.key]}</sub></span><span class="sr-only">${a.label} ${mix[a.key]}</span></span>`).join('');
const GLASS_NAME = { highball: 'Highball', rocks: 'Rocks', coupe: 'Coupe', nick: 'Nick & Nora', flute: 'Flute', bottle: 'Bottle' };

DRINKS.forEach((d, i) => {
  const li = document.createElement('li');
  li.className = 'drink';
  li.dataset.mood = [...d.mood, d.zero ? 'zero' : ''].join(' ');
  const cols = uiColours(d.mix);
  li.innerHTML = `<button type="button" class="drink-btn" aria-haspopup="dialog">
    <span class="g-art">${glassSVG(d, cols, 's-' + d.id)}</span>
    <span class="g-label" style="--tilt:${i % 2 ? 1.4 : -1.2}deg">
      <span class="g-name">${d.name}</span>
      <span class="g-line">${d.line}</span>
      <span class="g-meta">${d.mood.map((m) => `<span>${m[0].toUpperCase() + m.slice(1)}</span>`).join('')}${d.zero ? '<span class="z">Zero-proof</span>' : ''}</span>
    </span></button>`;
  $('button', li).addEventListener('click', (e) => openDrink(d, e.currentTarget));
  track.append(li);
});

function openDrink(d, trigger) {
  lastTrigger = trigger;
  dialogMix = d.mix;
  const set = (k, v) => { $(`[data-dd="${k}"]`, dialog).textContent = v; };
  $('[data-dd="art"]', dialog).innerHTML = glassSVG(d, uiColours(d.mix), 'd-' + d.id);
  set('kicker', `Season 04 · ${d.mood.join(' / ')}`);
  set('name', d.name); set('line', d.line);
  set('glass', GLASS_NAME[d.glass]); set('method', d.method); set('garnish', d.garnish);
  set('zero', d.zero ? 'Zero-proof' : 'Contains alcohol');
  $('[data-dd="formula"]', dialog).innerHTML = formulaHTML(d.mix);
  if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
  $('[data-close]', dialog).focus();
}
function closeDrink() {
  if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
}
dialog.addEventListener('close', () => { if (lastTrigger) lastTrigger.focus(); });
$('[data-close]', dialog).addEventListener('click', closeDrink);
dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDrink(); });
$('[data-load]', dialog).addEventListener('click', () => {
  const name = $('[data-dd="name"]', dialog).textContent;
  lastTrigger = null;
  closeDrink();
  setMix(dialogMix, `Loaded ${name} from the shelf. Change anything you like.`);
  $('#compose').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  setTimeout(() => $('#f-sweet').focus({ preventScroll: true }), reduced ? 0 : 700);
});

const countEl = $('[data-shelf-count]');
function filterShelf(mood) {
  let n = 0;
  $$('.drink', track).forEach((li) => {
    const show = mood === 'all' || li.dataset.mood.split(' ').includes(mood);
    li.hidden = !show;
    if (show) n++;
  });
  countEl.textContent = mood === 'all' ? `All ${n} drinks on the shelf.` : `Showing ${n} of ${DRINKS.length} drinks.`;
  track.scrollTo({ left: 0, behavior: reduced ? 'auto' : 'smooth' });
}
$$('.sh-filters .chip').forEach((chip) => chip.addEventListener('click', () => {
  $$('.sh-filters .chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
  filterShelf(chip.dataset.mood);
}));
filterShelf('all');
$$('[data-shelf]').forEach((b) => b.addEventListener('click', () => {
  const card = $('.drink:not([hidden])', track);
  const w = card ? card.getBoundingClientRect().width : 280;
  track.scrollBy({ left: (b.dataset.shelf === 'next' ? 1 : -1) * w, behavior: reduced ? 'auto' : 'smooth' });
}));

/* session batch log */
const mineWrap = $('#mine');
const mineList = $('[data-mine]');
function renderLog() {
  mineWrap.hidden = state.log.length === 0;
  mineList.innerHTML = '';
  state.log.forEach((e) => {
    const li = document.createElement('li');
    li.className = 'mine-item';
    const cols = uiColours(e.mix);
    li.innerHTML = `<span class="tube" style="--a:${cols[0]};--b:${cols[1]};--c:${cols[2]}" aria-hidden="true"></span>
      <span><b></b><small>Batch ${String(e.batch).padStart(3, '0')} · ${AXES.map((a) => a.sym + e.mix[a.key]).join(' ')}</small></span>
      <span class="mine-acts"><button type="button" class="btn" data-act="load">Load</button><button type="button" class="btn btn-quiet" data-act="remove">Remove</button></span>`;
    $('b', li).textContent = e.name;
    $('[data-act="load"]', li).setAttribute('aria-label', `Load ${e.name} into the composer`);
    $('[data-act="remove"]', li).setAttribute('aria-label', `Remove ${e.name} from your batch log`);
    $('[data-act="load"]', li).addEventListener('click', () => {
      setMix(e.mix, `Loaded ${e.name} from your batch log.`);
      $('#compose').scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
    $('[data-act="remove"]', li).addEventListener('click', () => {
      state.log = state.log.filter((x) => x.id !== e.id);
      store.set('log', state.log);
      renderLog();
      const next = $('.mine-item button', mineList);
      if (next) next.focus(); else $('[data-save]').focus();
    });
    mineList.append(li);
  });
}
renderLog();

/* ------------------------------------------------------------------ */
/* Booking form                                                         */
/* ------------------------------------------------------------------ */
const form = $('#book-form');
const dateIn = $('#bk-date');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = new Date(); today.setHours(0, 0, 0, 0);
const minD = new Date(today); minD.setDate(minD.getDate() + 1);
const maxD = new Date(today); maxD.setDate(maxD.getDate() + 365);
dateIn.min = iso(minD); dateIn.max = iso(maxD);

function fieldError(id, msg) {
  const err = $(`#${id}-err`);
  const input = $(`#${id}`);
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  err.textContent = msg || '';
  err.hidden = !msg;
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = String(data.get('name') || '').trim();
  const email = String(data.get('email') || '').trim();
  const session = data.get('session');
  const date = String(data.get('date') || '');
  const errs = [];
  if (name.length < 2) { fieldError('bk-name', 'Please tell us your name.'); errs.push('#bk-name'); } else fieldError('bk-name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { fieldError('bk-email', 'Please enter an email like name@example.com.'); errs.push('#bk-email'); } else fieldError('bk-email');
  const sErr = $('#bk-session-err');
  if (!session) { sErr.textContent = 'Choose one of the three sessions.'; sErr.hidden = false; errs.push('input[name="session"]'); } else { sErr.hidden = true; sErr.textContent = ''; }
  const d = date ? new Date(date + 'T00:00:00') : null;
  if (!d || Number.isNaN(d.getTime())) { fieldError('bk-date', 'Pick a date for your visit.'); errs.push('#bk-date'); }
  else if (d < minD || d > maxD) { fieldError('bk-date', 'Choose a date between tomorrow and a year from now.'); errs.push('#bk-date'); }
  else fieldError('bk-date');
  const done = $('#bk-done');
  if (errs.length) { done.hidden = true; $(errs[0]).focus(); return; }
  const guests = data.get('guests');
  const attach = data.get('attach') ? state.name : null;
  const when = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
  done.innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = 'Request drafted — not sent.';
  const p = document.createElement('p');
  p.textContent = `Thanks, ${name}. This is a portfolio demo, so no seat was booked and nothing left your browser. In a real studio we would write to ${email} about a ${session} for ${guests} on ${when}${attach ? `, starting from your ${attach}` : ''}.`;
  done.append(strong, p);
  done.hidden = false;
  done.focus();
});
$$('#book-form input, #book-form select').forEach((el) => el.addEventListener('input', () => {
  if (el.getAttribute('aria-invalid') === 'true') fieldError(el.id);
  if (el.name === 'session') { $('#bk-session-err').hidden = true; }
}));

/* ------------------------------------------------------------------ */
/* Header, nav state, reveals                                           */
/* ------------------------------------------------------------------ */
const menuBtn = $('.menu-btn');
const nav = $('#nav');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  $('.menu-label').textContent = open ? 'Close' : 'Menu';
  if (open) $('a', nav).focus();
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
$$('a', nav).forEach((a) => a.addEventListener('click', () => { if (nav.classList.contains('is-open')) setMenu(false); }));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); menuBtn.focus(); }
});
matchMedia('(min-width: 1001px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

if ('IntersectionObserver' in window) {
  const links = $$('a', nav);
  const nio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => {
        if (a.getAttribute('href') === '#' + en.target.id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  $$('main > section').forEach((s) => nio.observe(s));

  const fills = $$('.fill-title');
  if (reduced) fills.forEach((f) => f.classList.add('is-in'));
  else {
    const fio = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); fio.unobserve(en.target); } });
    }, { threshold: 0.6 });
    fills.forEach((f) => fio.observe(f));
  }
} else $$('.fill-title').forEach((f) => f.classList.add('is-in'));
