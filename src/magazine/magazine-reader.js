// Chhattisgadhiya Cloud - Masik Patrika reader & checkout (browser).
//
// The page HTML is rendered at build time by src/magazine/components.js. It
// contains the free preview pages, the preview gate and a JSON config
// (#mz-config). This script adds behaviour on top:
//
//   MagazineAccess   - asks the backend (config.accessEndpoint) for locked pages
//                      when the visitor holds an access token. Nothing here can
//                      unlock pages on its own: locked content is never shipped.
//   MagazineReader   - page navigation, zoom, full screen, swipe/keys, gate.
//   MagazineCheckout - purchase / subscription dialog (config.checkoutEndpoint).

(function () {
  'use strict';

  var configEl = document.getElementById('mz-config');
  if (!configEl) return;
  var CONFIG = JSON.parse(configEl.textContent);
  var S = CONFIG.strings;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function fmt(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
  }

  var storage = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    remove: function (k) { try { window.localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } },
  };

  // -------------------------------------------------------------------------
  // Access: backend entitlement hook
  // -------------------------------------------------------------------------
  // Contract for config.accessEndpoint (to be implemented server-side):
  //   GET {endpoint}/issues/{issueId}/pages?from={n}&lang={lang}
  //   Authorization: Bearer {token}
  //   200 -> { "pages": [ { "page": 6, "html": "<header ...>…</header>" }, … ] }
  //   401/403 -> token invalid or no entitlement for this issue
  // After payment the backend redirects back with ?access_token=… which is
  // stored locally and stripped from the address bar.
  var TOKEN_KEY = 'mz-access-token';

  function MagazineAccess(options) {
    this.endpoint = (options.endpoint || '').replace(/\/+$/, '');
    this.issueId = options.issueId;
    this.lang = options.lang;
    this.captureTokenFromUrl();
  }

  MagazineAccess.prototype.captureTokenFromUrl = function () {
    if (!window.URL || !window.history || !history.replaceState) return;
    var url = new URL(window.location.href);
    var token = url.searchParams.get('access_token');
    if (!token) return;
    storage.set(TOKEN_KEY, token);
    url.searchParams.delete('access_token');
    history.replaceState(null, '', url.toString());
  };

  MagazineAccess.prototype.loadLockedPages = function (fromPage) {
    var token = storage.get(TOKEN_KEY);
    if (!this.endpoint || !token || !window.fetch) return Promise.resolve(null);
    var url = this.endpoint + '/issues/' + encodeURIComponent(this.issueId) + '/pages?from=' + fromPage + '&lang=' + this.lang;
    return fetch(url, { headers: { Authorization: 'Bearer ' + token } })
      .then(function (res) {
        if (res.status === 401 || res.status === 403) { storage.remove(TOKEN_KEY); return null; }
        return res.ok ? res.json() : null;
      })
      .then(function (data) { return data && Array.isArray(data.pages) ? data.pages : null; })
      .catch(function () { return null; });
  };

  // -------------------------------------------------------------------------
  // Reader
  // -------------------------------------------------------------------------
  var ZOOM_STEPS = [0.9, 1, 1.1, 1.25, 1.4];
  var ZOOM_KEY = 'mz-reader-zoom';

  function MagazineReader(root, access) {
    this.root = root;
    this.access = access;
    this.total = parseInt(root.getAttribute('data-mr-total'), 10) || 1;
    this.preview = parseInt(root.getAttribute('data-mr-preview'), 10) || 0;
    this.unlockedThrough = this.preview;
    this.current = 1;
    this.visible = false;
    this.fallbackFullscreen = false;

    this.viewport = root.querySelector('[data-mr-viewport]');
    this.gate = root.querySelector('[data-mr-gate]');
    this.indicator = root.querySelector('[data-mr-indicator]');
    this.status = root.querySelector('[data-mr-status]');
    this.zoomLevel = root.querySelector('[data-mr-zoom-level]');
    this.fsButton = root.querySelector('[data-mr-fullscreen]');
    this.prevButtons = root.querySelectorAll('[data-mr-prev]');
    this.nextButtons = root.querySelectorAll('[data-mr-next]');
    this.segments = root.querySelectorAll('[data-mr-goto]');

    this.sheets = {};
    var sheets = root.querySelectorAll('[data-mr-page]');
    for (var i = 0; i < sheets.length; i++) {
      this.sheets[sheets[i].getAttribute('data-mr-page')] = sheets[i];
    }

    var savedZoom = parseInt(storage.get(ZOOM_KEY), 10);
    this.zoomIndex = savedZoom >= 0 && savedZoom < ZOOM_STEPS.length ? savedZoom : 1;

    this.bind();
    this.applyZoom();
    root.classList.add('is-ready');
    this.show(1, true);

    var self = this;
    access.loadLockedPages(this.preview + 1).then(function (pages) {
      if (pages && pages.length) self.unlock(pages);
    });
  }

  MagazineReader.prototype.isLocked = function (n) { return n > this.unlockedThrough; };

  MagazineReader.prototype.go = function (n) {
    n = Math.max(1, Math.min(this.total, n));
    if (n !== this.current) this.show(n, false);
  };

  MagazineReader.prototype.next = function () {
    if (this.isLocked(this.current) || this.current >= this.total) return;
    this.go(this.current + 1);
  };

  MagazineReader.prototype.prev = function () {
    // From the gate, "previous" returns to the last readable page.
    this.go(this.isLocked(this.current) ? this.unlockedThrough : this.current - 1);
  };

  MagazineReader.prototype.show = function (n, instant) {
    var dir = n >= this.current ? 1 : -1;
    var locked = this.isLocked(n);
    this.current = n;

    var target = locked ? this.gate : this.sheets[n];
    var panels = this.viewport.children;
    for (var i = 0; i < panels.length; i++) panels[i].hidden = panels[i] !== target;

    if (target && !instant && !reducedMotion) {
      target.style.setProperty('--mr-dir', dir);
      target.classList.remove('is-entering');
      void target.offsetWidth; // restart the enter animation
      target.classList.add('is-entering');
    }

    this.root.classList.toggle('is-gated', locked);
    this.indicator.textContent = fmt(S.pageOf, { n: n, total: this.total });
    this.status.textContent = locked
      ? fmt(S.statusLocked, { n: n })
      : (this.unlockedThrough >= this.total ? S.statusFull : fmt(S.statusPreview, { preview: this.preview }));

    var atStart = n <= 1;
    var atEnd = locked || n >= this.total;
    for (i = 0; i < this.prevButtons.length; i++) this.prevButtons[i].disabled = atStart;
    for (i = 0; i < this.nextButtons.length; i++) this.nextButtons[i].disabled = atEnd;

    for (i = 0; i < this.segments.length; i++) {
      var seg = this.segments[i];
      var k = parseInt(seg.getAttribute('data-mr-goto'), 10);
      seg.classList.toggle('is-current', k === n);
      seg.classList.toggle('is-read', k < n && !this.isLocked(k));
      if (k === n) seg.setAttribute('aria-current', 'page'); else seg.removeAttribute('aria-current');
    }

    if (!instant) this.keepInView();
  };

  // After a page turn, bring the top of the new page into view.
  MagazineReader.prototype.keepInView = function () {
    if (this.isFullscreen()) {
      var stage = this.root.querySelector('.mr-stage');
      if (stage) stage.scrollTop = 0;
      return;
    }
    if (this.root.getBoundingClientRect().top < 0) {
      this.root.scrollIntoView({ block: 'start', behavior: reducedMotion ? 'auto' : 'smooth' });
    }
  };

  // Inserts pages returned by the access endpoint and lifts the gate for them.
  MagazineReader.prototype.unlock = function (pages) {
    var self = this;
    pages.sort(function (a, b) { return a.page - b.page; }).forEach(function (p) {
      var n = parseInt(p.page, 10);
      if (!n || self.sheets[n] || n > self.total) return;
      var el = document.createElement('article');
      el.className = 'mr-sheet';
      el.setAttribute('data-mr-page', n);
      el.setAttribute('aria-label', fmt(S.pageOf, { n: n, total: self.total }));
      el.hidden = true;
      el.innerHTML = p.html; // trusted HTML from our own access endpoint
      self.viewport.insertBefore(el, self.gate || null);
      self.sheets[n] = el;
    });
    while (this.sheets[this.unlockedThrough + 1]) this.unlockedThrough++;

    for (var i = 0; i < this.segments.length; i++) {
      var k = parseInt(this.segments[i].getAttribute('data-mr-goto'), 10);
      if (!this.isLocked(k)) this.segments[i].classList.replace('is-locked', 'is-free');
    }
    if (this.unlockedThrough >= this.total) {
      this.root.classList.add('is-entitled');
      if (this.gate) { this.gate.remove(); this.gate = null; }
    }
    this.show(this.current, true);
  };

  MagazineReader.prototype.zoom = function (delta) {
    this.zoomIndex = Math.max(0, Math.min(ZOOM_STEPS.length - 1, this.zoomIndex + delta));
    storage.set(ZOOM_KEY, String(this.zoomIndex));
    this.applyZoom();
  };

  MagazineReader.prototype.applyZoom = function () {
    var z = ZOOM_STEPS[this.zoomIndex];
    this.root.style.setProperty('--mr-zoom', z);
    this.zoomLevel.textContent = Math.round(z * 100) + '%';
    var out = this.root.querySelector('[data-mr-zoom="-1"]');
    var inn = this.root.querySelector('[data-mr-zoom="1"]');
    if (out) out.disabled = this.zoomIndex === 0;
    if (inn) inn.disabled = this.zoomIndex === ZOOM_STEPS.length - 1;
  };

  MagazineReader.prototype.isFullscreen = function () {
    return this.fallbackFullscreen || (document.fullscreenElement || document.webkitFullscreenElement) === this.root;
  };

  MagazineReader.prototype.toggleFullscreen = function () {
    var root = this.root;
    var request = root.requestFullscreen || root.webkitRequestFullscreen;
    var exit = document.exitFullscreen || document.webkitExitFullscreen;
    if (this.fallbackFullscreen) return this.setFallbackFullscreen(false);
    if (document.fullscreenElement || document.webkitFullscreenElement) return exit.call(document);
    if (request) {
      var result = request.call(root);
      var self = this;
      if (result && result.catch) result.catch(function () { self.setFallbackFullscreen(true); });
    } else {
      // e.g. iPhone Safari: no element full screen API, so pin the reader to the viewport.
      this.setFallbackFullscreen(true);
    }
  };

  MagazineReader.prototype.setFallbackFullscreen = function (on) {
    this.fallbackFullscreen = on;
    document.documentElement.classList.toggle('mz-noscroll', on);
    this.syncFullscreen();
  };

  MagazineReader.prototype.syncFullscreen = function () {
    var on = this.isFullscreen();
    this.root.classList.toggle('is-fullscreen', on);
    this.fsButton.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) this.root.focus({ preventScroll: true });
  };

  MagazineReader.prototype.bind = function () {
    var self = this;

    this.root.addEventListener('click', function (e) {
      var el = e.target.closest('button');
      if (!el || !self.root.contains(el) || el.disabled) return;
      if (el.hasAttribute('data-mr-prev')) self.prev();
      else if (el.hasAttribute('data-mr-next')) self.next();
      else if (el.hasAttribute('data-mr-goto')) self.go(parseInt(el.getAttribute('data-mr-goto'), 10));
      else if (el.hasAttribute('data-mr-zoom')) self.zoom(parseInt(el.getAttribute('data-mr-zoom'), 10));
      else if (el.hasAttribute('data-mr-fullscreen')) self.toggleFullscreen();
    });

    document.addEventListener('fullscreenchange', function () { self.syncFullscreen(); });
    document.addEventListener('webkitfullscreenchange', function () { self.syncFullscreen(); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        self.visible = entries[0].isIntersecting;
      }, { threshold: 0.25 }).observe(this.root);
    } else {
      this.visible = true;
    }

    document.addEventListener('keydown', function (e) {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      if (document.querySelector('dialog[open]')) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      if (e.key === 'Escape' && self.fallbackFullscreen) { self.setFallbackFullscreen(false); return; }
      if (!self.visible && !self.isFullscreen()) return;
      if (e.key === 'ArrowRight') { self.next(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { self.prev(); e.preventDefault(); }
    });

    // Horizontal swipe on touch screens.
    var startX = 0, startY = 0, tracking = false;
    this.viewport.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      tracking = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, { passive: true });
    this.viewport.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      if (dx < 0) self.next(); else self.prev();
    }, { passive: true });
  };

  // -------------------------------------------------------------------------
  // Checkout (purchase / subscription CTA target)
  // -------------------------------------------------------------------------
  // Contract for config.checkoutEndpoint (to be implemented server-side):
  //   POST {endpoint}  JSON { issueId, product, name, phone, email, address, lang, returnUrl }
  //   200 -> { "paymentUrl": "https://…" }  (visitor is redirected to pay)
  // Without an endpoint (static hosting) the order is handed off by WhatsApp or
  // email so the team can reply with a payment link. It never unlocks pages.
  function MagazineCheckout(dialog) {
    this.dialog = dialog;
    this.form = dialog.querySelector('[data-mz-checkout-form]');
    this.issueLabel = dialog.querySelector('[data-mz-checkout-issue]');
    this.totalEl = dialog.querySelector('[data-mz-total]');
    this.addressField = dialog.querySelector('[data-mz-address]');
    this.errorEl = dialog.querySelector('[data-mz-error]');
    this.submitBtn = dialog.querySelector('[data-mz-submit]');
    this.issueId = CONFIG.issueId;
    this.bind();
  }

  MagazineCheckout.prototype.product = function () {
    var checked = this.form.querySelector('input[name="product"]:checked');
    return checked ? checked.value : 'digital';
  };

  MagazineCheckout.prototype.open = function (product, issueId) {
    this.issueId = issueId || CONFIG.issueId;
    this.issueLabel.textContent = CONFIG.issues[this.issueId] || '';
    var radio = this.form.querySelector('input[name="product"][value="' + product + '"]');
    if (radio) radio.checked = true;
    this.step('form');
    this.refresh();
    this.error('');
    if (typeof this.dialog.showModal === 'function') this.dialog.showModal();
    else this.dialog.setAttribute('open', '');
    var name = this.form.querySelector('[name="name"]');
    if (name && !name.value) name.focus();
  };

  MagazineCheckout.prototype.close = function () {
    if (typeof this.dialog.close === 'function') this.dialog.close();
    else this.dialog.removeAttribute('open');
  };

  MagazineCheckout.prototype.step = function (name) {
    var panels = this.dialog.querySelectorAll('[data-mz-step]');
    for (var i = 0; i < panels.length; i++) panels[i].hidden = panels[i].getAttribute('data-mz-step') !== name;
  };

  MagazineCheckout.prototype.refresh = function () {
    var product = this.product();
    var amount = CONFIG.prices[product];
    this.totalEl.textContent = CONFIG.currency + amount + (product === 'subscription' ? S.perMonth : '');
    this.addressField.hidden = product !== 'print';
    this.addressField.querySelector('textarea').required = product === 'print';
  };

  MagazineCheckout.prototype.error = function (msg) {
    this.errorEl.textContent = msg;
    this.errorEl.hidden = !msg;
  };

  MagazineCheckout.prototype.values = function () {
    var f = this.form;
    return {
      issueId: this.issueId,
      product: this.product(),
      name: f.name.value.trim(),
      phone: f.phone.value.trim(),
      email: f.email.value.trim(),
      address: f.address.value.trim(),
      lang: CONFIG.lang,
      returnUrl: window.location.href.split('#')[0] + '#mz-reader',
    };
  };

  MagazineCheckout.prototype.submit = function () {
    var v = this.values();
    if (!v.name || !v.phone || !v.email || !this.form.email.checkValidity()) return this.error(S.required);
    if (v.product === 'print' && !v.address) return this.error(S.requiredAddress);
    this.error('');

    if (CONFIG.checkoutEndpoint) {
      var self = this;
      var label = this.submitBtn.textContent;
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = S.submitting;
      fetch(CONFIG.checkoutEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(v) })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(res); })
        .then(function (data) {
          if (data && data.paymentUrl) window.location.assign(data.paymentUrl);
          else return Promise.reject(data);
        })
        .catch(function () {
          self.error(S.failed);
          self.submitBtn.disabled = false;
          self.submitBtn.textContent = label;
        });
      return;
    }
    this.handOff(v);
  };

  MagazineCheckout.prototype.handOff = function (v) {
    var product = S.products[v.product];
    var price = CONFIG.currency + CONFIG.prices[v.product] + (v.product === 'subscription' ? S.perMonth : '');
    var lines = [
      S.orderLine,
      S.item + ': ' + product.label + ' — ' + price,
      v.product === 'subscription' ? '' : S.issue + ': ' + (CONFIG.issues[v.issueId] || v.issueId),
      S.name + ': ' + v.name,
      S.phone + ': ' + v.phone,
      S.email + ': ' + v.email,
      v.address ? S.address + ': ' + v.address : '',
    ].filter(Boolean);
    var text = lines.join('\n');

    this.dialog.querySelector('[data-mz-summary]').textContent = lines.slice(1).join('\n');
    var wa = this.dialog.querySelector('[data-mz-send="whatsapp"]');
    var mail = this.dialog.querySelector('[data-mz-send="email"]');
    wa.hidden = !CONFIG.contact.whatsapp;
    wa.href = 'https://wa.me/' + CONFIG.contact.whatsapp + '?text=' + encodeURIComponent(text);
    mail.hidden = !CONFIG.contact.email;
    mail.href = 'mailto:' + CONFIG.contact.email + '?subject=' + encodeURIComponent(S.orderLine + ' — ' + product.label) + '&body=' + encodeURIComponent(text);
    this.step('done');
  };

  MagazineCheckout.prototype.bind = function () {
    var self = this;
    this.form.addEventListener('change', function (e) {
      if (e.target.name === 'product') self.refresh();
    });
    this.form.addEventListener('submit', function (e) {
      e.preventDefault();
      self.submit();
    });
    // Click on the backdrop closes the dialog.
    this.dialog.addEventListener('click', function (e) {
      if (e.target === self.dialog) self.close();
    });
  };

  // -------------------------------------------------------------------------
  // Wiring
  // -------------------------------------------------------------------------
  var access = new MagazineAccess({ endpoint: CONFIG.accessEndpoint, issueId: CONFIG.issueId, lang: CONFIG.lang });
  var readerRoot = document.querySelector('[data-mz-reader]');
  var reader = readerRoot ? new MagazineReader(readerRoot, access) : null;
  var dialog = document.getElementById('mz-checkout');
  var checkout = dialog ? new MagazineCheckout(dialog) : null;

  document.addEventListener('click', function (e) {
    var buy = e.target.closest('[data-mz-buy]');
    if (buy && checkout) {
      e.preventDefault();
      if (reader && reader.fallbackFullscreen) reader.setFallbackFullscreen(false);
      else if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
      checkout.open(buy.getAttribute('data-mz-buy'), buy.getAttribute('data-mz-issue'));
      return;
    }
    var jump = e.target.closest('a[href="#mz-reader"], a[href="#mz-buy"]');
    if (jump) {
      var target = document.querySelector(jump.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
      if (history.replaceState) history.replaceState(null, '', jump.getAttribute('href'));
      if (target.id === 'mz-reader' && readerRoot) readerRoot.focus({ preventScroll: true });
    }
  });

  window.MasikPatrika = { reader: reader, checkout: checkout, access: access };
})();

