// Chhattisgadhiya Cloud - shared page chrome (build time, Node).
// Header, menu sheet, mobile tab bar, "Stay connected" band and footer.
// Nav labels come from one list so desktop, mobile and footer always match.

const fs = require('fs');
const path = require('path');
const { esc, icon, pick } = require('./ui.js');
const { upcoming, parseEnd } = require('./events.js');

// Animated stage banner above the footer (styles: art-banner.css, motion: art-banner.js).
const ART_BANNER = fs.readFileSync(path.join(__dirname, 'art-banner.html'), 'utf8').trim();

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
    { id: 'gallery', icon: 'image', label: { en: 'Gallery', hi: 'चित्र दीर्घा' } },
    { id: 'about', icon: 'info', label: { en: 'About', hi: 'परिचय' } },
    { id: 'contact', icon: 'chat', label: { en: 'Contact', hi: 'संपर्क' } },
    { id: 'support', icon: 'heart', label: { en: 'Support Us', hi: 'सहयोग करें' } },
    { id: 'blog', icon: 'pen', label: { en: 'Blog', hi: 'ब्लॉग' } },
    { id: 'press', icon: 'news', label: { en: 'Press Kit', hi: 'प्रेस किट' } },
  ],
};
const ALL_PAGES = [...PAGES.explore, ...PAGES.organisation];
const byId = (id) => ALL_PAGES.find((p) => p.id === id);
// Header: Home + the core cultural sections, then a "More" dropdown with the
// organisational pages. What's On is reached from the home page, not the nav.
const MAIN_NAV = ['productions', 'events', 'training-workshops', 'magazine'];
const MORE_NAV = PAGES.organisation.map((p) => p.id);
const TABS = ['productions', 'events', 'magazine'];
// Footer: one 3-column list of the remaining pages (What's On stays in the
// header, menu and phone tab bar).
const FOOTER_LINKS = ALL_PAGES.filter((p) => p.id !== 'whats-on');

