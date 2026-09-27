// What's On: every dated event from site data, soonest first.
const { pageHead, formButton } = require('../site/ui.js');
const { upcoming } = require('../site/events.js');
const { renderTicket } = require('../site/tickets.js');

const T = {
  en: {
    title: "What's On", lead: 'Festivals, shows and camps coming up. Entry to our festivals is free.',
    festival: 'Festival', camp: 'Summer camp', pass: 'Reserve free pass', register: 'Register child', details: 'Details',
    emptyTitle: 'Nothing announced right now', emptyText: 'New dates are added here as soon as they are fixed. Leave your email below to hear first.',
    plays: 'See our plays', book: 'Want us to perform in your town?', bookText: 'We travel with all our plays. Tell us your city and preferred dates.', bookCta: 'Book a play',
  },
  hi: {
    title: 'कार्यक्रम', lead: 'आगामी समारोह, नाटक और शिविर। हमारे समारोहों में प्रवेश निःशुल्क है।',
    festival: 'समारोह', camp: 'समर कैम्प', pass: 'निःशुल्क पास आरक्षित करें', register: 'बच्चे का पंजीकरण', details: 'विवरण',
    emptyTitle: 'अभी कोई कार्यक्रम घोषित नहीं', emptyText: 'तिथियां तय होते ही यहां जोड़ी जाती हैं। सबसे पहले जानने के लिए नीचे अपना ईमेल दें।',
    plays: 'हमारे नाटक देखें', book: 'क्या आप चाहते हैं कि हम आपके शहर में आएं?', bookText: 'हम अपने सभी नाटकों के साथ यात्रा करते हैं। अपना शहर और तिथियां बताएं।', bookCta: 'नाटक बुक करें',
  },
};

function render(siteData, lang) {
  const t = T[lang];
  const items = upcoming(siteData);
  const list = items.length
    ? `<ol class="cc-tickets" aria-label="${t.title}">${items.map((i) => renderTicket(i, lang, { level: 2 })).join('')}</ol>`
    : `<div class="cc-empty"><h2 class="cc-h3">${t.emptyTitle}</h2><p>${t.emptyText}</p><div class="cc-actions"><a class="cc-btn cc-btn--secondary" href="/${lang}/productions/">${t.plays}</a></div></div>`;
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, banner: (siteData.pageBanners || {})['whats-on'], bannerSettings: siteData.pageBannerSettings, title: t.title, lead: t.lead })}
  <section class="cc-section">
    <div class="cc-wrap">${list}</div>
  </section>
  <section class="cc-section">
    <div class="cc-wrap">
      <div class="cc-callout">
        <div><h2 class="cc-h3">${t.book}</h2><p>${t.bookText}</p></div>
        ${formButton({ lang, form: 'booking', label: t.bookCta })}
      </div>
    </div>
  </section>`,
  };
}

module.exports = { render };
