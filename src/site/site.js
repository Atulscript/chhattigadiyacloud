// Chhattisgadhiya Cloud - shared page behaviour: menu, theme, forms,
// newsletter and the install prompt.
(function () {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CONFIG = window.CC_CONFIG || {};
  function store(kind) {
    return {
      get: function (k) { try { return window[kind].getItem(k); } catch (e) { return null; } },
      set: function (k, v) { try { window[kind].setItem(k, v); } catch (e) { /* storage unavailable */ } },
      remove: function (k) { try { window[kind].removeItem(k); } catch (e) { /* storage unavailable */ } },
    };
  }
  var local = store('localStorage');
  var session = store('sessionStorage');

  function openDialog(d) { if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', ''); }
  function closeDialog(d) { if (typeof d.close === 'function') d.close(); else d.removeAttribute('open'); }

  // ---- Menu ----
  var drawer = document.getElementById('cc-drawer');
  var menuButtons = document.querySelectorAll('[data-cc-menu]');
  function setExpanded(open) {
    for (var i = 0; i < menuButtons.length; i++) menuButtons[i].setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  for (var i = 0; i < menuButtons.length; i++) menuButtons[i].addEventListener('click', function () { openDialog(drawer); setExpanded(true); });
  if (drawer) {
    drawer.addEventListener('close', function () { setExpanded(false); });
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.closest('[data-cc-menu-close]') || e.target.closest('a:not([data-cc-form])')) closeDialog(drawer);
    });
  }

  // ---- Theme: light by default; dark only when chosen ----
  function applyTheme(value) {
    if (value === 'dark') { document.documentElement.setAttribute('data-theme', 'dark'); local.set('cc-theme', 'dark'); }
    else { document.documentElement.removeAttribute('data-theme'); local.remove('cc-theme'); value = 'light'; }
    var buttons = document.querySelectorAll('[data-cc-theme] button');
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-theme-value') === value ? 'true' : 'false');
    var toggles = document.querySelectorAll('[data-cc-theme-toggle]');
    for (var j = 0; j < toggles.length; j++) {
      var label = toggles[j].getAttribute(value === 'dark' ? 'data-label-light' : 'data-label-dark');
      toggles[j].setAttribute('aria-pressed', value === 'dark' ? 'true' : 'false');
      toggles[j].setAttribute('aria-label', label);
      toggles[j].setAttribute('title', label);
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', value === 'dark' ? '#14120F' : '#FAF6EF');
  }
  var animTimer;
  function switchTheme(value) {
    var root = document.documentElement;
    root.classList.add('cc-theme-anim');
    applyTheme(value);
    clearTimeout(animTimer);
    animTimer = setTimeout(function () { root.classList.remove('cc-theme-anim'); }, 400);
  }
  applyTheme(local.get('cc-theme') === 'dark' ? 'dark' : 'light');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cc-theme] button');
    if (b) switchTheme(b.getAttribute('data-theme-value'));
    if (e.target.closest('[data-cc-theme-toggle]')) switchTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  // ---- Short forms (dialogs and inline) ----
  function digits(s) { return String(s || '').replace(/\D/g, ''); }

  function summarise(form) {
    var lines = [form.getAttribute('data-cc-form-title')];
    var fields = form.querySelectorAll('.cc-field');
    for (var i = 0; i < fields.length; i++) {
      var control = fields[i].querySelector('input, select, textarea');
      var label = fields[i].querySelector('label');
      if (!control || !control.value) continue;
      var value = control.tagName === 'SELECT' ? control.options[control.selectedIndex].text : control.value.trim();
      if (value) lines.push(label.textContent + ': ' + value);
    }
    return lines.join('\n');
  }

  function showDone(form, mode, text) {
    var wrap = form.parentNode;
    var done = wrap.querySelector('.cc-done');
    var p = done.querySelector('[data-cc-done-text]');
    var summary = done.querySelector('[data-cc-summary]');
    var wa = done.querySelector('[data-cc-send="whatsapp"]');
    var mail = done.querySelector('[data-cc-send="email"]');
    p.textContent = p.getAttribute(mode === 'sent' ? 'data-sent' : 'data-handoff');
    summary.hidden = mode === 'sent';
    summary.textContent = text;
    var whatsapp = digits(CONFIG.whatsapp);
    wa.hidden = mode === 'sent' || !whatsapp;
    wa.href = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(text);
    mail.hidden = mode === 'sent' || !CONFIG.email;
    mail.href = 'mailto:' + CONFIG.email + '?subject=' + encodeURIComponent(form.getAttribute('data-cc-form-title')) + '&body=' + encodeURIComponent(text);
    form.hidden = true;
    done.hidden = false;
    var focusTarget = done.querySelector('h2');
    if (focusTarget) { focusTarget.setAttribute('tabindex', '-1'); focusTarget.focus(); }
  }

  function resetForm(form) {
    form.reset();
    form.hidden = false;
    var done = form.parentNode.querySelector('.cc-done');
    if (done) done.hidden = true;
    var err = form.querySelector('.cc-form-error');
    if (err) err.hidden = true;
    var marked = form.querySelectorAll('[aria-invalid]');
    for (var i = 0; i < marked.length; i++) marked[i].removeAttribute('aria-invalid');
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('.cc-form');
    if (!form) return;
    e.preventDefault();
    var err = form.querySelector('.cc-form-error');
    var controls = form.querySelectorAll('input, select, textarea');
    var invalid = [];
    for (var c = 0; c < controls.length; c++) {
      var el = controls[c];
      var bad = (el.required && !el.value.trim()) || (el.type === 'email' && el.value && !el.checkValidity());
      if (el.name === 'phone' && el.value.trim() && (digits(el.value).length < 10 || digits(el.value).length > 13)) bad = 'phone';
      if (bad) invalid.push([el, bad]); else el.removeAttribute('aria-invalid');
    }
    if (invalid.length) {
      invalid.forEach(function (pair) { pair[0].setAttribute('aria-invalid', 'true'); pair[0].setAttribute('aria-describedby', err.id + (pair[0].getAttribute('data-hint') ? ' ' + pair[0].getAttribute('data-hint') : '')); });
      err.textContent = err.getAttribute(invalid.length === 1 && invalid[0][1] === 'phone' ? 'data-phone' : 'data-required');
      err.hidden = false;
      invalid[0][0].focus();
      return;
    }
    err.hidden = true;
    var text = summarise(form);

    if (CONFIG.formsEndpoint) {
      var btn = form.querySelector('[type="submit"]');
      var label = btn.textContent;
      btn.disabled = true; btn.textContent = btn.getAttribute('data-sending');
      var payload = { form: form.getAttribute('data-cc-form-id').replace(/-inline$/, ''), lang: document.documentElement.lang, page: location.pathname, fields: {} };
      var data = new FormData(form);
      data.forEach(function (v, k) { payload.fields[k] = v; });
      fetch(CONFIG.formsEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (res) { if (!res.ok) throw res; showDone(form, 'sent', text); })
        .catch(function () { err.textContent = err.getAttribute('data-failed'); err.hidden = false; })
        .then(function () { btn.disabled = false; btn.textContent = label; });
      return;
    }
    showDone(form, 'handoff', text);
  });

  // Clear the error mark as soon as a field is corrected.
  document.addEventListener('input', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
  });

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-cc-form]');
    if (trigger) {
      var dialog = document.getElementById('form-' + trigger.getAttribute('data-cc-form'));
      if (!dialog) return; // falls back to the contact page link
      e.preventDefault();
      if (drawer && drawer.open) closeDialog(drawer);
      var form = dialog.querySelector('.cc-form');
      resetForm(form);
      var prefill = trigger.getAttribute('data-cc-prefill');
      if (prefill) {
        try {
          var values = JSON.parse(prefill);
          Object.keys(values).forEach(function (k) { if (form.elements[k]) form.elements[k].value = values[k]; });
        } catch (err) { /* ignore malformed prefill */ }
      }
      openDialog(dialog);
      var first = form.querySelector('input, select, textarea');
      if (first) first.focus();
      return;
    }
    var close = e.target.closest('[data-cc-dialog-close]');
    if (close) {
      var d = close.closest('dialog');
      if (d) closeDialog(d);
      else { var inline = close.closest('[data-cc-inline-form]'); if (inline) resetForm(inline.querySelector('.cc-form')); }
      return;
    }
    if (e.target.classList && e.target.classList.contains('cc-dialog')) closeDialog(e.target); // backdrop
  });

  // Deep links such as /contact/#form-booking open the matching dialog.
  var hashForm = /^#form-([a-z]+)$/.exec(location.hash);
  var hashTarget = hashForm && document.getElementById('form-' + hashForm[1]);
  if (hashTarget && hashTarget.tagName === 'DIALOG') {
    openDialog(hashTarget);
  }

  // ---- Newsletter ----
  // Posts to data-cc-endpoint when configured; otherwise opens a pre-filled
  // email to the organisation so the request actually reaches someone.
  var signup = document.querySelector('[data-cc-signup]');
  if (signup) {
    var msg = signup.querySelector('[data-cc-signup-msg]');
    signup.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = signup.querySelector('input[type="email"]');
      var email = input.value.trim();
      if (!email || !input.checkValidity()) {
        msg.textContent = msg.getAttribute('data-invalid'); msg.classList.add('is-error'); input.focus(); return;
      }
      msg.classList.remove('is-error');
      var endpoint = signup.getAttribute('data-cc-endpoint');
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, lang: document.documentElement.lang, page: location.pathname }) })
          .then(function (res) { if (!res.ok) throw res; msg.textContent = '✓'; signup.reset(); })
          .catch(function () { msg.textContent = msg.getAttribute('data-invalid'); msg.classList.add('is-error'); });
        return;
      }
      var to = signup.getAttribute('data-cc-mailto');
      if (to) window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Newsletter') + '&body=' + encodeURIComponent('Please add me to the mailing list: ' + email);
      msg.textContent = msg.getAttribute('data-done');
      signup.reset();
    });
  }

  // ---- Back to top ----
  var top = document.querySelector('[data-cc-top]');
  if (top) top.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    var skip = document.querySelector('.cc-brand');
    if (skip) skip.focus({ preventScroll: true });
  });

  // ---- Install prompt ----
  // Shown at most once ever, and only from a visitor's second visit onwards.
  if (!session.get('cc-visit-counted')) {
    session.set('cc-visit-counted', '1');
    local.set('cc-visits', String(parseInt(local.get('cc-visits') || '0', 10) + 1));
  }
  var deferredPrompt = null;
  var toast = document.querySelector('[data-cc-install-toast]');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    var visits = parseInt(local.get('cc-visits') || '0', 10);
    if (toast && visits >= 2 && !local.get('cc-install-shown')) {
      toast.hidden = false;
      local.set('cc-install-shown', '1');
    }
  });
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-cc-install]') && deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () { deferredPrompt = null; if (toast) toast.hidden = true; });
    }
    if (e.target.closest('[data-cc-install-dismiss]') && toast) toast.hidden = true;
  });
  window.addEventListener('appinstalled', function () { if (toast) toast.hidden = true; });
})();

