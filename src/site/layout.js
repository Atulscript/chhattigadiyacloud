// Chhattisgadhiya Cloud - shared page chrome (build time, Node).
// Header, mobile menu, mobile tab bar and footer used by every generated page.
// Styles: src/site/site.css. Behaviour: src/site/site.js.

const ICON_PATHS = {
  home: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
  calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z',
  mask: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 7.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z',
  star: 'M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z',
  palette: 'M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z',
  book: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z',
  info: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z',
  menu: 'M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z',
  close: 'M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
  globe: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.08 16zm2.95-8H5.08a7.99 7.99 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.35.16-2h4.68c.09.65.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z',
  phone: 'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z',
  mail: 'M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
  pin: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z',
  arrowUp: 'M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z',
  download: 'M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z',
};

const SOCIAL = [
  { name: 'YouTube', href: 'https://youtube.com', path: 'M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z' },
  { name: 'Instagram', href: 'https://instagram.com', path: 'M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z' },
  { name: 'Facebook', href: 'https://facebook.com', path: 'M24 12.07C24 5.41 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.5c-1.5 0-1.96.93-1.96 1.89v2.26h3.32l-.53 3.5h-2.8V24C19.62 23.1 24 18.1 24 12.07z' },
  { name: 'X', href: 'https://x.com', path: 'M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.21-6.82-5.97 6.82H1.68l7.73-8.84L1.25 2.25h6.83l4.71 6.23zm-1.16 17.52h1.83L7.08 4.13H5.12z' },
];

const LOGO_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke-dasharray="2.5 3.5"/><path d="M8 11.5c1.2 2 2.8 2.8 4 2.8s2.8-.8 4-2.8"/><circle cx="9" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15" cy="8.5" r="1.2" fill="currentColor"/><path d="M9 16c1.5 1.2 4.5 1.2 6 0"/></svg>`;

const icon = (name, cls = 'cc-icon') => `<svg class="${cls}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${ICON_PATHS[name]}"/></svg>`;

// Site map: `primary` shows in the desktop bar; everything shows in the menu.
const PAGES = {
  primary: [
    { id: 'whats-on', icon: 'calendar', label: { en: "What's On", hi: 'आगामी कार्यक्रम' } },
    { id: 'productions', icon: 'mask', label: { en: 'Plays', hi: 'नाटक' } },
    { id: 'events', icon: 'star', label: { en: 'Festivals', hi: 'समारोह' } },
    { id: 'training-workshops', icon: 'palette', label: { en: 'Workshops', hi: 'कार्यशालाएं' } },
    { id: 'magazine', icon: 'book', label: { en: 'Magazine', hi: 'पत्रिका' } },
    { id: 'about', icon: 'info', label: { en: 'About', hi: 'परिचय' } },
  ],
  more: [
    { id: 'blog', label: { en: 'Blog', hi: 'ब्लॉग' } },
    { id: 'press', label: { en: 'Press kit', hi: 'प्रेस किट' } },
    { id: 'support', label: { en: 'Support us', hi: 'सहयोग करें' } },
    { id: 'contact', label: { en: 'Contact', hi: 'संपर्क' } },
  ],
};

const T = {
  en: {
    skip: 'Skip to content', mainNav: 'Main', home: 'Home', menu: 'Menu', closeMenu: 'Close menu', contact: 'Contact',
    explore: 'Explore', organisation: 'Organisation', switchLang: 'हिन्दी', switchLangLabel: 'हिन्दी में देखें',
    quickNav: 'Quick links', installApp: 'Install the app', installSub: 'Read offline, open faster',
    install: 'Install', notNow: 'Not now',
    signupTitle: 'Stay in the loop',
    signupText: 'New plays, festival dates and magazine issues, straight to your inbox.',
    email: 'Email address', subscribe: 'Subscribe',
    signupDone: 'Thank you! Please send the email that just opened to confirm.',
    signupInvalid: 'Please enter a valid email address.',
    about: 'Theatre, festivals, workshops and a monthly magazine from Chhattisgarh.',
    follow: 'Follow us', bookPlay: 'Book a play', rights: 'All rights reserved.', backToTop: 'Back to top',
  },
  hi: {
    skip: 'मुख्य सामग्री पर जाएं', mainNav: 'मुख्य', home: 'होम', menu: 'मेनू', closeMenu: 'मेनू बंद करें', contact: 'संपर्क',
    explore: 'देखें', organisation: 'संस्था', switchLang: 'English', switchLangLabel: 'View in English',
    quickNav: 'त्वरित लिंक', installApp: 'ऐप इंस्टॉल करें', installSub: 'ऑफ़लाइन पढ़ें, तेज़ खोलें',
    install: 'इंस्टॉल', notNow: 'अभी नहीं',
    signupTitle: 'जुड़े रहें',
    signupText: 'नए नाटक, समारोह की तिथियां और पत्रिका के अंक, सीधे आपके ईमेल पर।',
    email: 'ईमेल पता', subscribe: 'सब्सक्राइब करें',
    signupDone: 'धन्यवाद! पुष्टि के लिए अभी खुला ईमेल भेज दें।',
    signupInvalid: 'कृपया सही ईमेल पता लिखें।',
    about: 'छत्तीसगढ़ से रंगमंच, समारोह, कार्यशालाएं और मासिक पत्रिका।',
    follow: 'हमें फ़ॉलो करें', bookPlay: 'नाटक बुक करें', rights: 'सर्वाधिकार सुरक्षित।', backToTop: 'ऊपर जाएं',
  },
};

