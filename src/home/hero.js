// Chhattisgadhiya Cloud - homepage hero slider (build time, Node).
// Slides live in siteData.homepage.heroSlides and are managed in the admin
// panel (Pages > Homepage > Hero slider): title, text, images, CTAs, order and
// active state. Behaviour (autoplay, swipe, keys) is in hero-slider.js.
//
// Images: `image` (landscape) and optional `imageMobile` (portrait). For local
// .jpg/.png files, sibling files are picked up automatically when present:
//   name.webp, name-1280.jpg, name-1280.webp  -> responsive desktop sources
//   name-mobile.webp (next to imageMobile)    -> WebP for phones
// Uploaded images (data URLs) and external URLs are used as they are.

const fs = require('fs');
const path = require('path');
const { esc, pick, localHref, icon } = require('../site/ui.js');

const ROOT = path.join(__dirname, '..', '..');
const MOBILE_QUERY = '(max-width: 767px)';

const T = {
  en: {
    label: 'Featured', slide: (i, n) => `${i} of ${n}`, prev: 'Previous slide', next: 'Next slide',
    goTo: (i) => `Show slide ${i}`, pause: 'Pause slideshow', play: 'Play slideshow',
  },
  hi: {
    label: 'विशेष', slide: (i, n) => `${n} में से ${i}`, prev: 'पिछली स्लाइड', next: 'अगली स्लाइड',
    goTo: (i) => `स्लाइड ${i} दिखाएं`, pause: 'स्लाइड शो रोकें', play: 'स्लाइड शो चलाएं',
  },
};

const exists = (p) => { try { return fs.existsSync(path.join(ROOT, p)); } catch (e) { return false; } };