// Floating share bar: live page URL for the share links, phone toggle.
(function () {
  'use strict';
  var bar = document.querySelector('[data-cc-share]');
  if (!bar) return;
  var url = location.href.split('#')[0];
  var title = document.title;
  var u = encodeURIComponent(url);
  var set = function (sel, href) { var a = bar.querySelector(sel); if (a) a.href = href; };
  set('[data-cc-share-fb]', 'https://www.facebook.com/sharer/sharer.php?u=' + u);
  set('[data-cc-share-x]', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + encodeURIComponent(title));
  set('[data-cc-share-wa]', 'https://wa.me/?text=' + encodeURIComponent(title + ' ') + u);

  var toggle = bar.querySelector('.cc-share__toggle');
  function setOpen(open) {
    bar.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  toggle.addEventListener('click', function () { setOpen(!bar.classList.contains('is-open')); });
  document.addEventListener('click', function (e) { if (!bar.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && bar.classList.contains('is-open')) { setOpen(false); toggle.focus(); } });
  bar.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });

})();

// Header "More" dropdown: click/tap toggles (hover also opens it on desktop),
// Escape or a click elsewhere closes it.
(function () {
  'use strict';
  var more = document.querySelector('[data-cc-more]');
  if (!more) return;
  var btn = more.querySelector('button');
  function setOpen(open) {
    more.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setOpen(!more.classList.contains('is-open')); });
  document.addEventListener('click', function (e) { if (!more.contains(e.target)) setOpen(false); });
  more.addEventListener('focusout', function (e) { if (!more.contains(e.relatedTarget)) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && more.classList.contains('is-open')) { setOpen(false); btn.focus(); }
  });
})();

