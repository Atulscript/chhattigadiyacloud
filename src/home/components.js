// Chhattisgadhiya Cloud - homepage sections (build time, Node).
// Copy lives in siteData.homepage (editable in the admin panel); plays,
// magazine and workshop details come from their own sections of siteData.

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = (v, lang) => (v && typeof v === 'object' ? (v[lang] || v.en || '') : (v || ''));
// Internal links in data are stored language-neutral ("/magazine/").
const localHref = (href, lang) => (href && href.startsWith('/') ? `/${lang}${href.replace(/^\/(en|hi)\//, '/')}` : href || '#');

const ARROW = '<svg class="hm-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const TILE_ICONS = {
  theatre: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 7.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z',
  fest: 'M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z',
  camp: 'M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  mag: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
};
const PLAY_ART = {
  'kahani-vasu-ki': '/src/assets/images/play-vasu.svg',
  'vincent-a-flashback': '/src/assets/images/play-vincent.svg',
  'gabar-ghichor': '/src/assets/images/play-gabar.svg',
  'raja-ravi-verma': '/src/assets/images/play-raja.svg',
};

const T = {
  en: {
    newIssue: 'New issue', readFree: (n) => `Read ${n} pages free`, buyFor: (p) => `Buy · ${p}`,
    ourPlays: 'Our plays', ourPlaysSub: 'Available to book for festivals, colleges and venues.',
    allPlays: 'All plays', book: 'Book this play', details: 'Details',
    comingUp: 'Coming up', nextSeason: 'Next season', nextSeasonTitle: 'New shows will be announced soon',
    nextSeasonText: 'Get dates and tickets first by joining our mailing list.', getUpdates: 'Get updates',
    camp: 'Workshop', enquire: 'Enquire now', fullCalendar: "See what's on",
    roots: 'Our roots', rootsSub: 'Three folk traditions shape everything we make.',
    critics: 'What critics say', statsLabel: 'In numbers', explore: 'Explore',
  },
  hi: {
    newIssue: 'नया अंक', readFree: (n) => `${n} पृष्ठ निःशुल्क पढ़ें`, buyFor: (p) => `खरीदें · ${p}`,
    ourPlays: 'हमारे नाटक', ourPlaysSub: 'समारोहों, कॉलेजों और सभागारों के लिए बुकिंग उपलब्ध।',
    allPlays: 'सभी नाटक', book: 'नाटक बुक करें', details: 'विवरण',
    comingUp: 'आगामी', nextSeason: 'अगला सत्र', nextSeasonTitle: 'नई प्रस्तुतियों की घोषणा जल्द',
    nextSeasonText: 'तिथियां और टिकट सबसे पहले पाने के लिए हमारी मेलिंग सूची से जुड़ें।', getUpdates: 'सूचना पाएं',
    camp: 'कार्यशाला', enquire: 'पूछताछ करें', fullCalendar: 'आगामी कार्यक्रम देखें',
    roots: 'हमारी जड़ें', rootsSub: 'तीन लोक परंपराएं हमारे हर काम को आकार देती हैं।',
    critics: 'समीक्षक क्या कहते हैं', statsLabel: 'आंकड़ों में', explore: 'देखें',
  },
};

function sectionHead(title, { sub = '', id = '', link = null } = {}) {
  return `
      <div class="hm-head">
        <div>
          <h2 class="hm-head__title"${id ? ` id="${id}"` : ''}>${esc(title)}</h2>
          ${sub ? `<p class="hm-head__sub">${esc(sub)}</p>` : ''}
        </div>
        ${link ? `<a class="hm-link" href="${link.href}">${esc(link.label)}${ARROW}</a>` : ''}
      </div>`;
}