// Local raster image -> { jpg, webp, srcset, webpSrcset } using sibling files.
function variants(src) {
  const m = /^(\/[^?#]+)\.(jpe?g|png)$/i.exec(src || '');
  if (!m) return { src, srcset: '', webpSrcset: '' };
  const [, base, ext] = m;
  const small = exists(`${base}-1280.${ext}`) ? `${base}-1280.${ext} 1280w, ` : '';
  const webpSmall = exists(`${base}-1280.webp`) ? `${base}-1280.webp 1280w, ` : '';
  const webp = exists(`${base}.webp`) ? `${base}.webp` : '';
  return {
    src,
    srcset: small ? `${small}${src} 1920w` : '',
    webpSrcset: webp ? (webpSmall ? `${webpSmall}${webp} 1920w` : webp) : '',
  };
}

// Sorted, active slides with the fields the component needs.
function getSlides(hp) {
  return (hp.heroSlides || [])
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s && s.active !== false && (s.image || s.imageMobile) && (s.title || s.description))
    .sort((a, b) => (Number(a.s.order) || a.i + 1) - (Number(b.s.order) || b.i + 1) || a.i - b.i)
    .map(({ s }) => s);
}

// Candidate URLs to preload for the first slide (used in <head>).
function heroPreload(hp) {
  const first = getSlides(hp)[0];
  if (!first) return '';
  const desk = variants(first.image || first.imageMobile);
  const mob = first.imageMobile ? variants(first.imageMobile) : null;
  const mobWebp = mob && /^\//.test(mob.src) ? mob.src.replace(/\.(jpe?g|png)$/i, '.webp') : '';
  const links = [];
  if (mob) {
    links.push(`<link rel="preload" as="image" href="${esc(mobWebp && exists(mobWebp) ? mobWebp : mob.src)}" media="${MOBILE_QUERY}" fetchpriority="high">`);
  }
  const deskHref = desk.webpSrcset ? desk.webpSrcset.split(', ').pop().split(' ')[0] : desk.src;
  const deskSet = desk.webpSrcset || desk.srcset;
  links.push(`<link rel="preload" as="image" href="${esc(deskHref)}"${deskSet ? ` imagesrcset="${esc(deskSet)}" imagesizes="100vw"` : ''}${mob ? ' media="(min-width: 768px)"' : ''} fetchpriority="high">`);
  return links.join('\n  ');
}

function renderPicture(slide, lang, first) {
  const alt = pick(slide.imageAlt, lang);
  const desk = variants(slide.image || slide.imageMobile);
  const sources = [];
  if (slide.imageMobile) {
    const mob = variants(slide.imageMobile);
    const mobWebp = /^\//.test(mob.src) ? mob.src.replace(/\.(jpe?g|png)$/i, '.webp') : '';
    if (mobWebp && mobWebp !== mob.src && exists(mobWebp)) sources.push(`<source media="${MOBILE_QUERY}" type="image/webp" srcset="${esc(mobWebp)}">`);
    sources.push(`<source media="${MOBILE_QUERY}" srcset="${esc(mob.src)}">`);
  }
  if (desk.webpSrcset) sources.push(`<source type="image/webp" srcset="${esc(desk.webpSrcset)}" sizes="100vw">`);
  const style = [
    slide.focus ? `--hs-focus:${esc(slide.focus)}` : '',
    slide.focusMobile ? `--hs-focus-m:${esc(slide.focusMobile)}` : '',
  ].filter(Boolean).join(';');
  return `<picture class="hs__media"${style ? ` style="${style}"` : ''}>
          ${sources.join('\n          ')}
          <img src="${esc(desk.src)}"${desk.srcset ? ` srcset="${esc(desk.srcset)}" sizes="100vw"` : ''} alt="${esc(alt)}" width="1920" height="1080" decoding="async" ${first ? 'fetchpriority="high"' : 'loading="lazy" fetchpriority="low"'}>
        </picture>`;
}

function renderCta(cta, lang, cls) {
  const text = cta && pick(cta.text, lang);
  if (!text || !cta.link) return '';
  const external = /^https?:/i.test(cta.link);
  return `<a class="${cls}" href="${esc(localHref(cta.link, lang))}"${external ? ' target="_blank" rel="noopener"' : ''}>${esc(text)}${cls.includes('primary') ? icon('arrowRight') : ''}</a>`;
}

function renderHeroSlider(hp, lang) {
  const slides = getSlides(hp);
  if (!slides.length) return '';
  const t = T[lang];
  const hero = hp.hero || {};
  const cfg = Object.assign({ autoplay: true, interval: 7 }, hp.heroSlider || {});
  const n = slides.length;
  const w1 = pick(hero.rebusWord1, lang); const mark = pick(hero.rebusMark, lang); const w2 = pick(hero.rebusWord2, lang);
  const pad = (i) => String(i).padStart(2, '0');

  return `
  <section class="hs" id="hero" aria-roledescription="carousel" aria-label="${esc(t.label)}"
    data-hs data-autoplay="${cfg.autoplay !== false && n > 1 ? 'true' : 'false'}" data-interval="${Math.max(3, Number(cfg.interval) || 7)}">
    <h1 class="cc-visually-hidden">${esc(pick(hero.headline, lang) || pick(hero.eyebrow, lang))}</h1>
    ${w1 || mark ? `<p class="hs__brand" aria-hidden="true"><span>${esc(w1)}</span><span class="hs__mark">${esc(mark)}</span><span>${esc(w2)}</span></p>` : ''}
    <div class="hs__viewport" data-hs-viewport>
      ${slides.map((s, i) => `
      <div class="hs__slide${i === 0 ? ' is-active' : ''}" id="hs-slide-${i + 1}" role="group" aria-roledescription="slide"
        aria-label="${esc(t.slide(i + 1, n))}"${i === 0 ? '' : ' aria-hidden="true" inert'} data-hs-slide>
        ${renderPicture(s, lang, i === 0)}
        <div class="hs__shade" aria-hidden="true"></div>
        <div class="cc-wrap hs__content">
          ${pick(s.kicker, lang) ? `<p class="hs__kicker">${esc(pick(s.kicker, lang))}</p>` : ''}
          <h2 class="hs__title">${esc(pick(s.title, lang))}</h2>
          ${pick(s.description, lang) ? `<p class="hs__text">${esc(pick(s.description, lang))}</p>` : ''}
          <div class="hs__actions">
            ${renderCta(s.cta, lang, 'cc-btn cc-btn--primary hs__cta')}
            ${renderCta(s.secondaryCta, lang, 'cc-btn cc-btn--on-dark hs__cta hs__cta--ghost')}
          </div>
        </div>
      </div>`).join('')}
    </div>
    ${n > 1 ? `
    <div class="hs__controls" hidden data-hs-controls>
      <div class="cc-wrap hs__controls-inner">
        <p class="hs__count" aria-hidden="true"><span data-hs-current>01</span><span class="hs__count-sep"></span><span>${pad(n)}</span></p>
        <div class="hs__dots">
          ${slides.map((s, i) => `<button type="button" class="hs__dot" data-hs-dot="${i}" aria-controls="hs-slide-${i + 1}" aria-label="${esc(t.goTo(i + 1))}"${i === 0 ? ' aria-current="true"' : ''}><span class="hs__dot-bar"><span class="hs__dot-fill"></span></span></button>`).join('')}
        </div>
        <div class="hs__nav">
          <button type="button" class="hs__btn hs__btn--toggle" data-hs-toggle aria-label="${esc(t.pause)}" data-label-pause="${esc(t.pause)}" data-label-play="${esc(t.play)}">
            <svg class="cc-icon hs__icon-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>
            <svg class="cc-icon hs__icon-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l11 7-11 7z"/></svg>
          </button>
          <button type="button" class="hs__btn hs__btn--arrow" data-hs-prev aria-label="${esc(t.prev)}">${icon('chevronLeft')}</button>
          <button type="button" class="hs__btn hs__btn--arrow" data-hs-next aria-label="${esc(t.next)}">${icon('chevronRight')}</button>
        </div>
      </div>
    </div>` : ''}
  </section>`;
}

module.exports = { renderHeroSlider, heroPreload, getSlides };
