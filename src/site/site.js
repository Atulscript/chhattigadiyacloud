// Chhattisgadhiya Cloud - shared page behaviour: menu, newsletter, install prompt.
(function () {
  'use strict';

  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var session = {
    get: function (k) { try { return window.sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { window.sessionStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };

  // ---- Menu (native <dialog> gives focus trapping and Escape) ----
  var drawer = document.getElementById('cc-drawer');
  var menuButtons = document.querySelectorAll('[data-cc-menu]');

  function setExpanded(open) {
    for (var i = 0; i < menuButtons.length; i++) menuButtons[i].setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function openMenu() {
    if (!drawer) return;
    if (typeof drawer.showModal === 'function') drawer.showModal(); else drawer.setAttribute('open', '');
    setExpanded(true);
  }
  function closeMenu() {
    if (!drawer) return;
    if (typeof drawer.close === 'function') drawer.close(); else drawer.removeAttribute('open');
  }

  for (var i = 0; i < menuButtons.length; i++) menuButtons[i].addEventListener('click', openMenu);
  if (drawer) {
    drawer.addEventListener('close', function () { setExpanded(false); });
    drawer.addEventListener('click', function (e) {
      // Backdrop clicks land on the dialog itself; link clicks navigate away.
      if (e.target === drawer || e.target.closest('[data-cc-menu-close]') || e.target.closest('a')) closeMenu();
    });
  }

  // ---- Newsletter ----
  // Posts to data-cc-endpoint when configured; otherwise opens a pre-filled
  // email to the organisation so the request actually reaches someone.
  var form = document.querySelector('[data-cc-signup]');
  if (form) {
    var msg = form.querySelector('[data-cc-signup-msg]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      var email = input.value.trim();
      if (!email || !input.checkValidity()) {
        msg.textContent = msg.getAttribute('data-invalid');
        msg.classList.add('is-error');
        input.focus();
        return;
      }
      msg.classList.remove('is-error');
      var endpoint = form.getAttribute('data-cc-endpoint');
      var done = function () { msg.textContent = msg.getAttribute('data-done'); form.reset(); };
      if (endpoint) {
        fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, lang: document.documentElement.lang }) })
          .then(function (res) { if (!res.ok) throw res; msg.textContent = '✓'; form.reset(); })
          .catch(function () { msg.textContent = msg.getAttribute('data-invalid'); msg.classList.add('is-error'); });
        return;
      }
      var to = form.getAttribute('data-cc-mailto');
      if (to) window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent('Newsletter') + '&body=' + encodeURIComponent('Please add me to the mailing list: ' + email);
      done();
    });
  }

  // ---- Back to top ----
  var top = document.querySelector('[data-cc-top]');
  if (top) top.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  // ---- Install as app (PWA) ----
  // The toast only appears on a visitor's second page view in a session, on
  // phones, and never again once dismissed.
  var deferredPrompt = null;
  var toast = document.querySelector('[data-cc-install-toast]');
  var installButtons = document.querySelectorAll('[data-cc-install]');
  var views = parseInt(session.get('cc-views') || '0', 10) + 1;
  session.set('cc-views', String(views));

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    for (var i = 0; i < installButtons.length; i++) installButtons[i].hidden = false;
    if (toast && views >= 2 && !session.get('cc-install-dismissed') && window.innerWidth <= 768) toast.hidden = false;
  });

  function install() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.finally(function () {
      deferredPrompt = null;
      if (toast) toast.hidden = true;
      for (var i = 0; i < installButtons.length; i++) installButtons[i].hidden = true;
    });
  }
  for (var j = 0; j < installButtons.length; j++) installButtons[j].addEventListener('click', install);

  var dismiss = document.querySelector('[data-cc-install-dismiss]');
  if (dismiss) dismiss.addEventListener('click', function () {
    toast.hidden = true;
    session.set('cc-install-dismissed', '1');
  });
  window.addEventListener('appinstalled', function () { if (toast) toast.hidden = true; });
})();
