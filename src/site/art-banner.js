// Animated stage banner above the footer: builds the valance and footlights
// to the strip width, fills the loop tracks, pauses off-screen / on hover.
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(document.querySelectorAll('.art-banner'), function (root) {
    // Valance: build the drape row in real pixels so scallops keep their shape at any width.
    var val = root.querySelector('.ab-val svg');
    function buildValance() {
      var w = root.clientWidth, h = root.querySelector('.ab-val').clientHeight || 26;
      val.setAttribute('viewBox', '0 0 ' + w + ' 26');
      val.setAttribute('preserveAspectRatio', 'none');
      val.innerHTML =
        '<g class="ab-sway ab-sway--back"><rect x="-40" y="0" width="' + (w + 80) + '" height="26" fill="url(#ab-drape2)" opacity=".7"/></g>' +
        '<g class="ab-sway"><rect x="-40" y="0" width="' + (w + 80) + '" height="26" fill="url(#ab-drape)"/></g>';
    }
    // Footlights: one dot every ~34px; the chase runs through them in order.
    var lights = root.querySelector('.ab-lights');
    function buildLights() {
      var n = Math.max(8, Math.round(root.clientWidth / 34));
      var html = '';
      for (var i = 0; i < n; i++) html += '<span class="ab-dot" style="--i:' + i + '"></span>';
      lights.innerHTML = html;
    }
    // Scrolling tracks: repeat the tile until it covers the width twice over.
    function fillTracks() {
      [].forEach.call(root.querySelectorAll('.ab-track'), function (track) {
        var tile = track.firstElementChild;
        while (track.children.length > 1) track.removeChild(track.lastElementChild);
        var tw = tile.getBoundingClientRect().width || 1;
        var need = Math.ceil(root.clientWidth / tw) + 1;
        for (var i = 0; i < need; i++) track.appendChild(tile.cloneNode(true));
      });
    }
    function build() { buildValance(); buildLights(); fillTracks(); }
    build();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); });
    if (reduce) return;
    root.classList.add('ab-js');
    // Pause while off-screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { root.classList.toggle('ab-off', !e.isIntersecting); sync(); });
      }).observe(root);
    }
    var hover = false;
    if (root.getAttribute('data-hover-pause') === 'true') {
      root.addEventListener('mouseenter', function () { hover = true; sync(); });
      root.addEventListener('mouseleave', function () { hover = false; sync(); });
    }
    function sync() { root.classList.toggle('ab-paused', hover || root.classList.contains('ab-off')); }
  });
})();