function renderHero(ctx) {
  const { lang, hp, magazine, config } = ctx;
  const t = T[lang];
  const hero = hp.hero || {};
  const issue = magazine.currentIssue || {};
  const cover = issue.coverImg || '/src/assets/images/mag-issue-14-cover.svg';
  const art = hero.bannerImage || '/src/assets/images/hero-art.svg';
  const w1 = pick(hero.rebusWord1, lang); const mark = pick(hero.rebusMark, lang); const w2 = pick(hero.rebusWord2, lang);
  return `
  <section class="hm-hero" aria-labelledby="hm-hero-title">
    <div class="cc-wrap hm-hero__grid">
      <div class="hm-hero__copy">
        <p class="hm-hero__tagline" aria-label="${esc(`${w1} ${mark} ${w2}`)}">
          <span>${esc(w1)}</span><span class="hm-hero__mark">${esc(mark)}</span><span>${esc(w2)}</span>
        </p>
        <h1 class="hm-hero__title" id="hm-hero-title">${esc(pick(hero.headline, lang) || pick(hero.eyebrow, lang))}</h1>
        <p class="hm-hero__lead">${esc(pick(hero.statement, lang))}</p>
        <div class="hm-actions">
          <a class="cc-btn cc-btn--accent hm-btn-lg" href="${localHref(hero.primaryCta && hero.primaryCta.link, lang)}">${esc(pick(hero.primaryCta && hero.primaryCta.text, lang))}</a>
          <a class="cc-btn hm-btn-outline hm-btn-lg" href="${localHref(hero.secondaryCta && hero.secondaryCta.link, lang)}">${esc(pick(hero.secondaryCta && hero.secondaryCta.text, lang))}</a>
        </div>
      </div>
      <div class="hm-hero__visual">
        <div class="hm-hero__art">
          <img src="${esc(art)}" alt="" width="800" height="520" fetchpriority="high" decoding="async">
        </div>
        <a class="hm-issue" href="/${lang}/magazine/">
          <img class="hm-issue__cover" src="${esc(cover)}" alt="" width="400" height="560">
          <span class="hm-issue__text">
            <span class="hm-issue__kicker">${t.newIssue} · ${esc(pick(issue.month, lang))}</span>
            <span class="hm-issue__title">${esc(pick(issue.title, lang))}</span>
            <span class="hm-issue__cta">${esc(t.readFree(config.previewPages))}${ARROW}</span>
          </span>
        </a>
      </div>
    </div>
  </section>`;
}