const T = {
  en: {
    skip: 'Skip to content', mainNav: 'Main', home: 'Home', menu: 'Menu', closeMenu: 'Close menu',
    explore: 'Explore', organisation: 'Organisation', more: 'More', contact: 'Contact', language: 'Language',
    theme: 'Theme', themeLight: 'Light', themeDark: 'Dark', toDark: 'Switch to dark mode', toLight: 'Switch to light mode',
    cta: 'Book a play', quickNav: 'Quick links',
    installApp: 'Add to home screen', installSub: 'Opens faster, works offline', install: 'Install', notNow: 'Not now',
    email: 'Email address', subscribe: 'Subscribe', follow: 'Follow us', newsletter: 'Monthly letter', signupNote: 'One email a month. No spam, unsubscribe any time.',
    signupDone: 'Thank you! Please send the email that just opened to confirm.', signupInvalid: 'Please enter a valid email address.',
    about: 'Theatre, festivals, workshops and a monthly magazine from Jashpur, Chhattisgarh.',
    rights: 'All rights reserved.', backToTop: 'Back to top',
    cdIn: 'starts in {n} days', cdTomorrow: 'starts tomorrow', cdToday: 'starts today', cdNow: 'is on now', cdCta: 'Reserve free pass', cdClose: 'Dismiss',
    share: 'Share this page', shareOn: 'Share on',
  },
  hi: {
    skip: 'मुख्य सामग्री पर जाएं', mainNav: 'मुख्य', home: 'होम', menu: 'मेनू', closeMenu: 'मेनू बंद करें',
    explore: 'देखें', organisation: 'संस्था', more: 'और', contact: 'संपर्क', language: 'भाषा',
    theme: 'रंग', themeLight: 'हल्का', themeDark: 'गहरा', toDark: 'डार्क मोड चालू करें', toLight: 'लाइट मोड चालू करें',
    cta: 'नाटक बुक करें', quickNav: 'त्वरित लिंक',
    installApp: 'होम स्क्रीन पर जोड़ें', installSub: 'तेज़ खुलता है, ऑफ़लाइन चलता है', install: 'जोड़ें', notNow: 'अभी नहीं',
    email: 'ईमेल पता', subscribe: 'सब्सक्राइब करें', follow: 'हमें फ़ॉलो करें', newsletter: 'मासिक पत्र', signupNote: 'महीने में एक ईमेल। कोई स्पैम नहीं, जब चाहें बंद करें।',
    signupDone: 'धन्यवाद! पुष्टि के लिए अभी खुला ईमेल भेज दें।', signupInvalid: 'कृपया सही ईमेल पता लिखें।',
    about: 'जशपुर, छत्तीसगढ़ से रंगमंच, समारोह, कार्यशालाएं और मासिक पत्रिका।',
    rights: 'सर्वाधिकार सुरक्षित।', backToTop: 'ऊपर जाएं',
    cdIn: '{n} दिन में शुरू', cdTomorrow: 'कल से शुरू', cdToday: 'आज से शुरू', cdNow: 'अभी जारी है', cdCta: 'निःशुल्क पास', cdClose: 'बंद करें',
    share: 'यह पेज शेयर करें', shareOn: 'शेयर करें:',
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
  const hi = lang === 'hi' ? '<span aria-current="true" lang="hi">हिन्दी</span>' : `<a href="${altUrl}" hreflang="hi" lang="hi">हिन्दी</a>`;
  return `<div class="cc-lang" role="group" aria-label="${label}">${en}<i aria-hidden="true">|</i>${hi}</div>`;
}

// Light is the default; dark only when the visitor chooses it.
function themeToggle(t) {
  return `<div class="cc-theme" role="group" aria-label="${t.theme}" data-cc-theme>
      <button type="button" data-theme-value="light" aria-pressed="true" aria-label="${t.themeLight}" title="${t.themeLight}">${icon('sun')}</button>
      <button type="button" data-theme-value="dark" aria-pressed="false" aria-label="${t.themeDark}" title="${t.themeDark}">${icon('moon')}</button>
    </div>`;
}

// Festival countdown: a slim bar under the header for the next festival.
// Rendered for the next festival at build time but hidden; site.js shows it
// only from 30 days before the start until the last day, unless dismissed.
function renderCountdown(lang, siteData, t) {
  const next = upcoming(siteData).find((i) => i.kind === 'festival');
  if (!next) return '';
  const end = parseEnd(next.dates.en);
  const labels = { soon: t.cdIn, tomorrow: t.cdTomorrow, today: t.cdToday, now: t.cdNow };
  return `
  <aside class="cc-countdown" data-cc-countdown-bar data-id="${esc(next.id)}-${next.start.toISOString().slice(0, 4)}" data-start="${next.start.toISOString().slice(0, 10)}" data-end="${end.toISOString().slice(0, 10)}" data-labels='${esc(JSON.stringify(labels))}' aria-label="${esc(pick(next.title, lang))}" hidden>
    <div class="cc-countdown__inner">
      <span class="cc-countdown__icon" aria-hidden="true">${icon('ticket')}</span>
      <p class="cc-countdown__text"><strong>${esc(pick(next.title, lang))}</strong> <span data-cc-cd-text></span></p>
      <a class="cc-countdown__cta" href="/${lang}/contact/#form-pass" data-cc-form="pass" data-cc-prefill="${esc(JSON.stringify({ festival: next.id }))}">${t.cdCta}${icon('arrowRight')}</a>
      <button type="button" class="cc-countdown__close" data-cc-cd-close aria-label="${t.cdClose}">${icon('close')}</button>
    </div>
  </aside>`;
}

function renderHeader({ lang, currentPath, altUrl, siteData }) {
  const t = T[lang];
  const home = isHomePath(lang, currentPath);
  const phone = (siteData.contact && siteData.contact.phone) || '';
  const email = (siteData.contact && siteData.contact.email) || '';
  const navLink = (cls, icons) => (id) => {
    const p = byId(id);
    return `<li><a class="${cls}" href="/${lang}/${id}/"${current(isActive(id, currentPath))}>${icons ? icon(p.icon) : ''}<span>${p.label[lang]}</span></a></li>`;
  };
  const drawerLink = (p) => navLink('cc-drawer__link', true)(p.id);
  const tab = (id) => {
    const p = byId(id);
    return `<a class="cc-tabbar__item" href="/${lang}/${id}/"${current(isActive(id, currentPath))}>${icon(p.icon)}<span>${p.label[lang]}</span></a>`;
  };
  const inMore = MORE_NAV.some((id) => isActive(id, currentPath));

  return `
  <a class="cc-skip" href="#main">${t.skip}</a>
  <header class="cc-header" id="top">
    <div class="cc-header__inner">
      <a class="cc-brand" href="/${lang}/"${current(home)}>
        <span class="cc-brand__mark">${LOGO_SVG}</span>
        <span class="cc-brand__name">${siteData.orgName[lang]}</span>
      </a>
      <nav class="cc-nav" aria-label="${t.mainNav}">
        <ul class="cc-nav__list">
          <li><a class="cc-nav__link" href="/${lang}/"${current(home)}>${icon('home')}<span>${t.home}</span></a></li>
          ${MAIN_NAV.map(navLink('cc-nav__link', true)).join('')}
          <li class="cc-more" data-cc-more>
            <button type="button" class="cc-nav__link cc-more__btn${inMore ? ' is-active' : ''}" aria-expanded="false" aria-controls="cc-more-list"><svg class="cc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="4" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.6"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.6"/><circle cx="16.75" cy="16.75" r="3.4"/></svg><span>${t.more}</span><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            <ul class="cc-more__list" id="cc-more-list">${MORE_NAV.map(navLink('cc-more__link', true)).join('')}</ul>
          </li>
        </ul>
      </nav>
      <div class="cc-header__lang">${langToggle(lang, altUrl, t.language)}</div>
      <div class="cc-header__tools">
        <button type="button" class="cc-tool-btn cc-theme-btn" data-cc-theme-toggle aria-pressed="false" aria-label="${t.toDark}" title="${t.toDark}" data-label-dark="${t.toDark}" data-label-light="${t.toLight}">
          <svg class="cc-theme-btn__moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/><path d="M17 3.5v2M16 4.5h2" stroke-width="1.4"/></svg>
          <svg class="cc-theme-btn__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>
        </button>
        <button type="button" class="cc-tool-btn cc-menu-btn" data-cc-menu aria-controls="cc-drawer" aria-expanded="false" aria-label="${t.menu}" title="${t.menu}">
          <svg class="cc-menu-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><path class="l1" d="M4 7h16"/><path class="l2" d="M4 12h10"/><path class="l3" d="M4 17h13"/><circle class="dot" cx="19" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>
        </button>
      </div>
    </div>
  </header>
  ${renderCountdown(lang, siteData, t)}

  <dialog class="cc-drawer" id="cc-drawer" aria-label="${t.menu}">
    <div class="cc-drawer__head">
      <a class="cc-brand" href="/${lang}/"><span class="cc-brand__mark">${LOGO_SVG}</span><span class="cc-brand__name">${siteData.orgName[lang]}</span></a>
      <button type="button" class="cc-icon-btn" data-cc-menu-close aria-label="${t.closeMenu}">${icon('close')}</button>
    </div>
    <nav class="cc-drawer__nav" aria-label="${t.menu}">
      <ul class="cc-drawer__list">
        <li><a class="cc-drawer__link" href="/${lang}/"${current(home)}>${icon('home')}<span>${t.home}</span></a></li>
        ${PAGES.explore.filter((p) => p.id !== 'whats-on').map(drawerLink).join('')}
      </ul>
      <p class="cc-kicker cc-drawer__label">${t.more}</p>
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
  <section class="cc-signup" id="newsletter" aria-labelledby="cc-connect-title">
    <div class="cc-wrap">
      <div class="cc-signup__panel">
        <div class="cc-signup__art" aria-hidden="true">
          <svg viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="56" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 5" opacity=".6"/>
            <rect x="24" y="38" width="72" height="50" rx="6" fill="#FFF6EC"/>
            <path d="M24 44l36 24 36-24" stroke="#A0461E" stroke-width="3" stroke-linejoin="round"/>
            <path d="M60 18c-9 0-16 6-16 15 0 7 5 13 16 17 11-4 16-10 16-17 0-9-7-15-16-15z" fill="#F5B82E"/>
            <path d="M53 30c1.5-1.5 3.5-1.5 5 0M62 30c1.5-1.5 3.5-1.5 5 0M54 38c3 3 9 3 12 0" stroke="#6E2412" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="cc-signup__copy">
          <p class="cc-signup__kicker">${t.newsletter}</p>
          <h2 class="cc-signup__title" id="cc-connect-title">${esc(title)}</h2>
          <p class="cc-signup__text">${esc(text)}</p>
        </div>
        <form class="cc-signup__form" data-cc-signup data-cc-endpoint="${esc(siteData.newsletterEndpoint || '')}" data-cc-mailto="${esc(c.email || '')}" novalidate>
          <div class="cc-signup__field">
            <label class="cc-visually-hidden" for="cc-signup-email">${t.email}</label>
            ${icon('mail')}
            <input id="cc-signup-email" type="email" name="email" autocomplete="email" placeholder="${t.email}" required>
            <button type="submit" class="cc-signup__btn">${t.subscribe}${icon('arrowRight')}</button>
          </div>
          <p class="cc-signup__note">${t.signupNote}</p>
          <p class="cc-signup__msg" role="status" data-cc-signup-msg data-done="${esc(t.signupDone)}" data-invalid="${esc(t.signupInvalid)}"></p>
        </form>
      </div>
    </div>
  </section>`;
}

// Floating share bar: a strip on the left edge on desktop, a single button
// above the tab bar on phones that fans the options out. site.js swaps in the
// live URL and handles "More" (native share sheet, else copy link).
const WHATSAPP_PATH = 'M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.43 9.43 0 1 1 7.99 4.42zm8.02-17.45A11.27 11.27 0 0 0 12.05.75C5.8.75.72 5.83.72 12.08c0 2 .52 3.95 1.52 5.66L.62 23.62l6.02-1.58a11.32 11.32 0 0 0 5.41 1.38h.01c6.25 0 11.33-5.08 11.33-11.33 0-3.03-1.18-5.87-3.32-8.01z';
function renderShareBar(t, url, orgName) {
  const u = encodeURIComponent(url);
  const path = (name) => SOCIAL.find((s) => s.name === name).path;
  const svg = (d) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${d}"/></svg>`;
  const social = (name) => SOCIAL.find((s) => s.name === name);
  const links = [
    { key: 'fb', name: 'Facebook', label: `${t.shareOn} Facebook`, href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, d: path('Facebook') },
    { key: 'x', name: 'X', label: `${t.shareOn} X`, href: `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(orgName)}`, d: path('X') },
    { key: 'wa', name: 'WhatsApp', label: `${t.shareOn} WhatsApp`, href: `https://wa.me/?text=${encodeURIComponent(orgName + ' ')}${u}`, d: WHATSAPP_PATH },
    { key: 'ig', name: 'Instagram', label: `${t.follow}: Instagram`, href: social('Instagram').href, d: path('Instagram') },
    { key: 'yt', name: 'YouTube', label: `${t.follow}: YouTube`, href: social('YouTube').href, d: path('YouTube') },
  ];
  return `
  <div class="cc-share" data-cc-share>
    <button type="button" class="cc-share__toggle" aria-expanded="false" aria-controls="cc-share-list" aria-label="${esc(t.share)}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
    </button>
    <ul class="cc-share__list" id="cc-share-list" aria-label="${esc(t.share)}">
      ${links.map((l, i) => `<li style="--i:${i}"><a class="cc-share__btn cc-share__btn--${l.key}" href="${esc(l.href)}" data-cc-share-${l.key} target="_blank" rel="noopener" aria-label="${esc(l.label)}">${svg(l.d)}<span>${l.name}</span></a></li>`).join('')}
    </ul>
  </div>`;
}

function renderFooter({ lang, siteData, altUrl, currentPath = '' }) {
  const t = T[lang];
  const c = siteData.contact || {};
  return `
  ${renderConnect({ lang, siteData, currentPath })}
  ${ART_BANNER}
  <footer class="cc-footer">
    <div class="cc-wrap cc-footer__intro">
      <a class="cc-brand cc-brand--light" href="/${lang}/"><span class="cc-brand__mark">${LOGO_SVG}</span><span class="cc-brand__name">${siteData.orgName[lang]}</span></a>
      <p class="cc-footer__tagline">${siteData.tagline[lang]}</p>
      <p class="cc-footer__about">${t.about}</p>
    </div>
    <div class="cc-wrap">
      <div class="cc-footer__grid">
        <nav class="cc-footer__col cc-footer__col--links" aria-label="${t.quickNav}">
          <h2 class="cc-footer__title">${t.quickNav}</h2>
          <ul class="cc-footer__list cc-footer__links">${FOOTER_LINKS.map((p) => `<li><a href="/${lang}/${p.id}/"${current(isActive(p.id, currentPath))}>${icon(p.icon)}<span>${p.label[lang]}</span></a></li>`).join('')}</ul>
        </nav>
        <div class="cc-footer__col cc-footer__col--contact">
          <h2 class="cc-footer__title">${t.contact}</h2>
          <ul class="cc-footer__list cc-footer__contact">
            ${c.email ? `<li><a href="mailto:${c.email}">${icon('mail')}<span>${esc(c.email)}</span></a></li>` : ''}
            ${c.phone ? `<li><a href="tel:${c.phone.replace(/\s+/g, '')}">${icon('phone')}<span>${esc(c.phone)}</span></a></li>` : ''}
            ${c.address ? `<li class="cc-footer__addr">${icon('pin')}<span>${esc(c.address[lang])}</span></li>` : ''}
          </ul>
        </div>
      </div>
      <div class="cc-footer__bottom">
        <p>© ${new Date().getFullYear()} ${siteData.orgName[lang]}. ${t.rights}</p>
        <div class="cc-footer__bottom-links">
          <a href="${altUrl}" hreflang="${lang === 'hi' ? 'en' : 'hi'}" lang="${lang === 'hi' ? 'en' : 'hi'}">${lang === 'hi' ? 'English' : 'हिन्दी'}</a>
          <a class="cc-footer__top-link" href="#top" data-cc-top>${icon('arrowUp')}<span>${t.backToTop}</span></a>
        </div>
      </div>
    </div>
  </footer>
${renderShareBar(t, (siteData.siteUrl || '') + currentPath, siteData.orgName[lang])}

  <aside class="cc-install" data-cc-install-toast hidden aria-label="${t.installApp}">
    <span class="cc-install__text"><strong>${t.installApp}</strong><span>${t.installSub}</span></span>
    <button type="button" class="cc-btn cc-btn--primary cc-btn--sm" data-cc-install>${t.install}</button>
    <button type="button" class="cc-icon-btn" data-cc-install-dismiss aria-label="${t.notNow}">${icon('close')}</button>
  </aside>`;
}

module.exports = { renderHeader, renderFooter, PAGES };
