// Contact: a short message form, quick request forms, and direct details.
const { esc, pick, icon, pageHead, formButton } = require('../site/ui.js');
const { renderInlineForm } = require('../site/forms.js');

const T = {
  en: {
    title: 'Contact', lead: 'Write to us, call, or pick a quick request below.',
    quick: 'Quick requests', find: 'Find us', hours: 'Office hours: Monday to Saturday, 10 am to 6 pm',
    email: 'Email', phone: 'Phone / WhatsApp',
    requests: [['booking', 'Book a play'], ['pass', 'Festival passes'], ['camp', 'Register for summer camp'], ['press', 'Press request'], ['partner', 'Support or partner']],
    emails: [['email', 'General'], ['bookingEmail', 'Bookings'], ['pressEmail', 'Press']],
  },
  hi: {
    title: 'संपर्क', lead: 'हमें लिखें, फ़ोन करें, या नीचे से कोई त्वरित अनुरोध चुनें।',
    quick: 'त्वरित अनुरोध', find: 'हमारा पता', hours: 'कार्यालय समय: सोमवार से शनिवार, सुबह 10 से शाम 6 बजे',
    email: 'ईमेल', phone: 'फ़ोन / व्हाट्सएप',
    requests: [['booking', 'नाटक बुक करें'], ['pass', 'समारोह पास'], ['camp', 'समर कैम्प पंजीकरण'], ['press', 'प्रेस अनुरोध'], ['partner', 'सहयोग या साझेदारी']],
    emails: [['email', 'सामान्य'], ['bookingEmail', 'बुकिंग'], ['pressEmail', 'प्रेस']],
  },
};

function render(siteData, lang) {
  const t = T[lang];
  const c = siteData.contact || {};
  return {
    title: t.title,
    desc: t.lead,
    content: `
  ${pageHead({ lang, title: t.title, lead: t.lead })}
  <section class="cc-section">
    <div class="cc-wrap" style="display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit, minmax(min(100%, 340px), 1fr)); align-items:start">
      ${renderInlineForm('contact', siteData, lang)}
      <div style="display:grid; gap:1.5rem">
        <section class="cc-card" aria-labelledby="quick-title"><div class="cc-card__body">
          <h2 class="cc-h3" id="quick-title">${t.quick}</h2>
          <div class="cc-actions">${t.requests.map(([form, label]) => formButton({ lang, form, label, variant: 'secondary', size: 'sm' })).join('')}</div>
        </div></section>
        <section class="cc-card" aria-labelledby="find-title"><div class="cc-card__body">
          <h2 class="cc-h3" id="find-title">${t.find}</h2>
          <ul class="cc-facts">
            ${c.address ? `<li>${icon('pin')}<span>${esc(pick(c.address, lang))}</span></li>` : ''}
            <li>${icon('clock')}<span>${t.hours}</span></li>
            ${c.phone ? `<li>${icon('phone')}<span><strong>${t.phone}:</strong> <a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${esc(c.phone)}</a></span></li>` : ''}
            ${t.emails.filter(([k]) => c[k]).map(([k, label]) => `<li>${icon('mail')}<span><strong>${label}:</strong> <a href="mailto:${esc(c[k])}">${esc(c[k])}</a></span></li>`).join('')}
          </ul>
        </div></section>
      </div>
    </div>
  </section>`,
  };
}

module.exports = { render };
