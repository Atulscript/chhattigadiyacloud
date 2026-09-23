// Festivals: Jashrang and Kavita Utsav, next edition first, then the archive.
const { esc, pick, icon, picture, pageHead, sectionHead, formButton } = require('../site/ui.js');
const { parseStart } = require('../site/events.js');

const ART = {
  'jashrang': '/src/assets/images/festival-jashrang.svg',
  'jashpur-kavita-utsav': '/src/assets/images/festival-kavita.svg',
};

const T = {
  en: {
    title: 'Festivals', lead: 'Two free festivals in Jashpur every year: Jashrang for theatre, Kavita Utsav for poetry.',
    next: 'Next edition', last: 'Latest edition', entry: 'Free entry', programme: 'Programme',
    pass: 'Reserve free pass', troupe: 'Apply to perform', poet: 'Register as a poet',
    archive: 'Past editions', sponsors: 'Supported by', artAlt: (n) => `Illustration for ${n}`,
    visitTitle: 'Plan your visit', visitText: 'Jashpur is in the hills of north-east Chhattisgarh. Nearest railway stations: Raigarh (160 km) and Ranchi (150 km). Nearest airports: Ranchi and Raipur.',
    volunteer: 'Volunteer with us',
  },
  hi: {
    title: 'समारोह', lead: 'जशपुर में हर वर्ष दो निःशुल्क समारोह: रंगमंच के लिए जशरंग और कविता के लिए कविता उत्सव।',
    next: 'अगला संस्करण', last: 'नवीनतम संस्करण', entry: 'निःशुल्क प्रवेश', programme: 'कार्यक्रम',
    pass: 'निःशुल्क पास आरक्षित करें', troupe: 'प्रस्तुति हेतु आवेदन', poet: 'कवि पंजीकरण',
    archive: 'पिछले संस्करण', sponsors: 'सहयोग', artAlt: (n) => `${n} का चित्रांकन`,
    visitTitle: 'जशपुर कैसे पहुंचें', visitText: 'जशपुर उत्तर-पूर्वी छत्तीसगढ़ की पहाड़ियों में है। निकटतम रेलवे स्टेशन: रायगढ़ (160 किमी) और रांची (150 किमी)। निकटतम हवाई अड्डे: रांची और रायपुर।',
    volunteer: 'स्वयंसेवक बनें',
  },
};

function renderFestival(fest, lang, today) {
  const t = T[lang];
  const name = pick(fest.name, lang);
  const editions = [...(fest.years || [])].sort((a, b) => b.year - a.year);
  const edition = editions[0];
  if (!edition) return '';
  const start = parseStart(edition.dates.en);
  const isNext = start && start >= today;
  const isPoetry = /kavita/.test(fest.id);
  return `
    <article class="cc-feature cc-feature--banner" id="${esc(fest.id)}" aria-labelledby="fest-${esc(fest.id)}">
      <div class="cc-feature__media">${picture(fest.photo || fest.bannerImage || fest.image || ART[fest.id], fest.photoAlt || t.artAlt(name), { width: 800, height: 360 })}</div>
      <div class="cc-feature__body">
        <p class="cc-kicker">${isNext ? t.next : t.last} · ${esc(edition.year)}</p>
        <h2 class="cc-h2" id="fest-${esc(fest.id)}">${esc(name)}</h2>
        <p class="cc-card__text">${esc(pick(fest.description, lang))}</p>
        <ul class="cc-facts">
          <li>${icon('calendar')}<span><strong>${esc(pick(edition.dates, lang))}</strong> · ${esc(pick(edition.theme, lang))}</span></li>
          <li>${icon('pin')}<span>${esc(pick(edition.venue, lang))}</span></li>
          <li>${icon('ticket')}<span>${t.entry}</span></li>
        </ul>
        ${(edition.schedule || []).length ? `
        <details${isNext ? ' open' : ''}>
          <summary class="cc-link" style="cursor:pointer">${t.programme}</summary>
          <ol class="cc-schedule" style="margin-top:0.5rem">
            ${edition.schedule.map((s) => `<li><span class="cc-schedule__when">${esc(s.day)} · ${esc(s.time)}</span><span class="cc-schedule__what" lang="en"><strong>${esc(s.event)}</strong><span>${esc(s.group)}</span></span></li>`).join('')}
          </ol>
        </details>` : ''}
        ${isNext ? `<div class="cc-actions">
          ${formButton({ lang, form: 'pass', label: t.pass, prefill: { festival: fest.id } })}
          ${formButton({ lang, form: isPoetry ? 'poet' : 'troupe', label: isPoetry ? t.poet : t.troupe, variant: 'secondary' })}
        </div>` : ''}
      </div>
    </article>`;
}

function render(siteData, lang) {
  const t = T[lang];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const fests = siteData.events || [];
  const archive = fests.flatMap((f) => (f.years || []).map((y) => ({ f, y })))
    .filter(({ y }) => { const s = parseStart(y.dates.en); return s && s < today; })
    .sort((a, b) => parseStart(b.y.dates.en) - parseStart(a.y.dates.en));
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, title: t.title, lead: t.lead })}
  <section class="cc-section">
    <div class="cc-wrap" style="display:grid; gap:1.5rem">${fests.map((f) => renderFestival(f, lang, today)).join('')}</div>
  </section>
  ${archive.length ? `
  <section class="cc-section cc-section--tint" aria-labelledby="archive-title">
    <div class="cc-wrap">
      ${sectionHead(t.archive, { id: 'archive-title' })}
      <ul class="cc-grid cc-grid--3">
        ${archive.map(({ f, y }) => `
        <li class="cc-card cc-card--clay"><div class="cc-card__body">
          <p class="cc-kicker">${esc(y.year)} · ${esc(pick(f.name, lang))}</p>
          <h3 class="cc-h3">${esc(pick(y.theme, lang))}</h3>
          <ul class="cc-facts">
            <li>${icon('calendar')}<span>${esc(pick(y.dates, lang))}</span></li>
            <li>${icon('pin')}<span>${esc(pick(y.venue, lang))}</span></li>
          </ul>
          <p class="cc-card__text">${esc(pick(y.highlight, lang))}</p>
          ${(y.sponsors || []).length ? `<p class="cc-muted" style="font-size:0.95rem">${t.sponsors}: ${esc(y.sponsors.join(', '))}</p>` : ''}
        </div></li>`).join('')}
      </ul>
    </div>
  </section>` : ''}
  <section class="cc-section">
    <div class="cc-wrap">
      <div class="cc-callout">
        <div><h2 class="cc-h3">${t.visitTitle}</h2><p>${t.visitText}</p></div>
        ${formButton({ lang, form: 'volunteer', label: t.volunteer, variant: 'secondary' })}
      </div>
    </div>
  </section>`,
  };
}

module.exports = { render };
