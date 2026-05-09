/* ============================================================
   COA Exam Prep — script.js
   All interactivity + special animation logic
   ============================================================ */
 
/* ─── PARTICLES ────────────────────────────────────────────── */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
 
  let W, H, particles = [];
  const COUNT = 60;
 
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();
 
  function rand(a, b) { return a + Math.random() * (b - a); }
 
  const COLORS = ['rgba(79,142,247,', 'rgba(124,58,237,', 'rgba(6,182,212,'];
 
  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = rand(0, W);
      this.y  = rand(0, H);
      this.r  = rand(0.8, 2.5);
      this.vx = rand(-0.25, 0.25);
      this.vy = rand(-0.4, -0.1);
      this.alpha = rand(0.2, 0.6);
      this.color = COLORS[Math.floor(rand(0, COLORS.length))];
      this.life = rand(60, 300);
      this.maxLife = this.life;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      if (this.life <= 0 || this.y < -10) this.reset();
    }
    draw() {
      const frac = this.life / this.maxLife;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color + (this.alpha * frac) + ')';
      ctx.fill();
    }
  }
 
  for (let i = 0; i < COUNT; i++) particles.push(new Particle());
 
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();
 
 
/* ─── PROGRESS BAR ─────────────────────────────────────────── */
window.addEventListener('scroll', () => {
  const h   = document.documentElement;
  const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
  document.getElementById('prog').style.width = pct + '%';
});
 
 
/* ─── CHAPTER TOGGLE ────────────────────────────────────────── */
function showChapter(id, btn) {
  const allSections = document.querySelectorAll('.chapter-section');
  const allBtns     = document.querySelectorAll('.ch-btn');
 
  allBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
 
  if (id === 'all') {
    allSections.forEach(s => {
      s.style.display = 'block';
      s.classList.add('active');
      triggerCardAnimations(s);
    });
  } else {
    allSections.forEach(s => {
      s.style.display = 'none';
      s.classList.remove('active');
    });
    const target = document.getElementById(id);
    if (target) {
      target.style.display = 'block';
      target.classList.add('active');
      triggerCardAnimations(target);
    }
  }
  window.scrollTo({ top: 60, behavior: 'smooth' });
}
 
/* re-trigger staggered card animation on chapter switch */
function triggerCardAnimations(section) {
  const cards = section.querySelectorAll('.topic-card');
  cards.forEach((card, i) => {
    card.style.animation = 'none';
    card.offsetHeight; // reflow
    card.style.animation = '';
    card.style.animationDelay = (i * 0.06) + 's';
  });
}
 
 
/* ─── SEARCH ────────────────────────────────────────────────── */
function handleSearch(val) {
  const q     = val.toLowerCase().trim();
  const cards = document.querySelectorAll('.topic-card');
 
  if (!q) {
    cards.forEach(c => { c.style.display = ''; });
    document.querySelectorAll('.chapter-section').forEach(s => {
      s.style.display = 'block';
      s.classList.add('active');
    });
    return;
  }
 
  document.querySelectorAll('.chapter-section').forEach(s => { s.style.display = 'block'; });
  cards.forEach(c => {
    const txt = c.textContent.toLowerCase();
    c.style.display = txt.includes(q) ? '' : 'none';
  });
}
 
 
/* ─── PIPELINE ANIMATION ────────────────────────────────────── */
function animatePipeline() {
  const stages = document.querySelectorAll('.pipeline-stage');
  if (!stages.length) return;
 
  let i = 0;
  function step() {
    stages.forEach(s => s.classList.remove('animate-flow'));
    stages[i].classList.add('animate-flow');
    i = (i + 1) % stages.length;
  }
  step();
  setInterval(step, 700);
}
 
 
/* ─── RIPPLE ON CARDS ───────────────────────────────────────── */
document.addEventListener('click', function(e) {
  const card = e.target.closest('.topic-card');
  if (!card) return;
 
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  const rect = card.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  ripple.style.cssText = `
    width:${size}px; height:${size}px;
    left:${e.clientX - rect.left - size/2}px;
    top:${e.clientY - rect.top - size/2}px;
  `;
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 700);
});
 
 
/* ─── KEYBOARD SHORTCUT ─────────────────────────────────────── */
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const search = document.getElementById('searchInput');
    if (search) { search.focus(); search.select(); }
  }
});
 
 
/* ─── RESPONSIVE SPAN-2 GRID FIX ───────────────────────────── */
function fixGrid() {
  const w      = window.innerWidth;
  const span2  = document.querySelectorAll('[style*="grid-column: span 2"]');
  span2.forEach(el => {
    el.style.gridColumn = w < 768 ? 'span 1' : 'span 2';
  });
}
window.addEventListener('resize', fixGrid);
fixGrid();
 
 
/* ─── OBSERVER: fade in cards as they scroll into view ─────── */
(function observeCards() {
  if (!('IntersectionObserver' in window)) return;
 
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'translateY(0) scale(1)';
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
 
  document.querySelectorAll('.topic-card').forEach(card => obs.observe(card));
})();
 
 
/* ─── COUNTER ANIMATION for stat-pills ─────────────────────── */
function animateCounters() {
  const pills = document.querySelectorAll('.stat-pill');
  const targets = [8, 50, 10, 5]; // approximate numeric targets
  pills.forEach((pill, i) => {
    const full = pill.textContent;
    // only animate if it starts with a digit
    const match = full.match(/^(\d+)/);
    if (!match) return;
    const target = parseInt(match[1]);
    let current  = 0;
    const step   = target / 30;
    const suffix = full.replace(/^\d+/, '');
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      pill.textContent = Math.round(current) + suffix;
      if (current >= target) clearInterval(interval);
    }, 40);
  });
}
 
 
/* ─── TOAST HELPER ──────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}
 
 
/* ─── SORT BAR DEMO ANIMATION ───────────────────────────────── */
function animateSortBars() {
  const bars = document.querySelectorAll('.sort-bar');
  if (!bars.length) return;
  const heights = Array.from(bars).map(() => Math.floor(Math.random() * 80) + 20);
  bars.forEach((b, i) => {
    b.style.height = heights[i] + '%';
  });
}
setInterval(animateSortBars, 2500);
 
 
/* ─── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // show all chapters on load
  document.querySelectorAll('.chapter-section').forEach(s => {
    s.style.display = 'block';
    s.classList.add('active');
  });
 
  animatePipeline();
  animateCounters();
 
  // keyboard shortcut hint toast
  setTimeout(() => showToast('💡 Press Ctrl+K to search'), 2000);
 
  // init sort bar heights
  animateSortBars();
});
 