// Issue library: shows the first few issues, "Show more" reveals the rest.
// The button only appears when there are more issues than fit the first view.
(function () {
  'use strict';
  var grid = document.querySelector('[data-mz-archive]');
  var btn = document.querySelector('[data-mz-archive-toggle]');
  if (!grid || !btn) return;
  var cards = grid.querySelectorAll('[data-mz-card]');
  var visible = parseInt(grid.getAttribute('data-visible'), 10) || 4;
  if (cards.length <= visible) { btn.hidden = true; btn.disabled = true; return; }

  var label = btn.querySelector('[data-mz-archive-label]');
  function setOpen(open) {
    grid.classList.toggle('is-collapsed', !open);
    btn.setAttribute('aria-expanded', String(open));
    btn.classList.toggle('is-open', open);
    label.textContent = btn.getAttribute(open ? 'data-fewer' : 'data-more');
  }
  setOpen(false);
  btn.hidden = false;
  btn.disabled = false;
  btn.addEventListener('click', function () {
    var open = btn.getAttribute('aria-expanded') !== 'true';
    setOpen(open);
    if (open) {
      // Move focus to the first newly shown issue so keyboard users land on it.
      var first = cards[visible];
      if (first) { first.setAttribute('tabindex', '-1'); first.focus({ preventScroll: false }); }
    } else {
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      grid.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
    }
  });
})();
