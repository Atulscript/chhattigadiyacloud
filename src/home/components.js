// Chhattisgadhiya Cloud - homepage sections (build time, Node).
// Copy lives in siteData.homepage (editable in the admin panel); plays,
// magazine, festivals and camps come from their own sections of siteData.

const { esc, pick, localHref, icon, picture, sectionHead, formButton, folkDivider } = require('../site/ui.js');
const { upcoming } = require('../site/events.js');
const { renderTicket } = require('../site/tickets.js');
const { ART: PLAY_ART } = require('../pages/plays.js');
const { renderHeroSlider, renderHeroReel } = require('./hero.js');

const TILE_ICONS = { theatre: 'mask', fest: 'tent', camp: 'users', mag: 'book' };

const T = {
  en: {
    heroAlt: 'Illustration of two folk performers dancing on a stage',
    newIssue: 'New issue', readFree: (n) => `Read ${n} pages free`, buyFor: (p) => `Buy · ${p}`, coverAlt: (m) => `Cover of the ${m} issue`,
    ourPlays: 'Our plays', ourPlaysSub: 'Available to book for festivals, colleges and venues.',
    allPlays: 'All plays', book: 'Book this play', details: 'Details', artAlt: (t) => `Illustration for ${t}`,
    comingUp: 'Coming up', comingUpSub: 'Festivals and camps in Jashpur. Entry to our festivals is free.', details: 'Details', kindFestival: 'Festival', kindCamp: 'Summer camp', fullCalendar: "See what's on", pass: 'Reserve free pass', register: 'Register child',
    nothingTitle: 'New dates coming soon', nothingText: 'Leave your email below to hear about shows, festivals and camps first.', getUpdates: 'Get updates',
    roots: 'Our roots', rootsSub: 'Three folk traditions shape everything we make.',
    critics: 'What critics say', explore: 'Explore',
    gallery: 'From the stage', galleryKicker: 'Gallery', gallerySub: 'Moments from our plays, festivals and camps.',
    artists: 'The people behind the stage', artistsSub: 'Writers, directors and performers who make every show.', meet: 'Meet the team',
  },
  hi: {
    heroAlt: 'मंच पर नृत्य करते दो लोक कलाकारों का चित्रांकन',
    newIssue: 'नया अंक', readFree: (n) => `${n} पृष्ठ निःशुल्क पढ़ें`, buyFor: (p) => `खरीदें · ${p}`, coverAlt: (m) => `${m} अंक का मुखपृष्ठ`,
    ourPlays: 'हमारे नाटक', ourPlaysSub: 'समारोहों, कॉलेजों और सभागारों के लिए बुकिंग उपलब्ध।',
    allPlays: 'सभी नाटक', book: 'नाटक बुक करें', details: 'विवरण', artAlt: (t) => `${t} का चित्रांकन`,
    comingUp: 'आगामी', comingUpSub: 'जशपुर में समारोह और शिविर। हमारे समारोहों में प्रवेश निःशुल्क है।', details: 'विवरण', kindFestival: 'समारोह', kindCamp: 'समर कैम्प', fullCalendar: 'सभी कार्यक्रम', pass: 'निःशुल्क पास', register: 'पंजीकरण',
    nothingTitle: 'नई तिथियां जल्द', nothingText: 'नाटक, समारोह और शिविर की खबर सबसे पहले पाने के लिए नीचे ईमेल दें।', getUpdates: 'सूचना पाएं',
    roots: 'हमारी जड़ें', rootsSub: 'तीन लोक परंपराएं हमारे हर काम को आकार देती हैं।',
    critics: 'समीक्षक क्या कहते हैं', explore: 'देखें',
    gallery: 'मंच से', galleryKicker: 'चित्र दीर्घा', gallerySub: 'हमारे नाटकों, समारोहों और शिविरों के कुछ पल।',
    artists: 'मंच के पीछे के लोग', artistsSub: 'लेखक, निर्देशक और कलाकार जो हर प्रस्तुति रचते हैं।', meet: 'पूरी टीम देखें',
  },
};

