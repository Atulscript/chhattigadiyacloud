// Chhattisgadhiya Cloud - homepage sections (build time, Node).
// Copy lives in siteData.homepage (editable in the admin panel); plays,
// magazine, festivals and camps come from their own sections of siteData.

const { esc, pick, localHref, icon, picture, sectionHead, stats, formButton } = require('../site/ui.js');
const { upcoming, dateBadge } = require('../site/events.js');
const { ART: PLAY_ART } = require('../pages/plays.js');
const { renderHeroSlider } = require('./hero.js');

const TILE_ICONS = { theatre: 'mask', fest: 'tent', camp: 'users', mag: 'book' };

const T = {
  en: {
    heroAlt: 'Illustration of two folk performers dancing on a stage',
    newIssue: 'New issue', readFree: (n) => `Read ${n} pages free`, buyFor: (p) => `Buy · ${p}`, coverAlt: (m) => `Cover of the ${m} issue`,
    ourPlays: 'Our plays', ourPlaysSub: 'Available to book for festivals, colleges and venues.',
    allPlays: 'All plays', book: 'Book this play', details: 'Details', artAlt: (t) => `Illustration for ${t}`,
    comingUp: 'Coming up', fullCalendar: "See what's on", pass: 'Reserve free pass', register: 'Register child',
    nothingTitle: 'New dates coming soon', nothingText: 'Leave your email below to hear about shows, festivals and camps first.', getUpdates: 'Get updates',
    roots: 'Our roots', rootsSub: 'Three folk traditions shape everything we make.',
    critics: 'What critics say', statsLabel: 'Our work in numbers', explore: 'Explore',
  },
  hi: {
    heroAlt: 'मंच पर नृत्य करते दो लोक कलाकारों का चित्रांकन',
    newIssue: 'नया अंक', readFree: (n) => `${n} पृष्ठ निःशुल्क पढ़ें`, buyFor: (p) => `खरीदें · ${p}`, coverAlt: (m) => `${m} अंक का मुखपृष्ठ`,
    ourPlays: 'हमारे नाटक', ourPlaysSub: 'समारोहों, कॉलेजों और सभागारों के लिए बुकिंग उपलब्ध।',
    allPlays: 'सभी नाटक', book: 'नाटक बुक करें', details: 'विवरण', artAlt: (t) => `${t} का चित्रांकन`,
    comingUp: 'आगामी', fullCalendar: 'सभी कार्यक्रम', pass: 'निःशुल्क पास', register: 'पंजीकरण',
    nothingTitle: 'नई तिथियां जल्द', nothingText: 'नाटक, समारोह और शिविर की खबर सबसे पहले पाने के लिए नीचे ईमेल दें।', getUpdates: 'सूचना पाएं',
    roots: 'हमारी जड़ें', rootsSub: 'तीन लोक परंपराएं हमारे हर काम को आकार देती हैं।',
    critics: 'समीक्षक क्या कहते हैं', statsLabel: 'आंकड़ों में हमारा काम', explore: 'देखें',
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

function renderExplore(ctx) {
  const { lang, hp } = ctx;
  return `
  <section class="hm-explore" aria-label="${T[lang].explore}">
    <div class="cc-wrap">
      <ul class="hm-explore__grid">
        ${(hp.featuredTiles || []).map((tile) => `
        <li>
          <a class="hm-tile" href="${localHref(tile.href, lang)}">
            <span class="hm-tile__icon">${icon(TILE_ICONS[tile.theme] || 'mask')}</span>
            <span class="hm-tile__body">
              <span class="hm-tile__top"><span class="hm-tile__title">${esc(pick(tile.title, lang))}</span><span class="hm-tile__tag">${esc(pick(tile.tag, lang))}</span></span>
              <span class="hm-tile__desc">${esc(pick(tile.desc, lang))}</span>
              <span class="hm-tile__link">${esc(pick(tile.linkText, lang))}${icon('arrowRight')}</span>
            </span>
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
  <section class="cc-section" aria-labelledby="hm-plays-title">
    <div class="cc-wrap">
      ${sectionHead(t.ourPlays, { id: 'hm-plays-title', sub: t.ourPlaysSub, link: { href: `/${lang}/productions/`, label: t.allPlays } })}
      <ul class="hm-plays">${productions.map((p) => renderPlayCard(p, lang)).join('')}</ul>
    </div>
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

function renderComingUp(ctx) {
  const { lang, siteData } = ctx;
  const t = T[lang];
  const items = upcoming(siteData).slice(0, 3);
  const cards = items.map((item) => {
    const d = dateBadge(item.start, lang);
    const isCamp = item.kind === 'camp';
    return `
        <li class="cc-event">
          <time class="cc-event__date" datetime="${d.iso}"><span class="cc-event__day">${esc(d.day)}</span><span class="cc-event__month">${esc(d.month)}</span></time>
          <div class="cc-event__body">
            <h3 class="cc-h3">${esc(pick(item.title, lang))}</h3>
            <p class="cc-muted">${esc(pick(item.dates, lang))} · ${esc(pick(item.venue, lang))}</p>
            <div class="cc-actions">${isCamp
              ? formButton({ lang, form: 'camp', label: t.register, variant: 'secondary', size: 'sm' })
              : formButton({ lang, form: 'pass', label: t.pass, variant: 'secondary', size: 'sm', prefill: { festival: item.id } })}</div>
          </div>
        </li>`;
  }).join('');
  return `
  <section class="cc-section cc-section--tint" aria-labelledby="hm-upcoming-title">
    <div class="cc-wrap">
      ${sectionHead(t.comingUp, { id: 'hm-upcoming-title', link: { href: `/${lang}/whats-on/`, label: t.fullCalendar } })}
      ${items.length ? `<ol class="cc-events">${cards}</ol>` : `<div class="cc-empty"><h3 class="cc-h3">${t.nothingTitle}</h3><p>${t.nothingText}</p><div class="cc-actions"><a class="cc-btn cc-btn--secondary" href="#newsletter">${t.getUpdates}</a></div></div>`}
    </div>
  </section>`;
}

function renderRoots(ctx) {
  const { lang, hp } = ctx;
  const t = T[lang];
  const items = hp.traditions || [];
  if (!items.length) return '';
  const icons = ['mask', 'drum', 'palette'];
  return `
  <section class="cc-section" aria-labelledby="hm-roots-title">
    <div class="cc-wrap">
      ${sectionHead(t.roots, { id: 'hm-roots-title', sub: t.rootsSub })}
      <ul class="cc-grid cc-grid--3">
        ${items.map((r, i) => `
        <li class="cc-card"><div class="cc-card__body">
          ${r.image ? `<img class="hm-root__img" src="${esc(r.image)}" alt="${esc(pick(r.title, lang))}" loading="lazy">` : `<span class="cc-tag cc-tag--clay" style="align-self:flex-start; padding:0.5rem">${icon(icons[i % icons.length])}</span>`}
          <p class="cc-kicker">${esc(pick(r.subtitle, lang))}</p>
          <h3 class="cc-h3">${esc(pick(r.title, lang))}</h3>
          <p class="cc-card__text">${esc(pick(r.desc, lang))}</p>
        </div></li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderCritics(ctx) {
  const { lang, hp } = ctx;
  const quotes = hp.criticsPraise || [];
  if (!quotes.length) return '';
  return `
  <section class="cc-section" aria-labelledby="hm-critics-title">
    <div class="cc-wrap">
      ${sectionHead(T[lang].critics, { id: 'hm-critics-title' })}
      <ul class="cc-grid cc-grid--3">
        ${quotes.map((q) => `
        <li><figure class="cc-quote">
          <blockquote lang="en">“${esc(pick(q.quote, lang))}”</blockquote>
          <figcaption><strong>${esc(pick(q.publication, lang))}</strong>${q.tag ? `<span>${esc(pick(q.tag, lang))}</span>` : ''}</figcaption>
        </figure></li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderClosingCta(ctx) {
  const { lang, hp } = ctx;
  const vh = hp.visualHighlight || {};
  if (!vh.title) return '';
  return `
  <section class="cc-section" aria-labelledby="hm-cta-title">
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
    ${renderHeroSlider(hp, lang) || renderHero(ctx)}
    ${renderExplore(ctx)}
    <section class="hm-stats" aria-label="${T[lang].statsLabel}"><div class="cc-wrap">${stats(hp.impactStats, lang)}</div></section>
    ${renderComingUp(ctx)}
    ${renderPlays(ctx)}
    ${renderMagazineFeature(ctx)}
    ${renderRoots(ctx)}
    ${renderCritics(ctx)}
    ${renderClosingCta(ctx)}
  </div>`;
}

module.exports = { renderHomePage };
