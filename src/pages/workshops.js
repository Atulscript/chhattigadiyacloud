// Workshops: the next Ullas Summer Camp, what children learn, past camps.
const { esc, pick, icon, picture, pageHead, sectionHead, formButton } = require('../site/ui.js');
const { parseStart, dateBadge } = require('../site/events.js');

const T = {
  en: {
    title: 'Workshops', lead: 'Ullas Summer Camp: three weeks of acting, music and folk craft for children aged 7 to 16 in Jashpur.',
    next: 'Next camp', dates: 'Dates', ages: 'Ages', venue: 'Venue', fee: 'Fee', activities: 'What happens at camp',
    register: 'Register your child', artAlt: 'Illustration of children at Ullas Summer Camp',
    learnTitle: 'What children learn',
    modules: [
      ['mask', 'Acting and movement', 'Body language, voice and confidence, drawn from Nacha and Panthi.'],
      ['palette', 'Masks and puppets', 'Clay masks and shadow puppets made by the children themselves.'],
      ['drum', 'Mandar and folk songs', 'Rhythm on the Mandar and songs in Chhattisgarhi.'],
      ['star', 'A play of their own', 'Children write and stage a play for families on the final day.'],
    ],
    past: 'Past camps', children: 'children', facilitators: 'Facilitators',
    upcoming: 'Upcoming workshop', upcomingMany: 'Upcoming workshops', upcomingSub: 'Registrations and enquiries are open. Places are limited in each batch.',
    pastSub: 'Every summer since 2023: what each camp explored and made.', ask: 'Ask a question',
  },
  hi: {
    title: 'कार्यशालाएं', lead: 'उल्लास समर कैम्प: जशपुर में 7 से 16 वर्ष के बच्चों के लिए अभिनय, संगीत और लोक शिल्प के तीन सप्ताह।',
    next: 'अगला शिविर', dates: 'तिथियां', ages: 'आयु', venue: 'स्थान', fee: 'शुल्क', activities: 'शिविर में क्या होता है',
    register: 'बच्चे का पंजीकरण करें', artAlt: 'उल्लास समर कैम्प में बच्चों का चित्रांकन',
    learnTitle: 'बच्चे क्या सीखते हैं',
    modules: [
      ['mask', 'अभिनय और देह-भाषा', 'नाचा और पंथी से प्रेरित देह-भाषा, आवाज़ और आत्मविश्वास।'],
      ['palette', 'मुखौटे और कठपुतली', 'बच्चे खुद माटी के मुखौटे और छाया-कठपुतलियां बनाते हैं।'],
      ['drum', 'मांदर और लोकगीत', 'मांदर पर ताल और छत्तीसगढ़ी लोकगीत।'],
      ['star', 'अपना नाटक', 'अंतिम दिन बच्चे परिवारों के सामने अपना लिखा नाटक खेलते हैं।'],
    ],
    past: 'पिछले शिविर', children: 'बच्चे', facilitators: 'प्रशिक्षक',
    upcoming: 'आगामी कार्यशाला', upcomingMany: 'आगामी कार्यशालाएं', upcomingSub: 'पंजीकरण और पूछताछ जारी है। हर बैच में सीमित स्थान हैं।',
    pastSub: '2023 से हर गर्मी: हर शिविर में बच्चों ने क्या खोजा और रचा।', ask: 'प्रश्न पूछें',
  },
};

// Upcoming workshops: `upcomingBatches` (list), the single `upcomingBatch`, or
// a CMS-edited array of workshops. Any number renders without layout changes.
function upcomingList(w) {
  if (Array.isArray(w)) return w;
  if (Array.isArray(w.upcomingBatches) && w.upcomingBatches.length) return w.upcomingBatches;
  return w.upcomingBatch ? [w.upcomingBatch] : [];
}

