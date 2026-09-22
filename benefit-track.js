(() => {
'use strict';
const FADE_OUT_MS = 300;
const ACTIVE = 0.4;
const STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1];

function canRender(row){
  return !!(row && row.publishAllowed && (row.mode === 'silent' || row.line));
}

function mount(file){
  const rows = [...(file.rows || [])].sort((a, b) => a.order - b.order);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const layer = document.querySelector('.benefit-track__line');

  rows.forEach((row) => {
    const cue = row.cue || (row.mode === 'lockup' ? row.line : '');
    if (cue) {
      document.querySelectorAll(`[data-track-line="${row.id}"]`).forEach((el) => {
        el.textContent = cue;
      });
    }
    if (row.mode === 'free' && row.line) {
      const sec = document.querySelector(`[data-track="${row.id}"]`);
      if (sec && !sec.querySelector('.track-caption')) {
        const p = document.createElement('p');
        p.className = 'track-caption';
        p.textContent = row.line;
        sec.insertBefore(p, sec.firstChild);
      }
    }
  });

  if (!layer || typeof IntersectionObserver === 'undefined') return;

  const ratios = new Map();
  const nodes = [...document.querySelectorAll('section[data-track], [data-sc-act][data-track]')];
  if (!nodes.length) return;

  let target = null;
  let timer = null;
  let visible = false;

  const show = (row) => {
    const play = row && row.mode === 'free' && row.line;
    layer.textContent = play ? row.line : '';
    layer.dataset.beat = play ? row.id : '';
    layer.classList.toggle('is-release', !!(row && row.release));
    if (play) {
      requestAnimationFrame(() => layer.classList.add('is-visible'));
      visible = true;
    } else {
      visible = false;
    }
  };

  const resolve = () => {
    let winner = null;
    let best = ACTIVE;
    rows.forEach((row) => {
      const ratio = ratios.get(row.id) || 0;
      if (ratio >= best) {
        best = ratio;
        winner = row.id;
      }
    });
    const row = winner ? byId.get(winner) : null;
    const next = row && canRender(row) && row.mode === 'free' ? row.id : null;
    if (next === target) return;
    target = next;
    layer.classList.remove('is-visible');
    if (timer) clearTimeout(timer);
    const wait = visible ? FADE_OUT_MS : 0;
    timer = setTimeout(() => show(next ? byId.get(next) : null), wait);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute('data-track');
      if (id) ratios.set(id, entry.intersectionRatio);
    });
    resolve();
  }, { threshold: STEPS });

  nodes.forEach((node) => observer.observe(node));
}

const src = document.querySelector('script[src*="benefit-track.js"]');
const url = src ? src.src.replace(/benefit-track.js.*$/, 'benefit-track.json') : 'benefit-track.json';
fetch(url).then((r) => r.ok ? r.json() : Promise.reject()).then(mount).catch(() => {});
})();