const isActive = (id, currentPath) => currentPath.includes(`/${id}/`);
const isHomePath = (lang, currentPath) => currentPath === `/${lang}/` || currentPath === `/${lang}`;
const current = (on) => (on ? ' aria-current="page"' : '');

function renderHeader({ lang, currentPath, altUrl, siteData }) {
  const t = T[lang];
  const altLang = lang === 'hi' ? 'en' : 'hi';
  const link = (p) => `<li><a class="cc-nav__link" href="/${lang}/${p.id}/"${current(isActive(p.id, currentPath))}>${p.label[lang]}</a></li>`;
  const drawerLink = (p) => `<li><a class="cc-drawer__link" href="/${lang}/${p.id}/"${current(isActive(p.id, currentPath))}>${p.icon ? icon(p.icon) : ''}<span>${p.label[lang]}</span></a></li>`;
  const home = isHomePath(lang, currentPath);
  const phone = (siteData.contact && siteData.contact.phone) || '';
  const email = (siteData.contact && siteData.contact.email) || '';

  const tabs = [
    { href: `/${lang}/`, label: t.home, icon: 'home', on: home },
    { href: `/${lang}/whats-on/`, label: PAGES.primary[0].label[lang], icon: 'calendar', on: isActive('whats-on', currentPath) },
    { href: `/${lang}/productions/`, label: PAGES.primary[1].label[lang], icon: 'mask', on: isActive('productions', currentPath) },
    { href: `/${lang}/magazine/`, label: PAGES.primary[4].label[lang], icon: 'book', on: isActive('magazine', currentPath) },
  ];

  return `
  <a class="cc-skip" href="#main">${t.skip}</a>
  <header class="cc-header" id="top">
    <div class="cc-header__inner">
      <a class="cc-brand" href="/${lang}/"${current(home)}>
        <span class="cc-brand__mark">${LOGO_SVG}</span>
        <span class="cc-brand__name">${siteData.orgName[lang]}</span>
      </a>
      <nav class="cc-nav" aria-label="${t.mainNav}">
        <ul>${PAGES.primary.map(link).join('')}</ul>
      </nav>
      <div class="cc-header__actions">
        <a class="cc-lang" href="${altUrl}" hreflang="${altLang}" lang="${altLang}" aria-label="${t.switchLangLabel}">${icon('globe')}<span>${t.switchLang}</span></a>
        <a class="cc-btn cc-btn--dark cc-header__cta" href="/${lang}/contact/"${current(isActive('contact', currentPath))}>${t.contact}</a>
        <button type="button" class="cc-menu-btn" data-cc-menu aria-controls="cc-drawer" aria-expanded="false" aria-label="${t.menu}">${icon('menu')}</button>
      </div>
    </div>
  </header>

  <dialog class="cc-drawer" id="cc-drawer" aria-label="${t.menu}">
    <div class="cc-drawer__head">
      <a class="cc-brand" href="/${lang}/"><span class="cc-brand__mark">${LOGO_SVG}</span><span class="cc-brand__name">${siteData.orgName[lang]}</span></a>
      <button type="button" class="cc-icon-btn" data-cc-menu-close aria-label="${t.closeMenu}">${icon('close')}</button>
    </div>
    <nav class="cc-drawer__nav" aria-label="${t.menu}">
      <p class="cc-drawer__label">${t.explore}</p>
      <ul>
        <li><a class="cc-drawer__link" href="/${lang}/"${current(home)}>${icon('home')}<span>${t.home}</span></a></li>
        ${PAGES.primary.map(drawerLink).join('')}
      </ul>
      <p class="cc-drawer__label">${t.organisation}</p>
      <ul class="cc-drawer__more">${PAGES.more.map(drawerLink).join('')}</ul>
    </nav>
    <div class="cc-drawer__foot">
      <a class="cc-drawer__lang" href="${altUrl}" hreflang="${altLang}" lang="${altLang}">${icon('globe')}<span>${t.switchLangLabel}</span></a>
      ${phone ? `<a class="cc-drawer__contact" href="tel:${phone.replace(/\s+/g, '')}">${icon('phone')}<span>${phone}</span></a>` : ''}
      ${email ? `<a class="cc-drawer__contact" href="mailto:${email}">${icon('mail')}<span>${email}</span></a>` : ''}
      <button type="button" class="cc-drawer__install" data-cc-install hidden>${icon('download')}<span>${t.installApp}</span></button>
    </div>
  </dialog>

  <nav class="cc-tabbar" aria-label="${t.quickNav}">
    ${tabs.map((tab) => `<a class="cc-tabbar__item" href="${tab.href}"${current(tab.on)}>${icon(tab.icon)}<span>${tab.label}</span></a>`).join('')}
    <button type="button" class="cc-tabbar__item" data-cc-menu aria-controls="cc-drawer" aria-expanded="false">${icon('menu')}<span>${t.menu}</span></button>
  </nav>`;
}

