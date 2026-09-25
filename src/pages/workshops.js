// Workshops: the next Ullas Summer Camp, what children learn, past camps.
const { esc, pick, icon, picture, pageHead, sectionHead, formButton } = require('../site/ui.js');

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
  },
};

function render(siteData, lang) {
  const t = T[lang];
  const w = siteData.workshops || {};
  const b = w.upcomingBatch;
  const years = [...(w.years || [])].sort((a, b2) => b2.year - a.year);
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, banner: (siteData.pageBanners || {})['training-workshops'], bannerSettings: siteData.pageBannerSettings, title: t.title, lead: t.lead })}
  ${b ? `
  <section class="cc-section" aria-labelledby="camp-title">
    <div class="cc-wrap">
      <article class="cc-feature cc-feature--banner">
        <div class="cc-feature__media">${picture(b.photo || b.bannerImage || b.image || '/src/assets/images/camp-ullas.svg', b.photoAlt || t.artAlt, { width: 800, height: 360 })}</div>
        <div class="cc-feature__body">
          <p class="cc-kicker">${t.next}</p>
          <h2 class="cc-h2" id="camp-title">${esc(pick(b.title, lang))}</h2>
          ${b.status ? `<span class="cc-tag" style="align-self:flex-start">${esc(pick(b.status, lang))}</span>` : ''}
          <ul class="cc-facts">
            <li>${icon('calendar')}<span><strong>${t.dates}:</strong> ${esc(pick(b.dates, lang))}</span></li>
            <li>${icon('users')}<span><strong>${t.ages}:</strong> ${esc(pick(b.ageGroup, lang))}</span></li>
            <li>${icon('pin')}<span><strong>${t.venue}:</strong> ${esc(pick(b.venue, lang))}</span></li>
            <li>${icon('ticket')}<span><strong>${t.fee}:</strong> ${esc(pick(b.fee, lang))}</span></li>
          </ul>
          <h3 class="cc-h3" style="font-size:1.1rem; margin-top:0.5rem">${t.activities}</h3>
          <ul class="cc-checklist">${(b.activities || []).map((a) => `<li>${esc(pick(a, lang))}</li>`).join('')}</ul>
          <div class="cc-actions">${formButton({ lang, form: 'camp', label: t.register })}</div>
        </div>
      </article>
    </div>
  </section>` : ''}
  <section class="cc-section cc-section--tint" aria-labelledby="learn-title">
    <div class="cc-wrap">
      ${sectionHead(t.learnTitle, { id: 'learn-title' })}
      <ul class="cc-grid cc-grid--4">
        ${t.modules.map(([ic, title, text]) => `
        <li class="cc-card"><div class="cc-card__body">
          <span class="cc-tag" style="align-self:flex-start; padding:0.5rem">${icon(ic)}</span>
          <h3 class="cc-h3">${title}</h3>
          <p class="cc-card__text">${text}</p>
        </div></li>`).join('')}
      </ul>
    </div>
  </section>
  ${years.length ? `
  <section class="cc-section" aria-labelledby="past-title">
    <div class="cc-wrap">
      ${sectionHead(t.past, { id: 'past-title' })}
      <ul class="cc-grid cc-grid--4">
        ${years.map((y) => `
        <li class="cc-card cc-card--accent"><div class="cc-card__body">
          <p class="cc-kicker">${esc(y.year)} · ${esc(parseInt(y.participants, 10))} ${t.children}</p>
          <h3 class="cc-h3">${esc(pick(y.theme, lang))}</h3>
          <p class="cc-card__text">${esc(pick(y.outcome, lang))}</p>
          <p class="cc-muted" style="font-size:0.95rem">${t.facilitators}: ${esc(y.facilitators)}</p>
        </div></li>`).join('')}
      </ul>
    </div>
  </section>` : ''}`,
  };
}

module.exports = { render };
