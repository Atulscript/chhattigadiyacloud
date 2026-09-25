// Chhattisgadhiya Cloud - homepage hero slider (browser).
// Markup is rendered at build time by src/home/hero.js. Without JavaScript the
// first slide shows on its own. This adds crossfades, autoplay (paused on
// hover, focus, touch, a hidden tab, or the pause button), arrows, dots,
// left/right keys and swipe. Autoplay is off when reduced motion is preferred.
(function () {
  'use strict';
  var root = document.querySelector('[data-hs]');
  if (!root) return;
  var slides = [].slice.call(root.querySelectorAll('[data-hs-slide]'));
  if (slides.length < 2) return;

  var controls = root.querySelector('[data-hs-controls]');
  var dots = [].slice.call(root.querySelectorAll('[data-hs-dot]'));
  var toggle = root.querySelector('[data-hs-toggle]');
  var current = root.querySelector('[data-hs-current]');
  var viewport = root.querySelector('[data-hs-viewport]');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var interval = (parseFloat(root.getAttribute('data-interval')) || 7) * 1000;
  var autoplay = root.getAttribute('data-autoplay') === 'true' && !reduce;

  var index = 0;
  var timer = null;
  var stopped = !autoplay;   // user pressed pause (or autoplay is off)
  var held = false;          // hover / focus / touch in progress

  root.style.setProperty('--hs-interval', interval + 'ms');
  controls.hidden = false;
  root.classList.add('is-ready');

  function go(to, fromUser) {
    var n = slides.length;
    to = (to + n) % n;
    if (to === index) return;
    var prev = slides[index];
    var next = slides[to];
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    prev.setAttribute('aria-hidden', 'true');
    prev.inert = true;
    window.setTimeout(function () { prev.classList.remove('is-leaving'); }, 1100);
    next.classList.add('is-active');
    next.removeAttribute('aria-hidden');
    next.inert = false;
    // Lazy slide images: make sure the one we show is requested now.
    var img = next.querySelector('img');
    if (img && img.loading === 'lazy') img.loading = 'eager';
    dots.forEach(function (d, i) { if (i === to) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    if (current) current.textContent = (to + 1 < 10 ? '0' : '') + (to + 1);
    index = to;
    preload(to + 1);
    if (fromUser) restart();
  }

  function preload(i) {
    var s = slides[i % slides.length];
    var img = s && s.querySelector('img');
    if (img && img.loading === 'lazy') img.loading = 'eager';
  }

  function schedule() {
    window.clearTimeout(timer);
    root.classList.remove('is-running');
    if (stopped || held || document.hidden) return;
    // Restart the progress bar animation on the active dot.
    void root.offsetWidth;
    root.classList.add('is-running');
    timer = window.setTimeout(function () { go(index + 1); schedule(); }, interval);
  }
  function restart() { schedule(); }

  function setStopped(v) {
    stopped = v;
    root.classList.toggle('is-paused', v);
    if (toggle) toggle.setAttribute('aria-label', toggle.getAttribute(v ? 'data-label-play' : 'data-label-pause'));
    schedule();
  }

  root.querySelector('[data-hs-prev]').addEventListener('click', function () { go(index - 1, true); });
  root.querySelector('[data-hs-next]').addEventListener('click', function () { go(index + 1, true); });
  dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i, true); }); });
  if (toggle) toggle.addEventListener('click', function () { setStopped(!stopped); });

  // Pause while the visitor is interacting.
  root.addEventListener('mouseenter', function () { held = true; schedule(); });
  root.addEventListener('mouseleave', function () { held = false; schedule(); });
  root.addEventListener('focusin', function () { held = true; schedule(); });
  root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { held = false; schedule(); } });
  document.addEventListener('visibilitychange', schedule);

  // Keyboard: left / right while focus is inside the slider.
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(index - 1, true); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { go(index + 1, true); e.preventDefault(); }
  });

  // Swipe (touch and pen). Vertical scrolling stays with the browser.
  var sx = 0; var sy = 0; var tracking = false;
  viewport.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    tracking = true; sx = e.clientX; sy = e.clientY; held = true; schedule();
  }, { passive: true });
  function end(e) {
    if (!tracking) return;
    tracking = false; held = false;
    var dx = e.clientX - sx; var dy = e.clientY - sy;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) go(index + (dx < 0 ? 1 : -1), true);
    else schedule();
  }
  viewport.addEventListener('pointerup', end, { passive: true });
  viewport.addEventListener('pointercancel', function () { tracking = false; held = false; schedule(); }, { passive: true });

  setStopped(stopped);
  preload(1);
})();
