// Chhattisgadhiya Cloud - shared page chrome (build time, Node).
// Header, menu sheet, mobile tab bar, "Stay connected" band and footer.
// Nav labels come from one list so desktop, mobile and footer always match.

const { esc, icon } = require('./ui.js');

const SOCIAL = [
  { name: 'YouTube', href: 'https://youtube.com', path: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z' },
  { name: 'Instagram', href: 'https://instagram.com', path: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z' },
  { name: 'Facebook', href: 'https://facebook.com', path: 'M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z' },
  { name: 'X', href: 'https://x.com', path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z' },
];

const LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke-dasharray="2.5 3.5"/><path d="M8 11.5c1.2 2 2.8 2.8 4 2.8s2.8-.8 4-2.8"/><circle cx="9" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15" cy="8.5" r="1.2" fill="currentColor"/><path d="M9 16c1.5 1.2 4.5 1.2 6 0"/></svg>`;

// Single source for nav labels, so header, menu, tab bar and footer always match.
// explore: what we do; organisation: who we are and how to reach us.
const PAGES = {
  explore: [
    { id: 'whats-on', icon: 'calendar', label: { en: "What's On", hi: 'कार्यक्रम' } },
    { id: 'productions', icon: 'mask', label: { en: 'Plays', hi: 'नाटक' } },
    { id: 'events', icon: 'tent', label: { en: 'Festivals', hi: 'समारोह' } },
    { id: 'training-workshops', icon: 'users', label: { en: 'Workshops', hi: 'कार्यशालाएं' } },
    { id: 'magazine', icon: 'book', label: { en: 'Magazine', hi: 'पत्रिका' } },
  ],
  organisation: [
    { id: 'about', icon: 'info', label: { en: 'About', hi: 'परिचय' } },
    { id: 'blog', icon: 'pen', label: { en: 'Blog', hi: 'ब्लॉग' } },
    { id: 'press', icon: 'news', label: { en: 'Press kit', hi: 'प्रेस किट' } },
    { id: 'support', icon: 'heart', label: { en: 'Support us', hi: 'सहयोग करें' } },
    { id: 'contact', icon: 'chat', label: { en: 'Contact', hi: 'संपर्क' } },
  ],
};
const ALL_PAGES = [...PAGES.explore, ...PAGES.organisation];
const byId = (id) => ALL_PAGES.find((p) => p.id === id);
// Desktop: main bar holds the sections people browse; the slim top bar holds
// the organisational links. Every page appears in one of the two.
const MAIN_NAV = ['whats-on', 'productions', 'events', 'training-workshops', 'magazine', 'about', 'blog'];
const UTILITY_NAV = ['press', 'support', 'contact'];
const TABS = ['whats-on', 'productions', 'magazine'];

const T = {
  en: {
    skip: 'Skip to content', mainNav: 'Main', home: 'Home', menu: 'Menu', closeMenu: 'Close menu',
    explore: 'Explore', organisation: 'Organisation', contact: 'Contact', language: 'Language',
    theme: 'Theme', themeLight: 'Light', themeDark: 'Dark',
    friezeAlt: 'Folk artwork: a caravan of musicians and dancers from Chhattisgarh',
    cta: 'Book a play', quickNav: 'Quick links',
    installApp: 'Add to home screen', installSub: 'Opens faster, works offline', install: 'Install', notNow: 'Not now',
    email: 'Email address', subscribe: 'Subscribe', follow: 'Follow us',
    signupDone: 'Thank you! Please send the email that just opened to confirm.', signupInvalid: 'Please enter a valid email address.',
    about: 'Theatre, festivals, workshops and a monthly magazine from Jashpur, Chhattisgarh.',
    rights: 'All rights reserved.', backToTop: 'Back to top',
  },
  hi: {
    skip: 'मुख्य सामग्री पर जाएं', mainNav: 'मुख्य', home: 'होम', menu: 'मेनू', closeMenu: 'मेनू बंद करें',
    explore: 'देखें', organisation: 'संस्था', contact: 'संपर्क', language: 'भाषा',
    theme: 'रंग', themeLight: 'हल्का', themeDark: 'गहरा',
    friezeAlt: 'लोक चित्र: छत्तीसगढ़ के वादकों और नर्तकों का कारवां',
    cta: 'नाटक बुक करें', quickNav: 'त्वरित लिंक',
    installApp: 'होम स्क्रीन पर जोड़ें', installSub: 'तेज़ खुलता है, ऑफ़लाइन चलता है', install: 'जोड़ें', notNow: 'अभी नहीं',
    email: 'ईमेल पता', subscribe: 'सब्सक्राइब करें', follow: 'हमें फ़ॉलो करें',
    signupDone: 'धन्यवाद! पुष्टि के लिए अभी खुला ईमेल भेज दें।', signupInvalid: 'कृपया सही ईमेल पता लिखें।',
    about: 'जशपुर, छत्तीसगढ़ से रंगमंच, समारोह, कार्यशालाएं और मासिक पत्रिका।',
    rights: 'सर्वाधिकार सुरक्षित।', backToTop: 'ऊपर जाएं',
  },
};

// "Stay connected" copy per page, so each page pitches what its visitors care about.
const CONNECT = {
  home: { en: ['Stay connected', 'New plays, festival dates and magazine issues, about once a month.'], hi: ['जुड़े रहें', 'नए नाटक, समारोह की तिथियां और पत्रिका के अंक, लगभग महीने में एक बार।'] },
  'whats-on': { en: ['Hear about new dates first', 'We email you when shows, festivals and camps are announced.'], hi: ['नई तिथियां सबसे पहले जानें', 'नाटक, समारोह और शिविर घोषित होते ही हम आपको ईमेल करेंगे।'] },
  productions: { en: ['Know when we play near you', 'Tour dates and new plays, straight to your inbox.'], hi: ['जानें कि हम आपके पास कब आ रहे हैं', 'दौरे की तिथियां और नए नाटक, सीधे आपके ईमेल पर।'] },
  events: { en: ['Festival news, first', 'Programme announcements, free passes and volunteer calls for Jashrang and Kavita Utsav.'], hi: ['समारोह की खबरें, सबसे पहले', 'जशरंग और कविता उत्सव के कार्यक्रम, निःशुल्क पास और स्वयंसेवक सूचनाएं।'] },
  'training-workshops': { en: ['Camp updates for parents', 'Registration dates, batch details and what to bring to Ullas camps.'], hi: ['अभिभावकों के लिए शिविर सूचनाएं', 'उल्लास शिविर की पंजीकरण तिथियां, बैच की जानकारी और क्या साथ लाएं।'] },
  magazine: { en: ['Get each new issue', 'A short email when a new issue of the magazine is out.'], hi: ['हर नया अंक पाएं', 'पत्रिका का नया अंक आते ही एक छोटा ईमेल।'] },
  blog: { en: ['New stories from the field', 'Rehearsal notes and tour diaries when we publish them.'], hi: ['क्षेत्र से नई कहानियां', 'रिहर्सल नोट्स और यात्रा डायरियां, प्रकाशित होते ही।'] },
  about: { en: ['Follow our work', 'Occasional news from Jashpur and from the road.'], hi: ['हमारे काम से जुड़े रहें', 'जशपुर और दौरों से समय-समय पर खबरें।'] },
  contact: { en: ['Stay connected', 'News about plays, festivals and camps, about once a month.'], hi: ['जुड़े रहें', 'नाटक, समारोह और शिविर की खबरें, लगभग महीने में एक बार।'] },
  press: { en: ['Press releases', 'Receive our announcements and festival press notes.'], hi: ['प्रेस विज्ञप्तियां', 'हमारी घोषणाएं और समारोह की प्रेस सूचनाएं पाएं।'] },
  support: { en: ['See where your support goes', 'Updates on the festivals, camps and plays our supporters make possible.'], hi: ['देखें आपका सहयोग कहां जाता है', 'सहयोगियों की मदद से होने वाले समारोहों, शिविरों और नाटकों की जानकारी।'] },
};

const isActive = (id, currentPath) => currentPath.includes(`/${id}/`);
const isHomePath = (lang, currentPath) => currentPath === `/${lang}/` || currentPath === `/${lang}`;
const current = (on) => (on ? ' aria-current="page"' : '');
const pageKey = (lang, currentPath) => (isHomePath(lang, currentPath) ? 'home' : ALL_PAGES.map((p) => p.id).find((id) => isActive(id, currentPath)) || 'home');

function langToggle(lang, altUrl, label) {
  const en = lang === 'en' ? '<span aria-current="true" lang="en">EN</span>' : `<a href="${altUrl}" hreflang="en" lang="en" aria-label="English">EN</a>`;
  const hi = lang === 'hi' ? '<span aria-current="true" lang="hi">हिं</span>' : `<a href="${altUrl}" hreflang="hi" lang="hi" aria-label="हिन्दी">हिं</a>`;
  return `<div class="cc-lang" role="group" aria-label="${label}">${en}${hi}</div>`;
}

// Light is the default; dark only when the visitor chooses it.
function themeToggle(t) {
  return `<div class="cc-theme" role="group" aria-label="${t.theme}" data-cc-theme>
      <button type="button" data-theme-value="light" aria-pressed="true" aria-label="${t.themeLight}" title="${t.themeLight}">${icon('sun')}</button>
      <button type="button" data-theme-value="dark" aria-pressed="false" aria-label="${t.themeDark}" title="${t.themeDark}">${icon('moon')}</button>
    </div>`;
}

function renderHeader({ lang, currentPath, altUrl, siteData }) {
  const t = T[lang];
  const home = isHomePath(lang, currentPath);
  const phone = (siteData.contact && siteData.contact.phone) || '';
  const email = (siteData.contact && siteData.contact.email) || '';
  const navLink = (cls) => (id) => {
    const p = byId(id);
    return `<li><a class="${cls}" href="/${lang}/${id}/"${current(isActive(id, currentPath))}>${icon(p.icon)}<span>${p.label[lang]}</span></a></li>`;
  };
  const drawerLink = (p) => navLink('cc-drawer__link')(p.id);
  const tab = (id) => {
    const p = byId(id);
    return `<a class="cc-tabbar__item" href="/${lang}/${id}/"${current(isActive(id, currentPath))}>${icon(p.icon)}<span>${p.label[lang]}</span></a>`;
  };

  return `
  <a class="cc-skip" href="#main">${t.skip}</a>
  <div class="cc-utility">
    <div class="cc-utility__inner">
      <p class="cc-utility__tagline">${esc(siteData.tagline[lang])}</p>
      <nav class="cc-utility__nav" aria-label="${t.organisation}">
        <ul class="cc-utility__list">${UTILITY_NAV.map(navLink('cc-utility__link')).join('')}</ul>
      </nav>
      ${langToggle(lang, altUrl, t.language)}
    </div>
  </div>
  <header class="cc-header" id="top">
    <div class="cc-header__inner">
      <a class="cc-brand" href="/${lang}/"${current(home)}>
        <span class="cc-brand__mark">${LOGO_SVG}</span>
        <span class="cc-brand__name">${siteData.orgName[lang]}</span>
      </a>
      <nav class="cc-nav" aria-label="${t.mainNav}">
        <ul class="cc-nav__list">${MAIN_NAV.map(navLink('cc-nav__link')).join('')}</ul>
      </nav>
      <div class="cc-header__actions">
        ${langToggle(lang, altUrl, t.language)}
        <button type="button" class="cc-menu-btn" data-cc-menu aria-controls="cc-drawer" aria-expanded="false" aria-label="${t.menu}">${icon('menu')}<span>${t.menu}</span></button>
      </div>
    </div>
  </header>

  <dialog class="cc-drawer" id="cc-drawer" aria-label="${t.menu}">
    <div class="cc-drawer__head">
      <a class="cc-brand" href="/${lang}/"><span class="cc-brand__mark">${LOGO_SVG}</span><span class="cc-brand__name">${siteData.orgName[lang]}</span></a>
      <button type="button" class="cc-icon-btn" data-cc-menu-close aria-label="${t.closeMenu}">${icon('close')}</button>
    </div>
    <nav class="cc-drawer__nav" aria-label="${t.menu}">
      <p class="cc-kicker cc-drawer__label">${t.explore}</p>
      <ul class="cc-drawer__list">
        <li><a class="cc-drawer__link" href="/${lang}/"${current(home)}>${icon('home')}<span>${t.home}</span></a></li>
        ${PAGES.explore.map(drawerLink).join('')}
      </ul>
      <p class="cc-kicker cc-drawer__label">${t.organisation}</p>
      <ul class="cc-drawer__list">${PAGES.organisation.map(drawerLink).join('')}</ul>
    </nav>
    <div class="cc-drawer__foot">
      <div class="cc-drawer__row"><span class="cc-muted">${t.language}</span>${langToggle(lang, altUrl, t.language)}</div>
      <div class="cc-drawer__row"><span class="cc-muted">${t.theme}</span>${themeToggle(t)}</div>
      ${phone ? `<a class="cc-drawer__contact" href="tel:${phone.replace(/\s+/g, '')}">${icon('phone')}<span>${esc(phone)}</span></a>` : ''}
      ${email ? `<a class="cc-drawer__contact" href="mailto:${email}">${icon('mail')}<span>${esc(email)}</span></a>` : ''}
    </div>
  </dialog>

  <nav class="cc-tabbar" aria-label="${t.quickNav}">
    ${TABS.map(tab).join('')}
    <button type="button" class="cc-tabbar__item" data-cc-menu aria-controls="cc-drawer" aria-expanded="false">${icon('menu')}<span>${t.menu}</span></button>
  </nav>`;
}

// Newsletter + social: the first row of the footer. Copy changes per page so
// each page pitches what its visitors care about (see CONNECT).
function renderConnect({ lang, siteData, currentPath }) {
  const t = T[lang];
  const [title, text] = (CONNECT[pageKey(lang, currentPath)] || CONNECT.home)[lang];
  const c = siteData.contact || {};
  return `
        <section class="cc-footer__signup" id="newsletter" aria-labelledby="cc-connect-title">
          <h2 class="cc-footer__signup-title" id="cc-connect-title">${esc(title)}</h2>
          <p class="cc-footer__signup-text">${esc(text)}</p>
          <form class="cc-connect__form" data-cc-signup data-cc-endpoint="${esc(siteData.newsletterEndpoint || '')}" data-cc-mailto="${esc(c.email || '')}" novalidate>
            <label class="cc-visually-hidden" for="cc-signup-email">${t.email}</label>
            <input class="cc-input" id="cc-signup-email" type="email" name="email" autocomplete="email" placeholder="${t.email}" required>
            <button type="submit" class="cc-btn cc-btn--primary">${t.subscribe}</button>
            <p class="cc-connect__msg" role="status" data-cc-signup-msg data-done="${esc(t.signupDone)}" data-invalid="${esc(t.signupInvalid)}"></p>
          </form>
          <ul class="cc-social" aria-label="${t.follow}">
            ${SOCIAL.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.name}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${s.path}"/></svg></a></li>`).join('')}
          </ul>
        </section>`;
}

function renderFooter({ lang, siteData, altUrl, currentPath = '' }) {
  const t = T[lang];
  const c = siteData.contact || {};
  const col = (title, pages) => `
        <nav class="cc-footer__col" aria-label="${title}">
          <h2 class="cc-footer__title">${title}</h2>
          <ul class="cc-footer__list">${pages.map((p) => `<li><a href="/${lang}/${p.id}/"${current(isActive(p.id, currentPath))}>${icon(p.icon)}<span>${p.label[lang]}</span></a></li>`).join('')}</ul>
        </nav>`;
  return `
  <div class="cc-frieze" role="img" aria-label="${esc(t.friezeAlt)}"></div>
  <footer class="cc-footer">
    <div class="cc-wrap">
      <div class="cc-footer__top">
        <div class="cc-footer__brand">
          <a class="cc-brand cc-brand--light" href="/${lang}/"><span class="cc-brand__mark">${LOGO_SVG}</span><span class="cc-brand__name">${siteData.orgName[lang]}</span></a>
          <p class="cc-footer__tagline">${siteData.tagline[lang]}</p>
          <p class="cc-footer__about">${t.about}</p>
        </div>
        ${renderConnect({ lang, siteData, currentPath })}
      </div>
      <div class="cc-footer__grid">
        ${col(t.explore, PAGES.explore)}
        ${col(t.organisation, PAGES.organisation)}
        <div class="cc-footer__col cc-footer__col--contact">
          <h2 class="cc-footer__title">${t.contact}</h2>
          <ul class="cc-footer__list cc-footer__contact">
            ${c.email ? `<li><a href="mailto:${c.email}">${icon('mail')}<span>${esc(c.email)}</span></a></li>` : ''}
            ${c.phone ? `<li><a href="tel:${c.phone.replace(/\s+/g, '')}">${icon('phone')}<span>${esc(c.phone)}</span></a></li>` : ''}
            ${c.address ? `<li class="cc-footer__addr">${icon('pin')}<span>${esc(c.address[lang])}</span></li>` : ''}
          </ul>
          <a class="cc-btn cc-btn--primary cc-btn--sm cc-footer__cta" href="/${lang}/contact/#form-booking" data-cc-form="booking">${icon('ticket')}${t.cta}</a>
        </div>
      </div>
      <div class="cc-footer__bottom">
        <p>© ${new Date().getFullYear()} ${siteData.orgName[lang]}. ${t.rights}</p>
        <div class="cc-footer__bottom-links">
          ${themeToggle(t)}
          <a href="${altUrl}" hreflang="${lang === 'hi' ? 'en' : 'hi'}" lang="${lang === 'hi' ? 'en' : 'hi'}">${lang === 'hi' ? 'English' : 'हिन्दी'}</a>
          <a href="#top" data-cc-top>${icon('arrowUp')}<span>${t.backToTop}</span></a>
        </div>
      </div>
    </div>
  </footer>

  <aside class="cc-install" data-cc-install-toast hidden aria-label="${t.installApp}">
    <span class="cc-install__text"><strong>${t.installApp}</strong><span>${t.installSub}</span></span>
    <button type="button" class="cc-btn cc-btn--primary cc-btn--sm" data-cc-install>${t.install}</button>
    <button type="button" class="cc-icon-btn" data-cc-install-dismiss aria-label="${t.notNow}">${icon('close')}</button>
  </aside>`;
}

module.exports = { renderHeader, renderFooter, PAGES };