function renderFooter({ lang, siteData, altUrl }) {
  const t = T[lang];
  const altLang = lang === 'hi' ? 'en' : 'hi';
  const c = siteData.contact || {};
  const col = (title, pages) => `
        <div class="cc-footer__col">
          <h2 class="cc-footer__title">${title}</h2>
          <ul>${pages.map((p) => `<li><a href="/${lang}/${p.id}/">${p.label[lang]}</a></li>`).join('')}</ul>
        </div>`;
  return `
  <section class="cc-signup" id="newsletter" aria-labelledby="cc-signup-title">
    <div class="cc-wrap cc-signup__inner">
      <div>
        <h2 class="cc-signup__title" id="cc-signup-title">${t.signupTitle}</h2>
        <p class="cc-signup__text">${t.signupText}</p>
      </div>
      <form class="cc-signup__form" data-cc-signup data-cc-endpoint="${siteData.newsletterEndpoint || ''}" data-cc-mailto="${c.email || ''}" novalidate>
        <label class="cc-visually-hidden" for="cc-signup-email">${t.email}</label>
        <input id="cc-signup-email" type="email" name="email" autocomplete="email" placeholder="${t.email}" required>
        <button type="submit" class="cc-btn cc-btn--accent">${t.subscribe}</button>
        <p class="cc-signup__msg" role="status" data-cc-signup-msg data-done="${t.signupDone}" data-invalid="${t.signupInvalid}"></p>
      </form>
    </div>
  </section>

  <div class="footer-artistic-ribbon cc-footer__art" aria-hidden="true"></div>

  <footer class="cc-footer">
    <div class="cc-wrap">
      <div class="cc-footer__grid">
        <div class="cc-footer__brand">
          <a class="cc-brand cc-brand--light" href="/${lang}/"><span class="cc-brand__mark">${LOGO_SVG}</span><span class="cc-brand__name">${siteData.orgName[lang]}</span></a>
          <p class="cc-footer__tagline">${siteData.tagline[lang]}</p>
          <p class="cc-footer__about">${t.about}</p>
          <p class="cc-footer__label">${t.follow}</p>
          <ul class="cc-social">
            ${SOCIAL.map((s) => `<li><a href="${s.href}" target="_blank" rel="noopener" aria-label="${s.name}"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${s.path}"/></svg></a></li>`).join('')}
          </ul>
        </div>
        ${col(t.explore, PAGES.primary.slice(0, 5))}
        ${col(t.organisation, [PAGES.primary[5], ...PAGES.more])}
        <div class="cc-footer__col">
          <h2 class="cc-footer__title">${t.contact}</h2>
          <ul class="cc-footer__contact">
            ${c.email ? `<li><a href="mailto:${c.email}">${icon('mail')}<span>${c.email}</span></a></li>` : ''}
            ${c.phone ? `<li><a href="tel:${c.phone.replace(/\s+/g, '')}">${icon('phone')}<span>${c.phone}</span></a></li>` : ''}
            ${c.address ? `<li><span class="cc-footer__addr">${icon('pin')}<span>${c.address[lang]}</span></span></li>` : ''}
          </ul>
          <a class="cc-btn cc-btn--light cc-footer__book" href="/${lang}/contact/?subject=Tour-Booking">${t.bookPlay}</a>
        </div>
      </div>
      <div class="cc-footer__bottom">
        <p>© ${new Date().getFullYear()} ${siteData.orgName[lang]}. ${t.rights}</p>
        <p class="cc-footer__links">
          <a href="${altUrl}" hreflang="${altLang}" lang="${altLang}">${t.switchLang}</a>
          <a href="#top" data-cc-top>${icon('arrowUp')}<span>${t.backToTop}</span></a>
        </p>
      </div>
    </div>
  </footer>

  <aside class="cc-install" data-cc-install-toast hidden aria-label="${t.installApp}">
    <span class="cc-install__text"><strong>${t.installApp}</strong><span>${t.installSub}</span></span>
    <button type="button" class="cc-btn cc-btn--accent cc-btn--sm" data-cc-install>${t.install}</button>
    <button type="button" class="cc-icon-btn" data-cc-install-dismiss aria-label="${t.notNow}">${icon('close')}</button>
  </aside>`;
}

module.exports = { renderHeader, renderFooter, PAGES };
