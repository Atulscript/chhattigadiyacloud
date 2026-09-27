// Gallery: photo albums (siteData.gallery.albums), each with its own accent
// colour. A sticky row of album chips jumps between them; each album is a
// masonry wall that keeps every photo's shape. Photos open in the photo
// viewer (site.js). Albums, photos and captions are managed in the admin
// panel (Pages > Gallery).
const { esc, pick, icon, photo, photoFull, pageHead } = require('../site/ui.js');

const T = {
  en: {
    title: 'Gallery', albums: 'Albums', all: 'All albums',
    lead: 'Photographs from our productions, festivals, rehearsals and programmes.',
    count: (n) => `${n} photograph${n === 1 ? '' : 's'}`, view: 'View photograph',
    empty: 'Photographs are on their way.',
  },
  hi: {
    title: 'चित्र दीर्घा', albums: 'एल्बम', all: 'सभी एल्बम',
    lead: 'हमारी प्रस्तुतियों, समारोहों, रिहर्सल और कार्यक्रमों की तस्वीरें।',
    count: (n) => `${n} तस्वीरें`, view: 'तस्वीर देखें',
    empty: 'तस्वीरें जल्द आ रही हैं।',
  },
};
const ACCENTS = ['vermilion', 'saffron', 'teal', 'magenta', 'indigo', 'forest'];

// Photos may be plain URLs or { image, caption, alt }.
function normalise(p, album) {
  const o = typeof p === 'string' ? { image: p } : (p || {});
  return { image: o.image || '', caption: o.caption || album.title, alt: o.alt || o.caption || album.title };
}
function slug(s, i) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `album-${i + 1}`;
}

function render(siteData, lang) {
  const t = T[lang];
  const g = siteData.gallery || {};
  const albums = (g.albums || []).map((a, i) => Object.assign({}, a, {
    id: a.id || slug(a.title && a.title.en, i),
    accent: ACCENTS.includes(a.accent) ? a.accent : ACCENTS[i % ACCENTS.length],
    photos: (a.photos || []).map((p) => normalise(p, a)).filter((p) => p.image),
  })).filter((a) => a.photos.length);
  const lead = pick(g.lead, lang) || t.lead;
  const pad = (i) => String(i).padStart(2, '0');

  const chips = albums.length > 1 ? `
  <nav class="gl-chips" aria-label="${t.albums}">
    <div class="cc-wrap gl-chips__inner">
      ${albums.map((a) => `<a class="gl-chip gl-accent--${a.accent}" href="#${esc(a.id)}"><span class="gl-chip__dot" aria-hidden="true"></span>${esc(pick(a.title, lang))}<span class="gl-chip__n">${a.photos.length}</span></a>`).join('')}
    </div>
  </nav>` : '';

  const body = albums.length ? albums.map((a, ai) => `
  <section class="gl-album gl-accent--${a.accent}" id="${esc(a.id)}" aria-labelledby="${esc(a.id)}-title">
    <div class="cc-wrap">
      <header class="gl-album__head">
        <span class="gl-album__num" aria-hidden="true">${pad(ai + 1)}</span>
        <div>
          ${pick(a.kind, lang) ? `<p class="gl-album__kind">${esc(pick(a.kind, lang))}</p>` : ''}
          <h2 class="gl-album__title" id="${esc(a.id)}-title">${esc(pick(a.title, lang))}</h2>
          <p class="gl-album__meta">${pick(a.note, lang) ? `<span>${esc(pick(a.note, lang))}</span>` : ''}<span>${icon('image')}${t.count(a.photos.length)}</span></p>
        </div>
      </header>
      <ul class="gl-wall" data-cc-lightbox>
        ${a.photos.map((p, i) => `
        <li class="gl-item">
          <a class="gl-item__link" href="${esc(photoFull(p.image))}" data-caption="${esc(pick(p.caption, lang))}" aria-label="${esc(`${t.view} ${i + 1} — ${pick(p.caption, lang)}`)}">
            ${photo(p.image, pick(p.alt, lang), { sizes: '(min-width: 1100px) 25vw, (min-width: 720px) 33vw, 50vw', widths: [400, 700, 1000] })}
            <span class="gl-item__num" aria-hidden="true">${pad(i + 1)}</span>
            <span class="gl-item__cap">${esc(pick(p.caption, lang))}</span>
          </a>
        </li>`).join('')}
      </ul>
    </div>
  </section>`).join('') : `<section class="cc-section"><div class="cc-wrap"><div class="cc-empty"><p>${t.empty}</p></div></div></section>`;

  return {
    title: t.title,
    desc: lead,
    content: `
  ${pageHead({ lang, banner: (siteData.pageBanners || {}).gallery, bannerSettings: siteData.pageBannerSettings, title: t.title, lead })}
  ${chips}
  ${body}`,
  };
}

module.exports = { render };
