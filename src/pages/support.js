// Support us: three ways to help, and the partners who already do.
const { esc, pick, icon, pageHead, sectionHead, formButton } = require('../site/ui.js');

const T = {
  en: {
    title: 'Support us', lead: 'Our festivals are free and our camps are free for local tribal children. Your support keeps them that way.',
    ways: [
      ['tent', 'Sponsor a festival night', 'Cover the stage, lights and travel for one visiting group at Jashrang.', 'partner', 'Talk to us'],
      ['users', 'Fund a camp place', 'Give a child from a Jashpur village three weeks at Ullas Summer Camp.', 'partner', 'Talk to us'],
      ['heart', 'Volunteer', 'Help with the stage, audience, food or photos during our festivals.', 'volunteer', 'Sign up'],
    ],
    partners: 'Our partners',
  },
  hi: {
    title: 'सहयोग करें', lead: 'हमारे समारोह निःशुल्क हैं और स्थानीय जनजातीय बच्चों के लिए हमारे शिविर भी। आपका सहयोग इन्हें ऐसा ही बनाए रखता है।',
    ways: [
      ['tent', 'एक समारोह संध्या प्रायोजित करें', 'जशरंग में एक अतिथि नाट्य दल के मंच, प्रकाश और यात्रा का खर्च उठाएं।', 'partner', 'बात करें'],
      ['users', 'शिविर में एक स्थान', 'जशपुर के किसी गांव के बच्चे को उल्लास समर कैम्प के तीन सप्ताह दें।', 'partner', 'बात करें'],
      ['heart', 'स्वयंसेवक बनें', 'समारोह के दौरान मंच, दर्शक, भोजन या फ़ोटोग्राफ़ी में मदद करें।', 'volunteer', 'जुड़ें'],
    ],
    partners: 'हमारे साझेदार',
  },
};

function render(siteData, lang) {
  const t = T[lang];
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, page: 'support', title: t.title, lead: t.lead })}
  <section class="cc-section">
    <div class="cc-wrap">
      <ul class="cc-grid cc-grid--3">
        ${t.ways.map(([ic, title, text, form, cta]) => `
        <li class="cc-card"><div class="cc-card__body">
          <span class="cc-icon-chip">${icon(ic)}</span>
          <h2 class="cc-h3">${title}</h2>
          <p class="cc-card__text">${text}</p>
          ${formButton({ lang, form, label: cta, variant: form === 'volunteer' ? 'secondary' : 'primary', size: 'sm' })}
        </div></li>`).join('')}
      </ul>
    </div>
  </section>
  ${(siteData.partners || []).length ? `
  <section class="cc-section cc-section--tint" aria-labelledby="partners-title">
    <div class="cc-wrap">
      ${sectionHead(t.partners, { id: 'partners-title' })}
      <ul class="cc-grid cc-grid--4">
        ${siteData.partners.map((p) => `
        <li class="cc-card"><div class="cc-card__body">
          <p class="cc-kicker">${esc(pick(p.category, lang))}</p>
          <h3 class="cc-h3 cc-h3--sm">${esc(p.name)}</h3>
        </div></li>`).join('')}
      </ul>
    </div>
  </section>` : ''}`,
  };
}

module.exports = { render };
