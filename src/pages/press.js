// Press kit: boilerplate, name style, logo download and press requests.
const { esc, pick, icon, pageHead, formButton, stats } = require('../site/ui.js');

const T = {
  en: {
    title: 'Press kit', about: 'About us in brief', name: 'How to write our name',
    nameText: 'Chhattisgadhiya Cloud: with "dh" and a capital C in Cloud. In Hindi: छत्तीसगढ़िया क्लाउड.',
    logo: 'Download logo (SVG)', request: 'Request photos or an interview', contact: 'Press contact', numbers: 'Key facts',
  },
  hi: {
    title: 'प्रेस किट', about: 'संक्षिप्त परिचय', name: 'हमारा नाम कैसे लिखें',
    nameText: 'छत्तीसगढ़िया क्लाउड। अंग्रेज़ी में: Chhattisgadhiya Cloud ("dh" के साथ)।',
    logo: 'लोगो डाउनलोड करें (SVG)', request: 'फ़ोटो या साक्षात्कार का अनुरोध', contact: 'प्रेस संपर्क', numbers: 'मुख्य तथ्य',
  },
};

function render(siteData, lang) {
  const t = T[lang];
  const kit = siteData.pressKit || {};
  const c = siteData.contact || {};
  return {
    title: t.title,
    desc: pick(kit.description, lang),
    content: `
  ${pageHead({ lang, banner: (siteData.pageBanners || {})['press'], bannerSettings: siteData.pageBannerSettings, title: t.title, lead: pick(kit.description, lang) })}
  <section class="cc-section">
    <div class="cc-wrap" style="display:grid; gap:1.5rem">
      <div class="cc-card"><div class="cc-card__body">
        <h2 class="cc-h3">${t.about}</h2>
        <p class="cc-prose">${esc(pick(kit.boilerplateShort, lang))}</p>
        <div class="cc-actions">
          <a class="cc-btn cc-btn--secondary" href="/favicon.svg" download="chhattisgadhiya-cloud-logo.svg">${icon('download')}${t.logo}</a>
          ${formButton({ lang, form: 'press', label: t.request })}
        </div>
      </div></div>
      <div class="cc-grid cc-grid--2">
        <div class="cc-card"><div class="cc-card__body"><h2 class="cc-h3">${t.name}</h2><p class="cc-card__text">${t.nameText}</p></div></div>
        <div class="cc-card"><div class="cc-card__body">
          <h2 class="cc-h3">${t.contact}</h2>
          <p class="cc-card__text">${esc(String(kit.contactPerson || '').split('•')[0].trim())}</p>
          ${c.pressEmail ? `<p><a class="cc-link" href="mailto:${esc(c.pressEmail)}">${icon('mail')}${esc(c.pressEmail)}</a></p>` : ''}
        </div></div>
      </div>
      <div>
        <h2 class="cc-h3" style="margin-bottom:1rem">${t.numbers}</h2>
        ${stats((siteData.homepage || {}).impactStats, lang)}
      </div>
    </div>
  </section>`,
  };
}

module.exports = { render };