function renderHero(ctx) {
  const { lang, hp, magazine, config } = ctx;
  const t = T[lang];
  const hero = hp.hero || {};
  const issue = magazine.currentIssue || {};
  const cover = issue.coverImg || '/src/assets/images/mag-issue-14-cover.svg';
  const art = hero.photo || hero.bannerImage || '/src/assets/images/hero-art.svg';
  const w1 = pick(hero.rebusWord1, lang); const mark = pick(hero.rebusMark, lang); const w2 = pick(hero.rebusWord2, lang);
  return `
  <section class="hm-hero" aria-labelledby="hm-hero-title">
    <div class="cc-wrap hm-hero__grid">
      <div class="hm-hero__copy">
        <p class="hm-hero__tagline" aria-label="${esc(`${w1} ${mark} ${w2}`)}">
          <span>${esc(w1)}</span><span class="hm-hero__mark">${esc(mark)}</span><span>${esc(w2)}</span>
        </p>
        <h1 class="cc-h1 hm-hero__title" id="hm-hero-title">${esc(pick(hero.headline, lang) || pick(hero.eyebrow, lang))}</h1>
        <p class="cc-lead hm-hero__lead">${esc(pick(hero.statement, lang))}</p>
        <div class="cc-actions cc-actions--stack">
          <a class="cc-btn cc-btn--primary" href="${localHref(hero.primaryCta && hero.primaryCta.link, lang)}">${esc(pick(hero.primaryCta && hero.primaryCta.text, lang))}</a>
          <a class="cc-btn cc-btn--secondary" href="${localHref(hero.secondaryCta && hero.secondaryCta.link, lang)}">${esc(pick(hero.secondaryCta && hero.secondaryCta.text, lang))}</a>
        </div>
      </div>
      <div class="hm-hero__visual">
        <div class="hm-hero__art">${picture(art, hero.photoAlt || t.heroAlt, { width: 800, height: 520, eager: true })}</div>
        <a class="hm-issue" href="/${lang}/magazine/">
          <img class="hm-issue__cover" src="${esc(cover)}" alt="${esc(t.coverAlt(pick(issue.month, lang)))}" width="400" height="560">
          <span class="hm-issue__text">
            <span class="cc-kicker">${t.newIssue} · ${esc(pick(issue.month, lang))}</span>
            <span class="hm-issue__title">${esc(pick(issue.title, lang))}</span>
            <span class="hm-issue__cta">${esc(t.readFree(config.previewPages))}${icon('arrowRight')}</span>
          </span>
        </a>
      </div>
    </div>
  </section>`;
}