// Event status tags: recompute Open / Upcoming / Closed from the dates in the
// visitor's browser (same rule as src/site/events.js), so a page built weeks
// ago still shows the right tag.
(function () {
  'use strict';
  var now = new Date();
  var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  [].forEach.call(document.querySelectorAll('[data-cc-status]'), function (el) {
    var start = Date.parse(el.getAttribute('data-start'));
    var end = Date.parse(el.getAttribute('data-end'));
    var days = parseInt(el.getAttribute('data-open-days'), 10) || 30;
    if (isNaN(start) || isNaN(end)) return;
    var status = end < today ? 'closed' : (start - today <= days * 86400000 ? 'open' : 'upcoming');
    var labels;
    try { labels = JSON.parse(el.getAttribute('data-labels')); } catch (e) { return; }
    el.className = 'cc-status cc-status--' + status;
    el.textContent = labels[status];
  });
})();

// "Starts in N days" / "On now" under home page event tickets.
(function () {
  'use strict';
  var L = {
    en: { now: 'On now', today: 'Starts today', tomorrow: 'Starts tomorrow', days: 'Starts in {n} days', months: 'In about {n} months' },
    hi: { now: 'अभी जारी है', today: 'आज से शुरू', tomorrow: 'कल से शुरू', days: '{n} दिन में शुरू', months: 'लगभग {n} महीने में' },
  };
  var now = new Date();
  var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  [].forEach.call(document.querySelectorAll('[data-cc-countdown]'), function (el) {
    var start = Date.parse(el.getAttribute('data-start'));
    var end = Date.parse(el.getAttribute('data-end'));
    var t = L[el.getAttribute('data-lang')] || L.en;
    if (isNaN(start) || end < today) return;
    var days = Math.round((start - today) / 86400000);
    var text = days <= 0 ? t.now : days === 1 ? t.tomorrow : days <= 60 ? t.days.replace('{n}', days) : t.months.replace('{n}', Math.round(days / 30));
    if (days === 0) text = t.today;
    if (start < today) text = t.now;
    el.textContent = text;
    el.hidden = false;
  });
})();

