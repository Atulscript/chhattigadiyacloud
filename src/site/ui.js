// Chhattisgadhiya Cloud - shared build-time UI helpers (Node).
// One line-icon set, text helpers and small components used by every page.

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (v, lang) => (v && typeof v === 'object' ? (v[lang] || v.en || '') : (v || ''));
// Internal links in data are stored language-neutral ("/magazine/").
const localHref = (href, lang) => (href && href.startsWith('/') ? `/${lang}${href.replace(/^\/(en|hi)\//, '/')}` : href || '#');

// Line icons: 24px grid, 1.75 stroke, round caps. Styled by .cc-icon.
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/><path d="M10 21v-6h4v6"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  mask: '<path d="M4 4h16v7a8 8 0 0 1-16 0z"/><path d="M8.5 9.5h1.5M14 9.5h1.5M9 14.5a3.5 3.5 0 0 0 6 0"/>',
  tent: '<path d="M2 20h20M4.5 20 12 4l7.5 16"/><path d="M12 4v16M9 20l3-5 3 5"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.2c2.6.4 4.5 2.6 4.5 5.8"/>',
  book: '<path d="M3 5.5C5.5 4 9 4 12 6c3-2 6.5-2 9-.5V19c-2.5-1.5-6-1.5-9 .5-3-2-6.5-2-9-.5z"/><path d="M12 6v13.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.4"/>',
  pen: '<path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17z"/><path d="M14.5 7.5l3 3"/>',
  news: '<rect x="3" y="5" width="14" height="14" rx="1.5"/><path d="M17 8h3v9a2 2 0 0 1-2 2M7 9h6M7 12.5h6M7 16h4"/>',
  heart: '<path d="M12 20s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 8 3.5C20 15.4 12 20 12 20z"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  ticket: '<path d="M4 6h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z"/><path d="M14 6v2M14 11v2M14 16v2"/>',
  arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  chevronLeft: '<path d="M15 5l-7 7 7 7"/>',
  chevronRight: '<path d="M9 5l7 7-7 7"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  monitor: '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20h8M12 16v4"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18"/>',
  feather: '<path d="M20 4C12 4 7 9 7 17v3"/><path d="M20 4c0 7-5 11-13 11M7 17h6"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  leaf: '<path d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15z"/><path d="M5 19l8-8"/>',
  drum: '<ellipse cx="12" cy="7" rx="8" ry="3"/><path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7M4 12l8 3 8-3"/>',
  palette: '<path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.8 1.2-1.6-.4-1 .2-2.4 1.6-2.4H17a4 4 0 0 0 4-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
  external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
};

function icon(name, cls = '') {
  const body = ICONS[name];
  if (!body) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="cc-icon${cls ? ` ${cls}` : ''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

// Responsive image: when a raster photo (jpg/png) has .avif/.webp siblings on
// disk, they are offered first. SVG illustrations pass straight through.
function picture(src, alt, { width, height, eager = false, cls = '', sizes = '' } = {}) {
  if (!src) return '';
  const attrs = [
    `src="${esc(src)}"`, `alt="${esc(alt || '')}"`,
    width ? `width="${width}"` : '', height ? `height="${height}"` : '',
    eager ? 'fetchpriority="high"' : 'loading="lazy"', 'decoding="async"',
    cls ? `class="${cls}"` : '', sizes ? `sizes="${sizes}"` : '',
  ].filter(Boolean).join(' ');
  const img = `<img ${attrs}>`;
  const m = /^(\/.*)\.(jpe?g|png)$/i.exec(src);
  if (!m) return img;
  const sources = ['avif', 'webp']
    .filter((ext) => fs.existsSync(path.join(ROOT, `${m[1]}.${ext}`)))
    .map((ext) => `<source srcset="${esc(`${m[1]}.${ext}`)}" type="image/${ext}">`);
  return sources.length ? `<picture>${sources.join('')}${img}</picture>` : img;
}

function pageHead({ lang, title, lead = '', kicker = '', extra = '', banner = null, bannerSettings = {} }) {
  const home = lang === 'hi' ? 'होम' : 'Home';
  // With banner images the header becomes an image slider (src/home/hero.js).
  if (banner && banner.length) {
    const { renderPageBanner } = require('../home/hero.js'); // lazy: hero.js requires this file
    const html = renderPageBanner({
      slides: banner, lang, label: title, settings: bannerSettings,
      content: `
      <nav class="cc-crumbs" aria-label="${lang === 'hi' ? 'आप यहां हैं' : 'Breadcrumb'}">
        <a href="/${lang}/">${home}</a>${icon('chevronRight')}<span aria-current="page">${esc(title)}</span>
      </nav>
      ${kicker ? `<p class="hs__kicker">${esc(kicker)}</p>` : ''}
      <h1 class="cc-h1 hs__page-title">${esc(title)}</h1>
      ${lead ? `<p class="hs__lead">${esc(lead)}</p>` : ''}
      ${extra}`,
    });
    if (html) return html;
  }
  return `
  <header class="cc-page-head">
    <div class="cc-wrap">
      <nav class="cc-crumbs" aria-label="${lang === 'hi' ? 'आप यहां हैं' : 'Breadcrumb'}">
        <a href="/${lang}/">${home}</a>${icon('chevronRight')}<span aria-current="page">${esc(title)}</span>
      </nav>
      ${kicker ? `<p class="cc-kicker" style="margin-top:1rem">${esc(kicker)}</p>` : ''}
      <h1 class="cc-h1">${esc(title)}</h1>
      ${lead ? `<p class="cc-lead">${esc(lead)}</p>` : ''}
      ${extra}
      <span class="cc-motif cc-motif--short" aria-hidden="true"></span>
    </div>
  </header>`;
}

function sectionHead(title, { sub = '', id = '', link = null, level = 2 } = {}) {
  return `
      <div class="cc-section-head">
        <div>
          <h${level} class="cc-h2"${id ? ` id="${id}"` : ''}>${esc(title)}</h${level}>
          ${sub ? `<p>${esc(sub)}</p>` : ''}
        </div>
        ${link ? `<a class="cc-link" href="${link.href}">${esc(link.label)}${icon('arrowRight')}</a>` : ''}
      </div>`;
}

// The dated stat set lives in siteData.homepage.impactStats and is reused everywhere.
function stats(items, lang, { label = '' } = {}) {
  if (!items || !items.length) return '';
  return `
      <dl class="cc-stats"${label ? ` aria-label="${esc(label)}"` : ''}>
        ${items.map((s) => `
        <div class="cc-stat">
          <dt class="cc-stat__label">${esc(pick(s.label, lang))}</dt>
          <dd class="cc-stat__num">${esc(s.number)}</dd>
          <dd class="cc-stat__sub">${esc(pick(s.sub, lang))}</dd>
        </div>`).join('')}
      </dl>`;
}

// Opens a short form dialog (see src/site/forms.js). Without JS the link
// falls back to the contact page.
function formButton({ lang, form, label, variant = 'primary', size = '', prefill = null, iconName = '' }) {
  const cls = ['cc-btn', `cc-btn--${variant}`, size ? `cc-btn--${size}` : ''].filter(Boolean).join(' ');
  const data = prefill ? ` data-cc-prefill="${esc(JSON.stringify(prefill))}"` : '';
  return `<a class="${cls}" href="/${lang}/contact/#form-${form}" data-cc-form="${form}"${data}>${iconName ? icon(iconName) : ''}${esc(label)}</a>`;
}

module.exports = { esc, pick, localHref, icon, ICONS, picture, pageHead, sectionHead, stats, formButton };