function renderWorkshop(b, i, lang, t) {
  const start = parseStart(pick(b.dates, 'en'));
  const badge = start ? dateBadge(start, lang) : null;
  const titleId = `workshop-${i + 1}`;
  const facts = [
    ['calendar', t.dates, pick(b.dates, lang)],
    ['users', t.ages, pick(b.ageGroup, lang)],
    ['pin', t.venue, pick(b.venue, lang)],
    ['ticket', t.fee, pick(b.fee, lang)],
  ].filter(([, , v]) => v);
  const activities = b.activities || [];
  const desc = pick(b.description, lang);
  return `
      <article class="cc-workshop" aria-labelledby="${titleId}">
        <div class="cc-workshop__media">
          ${picture(b.photo || b.bannerImage || b.image || '/src/assets/images/camp-ullas.svg', b.photoAlt || t.artAlt, { width: 800, height: 360 })}
          ${badge ? `<time class="cc-workshop__date" datetime="${badge.iso}"><span class="cc-workshop__day">${esc(badge.day)}</span><span class="cc-workshop__month">${esc(badge.month)}</span></time>` : ''}
        </div>
        <div class="cc-workshop__main">
          <div class="cc-workshop__top">
            <p class="cc-kicker">${t.next}</p>
            ${b.status ? `<span class="cc-tag cc-tag--live">${esc(pick(b.status, lang))}</span>` : ''}
          </div>
          <h3 class="cc-h2 cc-workshop__title" id="${titleId}">${esc(pick(b.title, lang))}</h3>
          ${desc ? `<p class="cc-card__text">${esc(desc)}</p>` : ''}
          ${facts.length ? `<ul class="cc-workshop__facts">
            ${facts.map(([ic, label, value]) => `<li><span class="cc-icon-chip cc-icon-chip--sm">${icon(ic)}</span><span><strong>${label}</strong> ${esc(value)}</span></li>`).join('')}
          </ul>` : ''}
        </div>
        ${activities.length ? `<div class="cc-workshop__extra">
          <h4 class="cc-workshop__sub">${t.activities}</h4>
          <ul class="cc-checklist">${activities.map((a) => `<li>${esc(pick(a, lang))}</li>`).join('')}</ul>
        </div>` : ''}
        <div class="cc-actions cc-actions--stack cc-workshop__actions">
          ${formButton({ lang, form: 'camp', label: t.register, size: 'lg', iconName: 'pen' })}
          <a class="cc-link" href="/${lang}/contact/">${t.ask}${icon('arrowRight')}</a>
        </div>
      </article>`;
}

function render(siteData, lang) {
  const t = T[lang];
  const w = siteData.workshops || {};
  const batches = upcomingList(w);
  const years = [...(w.years || [])].sort((a, b2) => b2.year - a.year);
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, page: 'training-workshops', title: t.title, lead: t.lead })}
  ${batches.length ? `
  <section class="cc-section" aria-labelledby="camp-title">
    <div class="cc-wrap">
      ${sectionHead(batches.length > 1 ? t.upcomingMany : t.upcoming, { id: 'camp-title', sub: t.upcomingSub })}
      <div class="cc-workshops${batches.length > 1 ? ' cc-workshops--many' : ''}">
        ${batches.map((b, i) => renderWorkshop(b, i, lang, t)).join('')}
      </div>
    </div>
  </section>` : ''}
  <section class="cc-section cc-section--tint" aria-labelledby="learn-title">
    <div class="cc-wrap">
      ${sectionHead(t.learnTitle, { id: 'learn-title' })}
      <ul class="cc-grid cc-grid--4">
        ${t.modules.map(([ic, title, text]) => `
        <li class="cc-card cc-card--feature"><div class="cc-card__body">
          <span class="cc-icon-chip">${icon(ic)}</span>
          <h3 class="cc-h3">${title}</h3>
          <p class="cc-card__text">${text}</p>
        </div></li>`).join('')}
      </ul>
    </div>
  </section>
  ${years.length ? `
  <section class="cc-section" aria-labelledby="past-title">
    <div class="cc-wrap">
      ${sectionHead(t.past, { id: 'past-title', sub: t.pastSub })}
      <ul class="cc-grid cc-grid--4">
        ${years.map((y) => `
        <li class="cc-card cc-camp"><div class="cc-card__body">
          <div class="cc-camp__top">
            <p class="cc-camp__year">${esc(y.year)}</p>
            ${y.participants ? `<span class="cc-tag cc-tag--plain">${icon('users')}${esc(parseInt(y.participants, 10))} ${t.children}</span>` : ''}
          </div>
          <h3 class="cc-h3">${esc(pick(y.theme, lang))}</h3>
          ${y.dates ? `<p class="cc-camp__dates">${icon('calendar')}<span>${esc(pick(y.dates, lang))}</span></p>` : ''}
          <p class="cc-card__text">${esc(pick(y.outcome, lang))}</p>
          ${y.facilitators ? `<p class="cc-camp__people"><strong>${t.facilitators}</strong> ${esc(y.facilitators)}</p>` : ''}
        </div></li>`).join('')}
      </ul>
    </div>
  </section>` : ''}`,
  };
}

module.exports = { render };