// Scroll reveal: sections and cards fade and rise in as they reach the
// viewport, a few at a time. Uses the separate `translate` property so card
// hover effects (which use `transform`) keep working, and drops the helper
// classes once the element has arrived. Off for reduced motion.
// Also counts up numeric stats (data-cc-count) the first time they show.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  var root = document.documentElement;
  var sel = '.cc-section-head, .hm-card, .cc-ticket, .hm-play, .hm-root, .hm-critic, .hm-artist, .hm-gallery__item, .cc-card, .cc-feature, .cc-event, .cc-stat, .cc-callout, .hm-mag__grid > *, .cc-signup__panel';
  var items = [].slice.call(document.querySelectorAll(sel)).filter(function (el) {
    if (el.closest('.hs, dialog')) return false;
    // Items in a sideways scroller (gallery, critics on phones) stay put.
    var strip = el.parentElement && el.parentElement.closest('.hm-gallery__grid, [data-cc-autoslide]');
    return !(strip && strip.scrollWidth > strip.clientWidth + 4);
  });
  root.classList.add('cc-reveal-on');
  items.forEach(function (el) {
    var i = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
    el.style.setProperty('--rv-d', (i % 4) * 90 + 'ms');
    el.classList.add('cc-rv');
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      io.unobserve(el);
      el.classList.add('is-in');
      setTimeout(function () { el.classList.remove('cc-rv', 'is-in'); el.style.removeProperty('--rv-d'); }, 1200);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });

  var counters = document.querySelectorAll('[data-cc-count]');
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target;
      var raw = el.getAttribute('data-cc-count');
      var target = parseInt(raw.replace(/\D/g, ''), 10);
      var comma = raw.indexOf(',') > -1;
      var plus = /\+$/.test(raw) ? '+' : '';
      var t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / 1400);
        var v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = (comma ? v.toLocaleString('en-US') : String(v)) + plus;
        if (p < 1) requestAnimationFrame(step); else el.textContent = raw;
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  [].forEach.call(counters, function (el) { cio.observe(el); });
})();

