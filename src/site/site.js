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

  // ---- Theme: auto (device), light or dark ----
  function applyTheme(value) {
    if (value === 'light' || value === 'dark') { document.documentElement.setAttribute('data-theme', value); local.set('cc-theme', value); }
    else { document.documentElement.removeAttribute('data-theme'); local.remove('cc-theme'); value = 'auto'; }
    var buttons = document.querySelectorAll('[data-cc-theme] button');
    for (var i = 0; i < buttons.length; i++) buttons[i].setAttribute('aria-pressed', buttons[i].getAttribute('data-theme-value') === value ? 'true' : 'false');
  }
  applyTheme(local.get('cc-theme') || 'auto');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-cc-theme] button');
    if (b) applyTheme(b.getAttribute('data-theme-value'));
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
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('.cc-form');
    if (!form) return;
    e.preventDefault();
    var err = form.querySelector('.cc-form-error');
    var requiredEmpty = Array.prototype.some.call(form.querySelectorAll('[required]'), function (el) { return !el.value.trim(); });
    var badEmail = Array.prototype.some.call(form.querySelectorAll('input[type="email"]'), function (el) { return el.value && !el.checkValidity(); });
    if (requiredEmpty || badEmail) {
      err.textContent = err.getAttribute('data-required'); err.hidden = false; return;
    }
    var phone = form.querySelector('[name="phone"]');
    if (phone && (digits(phone.value).length < 10 || digits(phone.value).length > 13)) {
      err.textContent = err.getAttribute('data-phone'); err.hidden = false; phone.focus(); return;
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

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-cc-form]');
    if (trigger) {
      var dialog = document.getElementById('cc-form-' + trigger.getAttribute('data-cc-form'));
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
  if (hashForm && document.getElementById('cc-form-' + hashForm[1]) && !document.getElementById('form-' + hashForm[1])) {
    openDialog(document.getElementById('cc-form-' + hashForm[1]));
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
