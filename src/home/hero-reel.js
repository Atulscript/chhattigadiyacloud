// Chhattisgadhiya Cloud - cinematic photo reel in the home hero (browser).
// Markup: src/home/hero.js (renderHeroReel). Frames crossfade every
// data-interval seconds with a slow push-in; the next two photos are
// requested just before they are needed. Pauses with the button, when the
// tab is hidden or the hero is off screen. Reduced motion: first photo only.
(function () {
  'use strict';
  var root = document.querySelector('[data-hr]');
  if (!root) return;
  var frames = [].slice.call(root.querySelectorAll('[data-hr-frame]'));
  if (frames.length < 2) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var interval = (parseFloat(root.getAttribute('data-interval')) || 2) * 1000;
  var current = root.querySelector('[data-hr-current]');
  var bar = root.querySelector('[data-hr-bar]');
  var toggle = root.querySelector('[data-hr-toggle]');
  var index = 0, timer = null, stopped = reduce, visible = true;
  root.style.setProperty('--hr-interval', interval + 'ms');
  root.style.setProperty('--hr-fade', Math.min(1200, Math.round(interval * 0.4)) + 'ms');

  function load(i) {
    var img = frames[i % frames.length].querySelector('img');
    if (img && img.getAttribute('data-src')) {
      if (img.getAttribute('data-srcset')) img.setAttribute('srcset', img.getAttribute('data-srcset'));
      img.src = img.getAttribute('data-src');
      img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
    }
  }
  function show(i) {
    var prev = frames[index];
    index = (i + frames.length) % frames.length;
    var next = frames[index];
    prev.classList.remove('is-active'); prev.classList.add('is-leaving');
    setTimeout(function () { prev.classList.remove('is-leaving'); }, 1400);
    next.classList.add('is-active');
    if (current) current.textContent = (index + 1 < 10 ? '0' : '') + (index + 1);
    load(index + 1); load(index + 2);
    restartBar();
  }
  function restartBar() {
    if (!bar) return;
    bar.classList.remove('is-running'); void bar.offsetWidth;
    if (!stopped) bar.classList.add('is-running');
  }
  function tick() {
    if (stopped || !visible || document.hidden) return;
    var nextImg = frames[(index + 1) % frames.length].querySelector('img');
    // Wait for a slow photo rather than fading to a blank frame.
    if (nextImg && !nextImg.complete) { load(index + 1); return; }
    show(index + 1);
  }
  function run() { clearInterval(timer); if (!stopped) timer = setInterval(tick, interval); restartBar(); }
  function setStopped(v) {
    stopped = v;
    root.classList.toggle('is-paused', v);
    if (toggle) toggle.setAttribute('aria-label', toggle.getAttribute(v ? 'data-label-play' : 'data-label-pause'));
    run();
  }
  if (toggle) toggle.addEventListener('click', function () { setStopped(!stopped); });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) restartBar(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.2 }).observe(root);
  }
  root.classList.add('is-ready');
  load(1); load(2);
  setStopped(stopped);
})();