// Swipe sliders ([data-cc-autoslide]): on narrow screens the list scrolls
// sideways; dots show the position and a gentle autoplay advances every 6s
// while it is on screen, until the visitor touches it. Off for reduced motion.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(document.querySelectorAll('[data-cc-autoslide]'), function (list) {
    var slides = [].slice.call(list.children);
    if (slides.length < 2) return;
    var dots = document.createElement('div');
    dots.className = 'cc-slide-dots';
    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (i + 1) + ' / ' + slides.length);
      b.addEventListener('click', function () { stop(); go(i); });
      dots.appendChild(b);
    });
    list.parentNode.insertBefore(dots, list.nextSibling);
    function sliding() { return list.scrollWidth > list.clientWidth + 4; }
    function current() {
      var x = list.scrollLeft + list.clientWidth / 2, best = 0, d = Infinity;
      slides.forEach(function (s, i) { var c = s.offsetLeft - list.offsetLeft + s.offsetWidth / 2; if (Math.abs(c - x) < d) { d = Math.abs(c - x); best = i; } });
      return best;
    }
    function mark() { var c = current(); [].forEach.call(dots.children, function (b, i) { if (i === c) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); }); }
    function go(i) { var s = slides[i]; list.scrollTo({ left: s.offsetLeft - list.offsetLeft - parseFloat(getComputedStyle(list).paddingLeft || 0), behavior: reduce ? 'auto' : 'smooth' }); }
    var timer = null, visible = false, stopped = reduce;
    function stop() { stopped = true; clearInterval(timer); }
    function tick() { if (!stopped && visible && sliding() && !document.hidden) go((current() + 1) % slides.length); }
    list.addEventListener('scroll', function () { window.requestAnimationFrame(mark); }, { passive: true });
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) { list.addEventListener(ev, stop, { passive: true }); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.5 }).observe(list);
    if (!stopped) timer = setInterval(tick, 6000);
    mark();
  });
})();