// Responsive sources for a local card image: name.jpg + name-480.jpg and
// their .webp siblings when present (generate-card-art.js writes all four).
const fs = require('fs');
const pathMod = require('path');
const ROOT = pathMod.join(__dirname, '..', '..');
function cardPicture(src, alt) {
  if (!src) return '';
  const m = /^(\/[^?#]+)\.(jpe?g|png)$/i.exec(src);
  const has = (f) => fs.existsSync(pathMod.join(ROOT, f));
  const sizes = '(min-width: 1100px) 280px, (min-width: 640px) 50vw, 100vw';
  if (!m) return `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  const [, base, ext] = m;
  const set = (e) => [has(`${base}-480.${e}`) ? `${base}-480.${e} 480w` : '', has(`${base}.${e}`) ? `${base}.${e} 800w` : ''].filter(Boolean).join(', ');
  const webp = set('webp');
  const jpg = set(ext);
  return `<picture>${webp ? `<source type="image/webp" srcset="${esc(webp)}" sizes="${sizes}">` : ''}<img src="${esc(src)}"${jpg ? ` srcset="${esc(jpg)}" sizes="${sizes}"` : ''} alt="${esc(alt)}" width="800" height="1000" loading="lazy" decoding="async"></picture>`;
}

// Four arts cards: artwork with the icon, title and text laid over its lower
// part, and the call to action in a strip below the image.
// Copy and images live in siteData.homepage.featuredTiles (admin editable).
function renderExplore(ctx) {
  const { lang, hp } = ctx;
  return `
  <section class="hm-explore hm-art hm-art--tree" aria-label="${T[lang].explore}">
    <div class="cc-wrap">
      <ul class="hm-explore__grid">
        ${(hp.featuredTiles || []).map((tile) => `
        <li>
          <a class="hm-card" href="${localHref(tile.href, lang)}">
            <span class="hm-card__media">
              ${cardPicture(tile.image, pick(tile.imageAlt, lang))}
              <span class="hm-card__overlay">
                <span class="hm-card__icon">${icon(TILE_ICONS[tile.theme] || 'mask')}</span>
                <span class="hm-card__title">${esc(pick(tile.title, lang))}</span>
                <span class="hm-card__desc">${esc(pick(tile.desc, lang))}</span>
              </span>
            </span>
            <span class="hm-card__cta">${esc(pick(tile.linkText, lang))}<span aria-hidden="true" class="hm-card__arrow">→</span></span>
          </a>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderPlayCard(p, lang) {
  const t = T[lang];
  const title = pick(p.title, lang);
  const art = p.photo || p.image || p.poster || PLAY_ART[p.id] || '/src/assets/images/hero-art.svg';
  return `
        <li class="hm-play">
          <div class="hm-play__art">${picture(art, p.photoAlt || t.artAlt(title), { width: 640, height: 360 })}</div>
          <div class="hm-play__body">
            <p class="cc-kicker">${esc(pick(p.genre, lang))} · ${esc(p.year)}</p>
            <h3 class="hm-play__title"><a href="/${lang}/productions/#${esc(p.id)}">${esc(title)}</a></h3>
            <p class="hm-play__sub">${esc(pick(p.subtitle, lang))}</p>
            <p class="hm-play__meta">${esc([p.duration, p.language].filter(Boolean).join(' · '))}</p>
          </div>
          <div class="hm-play__actions">
            ${formButton({ lang, form: 'booking', label: t.book, variant: 'secondary', size: 'sm', prefill: { play: p.id } })}
            <a class="cc-link" href="/${lang}/productions/#${esc(p.id)}">${t.details}</a>
          </div>
        </li>`;
}

function renderPlays(ctx) {
  const { lang, productions } = ctx;
  const t = T[lang];
  if (!productions.length) return '';
  return `
  <section class="cc-section hm-art hm-art--masks" aria-labelledby="hm-plays-title">
    <div class="cc-wrap">
      ${folkDivider()}
      ${sectionHead(t.ourPlays, { id: 'hm-plays-title', sub: t.ourPlaysSub, link: { href: `/${lang}/productions/`, label: t.allPlays } })}
      <ul class="hm-plays">${productions.map((p) => renderPlayCard(p, lang)).join('')}</ul>
    </div>
  </section>`;
}

// From the stage: a photo strip. Scrolls sideways on phones, a mixed-size
// grid on wider screens. Images come from homepage.gallery (admin).
function renderGallery(ctx) {
  const { lang, hp } = ctx;
  const t = T[lang];
  const items = (hp.gallery || []).filter((g) => g && g.image);
  if (!items.length) return '';
  const full = (src) => src.replace(/-1280(\.\w+)$/, '$1');
  return `
  <section class="hm-gallery" aria-labelledby="hm-gallery-title">
    <div class="hm-gallery__film" aria-hidden="true"></div>
    <div class="cc-wrap">
      <div class="hm-gallery__head">
        <p class="hm-gallery__kicker">${icon('star')}<span>${t.galleryKicker}</span></p>
        <h2 class="cc-h2 hm-gallery__title" id="hm-gallery-title">${t.gallery}</h2>
        <p class="hm-gallery__sub">${t.gallerySub}</p>
      </div>
      <ul class="hm-gallery__grid" data-cc-lightbox>
        ${items.map((g, i) => `
        <li class="hm-gallery__item">
          <a class="hm-gallery__link" href="${esc(full(g.image))}" data-caption="${esc(pick(g.caption, lang))}">
            ${picture(g.image, pick(g.alt, lang) || pick(g.caption, lang), { width: 1280, height: 720 })}
            <span class="hm-gallery__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
            ${pick(g.caption, lang) ? `<span class="hm-gallery__cap">${esc(pick(g.caption, lang))}</span>` : ''}
            <span class="hm-gallery__zoom" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></span>
          </a>
        </li>`).join('')}
      </ul>
    </div>
    <div class="hm-gallery__film hm-gallery__film--bottom" aria-hidden="true"></div>
  </section>`;
}

function renderMagazineFeature(ctx) {
  const { lang, magazine, config } = ctx;
  const t = T[lang];
  const issue = magazine.currentIssue || {};
  if (!issue.title) return '';
  return `
  <section class="hm-mag" aria-labelledby="hm-mag-title">
    <div class="cc-wrap hm-mag__grid">
      <a class="hm-mag__cover" href="/${lang}/magazine/">
        <img src="${esc(issue.coverImg || '/src/assets/images/mag-issue-14-cover.svg')}" alt="${esc(t.coverAlt(pick(issue.month, lang)))}" width="400" height="560" loading="lazy" decoding="async">
      </a>
      <div>
        <p class="cc-kicker hm-mag__kicker">${t.newIssue} · ${esc(pick(issue.month, lang))}</p>
        <h2 class="cc-h2 hm-mag__title" id="hm-mag-title">${esc(pick(issue.title, lang))}</h2>
        <p class="hm-mag__desc">${esc(pick(issue.description, lang) || pick(magazine.tagline, lang))}</p>
        <div class="cc-actions cc-actions--stack">
          <a class="cc-btn cc-btn--primary" href="/${lang}/magazine/#mz-reader">${esc(t.readFree(config.previewPages))}</a>
          <a class="cc-btn cc-btn--on-dark" href="/${lang}/magazine/#mz-buy">${esc(t.buyFor(`${config.currency}${config.digitalPrice}`))}</a>
        </div>
      </div>
    </div>
  </section>`;
}

// Coming up: the next three events as theatre tickets. The stub carries the
// date, status and type; site.js fills in the "starts in N days" countdown.
function renderComingUp(ctx) {
  const { lang, siteData } = ctx;
  const t = T[lang];
  const items = upcoming(siteData).slice(0, 3);
  const cards = items.map((item) => renderTicket(item, lang)).join('');
  return `
  <section class="cc-section cc-section--tint hm-upcoming hm-art hm-art--horse" aria-labelledby="hm-upcoming-title">
    <div class="cc-wrap">
      ${sectionHead(t.comingUp, { id: 'hm-upcoming-title', sub: t.comingUpSub, link: { href: `/${lang}/whats-on/`, label: t.fullCalendar } })}
      ${items.length ? `<ol class="cc-tickets">${cards}</ol>` : `<div class="cc-empty"><h3 class="cc-h3">${t.nothingTitle}</h3><p>${t.nothingText}</p><div class="cc-actions"><a class="cc-btn cc-btn--secondary" href="#newsletter">${t.getUpdates}</a></div></div>`}
    </div>
  </section>`;
}

// Our roots: one colour and one folk pattern per tradition (theatre / dance /
// craft), a numbered art band with the icon in a medallion, then the text.
function renderRoots(ctx) {
  const { lang, hp } = ctx;
  const t = T[lang];
  const items = hp.traditions || [];
  if (!items.length) return '';
  const icons = ['mask', 'drum', 'palette'];
  const tones = ['clay', 'saffron', 'forest'];
  return `
  <section class="cc-section hm-roots hm-art hm-art--sun" aria-labelledby="hm-roots-title">
    <div class="cc-wrap">
      ${folkDivider()}
      ${sectionHead(t.roots, { id: 'hm-roots-title', sub: t.rootsSub })}
      <ol class="hm-roots__grid">
        ${items.map((r, i) => `
        <li class="hm-root hm-root--${tones[i % tones.length]}">
          <div class="hm-root__art" aria-hidden="true">
            <span class="hm-root__num">${String(i + 1).padStart(2, '0')}</span>
            <span class="hm-root__medal">${r.image ? `<img src="${esc(r.image)}" alt="" loading="lazy">` : icon(icons[i % icons.length])}</span>
          </div>
          <div class="hm-root__body">
            <p class="hm-root__kicker">${esc(pick(r.subtitle, lang))}</p>
            <h3 class="hm-root__title">${esc(pick(r.title, lang))}</h3>
            <p class="hm-root__text">${esc(pick(r.desc, lang))}</p>
          </div>
        </li>`).join('')}
      </ol>
    </div>
  </section>`;
}

// What critics say: a dark stage band with gold quote marks.
// The people behind the stage: directors from about.team, with portrait,
// role, badge and a line from their bio.
function renderArtists(ctx) {
  const { lang, siteData } = ctx;
  const t = T[lang];
  const team = ((siteData.about || {}).team || []).slice(0, 3);
  if (!team.length) return '';
  return `
  <section class="cc-section hm-artists" aria-labelledby="hm-artists-title">
    <div class="cc-wrap">
      ${sectionHead(t.artists, { id: 'hm-artists-title', sub: t.artistsSub, link: { href: `/${lang}/about/`, label: t.meet } })}
      <ul class="hm-artists__grid">
        ${team.map((m) => `
        <li class="hm-artist">
          <div class="hm-artist__portrait">${m.image ? `<img src="${esc(m.image)}" alt="" width="160" height="160" loading="lazy" decoding="async">` : `<span>${esc((m.name || '?').split(' ').map((w) => w[0]).slice(0, 2).join(''))}</span>`}</div>
          ${m.badge ? `<p class="hm-artist__badge">${esc(pick(m.badge, lang))}</p>` : ''}
          <h3 class="hm-artist__name">${esc(m.name)}</h3>
          <p class="hm-artist__role">${esc(pick(m.role, lang))}</p>
          ${m.bio ? `<p class="hm-artist__bio">${esc(pick(m.bio, lang))}</p>` : ''}
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderCritics(ctx) {
  const { lang, hp } = ctx;
  const quotes = hp.criticsPraise || [];
  if (!quotes.length) return '';
  const initials = (name) => name.split(/\s+/).filter((w) => /^[A-Za-zऀ-ॿ]/.test(w) && !/^(the|of)$/i.test(w)).slice(0, 2).map((w) => w[0]).join('');
  return `
  <section class="cc-section hm-critics" aria-labelledby="hm-critics-title">
    <div class="cc-wrap">
      <div class="hm-critics__head">
        <span class="hm-critics__mark" aria-hidden="true">“</span>
        <h2 class="cc-h2" id="hm-critics-title">${T[lang].critics}</h2>
      </div>
      <ul class="hm-critics__grid" data-cc-autoslide>
        ${quotes.map((q) => {
          const pub = pick(q.publication, lang);
          return `
        <li><figure class="hm-critic">
          <blockquote${lang === 'hi' && !(q.quote && q.quote.hi) ? ' lang="en"' : ''}>${esc(pick(q.quote, lang))}</blockquote>
          <figcaption>
            <span class="hm-critic__mono" aria-hidden="true">${esc(initials(pub))}</span>
            <span><strong>${esc(pub)}</strong>${q.tag ? `<span>${esc(pick(q.tag, lang))}</span>` : ''}</span>
          </figcaption>
        </figure></li>`;
        }).join('')}
      </ul>
    </div>
  </section>`;
}

function renderClosingCta(ctx) {
  const { lang, hp } = ctx;
  const vh = hp.visualHighlight || {};
  if (!vh.title) return '';
  return `
  <section class="cc-section hm-art hm-art--tree-left" aria-labelledby="hm-cta-title">
    <div class="cc-wrap">
      <div class="cc-callout">
        <div><h2 class="cc-h2" id="hm-cta-title">${esc(pick(vh.title, lang))}</h2><p>${esc(pick(vh.desc, lang))}</p></div>
        ${formButton({ lang, form: 'booking', label: pick(vh.btnText, lang) })}
      </div>
    </div>
  </section>`;
}

function renderHomePage(siteData, lang) {
  const magazine = siteData.magazine || {};
  const hp = siteData.homepage || {};
  const ctx = {
    lang, hp, magazine, siteData,
    config: Object.assign({ currency: '₹', digitalPrice: 99, previewPages: 5 }, magazine.config || {}),
    productions: siteData.productions || [],
  };
  return `
  <div class="hm">
    ${renderHeroReel(hp, lang, siteData) || renderHeroSlider(hp, lang) || renderHero(ctx)}
    ${renderExplore(ctx)}
    ${renderComingUp(ctx)}
    ${renderGallery(ctx)}
    ${renderPlays(ctx)}
    ${renderMagazineFeature(ctx)}
    ${renderRoots(ctx)}
    ${renderArtists(ctx)}
    ${renderCritics(ctx)}
    ${renderClosingCta(ctx)}
  </div>`;
}

module.exports = { renderHomePage };