function renderExplore(ctx) {
  const { lang, hp } = ctx;
  const tiles = hp.featuredTiles || [];
  return `
  <section class="hm-explore" aria-label="${T[lang].explore}">
    <div class="cc-wrap">
      <ul class="hm-explore__grid">
        ${tiles.map((tile) => `
        <li>
          <a class="hm-tile hm-tile--${esc(tile.theme)}" href="${localHref(tile.href, lang)}">
            <span class="hm-tile__icon"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${TILE_ICONS[tile.theme] || TILE_ICONS.theatre}"/></svg></span>
            <span class="hm-tile__body">
              <span class="hm-tile__top"><span class="hm-tile__title">${esc(pick(tile.title, lang))}</span><span class="hm-tile__tag">${esc(pick(tile.tag, lang))}</span></span>
              <span class="hm-tile__desc">${esc(pick(tile.desc, lang))}</span>
              <span class="hm-tile__link">${esc(pick(tile.linkText, lang))}${ARROW}</span>
            </span>
          </a>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderStats(ctx) {
  const { lang, hp } = ctx;
  const stats = hp.impactStats || [];
  if (!stats.length) return '';
  return `
  <section class="hm-stats" aria-label="${T[lang].statsLabel}">
    <div class="cc-wrap">
      <dl class="hm-stats__grid">
        ${stats.map((s) => `
        <div class="hm-stat">
          <dt class="hm-stat__label">${esc(pick(s.label, lang))}</dt>
          <dd class="hm-stat__num">${esc(s.number)}</dd>
          <dd class="hm-stat__sub">${esc(pick(s.sub, lang))}</dd>
        </div>`).join('')}
      </dl>
    </div>
  </section>`;
}

function renderPlayCard(p, lang) {
  const t = T[lang];
  const art = p.image || p.poster || p.banner || PLAY_ART[p.id] || '/src/assets/images/hero-art.svg';
  const meta = [p.duration, p.language].filter(Boolean).join(' · ');
  return `
        <li class="hm-play">
          <a class="hm-play__art" href="/${lang}/productions/#${esc(p.id)}" tabindex="-1" aria-hidden="true">
            <img src="${esc(art)}" alt="" width="640" height="360" loading="lazy">
          </a>
          <div class="hm-play__body">
            <p class="hm-play__genre">${esc(pick(p.genre, lang))} · ${esc(p.year)}</p>
            <h3 class="hm-play__title"><a href="/${lang}/productions/#${esc(p.id)}">${esc(pick(p.title, lang))}</a></h3>
            <p class="hm-play__sub">${esc(pick(p.subtitle, lang))}</p>
            ${meta ? `<p class="hm-play__meta">${esc(meta)}</p>` : ''}
          </div>
          <div class="hm-play__actions">
            <a class="cc-btn cc-btn--dark cc-btn--sm" href="/${lang}/contact/?subject=Booking-${esc(p.id)}">${t.book}</a>
            <a class="hm-link hm-link--sm" href="/${lang}/productions/#${esc(p.id)}">${t.details}</a>
          </div>
        </li>`;
}

function renderPlays(ctx) {
  const { lang, productions } = ctx;
  const t = T[lang];
  if (!productions.length) return '';
  return `
  <section class="hm-section" aria-labelledby="hm-plays-title">
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
  const cover = issue.coverImg || '/src/assets/images/mag-issue-14-cover.svg';
  return `
  <section class="hm-mag" aria-labelledby="hm-mag-title">
    <div class="cc-wrap hm-mag__grid">
      <a class="hm-mag__cover" href="/${lang}/magazine/" tabindex="-1" aria-hidden="true">
        <img src="${esc(cover)}" alt="" width="400" height="560" loading="lazy">
      </a>
      <div class="hm-mag__copy">
        <p class="hm-kicker hm-kicker--light">${t.newIssue} · ${esc(pick(issue.month, lang))}</p>
        <h2 class="hm-mag__title" id="hm-mag-title">${esc(pick(issue.title, lang))}</h2>
        <p class="hm-mag__desc">${esc(pick(issue.description, lang) || pick(magazine.tagline, lang))}</p>
        <div class="hm-actions">
          <a class="cc-btn cc-btn--accent hm-btn-lg" href="/${lang}/magazine/#mz-reader">${esc(t.readFree(config.previewPages))}</a>
          <a class="cc-btn cc-btn--light hm-btn-lg" href="/${lang}/magazine/#mz-buy">${esc(t.buyFor(`${config.currency}${config.digitalPrice}`))}</a>
        </div>
      </div>
    </div>
  </section>`;
}

function renderComingUp(ctx) {
  const { lang, workshops } = ctx;
  const t = T[lang];
  const batch = (workshops && workshops.upcomingBatch) || null;
  return `
  <section class="hm-section" aria-labelledby="hm-upcoming-title">
    <div class="cc-wrap">
      ${sectionHead(t.comingUp, { id: 'hm-upcoming-title', link: { href: `/${lang}/whats-on/`, label: t.fullCalendar } })}
      <div class="hm-upcoming">
        <article class="hm-card">
          <p class="hm-kicker">${t.nextSeason}</p>
          <h3 class="hm-card__title">${t.nextSeasonTitle}</h3>
          <p class="hm-card__text">${t.nextSeasonText}</p>
          <a class="cc-btn hm-btn-outline" href="#newsletter">${t.getUpdates}</a>
        </article>
        ${batch ? `
        <article class="hm-card hm-card--camp">
          <p class="hm-kicker">${t.camp}${batch.status ? ` · <span class="hm-status">${esc(pick(batch.status, lang))}</span>` : ''}</p>
          <h3 class="hm-card__title">${esc(pick(batch.title, lang))}</h3>
          <dl class="hm-facts">
            ${batch.dates ? `<div><dt>📅</dt><dd>${esc(pick(batch.dates, lang))}</dd></div>` : ''}
            ${batch.ageGroup ? `<div><dt>👧</dt><dd>${esc(pick(batch.ageGroup, lang).replace(/\s*\(.*\)\s*/, ''))}</dd></div>` : ''}
            ${batch.venue ? `<div><dt>📍</dt><dd>${esc(pick(batch.venue, lang))}</dd></div>` : ''}
          </dl>
          <a class="cc-btn cc-btn--dark" href="/${lang}/training-workshops/">${t.enquire}</a>
        </article>` : ''}
      </div>
    </div>
  </section>`;
}

function renderRoots(ctx) {
  const { lang, hp } = ctx;
  const t = T[lang];
  const items = hp.traditions || [];
  if (!items.length) return '';
  return `
  <section class="hm-section hm-section--tint" aria-labelledby="hm-roots-title">
    <div class="cc-wrap">
      ${sectionHead(t.roots, { id: 'hm-roots-title', sub: t.rootsSub })}
      <ul class="hm-roots">
        ${items.map((r) => `
        <li class="hm-root">
          ${r.image ? `<img class="hm-root__img" src="${esc(r.image)}" alt="" loading="lazy">` : `<span class="hm-root__icon" aria-hidden="true">${esc(r.icon || '🎭')}</span>`}
          <p class="hm-kicker">${esc(pick(r.subtitle, lang))}</p>
          <h3 class="hm-root__title">${esc(pick(r.title, lang))}</h3>
          <p class="hm-root__desc">${esc(pick(r.desc, lang))}</p>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderCritics(ctx) {
  const { lang, hp } = ctx;
  const quotes = hp.criticsPraise || [];
  if (!quotes.length) return '';
  return `
  <section class="hm-section" aria-labelledby="hm-critics-title">
    <div class="cc-wrap">
      ${sectionHead(T[lang].critics, { id: 'hm-critics-title' })}
      <ul class="hm-quotes">
        ${quotes.map((q) => `
        <li>
          <figure class="hm-quote">
            <blockquote lang="en">${esc(pick(q.quote, lang))}</blockquote>
            <figcaption><strong>${esc(pick(q.publication, lang))}</strong>${q.tag ? `<span>${esc(pick(q.tag, lang))}</span>` : ''}</figcaption>
          </figure>
        </li>`).join('')}
      </ul>
    </div>
  </section>`;
}

function renderClosingCta(ctx) {
  const { lang, hp } = ctx;
  const vh = hp.visualHighlight || {};
  if (!vh.title) return '';
  return `
  <section class="hm-cta" aria-labelledby="hm-cta-title"${vh.image ? ` style="--hm-cta-img:url('${esc(vh.image)}')"` : ''}>
    <div class="cc-wrap hm-cta__inner">
      <div>
        <h2 class="hm-cta__title" id="hm-cta-title">${esc(pick(vh.title, lang))}</h2>
        <p class="hm-cta__text">${esc(pick(vh.desc, lang))}</p>
      </div>
      <a class="cc-btn cc-btn--accent hm-btn-lg" href="${localHref(vh.btnHref, lang)}">${esc(pick(vh.btnText, lang))}</a>
    </div>
  </section>`;
}

function renderHomePage(siteData, lang) {
  const magazine = siteData.magazine || {};
  const ctx = {
    lang,
    hp: siteData.homepage || {},
    magazine,
    config: Object.assign({ currency: '₹', digitalPrice: 99, previewPages: 5 }, magazine.config || {}),
    productions: siteData.productions || [],
    workshops: siteData.workshops || {},
  };
  return `
  <div class="hm">
    ${renderHero(ctx)}
    ${renderExplore(ctx)}
    ${renderStats(ctx)}
    ${renderPlays(ctx)}
    ${renderMagazineFeature(ctx)}
    ${renderComingUp(ctx)}
    ${renderRoots(ctx)}
    ${renderCritics(ctx)}
    ${renderClosingCta(ctx)}
  </div>`;
}

module.exports = {
  renderHomePage,
  renderHero,
  renderExplore,
  renderStats,
  renderPlays,
  renderPlayCard,
  renderMagazineFeature,
  renderComingUp,
  renderRoots,
  renderCritics,
  renderClosingCta,
};