// Festival countdown bar: shown from 30 days before the start to the last
// day, text computed in the browser; closing it hides this festival's bar
// for good. The hero shrinks by the bar's height (--cc-bar-h) so it still
// fits on one screen.
(function () {
  'use strict';
  var bar = document.querySelector('[data-cc-countdown-bar]');
  if (!bar) return;
  var key = 'cc-cd-closed-' + bar.getAttribute('data-id');
  try { if (localStorage.getItem(key)) return; } catch (e) {}
  var now = new Date();
  var today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  var start = Date.parse(bar.getAttribute('data-start'));
  var end = Date.parse(bar.getAttribute('data-end'));
  if (isNaN(start) || end < today || start - today > 30 * 86400000) return;
  var L = JSON.parse(bar.getAttribute('data-labels'));
  var days = Math.round((start - today) / 86400000);
  var text = start < today ? L.now : days === 0 ? L.today : days === 1 ? L.tomorrow : L.soon.replace('{n}', days);
  bar.querySelector('[data-cc-cd-text]').textContent = text;
  bar.hidden = false;
  var root = document.documentElement;
  function size() { root.style.setProperty('--cc-bar-h', bar.hidden ? '0px' : bar.offsetHeight + 'px'); }
  size();
  window.addEventListener('resize', size);
  bar.querySelector('[data-cc-cd-close]').addEventListener('click', function () {
    bar.hidden = true; size();
    try { localStorage.setItem(key, '1'); } catch (e) {}
  });
})();

// Photo viewer for [data-cc-lightbox] lists of links to images: full-screen
// dialog with caption, previous/next, arrow keys, swipe and Escape. Without
// JavaScript the links simply open the image.
(function () {
  'use strict';
  var lists = document.querySelectorAll('[data-cc-lightbox]');
  if (!lists.length || typeof HTMLDialogElement !== 'function') return;
  var hi = document.documentElement.lang === 'hi';
  var L = hi ? { close: 'बंद करें', prev: 'पिछला चित्र', next: 'अगला चित्र' } : { close: 'Close', prev: 'Previous photo', next: 'Next photo' };
  var dlg = document.createElement('dialog');
  dlg.className = 'cc-lightbox';
  dlg.setAttribute('aria-label', hi ? 'चित्र' : 'Photo');
  dlg.innerHTML =
    '<figure class="cc-lightbox__fig"><img alt=""><figcaption><span class="cc-lightbox__count"></span><span class="cc-lightbox__cap"></span></figcaption></figure>' +
    '<button type="button" class="cc-lightbox__btn cc-lightbox__close" aria-label="' + L.close + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
    '<button type="button" class="cc-lightbox__btn cc-lightbox__prev" aria-label="' + L.prev + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg></button>' +
    '<button type="button" class="cc-lightbox__btn cc-lightbox__next" aria-label="' + L.next + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button>';
  document.body.appendChild(dlg);
  var img = dlg.querySelector('img'), cap = dlg.querySelector('.cc-lightbox__cap'), count = dlg.querySelector('.cc-lightbox__count');
  var links = [], index = 0, opener = null;
  function show(i) {
    index = (i + links.length) % links.length;
    var a = links[index], inner = a.querySelector('img');
    img.classList.remove('is-in');
    img.src = a.getAttribute('href');
    img.alt = inner ? inner.alt : '';
    cap.textContent = a.getAttribute('data-caption') || '';
    count.textContent = (index + 1) + ' / ' + links.length;
  }
  img.addEventListener('load', function () { img.classList.add('is-in'); });
  function open(list, a) {
    links = [].slice.call(list.querySelectorAll('a[href]'));
    opener = a;
    show(links.indexOf(a));
    dlg.showModal();
    document.documentElement.classList.add('cc-lightbox-open');
  }
  dlg.addEventListener('close', function () { document.documentElement.classList.remove('cc-lightbox-open'); if (opener) opener.focus(); });
  dlg.querySelector('.cc-lightbox__close').addEventListener('click', function () { dlg.close(); });
  dlg.querySelector('.cc-lightbox__prev').addEventListener('click', function () { show(index - 1); });
  dlg.querySelector('.cc-lightbox__next').addEventListener('click', function () { show(index + 1); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { show(index - 1); e.preventDefault(); }
    else if (e.key === 'ArrowRight') { show(index + 1); e.preventDefault(); }
  });
  var sx = null;
  dlg.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  dlg.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1)); });
  [].forEach.call(lists, function (list) {
    list.addEventListener('click', function (e) {
      var a = e.target.closest('a[href]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      open(list, a);
    });
  });
})();
