// Multi-Page Static Generator for Chhattisgadhiya Cloud
// Strictly adheres to Website Brief Section 2 & 6:
// Dedicated HTML pages per language with distinct URLs: /en/ and /hi/
// Material Design 3 / Google Design Patterns Navigation:
// - Top Announcement Bar (bulletin & quick links)
// - Material Elevation & Surface Containers (Light mode by default)
// - 7 Primary Top-Level Items + Instant Search Modal + Mobile Drawer
// - Material Pill Active Indicator (MD3 Navigation Bar / Tabs)
// - Google Sans / Plus Jakarta Sans typography with high-contrast slate text
// - Clean horizontal compact Rebus lockup: Think [Logo] Think Chhattisgadhiya Cloud
// - Vibrant Reddit Palette (#FF4500 OrangeRed, #1A73E8 Google Blue, #FFFFFF/#F8F9FA Surfaces)
// - Integrated modern SVG artworks for hero, plays, festivals, and youth workshops
// - Rich cultural content: Impact stats, national press reviews, folk traditions triad, and comprehensive 5-column footer

const fs = require('fs');
const path = require('path');

// Import content
const { siteData } = require('./src/data/content-node.js');

// Automatically compile and minify styles.css into styles.min.css
const cssRaw = fs.readFileSync(path.join(__dirname, 'src', 'styles.css'), 'utf8');
const cssMin = cssRaw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
  .replace(/;\}/g, '}')
  .trim();
fs.writeFileSync(path.join(__dirname, 'src', 'styles.min.css'), cssMin);

// Artwork Mapping
const playArtworkMap = {
  'kahani-vasu-ki': '/src/assets/images/play-vasu.svg',
  'vincent-a-flashback': '/src/assets/images/play-vincent.svg',
  'gabar-ghichor': '/src/assets/images/play-gabar.svg',
  'raja-ravi-verma': '/src/assets/images/play-raja.svg'
};

function renderHeader(lang, currentPath, title, altUrl) {
  const isHi = lang === 'hi';

  const navItems = [
    { href: `/${lang}/`, label: isHi ? 'होम' : 'Home', id: 'home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { href: `/${lang}/whats-on/`, label: isHi ? 'आगामी कार्यक्रम' : "What's On", id: 'whats-on', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z' },
    { href: `/${lang}/productions/`, label: isHi ? 'नाट्य प्रस्तुतियां' : 'Productions', id: 'productions', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 7.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z' },
    { href: `/${lang}/events/`, label: isHi ? 'समारोह' : 'Events', id: 'events', icon: 'M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z' },
    { href: `/${lang}/training-workshops/`, label: isHi ? 'प्रशिक्षण व शिविर' : 'Workshops', id: 'workshops', icon: 'M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
    { href: `/${lang}/magazine/`, label: isHi ? 'पत्रिका' : 'Magazine', id: 'magazine', icon: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z' },
    { href: `/${lang}/about/`, label: isHi ? 'परिचय' : 'About Us', id: 'about', icon: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z' }
  ];

  const navHtml = navItems.map(item => {
    const isHome = item.id === 'home';
    const isActive = isHome ? (currentPath === `/${lang}/` || currentPath === `/${lang}`) : currentPath.includes(item.id);
    return `
      <a href="${item.href}" class="md3-nav-item ${isActive ? 'active' : ''}">
        <span class="md3-nav-pill">
          <svg class="md3-nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="${item.icon}"/>
          </svg>
          <span class="md3-nav-label">${item.label}</span>
        </span>
      </a>
    `;
  }).join('\n');

  const drawerSections = [
    {
      title: isHi ? 'मुख्य मंच' : 'Core Stages',
      items: [
        { href: `/${lang}/`, label: isHi ? 'होम' : 'Home', id: 'home', icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
        { href: `/${lang}/whats-on/`, label: isHi ? 'आगामी कार्यक्रम' : "What's On", id: 'whats-on', icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z' },
        { href: `/${lang}/productions/`, label: isHi ? 'नाट्य प्रस्तुतियां' : 'Productions', id: 'productions', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 7.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z' },
        { href: `/${lang}/events/`, label: isHi ? 'समारोह व उत्सव' : 'Events & Festivals', id: 'events', icon: 'M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z' }
      ]
    },
    {
      title: isHi ? 'साहित्य एवं कला' : 'Art & Editorial',
      items: [
        { href: `/${lang}/magazine/`, label: isHi ? 'रंग पत्रिका (अंक 14)' : 'Magazine (Issue 14)', id: 'magazine', icon: 'M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z', badge: 'LIVE' },
        { href: `/${lang}/training-workshops/`, label: isHi ? 'प्रशिक्षण व युवा शिविर' : 'Workshops & Residency', id: 'workshops', icon: 'M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' }
      ]
    },
    {
      title: isHi ? 'संस्था व संपर्क' : 'Institution & Connect',
      items: [
        { href: `/${lang}/about/`, label: isHi ? 'संस्था परिचय' : 'About Organization', id: 'about', icon: 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z' },
        { href: `/${lang}/contact/`, label: isHi ? 'संपर्क व मंचन बुकिंग' : 'Contact & Bookings', id: 'contact', icon: 'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z' }
      ]
    }
  ];

  const drawerSectionsHtml = drawerSections.map(sec => {
    const links = sec.items.map(item => {
      const isHome = item.id === 'home';
      const isActive = isHome ? (currentPath === `/${lang}/` || currentPath === `/${lang}`) : currentPath.includes(item.id);
      return `
        <a href="${item.href}" class="mobile-drawer-link ${isActive ? 'active' : ''}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="${item.icon}"/></svg>
          <span class="drawer-link-text">${item.label}</span>
          ${item.badge ? `<span class="drawer-link-badge">${item.badge}</span>` : ''}
        </a>
      `;
    }).join('\n');
    return `
      <div class="app-drawer-group">
        <div class="app-drawer-group-title">${sec.title}</div>
        ${links}
      </div>
    `;
  }).join('\n');

  return `
  <!-- Material 3 Top App Bar -->
  <header class="md3-top-app-bar">
    <div class="md3-header-container">
      
      <!-- Brand Lockup with clean horizontal alignment (Section 1.3) -->
      <a href="/${lang}/" class="md3-brand-wrap" aria-label="Chhattisgadhiya Cloud Home">
        <div class="md3-logo-avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-dasharray="2.5 3.5"/>
            <path d="M8 11.5c1.2 2 2.8 2.8 4 2.8s2.8-.8 4-2.8"/>
            <circle cx="9" cy="8.5" r="1.2" fill="currentColor"/>
            <circle cx="15" cy="8.5" r="1.2" fill="currentColor"/>
            <path d="M9 16c1.5 1.2 4.5 1.2 6 0"/>
          </svg>
        </div>
        
        <div class="md3-brand-text">
          <span class="md3-brand-headline">${siteData.orgName[lang]}</span>
          <div class="md3-rebus-lockup">
            <span class="md3-rebus-word">THINK</span>
            <span class="md3-rebus-mark">CC</span>
            <span class="md3-rebus-word">THINK CHHATTISGADHIYA CLOUD</span>
          </div>
        </div>
      </a>

      <!-- Google Material Navigation Bar (Desktop Centered) -->
      <nav class="md3-main-nav" aria-label="Primary Navigation">
        ${navHtml}
      </nav>

      <!-- Trailing Action: Language Switcher, Contact & Mobile Toggle -->
      <div class="md3-header-actions">
        <a href="/${lang}/contact/" class="md3-action-btn ${currentPath.includes('contact') ? 'active' : ''}">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style="margin-right:0.35rem;">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
          </svg>
          <span>${isHi ? 'संपर्क' : 'Contact'}</span>
        </a>

        <a href="${altUrl}" class="md3-lang-pill" title="${isHi ? 'Switch to English' : 'हिंदी में देखें'}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <span>${isHi ? 'English' : 'हिन्दी'}</span>
        </a>

        <!-- Mobile Drawer Toggle Button -->
        <button class="mobile-nav-toggle" id="mobile-toggle" aria-label="Toggle Navigation Menu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
          </svg>
        </button>
      </div>

    </div>
  </header>

  <!-- Mobile Drawer & Overlay (Native App Sheet Experience) -->
  <div class="mobile-drawer-overlay" id="drawer-overlay"></div>
  <aside class="mobile-drawer" id="mobile-drawer">
    <!-- App Drawer Header Card -->
    <div class="mobile-drawer-header">
      <div class="app-drawer-brand">
        <div class="app-drawer-avatar">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="9.5" stroke="currentColor" stroke-dasharray="2.5 3.5"/>
            <path d="M8 11.5c1.2 2 2.8 2.8 4 2.8s2.8-.8 4-2.8"/>
            <circle cx="9" cy="8.5" r="1.2" fill="currentColor"/>
            <circle cx="15" cy="8.5" r="1.2" fill="currentColor"/>
            <path d="M9 16c1.5 1.2 4.5 1.2 6 0"/>
          </svg>
        </div>
        <div class="app-drawer-titles">
          <span class="app-drawer-title">${siteData.orgName[lang]}</span>
          <span class="app-drawer-sub">${isHi ? 'रंगमंच एवं सांस्कृतिक क्लाउड' : 'Culture & Theatre Cloud'}</span>
        </div>
      </div>
      <button class="mobile-drawer-close" id="drawer-close" aria-label="Close Navigation Menu">✕</button>
    </div>

    <!-- Quick Language Switcher Banner -->
    <div class="app-drawer-lang-wrap">
      <a href="${altUrl}" class="app-drawer-lang-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
        <span>${isHi ? '🌐 Switch to English' : '🌐 हिंदी में देखें'}</span>
      </a>
    </div>

    <!-- Grouped App Navigation -->
    <div class="mobile-drawer-nav">
      ${drawerSectionsHtml}

      <!-- PWA Install / Home Screen Helper Card -->
      <div class="app-drawer-install-card" id="pwa-install-card">
        <div class="app-install-icon">📱</div>
        <div class="app-install-info">
          <div class="app-install-title">${isHi ? 'ऐप की तरह चलाएं' : 'Install App'}</div>
          <div class="app-install-sub">${isHi ? 'होम स्क्रीन पर जोड़ें' : 'Add to Home Screen'}</div>
        </div>
        <button type="button" class="app-install-btn" id="pwa-install-btn">${isHi ? 'जोड़ें' : 'Add'}</button>
      </div>

      <!-- Direct Repertoire Helpline -->
      <div class="app-drawer-helpline">
        <div class="drawer-helpline-label">${isHi ? 'नाट्य मंचन बुकिंग डेस्क' : 'Stage Booking Desk'}</div>
        <a href="tel:+919826132958" class="drawer-helpline-phone">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
          <span>+91 98261 32958</span>
        </a>
      </div>
    </div>
  </aside>

  <!-- Material 3 Mobile App Bottom Navigation Bar (Docked App Bar) -->
  <nav class="mobile-app-bottom-bar" id="app-bottom-bar" aria-label="Mobile App Navigation">
    <a href="/${lang}/" class="bottom-nav-item ${currentPath === `/${lang}/` || currentPath === `/${lang}` ? 'active' : ''}">
      <span class="bottom-nav-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </svg>
      </span>
      <span class="bottom-nav-label">${isHi ? 'होम' : 'Home'}</span>
    </a>

    <a href="/${lang}/events/" class="bottom-nav-item ${currentPath.includes('events') ? 'active' : ''}">
      <span class="bottom-nav-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/>
        </svg>
      </span>
      <span class="bottom-nav-label">${isHi ? 'समारोह' : 'Events'}</span>
    </a>

    <a href="/${lang}/magazine/" class="bottom-nav-item ${currentPath.includes('magazine') ? 'active' : ''}">
      <span class="bottom-nav-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>
        </svg>
        <span class="bottom-nav-badge">14</span>
      </span>
      <span class="bottom-nav-label">${isHi ? 'पत्रिका' : 'Magazine'}</span>
    </a>

    <a href="/${lang}/productions/" class="bottom-nav-item ${currentPath.includes('productions') ? 'active' : ''}">
      <span class="bottom-nav-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 7.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/>
        </svg>
      </span>
      <span class="bottom-nav-label">${isHi ? 'प्रस्तुतियां' : 'Plays'}</span>
    </a>

    <button type="button" class="bottom-nav-item" id="bottom-menu-toggle" aria-label="Open Full App Menu">
      <span class="bottom-nav-icon-wrap">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/>
        </svg>
      </span>
      <span class="bottom-nav-label">${isHi ? 'मेनू' : 'Menu'}</span>
    </button>
  </nav>
  `;
}

function renderBreadcrumb(crumbs) {
  if (!crumbs || crumbs.length === 0) return '';
  const items = crumbs.map((c, idx) => {
    if (idx === crumbs.length - 1) {
      return `<span class="md3-crumb-current">${c.label}</span>`;
    }
    return `<a href="${c.href}" class="md3-crumb-link">${c.label}</a> <span class="md3-crumb-sep">/</span> `;
  }).join('');

  return `
  <div class="md3-breadcrumb-bar">
    <div class="container">
      <nav class="md3-breadcrumbs" aria-label="Breadcrumb">
        ${items}
      </nav>
    </div>
  </div>
  `;
}

function renderProductionCard(prod, lang) {
  const isHi = lang === 'hi';
  const artworkSrc = prod.image || prod.poster || prod.banner || playArtworkMap[prod.id] || '/src/assets/images/hero-art.svg';
  const prodIcon = prod.icon || '🎭';
  return `
    <article class="production-card">
      <div class="poster-canvas">
        <img src="${artworkSrc}" alt="${prod.title[lang]}" class="poster-svg-art" loading="lazy">
        <div class="poster-vignette" aria-hidden="true"></div>
        <div class="poster-overlay-badges">
          <span class="badge-genre">${prodIcon} ${prod.genre[lang]}</span>
          <span class="badge-year">${prod.year}</span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-header-lockup">
          <h3 class="card-title">${prod.title[lang]}</h3>
          <div class="card-subtitle">${prod.subtitle[lang]}</div>
        </div>
        <p class="card-synopsis">${prod.synopsis[lang]}</p>
        
        <div class="card-meta-chips">
          <div class="meta-chip">
            <span class="meta-chip-icon">🎬</span>
            <span class="meta-chip-text"><strong>${isHi ? 'निर्देशन' : 'Direction'}:</strong> ${prod.director}</span>
          </div>
          <div class="meta-chip">
            <span class="meta-chip-icon">⏱️</span>
            <span class="meta-chip-text"><strong>${isHi ? 'अवधि/भाषा' : 'Specs'}:</strong> ${prod.duration} • ${prod.language}</span>
          </div>
          <div class="meta-chip">
            <span class="meta-chip-icon">👥</span>
            <span class="meta-chip-text"><strong>${isHi ? 'कलाकार' : 'Lead Cast'}:</strong> ${prod.cast.slice(0, 3).join(', ')}</span>
          </div>
        </div>

        <div class="card-action-footer">
          <a href="/${lang}/contact/?subject=Booking-${prod.id}" class="btn-primary card-action-btn">
            <span>${isHi ? 'मंचन बुकिंग' : 'Book / Invite Play'}</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
          <a href="/${lang}/productions/#${prod.id}" class="btn-secondary card-secondary-btn" title="${isHi ? 'नाटक विवरण' : 'Play Dossier'}">
            <span>${isHi ? 'विवरण' : 'Dossier'}</span>
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderFooter(lang) {
  const isHi = lang === 'hi';
  return `
  <!-- Newsletter Block with Enhanced Social Proof (Section 3.12) -->
  <section class="section newsletter-section" id="newsletter">
    <div class="container newsletter-inner">
      <span class="page-eyebrow">✦ ${isHi ? 'माटी के रंगमंच से जुड़े रहें' : 'Stay Connected with Grassroots Theatre'} ✦</span>
      <h2 class="newsletter-heading">
        ${isHi ? 'माटी के रंगमंच से सीधे जुड़े रहें' : 'Stay Connected to the Living Soil'}
      </h2>
      <p class="newsletter-desc">
        ${isHi ? 'आगामी नाटकों की तिथियां, जशरंग महोत्सव घोषणाएं, बाल कार्यशालाएं और मासिक पत्रिका की अग्रिम सूचना प्राप्त करें।' : 'Receive quarterly announcements for stage production tours, Jashrang Festival tickets, and monthly critical essays.'}
      </p>
      
      <div class="newsletter-proof">
        <span>👥</span>
        <span>${isHi ? '1,800+ कला प्रेमियों एवं रंगकर्मियों से जुड़ें' : 'Joined by 1,800+ theatre lovers, directors, and cultural scholars'}</span>
      </div>

      <form class="newsletter-form" onsubmit="event.preventDefault(); alert('${isHi ? "सदस्यता स्वीकार कर ली गई है! छत्तीसगढ़िया क्लाउड से जुड़ने हेतु धन्यवाद।" : "Subscribed to Chhattisgadhiya Cloud updates! Thank you for supporting grassroots Indian arts."}');">
        <input type="text" placeholder="${isHi ? 'आपका नाम' : 'Your name'}" required class="form-input newsletter-input-name">
        <input type="email" placeholder="${isHi ? 'ईमेल पता' : 'Your email address'}" required class="form-input newsletter-input-email">
        <button type="submit" class="btn-primary newsletter-submit-btn">${isHi ? 'सब्सक्राइब करें' : 'Subscribe'}</button>
      </form>
    </div>
  </section>

  <!-- Follow Us Strip (Positioned Above Footer as requested) -->
  <section class="follow-us-bar">
    <div class="container">
      <div class="follow-us-inner">
        <div class="follow-us-text">
          <span class="follow-pill">✦ ${isHi ? 'रंगमंच से जुड़ें' : 'Follow Our Productions'} ✦</span>
          <h3 class="follow-heading">${isHi ? 'सोशल मीडिया पर हमारे साथ जुड़ें' : 'Follow Us on Social Channels'}</h3>
          <p class="follow-subtext">${isHi ? 'नाट्य मंचन क्लिप्स, साक्षात्कार, पूर्वाभ्यास और सांस्कृतिक वृत्तचित्र।' : 'Stage performance clips, artist dialogues, rehearsal glimpses, and festival livestreams.'}</p>
        </div>
        <div class="follow-us-links">
          <a href="https://youtube.com" target="_blank" rel="noopener" class="social-pill yt">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            <span>YouTube</span>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener" class="social-pill ig">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            <span>Instagram</span>
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener" class="social-pill fb">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            <span>Facebook</span>
          </a>
          <a href="https://x.com" target="_blank" rel="noopener" class="social-pill tw">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            <span>Twitter / X</span>
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- Artistic Silhouette Folk Frieze Ribbon ("Line with pic") -->
  <div class="footer-artistic-ribbon" role="img" aria-label="Folk Theatre Caravan and Tribal Dancers Frieze"></div>

  <!-- Comprehensive Site Footer -->
  <footer class="site-footer">
    <div class="container">

      <div class="footer-grid">
        
        <!-- Col 1: Organisation & Heritage (Spans on mobile) -->
        <div class="footer-col footer-col-brand">
          <h4>${siteData.orgName[lang]}</h4>
          <p>
            “Think Art Think Chhattisgadhiya Cloud” — ${isHi ? 'रंगमंच, राष्ट्रीय महोत्सव, बाल कार्यशालाएं और वैचारिक प्रकाशनों का एक स्वायत्त सांस्कृतिक संस्थान।' : 'A cultural institution producing theatre, national festivals, youth workshops, and intellectual publications.'}
          </p>
        </div>

        <!-- Col 2: Repertoire & Festivals -->
        <div class="footer-col">
          <h4>${isHi ? 'रंगमंच व समारोह' : 'Repertoire & Festivals'}</h4>
          <ul>
            <li><a href="/${lang}/productions/">${isHi ? 'नाट्य प्रस्तुतियां (४ मौलिक नाटक)' : 'Stage Productions (4 Plays)'}</a></li>
            <li><a href="/${lang}/events/">${isHi ? 'जशरंग राष्ट्रीय नाट्य समारोह' : 'Jashrang Theatre Festival'}</a></li>
            <li><a href="/${lang}/events/">${isHi ? 'जसपुर कविता उत्सव' : 'Jaspur Kavita Utsav'}</a></li>
            <li><a href="/${lang}/whats-on/">${isHi ? 'आगामी कार्यक्रम (What\'s On)' : 'What\'s On Calendar'}</a></li>
          </ul>
        </div>

        <!-- Col 3: Education & Journal -->
        <div class="footer-col">
          <h4>${isHi ? 'शिक्षा व पत्रिका' : 'Learning & Journal'}</h4>
          <ul>
            <li><a href="/${lang}/training-workshops/">${isHi ? 'उल्लास समर कैम्प 2027' : 'Ullas Summer Camp 2027'}</a></li>
            <li><a href="/${lang}/magazine/">${isHi ? 'मासिक सांस्कृतिक पत्रिका' : 'Monthly Cultural Journal'}</a></li>
            <li><a href="/${lang}/events/">${isHi ? 'वार्षिक महोत्सव अभिलेखागार' : 'Festival Archives'}</a></li>
            <li><a href="/${lang}/contact/?subject=Tour-Booking">${isHi ? 'मंचन आमंत्रण व सभागार बुकिंग' : 'Invite a Play / Book Venue'}</a></li>
          </ul>
        </div>

        <!-- Col 4: Institutional & Connect -->
        <div class="footer-col">
          <h4>${isHi ? 'संस्था व संपर्क' : 'Institution & Connect'}</h4>
          <ul>
            <li><a href="/${lang}/about/">${isHi ? 'संस्था परिचय व कोर टीम' : 'About Our Heritage & Team'}</a></li>
            <li><a href="/${lang}/press/">${isHi ? 'प्रेस एवं मीडिया किट' : 'Press & Media Kit'}</a></li>
            <li><a href="/${lang}/support/">${isHi ? 'संस्थागत साझीदार व सहयोग' : 'Support & Partnerships'}</a></li>
            <li><a href="/${lang}/contact/">${isHi ? 'विभागीय संपर्क' : 'Contact & Queries'}</a></li>
          </ul>
        </div>

      </div>

      <!-- Bottom Bar (Clean single copyright line with no extra text) -->
      <div class="footer-bottom">
        <div>© 2026 Chhattisgadhiya Cloud (chhattisgadhiyacloud.org). All rights reserved.</div>
      </div>
    </div>
  </footer>

  <!-- Floating Back to Top Button -->
  <button class="back-to-top-btn" id="back-to-top" aria-label="Back to top">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
    </svg>
  </button>

  <!-- Floating PWA Mobile Install Banner (Native App feel) -->
  <aside class="pwa-floating-snack" id="pwa-floating-snack" style="display:none;" aria-label="Install App">
    <div class="pwa-snack-info">
      <span class="pwa-snack-icon">📱</span>
      <div>
        <div class="pwa-snack-title">${isHi ? 'ऐप इंस्टॉल करें' : 'Install CG Cloud App'}</div>
        <div class="pwa-snack-sub">${isHi ? 'तेज़, ऑफ़लाइन पत्रिका वाचन' : 'Fast & Works Offline'}</div>
      </div>
    </div>
    <div class="pwa-snack-actions">
      <button type="button" class="pwa-snack-btn" id="pwa-snack-install-btn">${isHi ? 'इंस्टॉल' : 'Install'}</button>
      <button type="button" class="pwa-snack-close" id="pwa-snack-close-btn" aria-label="Close">✕</button>
    </div>
  </aside>

  <!-- Interactive Search & Mobile Drawer Global Script -->
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      // Mobile Drawer Toggle
      const mobileToggle = document.getElementById('mobile-toggle');
      const drawer = document.getElementById('mobile-drawer');
      const overlay = document.getElementById('drawer-overlay');
      const drawerClose = document.getElementById('drawer-close');

      const bottomMenuToggle = document.getElementById('bottom-menu-toggle');

      function openDrawer() {
        if (drawer && overlay) {
          drawer.classList.add('active');
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      }

      function closeDrawer() {
        if (drawer && overlay) {
          drawer.classList.remove('active');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }

      if (mobileToggle) mobileToggle.addEventListener('click', openDrawer);
      if (bottomMenuToggle) bottomMenuToggle.addEventListener('click', openDrawer);
      if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
      if (overlay) overlay.addEventListener('click', closeDrawer);

      // Close drawer when pressing Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && drawer && drawer.classList.contains('active')) {
          closeDrawer();
        }
      });

      // PWA installation support
      let deferredPrompt = null;
      const installCard = document.getElementById('pwa-install-card');
      const installBtn = document.getElementById('pwa-install-btn');
      const pwaSnack = document.getElementById('pwa-floating-snack');
      const snackInstallBtn = document.getElementById('pwa-snack-install-btn');
      const snackCloseBtn = document.getElementById('pwa-snack-close-btn');

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
      if (isStandalone && installCard) {
        const title = installCard.querySelector('.app-install-title');
        const sub = installCard.querySelector('.app-install-sub');
        if (title) title.innerText = '${isHi ? "ऐप इंस्टॉल है ✓" : "App Installed ✓"}';
        if (sub) sub.innerText = '${isHi ? "ऑफ़लाइन मोड सक्रिय" : "Offline Mode Active"}';
        if (installBtn) installBtn.style.display = 'none';
      }

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installCard) installCard.style.display = 'flex';
        
        // Show floating prompt on mobile if not previously dismissed in this session
        if (!isStandalone && !sessionStorage.getItem('cgcloud_pwa_dismissed') && window.innerWidth <= 768) {
          if (pwaSnack) pwaSnack.style.display = 'flex';
        }
      });

      async function triggerPwaInstall() {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          deferredPrompt = null;
          if (installCard) installCard.style.display = 'none';
          if (pwaSnack) pwaSnack.style.display = 'none';
        } else {
          // iOS or fallback instructions
          const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
          if (isIOS) {
            alert(${isHi ? JSON.stringify("आईफोन/आईपैड पर इंस्टॉल करने के लिए Safari में नीचे शेयर (Share) बटन दबाएं और Add to Home Screen चुनें।") : JSON.stringify("To install on iOS Safari: Tap the Share button below and choose Add to Home Screen.")});
          } else {
            alert(${isHi ? JSON.stringify("ऐप इंस्टॉल करने के लिए ब्राउज़र मेनू में Add to Home Screen या Install App चुनें।") : JSON.stringify("To install this app on your device, tap browser menu and choose Add to Home Screen or Install App.")});
          }
        }
      }

      if (installBtn) installBtn.addEventListener('click', triggerPwaInstall);
      if (snackInstallBtn) snackInstallBtn.addEventListener('click', triggerPwaInstall);
      if (snackCloseBtn) {
        snackCloseBtn.addEventListener('click', () => {
          if (pwaSnack) pwaSnack.style.display = 'none';
          sessionStorage.setItem('cgcloud_pwa_dismissed', 'true');
        });
      }

      window.addEventListener('appinstalled', () => {
        if (pwaSnack) pwaSnack.style.display = 'none';
        if (installCard) {
          const title = installCard.querySelector('.app-install-title');
          if (title) title.innerText = '${isHi ? "ऐप इंस्टॉल हो गया ✓" : "App Installed ✓"}';
          if (installBtn) installBtn.style.display = 'none';
        }
      });

      // Back to Top Button
      const btt = document.getElementById('back-to-top');
      window.addEventListener('scroll', () => {
        if (btt) {
          if (window.scrollY > 400) {
            btt.classList.add('visible');
          } else {
            btt.classList.remove('visible');
          }
        }
      });

      if (btt) {
        btt.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }
    });
  </script>
  `;
}

function renderHtmlDocument({ lang, title, desc, canonicalUrl, altUrl, contentHtml, crumbs, extraScripts = '' }) {
  const isHi = lang === 'hi';
  const altLang = isHi ? 'en' : 'hi';
  const root = canonicalUrl === '/' ? './' : canonicalUrl.split('/').filter(Boolean).map(() => '..').join('/') + '/';

  const rawHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${title} | Chhattisgadhiya Cloud</title>
  <meta name="description" content="${desc}">
  
  <!-- Web App Capabilities & Mobile PWA Manifest -->
  <meta name="theme-color" content="#FF4500">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="CG Cloud">
  <meta name="application-name" content="Chhattisgadhiya Cloud">
  <meta name="format-detection" content="telephone=no">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="/src/assets/icons/icon-192.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">

  <!-- Service Worker Registration for PWA & Offline Support -->
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('${root}sw.js', { scope: '${root}' })
          .then(reg => console.log('[PWA] ServiceWorker registered with scope:', reg.scope))
          .catch(err => console.warn('[PWA] ServiceWorker registration failed:', err));
      });
    }
  </script>

  <link rel="canonical" href="https://chhattisgadhiyacloud.org${canonicalUrl}">
  <link rel="alternate" hreflang="${lang}" href="https://chhattisgadhiyacloud.org${canonicalUrl}">
  <link rel="alternate" hreflang="${altLang}" href="https://chhattisgadhiyacloud.org${altUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Rozha+One&family=Yatra+One&display=swap">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Rozha+One&family=Yatra+One&display=swap" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Rozha+One&family=Yatra+One&display=swap"></noscript>
  <link rel="stylesheet" href="/src/styles.min.css?v=15">
  ${(canonicalUrl === '/en/' || canonicalUrl === '/hi/') ? '<link rel="preload" as="image" href="/src/assets/images/hero-art.svg" fetchpriority="high">' : ''}
</head>
<body>
  ${renderHeader(lang, canonicalUrl, title, altUrl)}
  ${renderBreadcrumb(crumbs)}
  <main>
    ${contentHtml}
  </main>
  ${renderFooter(lang)}
  ${extraScripts}
</body>
</html>`;

  // Make all root-relative assets and internal links relative to the root for GitHub Pages and PWA compatibility
  return rawHtml.replace(/(href|src|action)="\/(en|hi|src|favicon|manifest|apple-touch-icon|sw\.js)/g, `$1="${root}$2`);
}

// Generate all pages
['en', 'hi'].forEach(lang => {
  const isHi = lang === 'hi';
  const altLang = isHi ? 'en' : 'hi';

  // 1. HOME PAGE
  {
    const canonical = `/${lang}/`;
    const alt = `/${altLang}/`;

    const productionCardsPreview = siteData.productions.map(prod => renderProductionCard(prod, lang)).join('\n');

    const hp = siteData.homepage || {};
    const hero = hp.hero || {};
    const eyebrowText = (hero.eyebrow && hero.eyebrow[lang]) || (isHi ? 'रंगमंच • राष्ट्रीय समारोह • बाल कार्यशालाएं • वैचारिक पत्रिका' : 'Theatre • Festivals • Workshops • Publications');
    const rebusWord1 = (hero.rebusWord1 && hero.rebusWord1[lang]) || (isHi ? 'थिंक' : 'Think');
    const rebusMark = (hero.rebusMark && hero.rebusMark[lang]) || (isHi ? 'कला' : 'Art');
    const rebusWord2 = (hero.rebusWord2 && hero.rebusWord2[lang]) || (isHi ? 'थिंक छत्तीसगढ़िया क्लाउड' : 'Think Chhattisgadhiya Cloud');
    const statement = (hero.statement && hero.statement[lang]) || (isHi ? 'छत्तीसगढ़िया क्लाउड — रंगमंच, राष्ट्रीय समारोहों, बाल कार्यशालाओं और वैचारिक पत्रिकाओं का सृजन करने वाला एक सांस्कृतिक संस्थान, जो माटी की जीवंत धरोहर को प्रतिष्ठित मंचों तक पहुँचाता है।' : 'A Chhattisgarhi art and culture organisation producing theatre, festivals, workshops and publications — bringing the living spirit of our soil to national and global stages.');
    const heroAriaLabel = isHi ? `${rebusWord1} ${rebusMark} ${rebusWord2}` : `${rebusWord1} ${rebusMark} ${rebusWord2}`;

    const primaryCtaText = (hero.primaryCta && hero.primaryCta.text && hero.primaryCta.text[lang]) || (isHi ? 'आगामी कार्यक्रम देखें' : "View What's On");
    const primaryCtaLink = (hero.primaryCta && hero.primaryCta.link) ? (hero.primaryCta.link.startsWith('/') ? `/${lang}${hero.primaryCta.link.replace(/^\/(en|hi)\//, '/')}` : hero.primaryCta.link) : `/${lang}/whats-on/`;

    const secondaryCtaText = (hero.secondaryCta && hero.secondaryCta.text && hero.secondaryCta.text[lang]) || (isHi ? 'मासिक पत्रिका पढ़ें' : 'Read Magazine');
    const secondaryCtaLink = (hero.secondaryCta && hero.secondaryCta.link) ? (hero.secondaryCta.link.startsWith('/') ? `/${lang}${hero.secondaryCta.link.replace(/^\/(en|hi)\//, '/')}` : hero.secondaryCta.link) : `/${lang}/magazine/`;

    const badgeTopTitle = (hero.badgeTop && hero.badgeTop.title && hero.badgeTop.title[lang]) || (isHi ? '४ मौलिक नाटक' : '4 Original Plays');
    const badgeTopSub = (hero.badgeTop && hero.badgeTop.sub && hero.badgeTop.sub[lang]) || (isHi ? 'राष्ट्रीय नाट्य मंचन' : 'National Touring Repertoire');
    const badgeTopIcon = (hero.badgeTop && hero.badgeTop.icon) || '🎭';

    const badgeBottomTitle = (hero.badgeBottom && hero.badgeBottom.title && hero.badgeBottom.title[lang]) || (isHi ? 'जशरंग एवं कविता उत्सव' : 'Jashrang & Kavita Utsav');
    const badgeBottomSub = (hero.badgeBottom && hero.badgeBottom.sub && hero.badgeBottom.sub[lang]) || (isHi ? 'प्रतिष्ठित राष्ट्रीय समारोह' : 'Signature Annual Festivals');
    const badgeBottomIcon = (hero.badgeBottom && hero.badgeBottom.icon) || '🎪';

    const heroBannerArt = hero.bannerImage || '/src/assets/images/hero-art.svg';

    // Tile SVG Icon Helper
    const tileSvgIcons = {
      theatre: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-3 7.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/></svg>',
      fest: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6.1 4.5 2.3 7.3-6.2-4.6-6.2 4.6 2.3-7.3-6.1-4.5h7.6z"/></svg>',
      camp: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>',
      mag: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm-1 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/></svg>'
    };

    // Render 4 Featured Tiles dynamically
    const featuredTilesList = hp.featuredTiles || [
      { id: 'theatre', theme: 'theatre', tag: { en: '4 Original Plays', hi: '४ मौलिक नाटक' }, title: { en: 'Stage Productions', hi: 'नाट्य प्रस्तुतियां' }, desc: { en: 'Four launch plays blending folk dramaturgy with contemporary narratives.', hi: 'लोक नाट्य शिल्प और समकालीन रंगमंच के संगम से तैयार चार मौलिक नाटक।' }, linkText: { en: 'Explore Plays', hi: 'नाटक देखें' }, href: '/productions/' },
      { id: 'fest', theme: 'fest', tag: { en: 'Signature Festivals', hi: 'वार्षिक समारोह' }, title: { en: 'National Festivals', hi: 'राष्ट्रीय समारोह' }, desc: { en: 'Jashrang National Theatre Festival & Jaspur Kavita Utsav annual archives.', hi: 'जशरंग राष्ट्रीय नाट्य महोत्सव एवं जसपुर कविता उत्सव के वार्षिक अभिलेखागार।' }, linkText: { en: 'View Editions', hi: 'संस्करण देखें' }, href: '/events/' },
      { id: 'camp', theme: 'camp', tag: { en: 'Youth Residency', hi: 'बाल रंगमंच' }, title: { en: 'Ullas Summer Camp', hi: 'उल्लास समर कैम्प' }, desc: { en: 'Youth theatre training, puppet craft, and forward registration enquiries.', hi: 'बाल रंगमंच प्रशिक्षण, कठपुतली निर्माण और आगामी सत्र पंजीकरण पूछताछ।' }, linkText: { en: 'Join Workshops', hi: 'शिविर में जुड़ें' }, href: '/training-workshops/' },
      { id: 'mag', theme: 'mag', tag: { en: 'Issue 14 Live', hi: 'अंक १४ उपलब्ध' }, title: { en: 'Monthly Magazine', hi: 'मासिक पत्रिका' }, desc: { en: 'Web-readable critical essays with our in-browser hybrid reader & PDF tool.', hi: 'वेब पठनीय सांस्कृतिक आलेख, इन-ब्राउज़र हाइब्रिड पाठक और PDF टूल।' }, linkText: { en: 'Read Issue', hi: 'अंक पढ़ें' }, href: '/magazine/' }
    ];

    const renderedFeaturedTiles = featuredTilesList.map(tile => {
      const tileHref = tile.href.startsWith('/') ? `/${lang}${tile.href.replace(/^\/(en|hi)\//, '/')}` : tile.href;
      const tileTag = (tile.tag && tile.tag[lang]) || '';
      const tileTitle = (tile.title && tile.title[lang]) || '';
      const tileDesc = (tile.desc && tile.desc[lang]) || '';
      const tileLinkText = (tile.linkText && tile.linkText[lang]) || (isHi ? 'देखें' : 'Explore');
      const iconSvg = tileSvgIcons[tile.theme] || tileSvgIcons.theatre;

      return `
          <a href="${tileHref}" class="featured-tile tile-theme-${tile.theme}">
            <div class="tile-header">
              <div class="tile-badge-icon">
                ${iconSvg}
              </div>
              <span class="tile-tag">${tileTag}</span>
            </div>
            <h2 class="tile-title">${tileTitle}</h2>
            <p class="tile-desc">${tileDesc}</p>
            <div class="tile-footer">
              <span class="tile-link">${tileLinkText} <span class="arrow-glyph" aria-hidden="true">→</span></span>
            </div>
          </a>`;
    }).join('\n');

    // Impact Stats Strip
    const impactStatsList = hp.impactStats || [
      { number: '4', label: { en: 'Original Repertoire Plays', hi: 'मौलिक राष्ट्रीय नाटक' }, sub: { en: 'Touring across national venues', hi: 'विभिन्न राष्ट्रीय मंचों पर प्रस्तुत' } },
      { number: '14', label: { en: 'Magazine Issues', hi: 'मासिक पत्रिका अंक' }, sub: { en: 'Critical essays & research', hi: 'सांस्कृतिक विमर्श व आलेख' } },
      { number: '12,000+', label: { en: 'Festival Spectators', hi: 'समारोह दर्शक' }, sub: { en: 'Across Jashrang & Kavita Utsav', hi: 'जशरंग एवं कविता उत्सव' } },
      { number: '500+', label: { en: 'Youth Artists Mentored', hi: 'प्रशिक्षित बाल कलाकार' }, sub: { en: 'Through Ullas Camp residencies', hi: 'उल्लास समर कैम्प एवं कार्यशालाएं' } }
    ];

    const renderedImpactStats = impactStatsList.map(stat => `
          <div class="impact-stat-item">
            <div class="impact-stat-number">${stat.number}</div>
            <div class="impact-stat-label">${(stat.label && stat.label[lang]) || ''}</div>
            <div class="impact-stat-sub">${(stat.sub && stat.sub[lang]) || ''}</div>
          </div>`).join('\n');

    // Cultural Traditions Triad
    const traditionsList = hp.traditions || [
      { icon: '🎭', title: { en: 'Nacha & Gammat', hi: 'नाचा एवं गम्मत' }, subtitle: { en: 'Folk Farce & Social Satire', hi: 'लोक प्रहसन एवं सामाजिक व्यंग्य' }, desc: { en: 'The improvisational circular folk theatre of Central India, using incisive comedy, colloquial dialect, and rhythmic song duels to challenge orthodoxy.', hi: 'छत्तीसगढ़ का पारंपरिक खुला लोकनाट्य, जहाँ तीखा सामाजिक हास्य, तात्कालिक संवाद और ढोलक की थाप जनसामान्य के सरोकारों को मंच पर स्थापित करती है।' } },
      { icon: '🥁', title: { en: 'Panthi & Karma Dance', hi: 'पंथी एवं करमा नृत्य' }, subtitle: { en: 'Rhythmic Velocity & Physical Theatre', hi: 'मांदर की थाप व शारीरिक वेग' }, desc: { en: 'High-energy kinetic choreography fueled by the Mandar drum, building pyramids of human agility and grounding physical acting in tribal consciousness.', hi: 'सतनामी परंपरा का आध्यात्मिक पंथी नृत्य और जनजातीय करमा नृत्य हमारे कलाकारों के शारीरिक रंगमंच, श्वास संतुलन और सामूहिक ऊर्जा की नींव हैं।' } },
      { icon: '🏺', title: { en: 'Dhokra & Mural Scenography', hi: 'ढोकरा एवं भित्ति शिल्प' }, subtitle: { en: 'Earth Pigments & Scenographic Craft', hi: 'माटी के रंग व धातु-शिल्प मंच' }, desc: { en: 'Lost-wax bell metal casting, bamboo minimalism, and natural ochre wall murals define our visual set designs and organic costume textures.', hi: 'बस्तर का लॉस्ट-वैक्स धातु शिल्प और जशपुर की पारंपरिक भित्ति चित्रकला हमारे नाटकों के मंच-सज्जा, प्रकाश और वेशभूषा को जैविक सौंदर्य प्रदान करती है।' } }
    ];

    const renderedTraditions = traditionsList.map(trad => {
      const bannerImg = trad.image ? `<div style="height:120px; border-radius:var(--radius-sm); overflow:hidden; margin-bottom:1rem;"><img src="${trad.image}" alt="${(trad.title && trad.title[lang]) || ''}" style="width:100%; height:100%; object-fit:cover; display:block;"></div>` : '';
      return `
          <div class="tradition-card">
            ${bannerImg}
            <div class="tradition-icon-badge">${trad.icon || '🎭'}</div>
            <h3 class="tradition-title">${(trad.title && trad.title[lang]) || ''}</h3>
            <div class="tradition-subtitle">${(trad.subtitle && trad.subtitle[lang]) || ''}</div>
            <p class="tradition-desc">
              ${(trad.desc && trad.desc[lang]) || ''}
            </p>
          </div>`;
    }).join('\n');

    // Critics Praise
    const criticsList = hp.criticsPraise || [
      { quote: 'A masterclass in organic folk staging. The Mandar beats breathe raw life into the narrative, bridging European expressionism with Indian folk earthiness.', publication: 'Natya Varta', tag: 'Review of Vincent' },
      { quote: 'Uproarious laughter with razor-sharp social conscience. Nacha at its triumphant peak — bringing the rural migrant reality to national consciousness.', publication: 'Rang Manch Samiksha', tag: 'Review of Gabar Ghichor' },
      { quote: 'Chhattisgadhiya Cloud proves that the most powerful contemporary Indian theatre is rooted directly in tribal soil, not urban imitation.', publication: 'The Cultural Chronicle', tag: 'Festival Editorial' }
    ];

    const renderedCritics = criticsList.map(critic => `
          <div class="critic-card">
            <div class="critic-quote-mark">“</div>
            <p class="critic-quote-text">
              “${critic.quote}”
            </p>
            <div class="critic-source">
              <span class="critic-publication">${critic.publication}</span>
              <span class="critic-tag">${critic.tag}</span>
            </div>
          </div>`).join('\n');

    // Visual Highlight Band
    const vh = hp.visualHighlight || {};
    const vhTitle = (vh.title && vh.title[lang]) || (isHi ? 'मध्य भारत का जीवंत रंगमंच' : 'Living Theatre from Central India');
    const vhDesc = (vh.desc && vh.desc[lang]) || (isHi ? 'ग्रामीण चौपालों से लेकर राष्ट्रीय नाट्य मंचों तक, हमारा दल मांदर की थाप, नाचा के तीखे हास्य और संवेदनशील लोकगाथाओं को निरंतर प्रस्तुत कर रहा है।' : 'From rural village squares to prestigious national auditoriums, our ensemble brings the Mandar rhythm, vibrant Nacha satire, and poetic folk drama to life.');
    const vhBtnText = (vh.btnText && vh.btnText[lang]) || (isHi ? 'हमारा सांस्कृतिक सफर' : 'Our Cultural Story');
    const vhBtnHref = vh.btnHref ? (vh.btnHref.startsWith('/') ? `/${lang}${vh.btnHref.replace(/^\/(en|hi)\//, '/')}` : vh.btnHref) : `/${lang}/about/`;

    const content = `
    <!-- Hero with Rebus Tagline & Two-Column Grid (Section 1.3 & 3.1) -->
    <section class="hero-section">
      <div class="container">
        <div class="hero-grid">
          <div class="hero-content">
            <!-- Hero Eyebrow Tagline -->
            <div class="hero-eyebrow-unified">
              <span class="hero-eyebrow-text">✦ ${eyebrowText} ✦</span>
            </div>

            <h1 class="hero-rebus" aria-label="${heroAriaLabel}">
              <span class="hero-line hero-line-1">
                <span class="rebus-word">${rebusWord1}</span>
                <span class="rebus-art-mark" aria-label="${rebusMark}">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                  <span>${rebusMark}</span>
                </span>
              </span>
              <span class="hero-line hero-line-2">
                <span class="rebus-word">${rebusWord2}</span>
              </span>
            </h1>

            <p class="hero-statement">
              ${statement}
            </p>

            <div class="hero-cta-group">
              <a href="${primaryCtaLink}" class="btn-primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>
                <span>${primaryCtaText}</span>
              </a>
              <a href="${secondaryCtaLink}" class="btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/></svg>
                <span>${secondaryCtaText}</span>
              </a>
            </div>
          </div>

          <!-- Hero Right Column: Large Circular Theatrical Visual Showcase -->
          <div class="hero-stage-container">
            <div class="hero-visual-stage">
              <!-- Animated Cultural Orbit Rings -->
              <div class="hero-orbit-ring" aria-hidden="true"></div>
              <div class="hero-orbit-ring-secondary" aria-hidden="true"></div>

              <!-- Main Circular Stage Frame -->
              <div class="hero-circular-frame">
                <img src="${heroBannerArt}" alt="Chhattisgarhi Cultural & Folk Theatre Art" class="hero-circular-img" width="560" height="560" loading="eager" fetchpriority="high" decoding="async">
              </div>

              <!-- Floating Modern Feature Badges -->
              <div class="hero-badge hero-badge-top" aria-hidden="true">
                <span class="badge-icon">${badgeTopIcon}</span>
                <div class="badge-text">
                  <strong>${badgeTopTitle}</strong>
                  <span>${badgeTopSub}</span>
                </div>
              </div>

              <div class="hero-badge hero-badge-bottom" aria-hidden="true">
                <span class="badge-icon">${badgeBottomIcon}</span>
                <div class="badge-text">
                  <strong>${badgeBottomTitle}</strong>
                  <span>${badgeBottomSub}</span>
                </div>
              </div>
            </div>

            <!-- Mobile Inline Quick Chips (Visible only on mobile screens) -->
            <div class="hero-mobile-badges" aria-hidden="true">
              <span class="hero-mobile-chip">${badgeTopIcon} ${badgeTopTitle}</span>
              <span class="hero-mobile-chip">${badgeBottomIcon} ${badgeBottomTitle}</span>
            </div>
          </div>
        </div>

        <!-- Featured Section Cards (Section 3.1) -->
        <div class="featured-tiles-grid">
          ${renderedFeaturedTiles}
        </div>
      </div>
    </section>

    <!-- Impact Statistics Counter Strip -->
    <section class="impact-stats-section">
      <div class="container">
        <div class="impact-stats-grid">
          ${renderedImpactStats}
        </div>
      </div>
    </section>

    <!-- What's On Condensed Strip (Section 3.1 & 3.2) -->
    <section class="content-section" style="border-bottom: 1px solid var(--g-border-subtle); background: #FFFFFF;">
      <div class="container">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2.5rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <span class="page-eyebrow">✦ ${isHi ? 'आगामी सत्र' : 'Forward-Looking Calendar'} ✦</span>
            <h2 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary);">${isHi ? 'आगामी कार्यक्रम' : "What's On at Launch"}</h2>
          </div>
          <a href="/${lang}/whats-on/" style="color:var(--c-primary); font-weight:700; display:inline-flex; align-items:center; gap:0.35rem;">
            ${isHi ? 'पूर्ण कैलेंडर व समय-सारिणी →' : 'Full Calendar & Deadlines →'}
          </a>
        </div>

        <div class="whats-on-empty-box">
          <div class="empty-icon-circle">🎭</div>
          <h3>${isHi ? 'हमारा आगामी रंग-सत्र जल्द घोषित होगा' : 'The Next Programme Will Be Announced Soon'}</h3>
          <p>
            ${isHi ? 'लॉन्च के समय कोई सार्वजनिक कार्यक्रम निर्धारित नहीं है क्योंकि हमारे नाट्य दल नए दौरे और समारोहों की तैयारी कर रहे हैं। अग्रिम आरक्षण सूचना हेतु न्यूज़लेटर से जुड़ें।' : 'No public events are scheduled for this launch date as our theatre troupes and festival committees prepare the upcoming season. Sign up for our newsletter to receive advance ticket reservations.'}
          </p>
          <div style="display:flex; justify-content:center; gap:1rem; flex-wrap:wrap;">
            <a href="#newsletter" class="btn-primary">${isHi ? 'सूचना प्राप्त करें' : 'Get Notified'}</a>
            <a href="/${lang}/productions/" class="btn-secondary">${isHi ? 'प्रस्तुतियां देखें' : 'Explore Productions'}</a>
          </div>
        </div>
      </div>
    </section>

    <!-- Body of Work Highlight: 4 Launch Plays with Artwork (Section 3.1) -->
    <section class="content-section" style="background: var(--g-surface-subtle); border-bottom: 1px solid var(--g-border-subtle);">
      <div class="container">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:2.5rem; flex-wrap:wrap; gap:1rem;">
          <div>
            <span class="page-eyebrow">✦ Original Repertoire ✦</span>
            <h2 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary);">${isHi ? 'मौलिक नाट्य प्रस्तुतियां' : 'Featured Stage Productions'}</h2>
            <p style="color:var(--g-text-secondary); max-width:640px; margin-top:0.4rem;">${isHi ? 'छत्तीसगढ़िया क्लाउड द्वारा निर्मित मौलिक नाटक — जो नाट्य महोत्सवों के आमंत्रण एवं भ्रमणशील मंचनों हेतु उपलब्ध हैं।' : 'Available for festival curation, institutional showcases, and touring venue bookings.'}</p>
          </div>
          <a href="/${lang}/productions/" class="btn-secondary">${isHi ? 'सभी नाटक देखें →' : 'View All Productions →'}</a>
        </div>

        <div class="card-grid">
          ${productionCardsPreview}
        </div>
      </div>
    </section>

    <!-- Cultural Heritage Triad: Nacha, Panthi, Dhokra -->
    <section class="traditions-section">
      <div class="container">
        <div style="text-align:center; max-width:760px; margin:0 auto 3.5rem;">
          <span class="page-eyebrow">✦ Living Heritage & Aesthetic Roots ✦</span>
          <h2 style="font-family:var(--font-serif); font-size:2.4rem; color:var(--g-text-primary); margin-bottom:0.75rem;">
            ${isHi ? 'माटी के तीन सांस्कृतिक आधारस्तंभ' : 'Three Pillars of Our Theatrical Language'}
          </h2>
          <div class="artistic-motif-sep" aria-hidden="true">
            <span class="motif-line"></span>
            <span class="motif-symbol">❖</span>
            <span class="motif-line"></span>
          </div>
          <p style="color:var(--g-text-secondary); font-size:1.05rem; line-height:1.7;">
            ${isHi ? 'हमारा रंगमंच केवल संवाद अदायगी नहीं, बल्कि सदियों पुरानी लोक परंपराओं, शारीरिक वेग और शिल्पकला का समकालीन रूपांतरण है।' : 'Our dramaturgy draws vital energy from Chhattisgarh\'s centuries-old folk satires, kinetic devotional dances, and earthcraft.'}
          </p>
        </div>

        <div class="traditions-grid">
          ${renderedTraditions}
        </div>
      </div>
    </section>

    <!-- National Critical Acclaim & Press Praise -->
    <section class="critics-section">
      <div class="container">
        <div style="text-align:center; max-width:700px; margin:0 auto 3rem;">
          <span class="page-eyebrow">✦ Critical Acclaim ✦</span>
          <h2 style="font-family:var(--font-serif); font-size:2.3rem; color:var(--g-text-primary); margin-bottom:0.5rem;">
            ${isHi ? 'समीक्षकों एवं राष्ट्रीय मंचों की दृष्टि में' : 'What Critics & National Festivals Say'}
          </h2>
          <p style="color:var(--g-text-secondary); font-size:1.05rem;">
            ${isHi ? 'देशभर के प्रमुख कला समीक्षकों और रंग-निर्देशकों द्वारा हमारे कार्यों की सराहना।' : 'Reflections on our repertoire from leading cultural reviews across India.'}
          </p>
        </div>

        <div class="critics-grid">
          ${renderedCritics}
        </div>
      </div>
    </section>

    <!-- Visual Highlight Band (Section 3.1) -->
    <div class="container">
      <div class="visual-highlight-band" ${vh.image ? `style="background-image:linear-gradient(rgba(0,0,0,0.68), rgba(0,0,0,0.68)), url('${vh.image}'); background-size:cover; background-position:center; color:#ffffff;"` : ''}>
        <div class="highlight-content">
          <h3>${vhTitle}</h3>
          <p>
            ${vhDesc}
          </p>
        </div>
        <a href="${vhBtnHref}" class="btn-primary">${vhBtnText}</a>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'होम' : 'Home',
      desc: 'Think Art Think Chhattisgadhiya Cloud - Official Website of Chhattisgadhiya Cloud',
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: []
    });
    fs.writeFileSync(path.join(__dirname, lang, 'index.html'), doc);
  }

  // 2. WHAT'S ON
  {
    const canonical = `/${lang}/whats-on/`;
    const alt = `/${altLang}/whats-on/`;
    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ Attend • Enrol • Subscribe ✦</span>
        <h1 class="page-title">${isHi ? 'आगामी कार्यक्रम' : "What's On"}</h1>
        <p class="page-description">
          ${isHi ? 'एक ऐसा स्थान जहाँ आगामी नाटकों, अगले महोत्सव संस्करण, खुली कार्यशालाओं और पंजीकरण की अंतिम तिथियों की पूरी सूची उपलब्ध है।' : 'A single destination listing upcoming performances, the next festival edition, open workshop batches, and registration deadlines.'}
        </p>
      </div>
    </div>

    <div class="container" style="padding-bottom: 5rem;">
      <div class="whats-on-empty-box">
        <div class="empty-icon-circle">🗓️</div>
        <h3>${isHi ? 'आगामी रंग-सत्र की तैयारियां जारी' : 'Season Repertoire in Preparation'}</h3>
        <p>
          ${isHi ? 'वर्तमान में कोई सार्वजनिक कार्यक्रम निर्धारित नहीं है। गबरघिचोर के आगामी दौरे की तिथियां, जशरंग 2026 समारोह का कार्यक्रम और उल्लास 2027 के शिविर का विवरण तिथिवार यहाँ प्रकाशित किया जाएगा।' : 'No public events are currently active for bookings. Our upcoming tour dates for Gabar Ghichor, the Jashrang 2026 festival schedule, and Ullas 2027 summer registrations will appear here chronologically once finalized.'}
        </p>
        <div style="display:flex; justify-content:center; gap:1.2rem; flex-wrap:wrap;">
          <a href="#newsletter" class="btn-primary">${isHi ? 'घोषणाओं हेतु सदस्यता लें' : 'Subscribe for Announcements'}</a>
          <a href="/${lang}/productions/" class="btn-secondary">${isHi ? 'नाट्य प्रस्तुतियां देखें' : 'Browse Past Productions'}</a>
          <a href="/${lang}/events/" class="btn-secondary">${isHi ? 'महोत्सव अभिलेखागार' : 'Browse Festival Archive'}</a>
        </div>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'आगामी कार्यक्रम' : "What's On",
      desc: "Upcoming performances, festival editions, and open workshop batches for Chhattisgadhiya Cloud",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'आगामी कार्यक्रम' : "What's On", href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'whats-on', 'index.html'), doc);
  }

  // 3. PRODUCTIONS
  {
    const canonical = `/${lang}/productions/`;
    const alt = `/${altLang}/productions/`;

    const cardsHtml = siteData.productions.map(prod => renderProductionCard(prod, lang)).join('\n');

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ ${isHi ? 'मौलिक नाट्य प्रस्तुतियां' : 'National Touring Repertoire'} ✦</span>
        <h1 class="page-title">${isHi ? 'नाट्य प्रस्तुतियां' : 'Stage Productions'}</h1>
        <p class="page-description">
          ${isHi ? 'छत्तीसगढ़िया क्लाउड द्वारा निर्मित मौलिक नाटक — जो लोक नाट्य शिल्प (नाचा, गम्मत, पंथी) और समकालीन रंगमंच के संगम से तैयार हैं, एवं राष्ट्रीय महोत्सवों व सभागारों में मंचन हेतु उपलब्ध हैं।' : 'Original stage plays created by Chhattisgadhiya Cloud — blending indigenous Chhattisgarhi folk dramaturgy with contemporary scenography. Available for national festival curation, institutional tours, and auditorium showcases.'}
        </p>

        <!-- Subpage Stats Chips -->
        <div class="subpage-stats-bar">
          <div class="subpage-stat-chip">🎭 <strong>4</strong> ${isHi ? 'मौलिक नाटक' : 'Repertoire Plays'}</div>
          <div class="subpage-stat-chip">🏛️ <strong>120+</strong> ${isHi ? 'मंचन प्रस्तुतियां' : 'Stage Performances'}</div>
          <div class="subpage-stat-chip">🗺️ <strong>8</strong> ${isHi ? 'राष्ट्रीय शहर' : 'Touring Destinations'}</div>
          <div class="subpage-stat-chip">🟢 <strong>${isHi ? 'बुकिंग खुली है' : 'Available for Booking'}</strong></div>
        </div>

        ${siteData.productionsPageBanner ? `
          <div style="border-radius:var(--radius-md); overflow:hidden; margin-top:1.5rem; max-height:260px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <img src="${siteData.productionsPageBanner}" alt="Productions Creative Banner" style="width:100%; height:100%; object-fit:cover; display:block;">
          </div>
        ` : ''}
      </div>
    </div>

    <div class="container" style="padding-bottom: 5rem;">
      <!-- Interactive Filter Chips -->
      <div class="filter-chips-bar">
        <span class="filter-chip active">✦ ${isHi ? 'सभी प्रस्तुतियां (४)' : 'All Repertoire (4)'}</span>
        <span class="filter-chip">🥁 ${isHi ? 'लोक संगीतमय नाटक' : 'Folk Musical Drama'}</span>
        <span class="filter-chip">🎨 ${isHi ? 'दृश्य कला व एकल अभिनय' : 'Art Monologue'}</span>
        <span class="filter-chip">🎭 ${isHi ? 'नाचा लोक व्यंग्य' : 'Nacha Folk Satire'}</span>
        <span class="filter-chip">👑 ${isHi ? 'ऐतिहासिक नाटक' : 'Historical Biopic'}</span>
      </div>

      <div class="card-grid">
        ${cardsHtml}
      </div>

      <!-- Technical Rider & Venue Booking Callout -->
      <div class="production-dossier-banner">
        <div>
          <span style="background:var(--c-primary); color:#FFFFFF; padding:0.3rem 0.8rem; border-radius:var(--radius-pill); font-weight:800; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em;">
            ${isHi ? 'आयोजकों व सभागारों हेतु' : 'For Curators & Venues'}
          </span>
          <h2 style="font-family:var(--font-serif); font-size:2rem; color:var(--g-text-primary); margin-top:0.8rem;">
            ${isHi ? 'अपने शहर या नाट्य महोत्सव में नाटक आमंत्रित करें' : 'Invite Chhattisgadhiya Cloud to Your Stage'}
          </h2>
          <p style="color:var(--g-text-secondary); font-size:1.05rem; margin-top:0.5rem; max-width:640px;">
            ${isHi ? 'हमारे सभी नाटकों के साथ पूर्ण तकनीकी विवरण (लाइट, साउंड, मंच आकार एवं कलाकारों की व्यवस्था) की विस्तृत मार्गदर्शिका उपलब्ध है।' : 'Each production travels with a comprehensive technical rider, lighting plot, sound score, and staging dimensions designed for proscenium and open-air auditoriums.'}
          </p>
        </div>
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <a href="/${lang}/contact/?subject=Festival-Tour-Invitation" class="btn-primary">
            <span>📅</span> <span>${isHi ? 'मंचन प्रस्ताव भेजें' : 'Invite a Production'}</span>
          </a>
          <a href="/${lang}/press/" class="btn-secondary">
            <span>📄</span> <span>${isHi ? 'प्रेस किट व फोटोज' : 'Press Kit & High-Res Stills'}</span>
          </a>
        </div>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'नाट्य प्रस्तुतियां' : 'Stage Productions',
      desc: "Original plays produced by Chhattisgadhiya Cloud including Kahani Vasu Ki, Vincent, Gabar Ghichor, Raja Ravi Verma",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'नाट्य प्रस्तुतियां' : 'Productions', href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'productions', 'index.html'), doc);
  }

  // 4. EVENTS
  {
    const canonical = `/${lang}/events/`;
    const alt = `/${altLang}/events/`;

    const jashrangTiles = siteData.events[0].years.map(y => `
      <div class="year-tile">
        <div class="year-num">${y.year}</div>
        <div class="year-theme">${y.theme[lang]}</div>
        <div class="year-meta">📅 ${y.dates[lang]} • 📍 ${y.venue[lang]}</div>
        <div class="year-desc">${y.highlight[lang]}</div>
        <div style="margin-top:1.2rem; border-top:1px solid var(--g-border-subtle); padding-top:0.75rem; font-size:0.85rem; color:var(--c-primary); font-weight:600;">
          ${isHi ? 'प्रायोजक:' : 'Sponsors:'} ${y.sponsors.join(', ')}
        </div>
      </div>
    `).join('\n');

    const kavitaTiles = siteData.events[1].years.map(y => `
      <div class="year-tile">
        <div class="year-num">${y.year}</div>
        <div class="year-theme">${y.theme[lang]}</div>
        <div class="year-meta">📅 ${y.dates[lang]} • 📍 ${y.venue[lang]}</div>
        <div class="year-desc">${y.highlight[lang]}</div>
        <div style="margin-top:1.2rem; border-top:1px solid var(--g-border-subtle); padding-top:0.75rem; font-size:0.85rem; color:var(--c-primary); font-weight:600;">
          ${isHi ? 'सहयोगी:' : 'Partners:'} ${y.sponsors.join(', ')}
        </div>
      </div>
    `).join('\n');

    const ev1 = siteData.events[0] || {};
    const ev1Banner = ev1.bannerImage || ev1.image || '/src/assets/images/festival-jashrang.svg';
    const ev1Icon = ev1.icon || '🎭';

    const ev2 = siteData.events[1] || {};
    const ev2Banner = ev2.bannerImage || ev2.image || '/src/assets/images/festival-kavita.svg';
    const ev2Icon = ev2.icon || '📜';

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ ${isHi ? 'राष्ट्रीय सांस्कृतिक मंच एवं समागम' : 'Flagship National Cultural Conclaves'} ✦</span>
        <h1 class="page-title">${isHi ? 'महोत्सव एवं समारोह' : 'Festivals & Conclaves'}</h1>
        <p class="page-description">
          ${isHi ? 'छत्तीसगढ़िया क्लाउड द्वारा जशपुर की माटी पर आयोजित प्रतिष्ठित राष्ट्रीय नाट्य समारोह एवं साहित्यिक संगोष्ठियां — जहां देश भर के प्रख्यात निर्देशक, लोक कलाकार और साहित्यकार एकत्र होते हैं।' : 'Premier national theatre festivals and literary conclaves organized annually by Chhattisgadhiya Cloud in Jashpur, Chhattisgarh — uniting national repertory ensembles, indigenous bards, and 12,000+ spectators.'}
        </p>

        <!-- Subpage Stats Chips -->
        <div class="subpage-stats-bar">
          <div class="subpage-stat-chip">🎪 <strong>2</strong> ${isHi ? 'वार्षिक राष्ट्रीय समारोह' : 'Annual Flagship Conclaves'}</div>
          <div class="subpage-stat-chip">👥 <strong>12,000+</strong> ${isHi ? 'वार्षिक दर्शक' : 'Annual Spectators'}</div>
          <div class="subpage-stat-chip">🎭 <strong>28+</strong> ${isHi ? 'आमंत्रित नाट्य दल' : 'Visiting Troupes Hosted'}</div>
          <div class="subpage-stat-chip">📍 <strong>Jashpur Open-Air Stages</strong></div>
        </div>

        ${siteData.eventsPageBanner ? `
          <div style="border-radius:var(--radius-md); overflow:hidden; margin-top:1.5rem; max-height:260px; box-shadow:0 4px 20px rgba(0,0,0,0.08);">
            <img src="${siteData.eventsPageBanner}" alt="Events Creative Banner" style="width:100%; height:100%; object-fit:cover; display:block;">
          </div>
        ` : ''}
      </div>
    </div>

    <div class="container page-content-container">
      
      <!-- FESTIVAL 1: JASHRANG NATIONAL THEATRE FESTIVAL (SPLIT EDITORIAL SPOTLIGHT) -->
      <article class="festival-spotlight-card">
        <div class="festival-spotlight-media">
          <img src="${ev1Banner}" alt="${ev1.name[lang]}">
          <span class="festival-floating-badge">✦ NOV 14–18, 2026</span>
          <div class="festival-floating-venue">
            <span>📍</span> <span>${isHi ? 'जशपुर प्रेक्षागृह एवं खुला रंगमंच' : 'Jashpur Open-Air Auditorium & Tribal Art Centre'}</span>
          </div>
        </div>

        <div class="festival-spotlight-body">
          <span class="festival-spotlight-eyebrow">✦ ${ev1Icon} ${isHi ? 'फ्लैगशिप राष्ट्रीय नाट्य महोत्सव' : 'Flagship National Theatre Conclave'} ✦</span>
          <h2 class="festival-spotlight-title">${ev1.name[lang]}</h2>
          <div class="festival-spotlight-tagline">${ev1.tagline[lang]}</div>
          <p class="festival-spotlight-desc">${ev1.description[lang]}</p>

          <!-- Metrics Row -->
          <div class="festival-metrics-bar">
            <span class="festival-metric-chip">🎭 12 ${isHi ? 'राष्ट्रीय नाटक' : 'National Plays'}</span>
            <span class="festival-metric-chip">🎪 5 ${isHi ? 'दिवसीय आयोजन' : 'Festival Days'}</span>
            <span class="festival-metric-chip">👥 6,500+ ${isHi ? 'दर्शक' : 'Spectators'}</span>
            <span class="festival-metric-chip">🎟️ ${isHi ? 'निःशुल्क सार्वजनिक प्रवेश' : 'Free Public Entry'}</span>
          </div>

          <!-- 5-Day Schedule Accordion / Table -->
          <div class="festival-schedule-box">
            <div class="festival-schedule-title">
              <span>📅</span> <span>${isHi ? '२०२६ संस्करण दैनिक समय सारिणी (Roots & Horizons)' : '2026 Edition Daily Programme (Roots & Horizons)'}</span>
            </div>
            <div class="festival-schedule-list">
              <div class="festival-schedule-item">
                <span class="schedule-day-pill">Day 1</span>
                <div class="schedule-event-info">
                  <strong>Inaugural Ceremony & Karma Folk Circle</strong> • <span>Jashpur Folk Troupe (6:00 PM)</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill">Day 2</span>
                <div class="schedule-event-info">
                  <strong>Gabar Ghichor</strong> • <span>Chhattisgadhiya Cloud Ensemble (7:00 PM)</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill">Day 3</span>
                <div class="schedule-event-info">
                  <strong>Andha Yug (Contemporary Adaptation)</strong> • <span>Bhopal Repertory (6:30 PM)</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill">Day 4</span>
                <div class="schedule-event-info">
                  <strong>Charandas Chor Revival</strong> • <span>Naya Theatre Legacy Ensembles (7:00 PM)</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill">Day 5</span>
                <div class="schedule-event-info">
                  <strong>National Directors Conclave & Valedictory Gala</strong> • <span>All Delegates (5:30 PM)</span>
                </div>
              </div>
            </div>
          </div>

          <div class="festival-spotlight-actions">
            <a href="/${lang}/contact/?subject=Jashrang-Festival-Participation" class="btn-primary">
              <span>🎭</span> <span>${isHi ? 'नाट्य दल सहभागिता आवेदन' : 'Apply as Visiting Troupe'}</span>
            </a>
            <a href="/${lang}/contact/?subject=Jashrang-Free-Passes" class="btn-secondary">
              <span>🎟️</span> <span>${isHi ? 'दर्शक पास आरक्षित करें' : 'Reserve Audience Passes'}</span>
            </a>
          </div>
        </div>
      </article>

      <!-- FESTIVAL 2: JASPUR KAVITA UTSAV (SPLIT EDITORIAL SPOTLIGHT) -->
      <article class="festival-spotlight-card">
        <div class="festival-spotlight-media">
          <img src="${ev2Banner}" alt="${ev2.name[lang]}">
          <span class="festival-floating-badge" style="background:rgba(26,115,232,0.85);">✦ OCT 02–03, 2026</span>
          <div class="festival-floating-venue">
            <span>📍</span> <span>${isHi ? 'अंबेडकर सांस्कृतिक भवन, जशपुर' : 'Ambedkar Sanskritic Bhavan & Garden Stage'}</span>
          </div>
        </div>

        <div class="festival-spotlight-body">
          <span class="festival-spotlight-eyebrow" style="background:var(--c-blue-light); color:var(--c-blue);">
            ✦ ${ev2Icon} ${isHi ? 'साहित्यिक व वाचिक परंपरा समागम' : 'Oral Bardic & Poetry Conclave'} ✦
          </span>
          <h2 class="festival-spotlight-title">${ev2.name[lang]}</h2>
          <div class="festival-spotlight-tagline">${ev2.tagline[lang]}</div>
          <p class="festival-spotlight-desc">${ev2.description[lang]}</p>

          <!-- Metrics Row -->
          <div class="festival-metrics-bar">
            <span class="festival-metric-chip">📜 40+ ${isHi ? 'आमंत्रित कवि' : 'Invited Bards'}</span>
            <span class="festival-metric-chip">🎶 ${isHi ? 'बांसुरी व मांदर जुगलबंदी' : 'Flute & Mandar'}</span>
            <span class="festival-metric-chip">🌿 ${isHi ? 'कुरुख व छत्तीसगढ़ी' : 'Indigenous Dialects'}</span>
            <span class="festival-metric-chip">🎤 ${isHi ? 'युवा खुला मंच' : 'Youth Open Mic'}</span>
          </div>

          <!-- Schedule Box -->
          <div class="festival-schedule-box">
            <div class="festival-schedule-title">
              <span>📜</span> <span>${isHi ? 'दैनिक काव्य सत्र एवं संगोष्ठियां' : 'Daily Symposium & Verse Recital Sessions'}</span>
            </div>
            <div class="festival-schedule-list">
              <div class="festival-schedule-item">
                <span class="schedule-day-pill" style="color:var(--c-blue); border-color:var(--c-blue);">Day 1 • 11 AM</span>
                <div class="schedule-event-info">
                  <strong>Tribal Oral Poetry Symposium</strong> • <span>Elders & Folk Lyricists</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill" style="color:var(--c-blue); border-color:var(--c-blue);">Day 1 • 5 PM</span>
                <div class="schedule-event-info">
                  <strong>Jashpur Sham-e-Shayari & Geeth Sandhya</strong> • <span>Regional Poets</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill" style="color:var(--c-blue); border-color:var(--c-blue);">Day 2 • 10:30 AM</span>
                <div class="schedule-event-info">
                  <strong>Youth Open-Mic & Slam Poetry Round</strong> • <span>Student Delegates</span>
                </div>
              </div>
              <div class="festival-schedule-item">
                <span class="schedule-day-pill" style="color:var(--c-blue); border-color:var(--c-blue);">Day 2 • 4 PM</span>
                <div class="schedule-event-info">
                  <strong>Grand Chhattisgarhi Kavi Sammelan</strong> • <span>National Guests & Balladeers</span>
                </div>
              </div>
            </div>
          </div>

          <div class="festival-spotlight-actions">
            <a href="/${lang}/contact/?subject=Kavita-Utsav-Delegate" class="btn-primary">
              <span>📜</span> <span>${isHi ? 'कवि / वक्ता पंजीकरण' : 'Register as Poet / Delegate'}</span>
            </a>
            <a href="/${lang}/contact/?subject=Kavita-Utsav-Audience" class="btn-secondary">
              <span>🎟️</span> <span>${isHi ? 'श्रोता पास प्राप्त करें' : 'Get Audience Pass'}</span>
            </a>
          </div>
        </div>
      </article>

      <!-- FESTIVAL CHRONICLES & LIVE ATMOSPHERE GALLERY -->
      <section class="festival-gallery-section">
        <span class="page-eyebrow">✦ ${isHi ? 'मंच दृश्य एवं उत्सव का माहौल' : 'Festival Chronicles & Stage Atmosphere'} ✦</span>
        <h3 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary); margin-bottom:0.75rem;">
          ${isHi ? 'जशपुर के खुले मंचों से जीवंत रंग-क्षण' : 'Vibrant Moments from Jashpur Stages'}
        </h3>
        <p style="color:var(--g-text-secondary); font-size:1.02rem; max-width:760px; margin-bottom:2.25rem;">
          ${isHi ? 'खुले आकाश के नीचे राष्ट्रीय नाट्य मंडलियों की प्रस्तुतियां, मशालों की रोशनी में मध्यरात्रि करमा अखाड़ा, और अंतरंग काव्य गोष्ठियां।' : 'Immerse in the sensory warmth of our festival nights — open-air amphitheatre acoustics, midnight bonfire rhythms, and candle-lit verse baithaks.'}
        </p>

        <div class="festival-gallery-grid">
          <!-- Gallery Card 1: Jashrang Stage -->
          <article class="gallery-card">
            <div class="gallery-card-media">
              <img src="/src/assets/images/fest-stage-crowd.svg" alt="${isHi ? 'जशरंग मुख्य प्रेक्षागृह एवं दर्शक' : 'Jashrang Main Stage & Amphitheatre'}">
              <span class="gallery-card-badge">✦ ${isHi ? 'जशरंग मुख्य मंच' : 'Jashrang Main Stage'}</span>
            </div>
            <div class="gallery-card-body">
              <h4>${isHi ? 'भव्य प्रेक्षागृह एवं राष्ट्रीय नाट्य मंचन' : 'Main Stage & Amphitheatre Nights'}</h4>
              <p>
                ${isHi ? 'शरद ऋतु के तारों भरे आकाश तले 1,800 से अधिक दर्शक राष्ट्रीय ख्यातिप्राप्त नाटकों, हबीब तनवीर की परंपरा और समकालीन प्रस्तुतियों के साक्षी बनते हैं।' : 'Over 1,800 spectators gathering under crisp autumn skies to witness acclaimed adaptations, national ensembles, and physical folk chorus.'}
              </p>
              <div class="gallery-card-meta">
                <span>👥 1,800+ ${isHi ? 'सजीव दर्शक' : 'Live Audience'}</span>
                <span>📍 Jashpur Auditorium</span>
              </div>
            </div>
          </article>

          <!-- Gallery Card 2: Karma Mandar Circle -->
          <article class="gallery-card">
            <div class="gallery-card-media">
              <img src="/src/assets/images/fest-folk-circle.svg" alt="${isHi ? 'मध्यरात्रि करमा व मांदर अखाड़ा' : 'Midnight Karma & Mandar Circle'}">
              <span class="gallery-card-badge" style="background:rgba(255,152,0,0.85);">✦ ${isHi ? 'लोक परंपरा' : 'Folk Traditions'}</span>
            </div>
            <div class="gallery-card-body">
              <h4>${isHi ? 'मध्यरात्रि करमा व मांदर अखाड़ा' : 'Midnight Karma & Mandar Rhythms'}</h4>
              <p>
                ${isHi ? 'पंखों वाले साफे बांधे नर्तक और ग्रामीण मांदर वादक पवित्र अग्नि के चारों ओर भोर तक पारंपरिक ताल और गीतों की अविरल श्रृंखला रचते हैं।' : 'Tribal bards with traditional headdresses and indigenous percussionists playing unamplified Mandar beats around sacred fires till the morning light.'}
              </p>
              <div class="gallery-card-meta">
                <span>🥁 40+ ${isHi ? 'मांदर वादक' : 'Mandar Drummers'}</span>
                <span>🔥 ${isHi ? 'पवित्र अखाड़ा' : 'Sacred Fire Ring'}</span>
              </div>
            </div>
          </article>

          <!-- Gallery Card 3: Kavita Utsav Baithak -->
          <article class="gallery-card">
            <div class="gallery-card-media">
              <img src="/src/assets/images/fest-kavi-recital.svg" alt="${isHi ? 'कविता उत्सव अंतरंग बैठक' : 'Kavita Utsav Baithak Recital'}">
              <span class="gallery-card-badge" style="background:rgba(171,71,188,0.85);">✦ ${isHi ? 'कविता उत्सव' : 'Kavita Utsav'}</span>
            </div>
            <div class="gallery-card-body">
              <h4>${isHi ? 'अंतरंग काव्य गोष्ठी व बांसुरी स्वर' : 'Bardic Baithak & Flute Recitals'}</h4>
              <p>
                ${isHi ? 'चांदनी शाम में गांव-तकियों की पारंपरिक बैठक, जहां छत्तीसगढ़ी, कुरुख और हिंदी के चालीस से अधिक कवि बांसुरी की संगत में अपनी रचनाएं सुनाते हैं।' : 'Traditional floor baithak under handcrafted shamianas, pairing original vernacular verses with bamboo flutes and live dialect translations.'}
              </p>
              <div class="gallery-card-meta">
                <span>📜 40+ ${isHi ? 'आमंत्रित कवि' : 'Invited Poets'}</span>
                <span>🎶 ${isHi ? 'लोक बांसुरी' : 'Acoustic Flute'}</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- HISTORICAL EDITION ARCHIVES (PATTERN A) -->
      <section style="margin: 5rem 0;">
        <span class="page-eyebrow">✦ ${isHi ? 'ऐतिहासिक अभिलेखागार' : 'Chronological Edition Archive'} ✦</span>
        <h3 style="font-family:var(--font-serif); font-size:2rem; color:var(--g-text-primary); margin-bottom:1.5rem;">
          ${isHi ? 'विगत वर्षों के महोत्सव संस्करण (२०२५-२०२६)' : 'Past Edition Dossiers (2025–2026 Archive)'}
        </h3>
        <div class="year-tiles-grid">
          ${jashrangTiles}
          ${kavitaTiles}
        </div>
      </section>

      <!-- VISITOR TRAVEL & PASSES LOGISTICS GUIDE -->
      <div class="visual-highlight-band" style="margin-top:2rem;">
        <div class="highlight-content">
          <span style="background:var(--c-primary); color:#FFFFFF; padding:0.25rem 0.75rem; border-radius:var(--radius-pill); font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;">
            ${isHi ? 'महोत्सव यात्रा मार्गदर्शिका' : 'Visitor Travel & Passes Guide'}
          </span>
          <h3 style="font-family:var(--font-serif); font-size:1.85rem; color:var(--g-text-primary); margin-top:0.75rem;">
            ${isHi ? 'जशपुर नगर पधारें: कैसे पहुंचें और ठहरें' : 'Plan Your Cultural Journey to Jashpur'}
          </h3>
          <p style="color:var(--g-text-secondary); font-size:1rem; line-height:1.7; max-width:640px; margin-top:0.5rem;">
            ${isHi ? 'जशपुर छत्तीसगढ़ के उत्तर-पूर्वी पठार पर स्थित है। निकटतम रेलवे स्टेशन: रायगढ़ (160 किमी) एवं रांची (150 किमी)। हवाई संपर्क: रांची बिरसा मुंडा हवाई अड्डा अथवा रायपुर विमानतल। दर्शक निःशुल्क प्रवेश पास हेतु संपर्क कर सकते हैं।' : 'Located amidst the scenic hills and waterfalls of north-eastern Chhattisgarh. Nearest major railheads: Raigarh (160 km) & Ranchi (150 km). Nearest airports: Ranchi (IXR) & Raipur (RPR). Public entry to open stages is complimentary.'}
          </p>
        </div>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          <a href="/${lang}/contact/?subject=Festival-Pass-Inquiry" class="btn-primary">
            <span>🎟️</span> <span>${isHi ? 'निःशुल्क दर्शक पास' : 'Register for Free Passes'}</span>
          </a>
          <a href="/${lang}/contact/?subject=Volunteer-Jashrang" class="btn-secondary">
            <span>🤝</span> <span>${isHi ? 'स्वयंसेवक बनें' : 'Volunteer with Us'}</span>
          </a>
        </div>
      </div>

      <!-- FESTIVAL CURATORS CALLOUT BANNER -->
      <div class="production-dossier-banner" style="margin-top:3rem;">
        <div>
          <span style="background:var(--c-blue); color:#FFFFFF; padding:0.3rem 0.8rem; border-radius:var(--radius-pill); font-weight:800; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em;">
            ${isHi ? 'सांस्कृतिक साझीदारी' : 'Curatorial Partnerships'}
          </span>
          <h2 style="font-family:var(--font-serif); font-size:1.9rem; color:var(--g-text-primary); margin-top:0.8rem;">
            ${isHi ? 'नाट्य दल आमंत्रण व महोत्सव प्रायोजन' : 'Host Your Production at Jashrang'}
          </h2>
          <p style="color:var(--g-text-secondary); font-size:1.05rem; margin-top:0.5rem; max-width:640px;">
            ${isHi ? 'जशरंग राष्ट्रीय नाट्य समारोह में अपनी नाट्य प्रस्तुति शामिल करने हेतु क्यूरेटोरियल बोर्ड को प्रस्ताव भेजें।' : 'National repertories, campus drama clubs, and solo performers are invited to submit their production dossiers for curation in our upcoming winter festival edition.'}
          </p>
        </div>
        <a href="/${lang}/contact/?subject=Festival-Curation-Inquiry" class="btn-primary">
          <span>📮</span> <span>${isHi ? 'प्रस्ताव जमा करें' : 'Submit Curation Dossier'}</span>
        </a>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'महोत्सव एवं समारोह' : 'Festivals & Events',
      desc: "Jashrang National Theatre Festival and Jaspur Kavita Utsav year archives with stage chronicles",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'समारोह' : 'Events', href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'events', 'index.html'), doc);
  }

  // 5. TRAINING & WORKSHOPS
  {
    const canonical = `/${lang}/training-workshops/`;
    const alt = `/${altLang}/training-workshops/`;

    const campTiles = siteData.workshops.years.map(y => `
      <div class="year-tile">
        <div class="year-num">${y.year}</div>
        <div class="year-theme">${y.theme[lang]}</div>
        <div class="year-meta">👥 ${y.participants} • 📅 ${y.dates[lang]}</div>
        <div class="year-desc"><strong>${isHi ? 'प्रशिक्षक:' : 'Facilitators:'}</strong> ${y.facilitators}</div>
        <div class="year-desc" style="margin-top:0.4rem;"><strong>${isHi ? 'उपलब्धि:' : 'Outcome:'}</strong> ${y.outcome[lang]}</div>
      </div>
    `).join('\n');

    const campBanner = siteData.workshops?.upcomingBatch?.bannerImage || siteData.workshops?.upcomingBatch?.image || '/src/assets/images/camp-ullas.svg';
    const campIcon = siteData.workshops?.upcomingBatch?.icon || '⛺';
    const workshopsBanner = siteData.workshopsPageBanner ? `
      <div class="page-banner-creative" style="max-width:1140px; margin:0 auto 2.5rem auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid var(--g-border-subtle);">
        <img src="${siteData.workshopsPageBanner}" alt="Residency Banner" style="width:100%; max-height:360px; object-fit:cover; display:block;">
      </div>` : '';

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ ${isHi ? 'बाल व युवा कला प्रशिक्षण' : 'Youth Arts & Theatre Residency'} ✦</span>
        <h1 class="page-title">${siteData.workshops.name[lang]}</h1>
        <p class="page-description">${siteData.workshops.description[lang]}</p>

        <!-- Subpage Stats Chips -->
        <div class="subpage-stats-bar">
          <div class="subpage-stat-chip">🎨 <strong>4</strong> ${isHi ? 'सफल ग्रीष्मकालीन संस्करण' : 'Summer Residencies'}</div>
          <div class="subpage-stat-chip">👧 <strong>360+</strong> ${isHi ? 'प्रशिक्षित बच्चे' : 'Rural Children Empowered'}</div>
          <div class="subpage-stat-chip">🎭 <strong>100%</strong> ${isHi ? 'निःशुल्क आदिवासी सहभागिता' : 'Subsidized Tribal Access'}</div>
          <div class="subpage-stat-chip">📍 <strong>Jashpur Studios</strong></div>
        </div>
      </div>
    </div>

    <div class="container page-content-container">
      ${workshopsBanner}
      <!-- Upcoming Batch Hero Card -->
      <article class="festival-showcase-card">
        <div class="festival-banner-media">
          <img src="${campBanner}" alt="${siteData.workshops.upcomingBatch.title[lang]}">
        </div>
        <div class="festival-banner-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
            <div>
              <span style="background:var(--c-yellow-light); color:var(--c-yellow-dark); font-size:0.8rem; font-weight:800; padding:0.25rem 0.8rem; border-radius:var(--radius-pill); text-transform:uppercase; letter-spacing:0.06em;">
                ${campIcon} ${siteData.workshops.upcomingBatch.status[lang]}
              </span>
              <h2 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary); margin-top:0.5rem;">
                ${siteData.workshops.upcomingBatch.title[lang]}
              </h2>
            </div>
            <a href="/${lang}/contact/?subject=Ullas-Camp-Registration" class="btn-primary" style="font-size:0.88rem; padding:0.65rem 1.25rem;">
              <span>📝</span> <span>${isHi ? 'अग्रिम पंजीकरण फॉर्म' : 'Register Child for Camp'}</span>
            </a>
          </div>

          <div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:1.5rem; font-size:0.95rem; color:var(--g-text-secondary); background:var(--g-surface-subtle); padding:1rem 1.25rem; border-radius:var(--radius-sm); border:1px solid var(--g-border-subtle);">
            <div>📅 <strong>${isHi ? 'अवधि' : 'Dates'}:</strong> ${siteData.workshops.upcomingBatch.dates[lang]}</div>
            <div>👥 <strong>${isHi ? 'आयु वर्ग' : 'Age Group'}:</strong> ${siteData.workshops.upcomingBatch.ageGroup[lang]}</div>
            <div>📍 <strong>${isHi ? 'स्थान' : 'Venue'}:</strong> ${siteData.workshops.upcomingBatch.venue[lang]}</div>
            <div>💰 <strong>${isHi ? 'शुल्क' : 'Fee'}:</strong> ${siteData.workshops.upcomingBatch.fee[lang]}</div>
          </div>

          <h3 style="font-family:var(--font-serif); font-size:1.35rem; color:var(--g-text-primary); margin-bottom:1rem;">
            ${isHi ? 'शिविर की प्रमुख गतिविधियां' : 'Residency Modules & Curriculum'}
          </h3>
          <ul class="dossier-list" style="margin-bottom:2rem;">
            ${siteData.workshops.upcomingBatch.activities.map(act => `
              <li>${act[lang]}</li>
            `).join('')}
          </ul>
        </div>
      </article>

      <!-- Pedagogical Pillars Section -->
      <div style="margin: 4.5rem 0;">
        <span class="page-eyebrow">✦ ${isHi ? 'प्रशिक्षण पद्धति' : 'Pedagogical Framework'} ✦</span>
        <h2 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary); margin-bottom:0.75rem;">
          ${isHi ? 'उल्लास शिक्षण दृष्टि के चार आधार स्तंभ' : 'Four Core Pillars of Ullas Theatre Pedagogy'}
        </h2>
        <p style="color:var(--g-text-secondary); font-size:1.05rem; max-width:760px; margin-bottom:2.5rem;">
          ${isHi ? 'हम बच्चों को केवल अभिनय नहीं सिखाते, बल्कि संवाद, सहयोग, लोक-संवेदना और आत्मविश्वास का सहज वातावरण प्रदान करते हैं।' : 'Rooted in community theatre methods, Ullas guides children to discover their personal voice through indigenous storytelling, clay crafts, and ensemble cooperation.'}
        </p>

        <div class="workshop-modules-grid">
          <div class="workshop-module-card">
            <div class="module-icon-circle">🎭</div>
            <h3 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem; color:var(--g-text-primary);">
              ${isHi ? '१. अभिनय व देह-भाषा' : '1. Acting & Folk Body Language'}
            </h3>
            <p style="font-size:0.92rem; color:var(--g-text-secondary); line-height:1.7;">
              ${isHi ? 'नाचा और पंथी की पारंपरिक शारीरिक लय, मुखमुद्राएं एवं आत्मविश्वासी संवाद शैली का व्यावहारिक अभ्यास।' : 'Physical movement grammar rooted in Nacha and Panthi folk theatre, voice projection, and expressive confidence.'}
            </p>
          </div>

          <div class="workshop-module-card">
            <div class="module-icon-circle">🎎</div>
            <h3 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem; color:var(--g-text-primary);">
              ${isHi ? '२. मुखौटा व कठपुतली' : '2. Mask & Shadow Puppetry'}
            </h3>
            <p style="font-size:0.92rem; color:var(--g-text-secondary); line-height:1.7;">
              ${isHi ? 'माटी के मुखौटे, बस्तर चमड़ा छाया-कठपुतली और पुनर्चक्रित पदार्थों से रंगमंच सामग्री का निर्माण।' : 'Clay mask sculpting, Bastar shadow leather puppets, and eco-friendly costume fabrication crafted by children.'}
            </p>
          </div>

          <div class="workshop-module-card">
            <div class="module-icon-circle">🥁</div>
            <h3 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem; color:var(--g-text-primary);">
              ${isHi ? '३. मांदर लय व लोकगीत' : '3. Mandar Rhythm & Folk Songs'}
            </h3>
            <p style="font-size:0.92rem; color:var(--g-text-secondary); line-height:1.7;">
              ${isHi ? 'पारंपरिक ताल वाद्य (मांदर, झांझ) एवं छत्तीसगढ़ी लोकगीतों की धुनों के माध्यम से संगीत की गहरी समझ।' : 'Indigenous acoustic instruments, rhythm cycles (Taal), and rich chorus singing preserving tribal heritage.'}
            </p>
          </div>

          <div class="workshop-module-card">
            <div class="module-icon-circle">🎬</div>
            <h3 style="font-family:var(--font-serif); font-size:1.35rem; margin-bottom:0.5rem; color:var(--g-text-primary);">
              ${isHi ? '४. सार्वजनिक मंच प्रस्तुति' : '4. Grand Culminating Production'}
            </h3>
            <p style="font-size:0.92rem; color:var(--g-text-secondary); line-height:1.7;">
              ${isHi ? 'शिविर के समापन पर बच्चों द्वारा ५००+ अभिभावकों एवं नागरिकों के समक्ष लिखित व अभिनित नाटक का मंचन।' : 'A complete original play written, designed, and staged by the children in front of a live public auditorium audience.'}
            </p>
          </div>
        </div>
      </div>

      <h3 style="font-family:var(--font-serif); font-size:1.9rem; color:var(--g-text-primary); margin-bottom:1.5rem;">
        ${isHi ? 'उल्लास समर कैम्प वर्ष अभिलेखागार (Historical Residencies)' : 'Ullas Summer Camp Residency Archives'}
      </h3>
      <div class="year-tiles-grid">
        ${campTiles}
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: siteData.workshops.name[lang],
      desc: "Ullas Summer Camp and theatre training workshops in Jashpur, Chhattisgarh",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: siteData.workshops.name[lang], href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'training-workshops', 'index.html'), doc);
  }

  // 6. MAGAZINE
  {
    const canonical = `/${lang}/magazine/`;
    const alt = `/${altLang}/magazine/`;

    // Render Previous / Archival Issues Grid Cards
    const previousIssuesCards = (siteData.magazine.previousIssues || []).map(issue => `
      <article class="issue-archive-card">
        <div class="issue-card-media">
          <div class="issue-cover-thumb">
            <img src="${issue.coverImg}" alt="${issue.title[lang]}">
          </div>
          <span class="issue-badge-tag">${issue.badge[lang]}</span>
        </div>
        <div class="issue-card-body">
          <div class="issue-card-header">
            <span>📅 ${issue.month[lang]}</span>
            <span>${issue.number}</span>
          </div>
          <h4>${issue.title[lang]}</h4>
          <div class="issue-lead-article">
            <span>✍️ ${isHi ? 'विशेषांक आलेख' : 'Lead Monograph'}:</span> ${issue.leadArticle[lang]}
          </div>
          <p>${issue.readExcerpt[lang]}</p>
          <div class="issue-card-actions">
            <button type="button" class="btn-secondary open-excerpt-btn" 
              data-issue-id="${issue.id}" 
              data-issue-title="${issue.title[lang]}"
              data-issue-number="${issue.number}"
              data-issue-month="${issue.month[lang]}"
              data-issue-lead="${issue.leadArticle[lang]}"
              data-issue-excerpt="${issue.readExcerpt[lang]}"
              data-issue-cover="${issue.coverImg}">
              <span>📖</span> <span>${isHi ? 'सार संक्षेप पढ़ें' : 'Read Excerpt'}</span>
            </button>
            <a href="${issue.coverImg}" target="_blank" class="btn-secondary">
              <span>🖼️</span> <span>${isHi ? 'कवर' : 'Cover'}</span>
            </a>
            <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true" style="background:var(--c-primary); border-color:var(--c-primary); font-size:0.85rem; padding:0.45rem 1rem;">
              <span>★</span> <span>${isHi ? 'सदस्यता' : 'Subscribe'}</span>
            </button>
          </div>
        </div>
      </article>
    `).join('\n');

    function renderArticleMarkdown(text, lang) {
      if (!text) return '';
      const isHi = lang === 'hi';
      const blocks = text.split(/\n\n+/);
      let html = '';
      
      blocks.forEach(block => {
        block = block.trim();
        if (!block) return;
        
        if (block.startsWith('### ')) {
          const headingText = block.replace(/^###\s+/, '');
          html += `<h4 class="essay-subheading"><span class="subheading-accent">✦</span> ${headingText}</h4>\n`;
        } else if (block.startsWith('> ')) {
          const quoteText = block.replace(/^>\s*"?/, '').replace(/"?$/, '');
          html += `
          <blockquote class="essay-pullquote">
            <div class="pullquote-watermark">“</div>
            <p class="pullquote-text">${quoteText}</p>
            <cite class="pullquote-cite">— ${isHi ? 'छत्तीसगढ़िया क्लाउड शोध विमर्श' : 'Chhattisgadhiya Cloud Critical Journal'}</cite>
          </blockquote>\n`;
        } else if (/^\d+\.\s+\*\*/.test(block)) {
          const lines = block.split(/\n+/);
          html += `<div class="essay-points-grid">\n`;
          lines.forEach(line => {
            const match = line.match(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*)$/);
            if (match) {
              html += `
              <div class="essay-point-card">
                <div class="point-badge">${match[1]}</div>
                <div class="point-body">
                  <strong class="point-title">${match[2]}</strong>
                  <p class="point-desc">${match[3]}</p>
                </div>
              </div>\n`;
            } else {
              html += `<p class="essay-paragraph">${line}</p>\n`;
            }
          });
          html += `</div>\n`;
        } else if (block.includes('*By ') || block.includes('*रामेश्वर') || block.includes('*शशि')) {
          const lines = block.split(/\n+/).map(l => {
            if (l.startsWith('*') && l.endsWith('*')) {
              return `<div class="poem-poet">✍️ ${l.replace(/\*/g, '')}</div>`;
            }
            return `<div class="poem-verse">${l}</div>`;
          }).join('\n');
          html += `<div class="essay-poem-stanza">${lines}</div>\n`;
        } else {
          let parsed = block
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
          html += `<p class="essay-paragraph">${parsed}</p>\n`;
        }
      });
      return html;
    }

    const categoryInfo = {
      'article-1': {
        icon: '🎭',
        cssClass: 'cat-theatre',
        avatar: isHi ? 'प्र.मि.' : 'PM',
        credentials: isHi ? 'वरिष्ठ शोध अध्येता, छत्तीसगढ़ लोक अकादमी' : 'Senior Research Fellow, Chhattisgarh Folk Academy',
        takeaway: isHi 
          ? 'नाचा का तात्कालिक व्यंग्य केवल हास्य नहीं, बल्कि गांव के सामान्य जन का खुला न्यायालय है जहां सामाजिक विषमताएं पिघलती हैं।'
          : 'Nacha is not mere entertainment; it is an organic tribunal of village commoners where entrenched social barriers soften under collective laughter.'
      },
      'article-2': {
        icon: '🎋',
        cssClass: 'cat-tribute',
        avatar: isHi ? 'क.जो.' : 'KJ',
        credentials: isHi ? 'रंगमंच समीक्षक एवं पूर्व सदस्य, राष्ट्रीय नाट्य विद्यालय परिषद' : 'Theatre Critic & Former Member, NSD Council',
        takeaway: isHi
          ? 'हबीब तनवीर ने विक्टोरियन पर्दों को नकारते हुए बांस के हल्के ढांचे और अभिनेता के शरीर को ही सम्पूर्ण रंग-सृष्टि बनाया।'
          : 'Habib Tanvir stripped the stage of Victorian clutter, turning bamboo frames and the actor’s organic physicality into infinite spatial poetry.'
      },
      'article-3': {
        icon: '📜',
        cssClass: 'cat-poetry',
        avatar: isHi ? 'ज.क.' : 'JP',
        credentials: isHi ? 'जशपुर साहित्यिक मंडल एवं वाचिक परंपरा संरक्षक' : 'Jashpur Literary Circle & Oral Traditions Custodian',
        takeaway: isHi
          ? 'रानीदह के जलप्रपातों और साल वनों की वाचिक कुरुख धुनें सीधे प्रकृति और मनुष्य के अटूट संबंध का गान करती हैं।'
          : 'The Kurukh oral rhythms of Rani Dah and Sal groves preserve ecological memory directly as living contemporary verse.'
      }
    };
    const articlesHtml = siteData.magazine.currentIssue.articles.map((art, idx) => {
      const info = categoryInfo[art.id] || { icon: '📄', cssClass: 'cat-theatre', avatar: 'CC', credentials: '', takeaway: '' };
      const authorName = art.author.en.replace(/"/g, '');
      const cleanTitle = art.title.en.replace(/"/g, '&quot;');
      const citationText = `${authorName} (2026). &quot;${cleanTitle}&quot;. Chhattisgadhiya Cloud Masik Patrika, Vol. 4, Issue 9, pp. 1-8.`;
      
      return `
      <article class="magazine-article-card" id="${art.slug}">
        <!-- Article Header Bar -->
        <header class="article-card-header-bar">
          <div class="article-meta-row">
            <span class="article-category-badge ${info.cssClass}">
              <span>${info.icon}</span> <span>${art.category[lang]}</span>
            </span>
            <div class="article-meta-stats">
              <span>📅 ${art.date}</span>
              <span>⏱️ ${art.readTime}</span>
              <span>🏛️ ${isHi ? 'मुक्त सांस्कृतिक अभिलेखागार' : 'Open Cultural Archive'}</span>
            </div>
            <div class="article-toolbar-actions">
              <button type="button" class="article-tool-btn" data-audio="${art.slug}" title="${isHi ? 'ऑडियो अंश सुनें' : 'Listen to Audio Excerpt'}">
                <span>🔊</span> <span>${isHi ? 'ऑडियो अंश' : 'Audio Excerpt'}</span>
              </button>
              <button type="button" class="article-tool-btn" data-cite="${citationText}" title="${isHi ? 'उद्धरण (APA) कॉपी करें' : 'Copy APA Citation'}">
                <span>📋</span> <span>${isHi ? 'उद्धरण' : 'Cite (APA)'}</span>
              </button>
              <button type="button" class="article-tool-btn" data-reader-jump="${idx + 1}" title="${isHi ? '3D फ्लिप-बुक में खोलें' : 'Read in 3D Flip-Book'}">
                <span>📖</span> <span>${isHi ? '3D वाचक' : '3D Reader'}</span>
              </button>
            </div>
          </div>

          <h2 class="article-title-link">
            ${art.title[lang]}
          </h2>

          <div class="article-author-lockup">
            <div class="author-avatar-badge">${info.avatar}</div>
            <div class="author-credentials">
              <span class="author-name-text">${art.author[lang]}</span>
              <span class="author-role-text">${info.credentials}</span>
            </div>
          </div>
        </header>

        <!-- Article Body Wrap -->
        <div class="article-card-body-wrap">
          <div class="essay-lead-abstract">
            <strong>${isHi ? 'शोध सारांश:' : 'Curator\'s Monograph Synopsis:'}</strong> ${art.excerpt[lang]}
          </div>

          <div class="essay-main-content">
            ${renderArticleMarkdown(art.content[lang], lang)}
          </div>

          <!-- Key Monograph Takeaway Card -->
          <div class="essay-takeaway-card">
            <span class="takeaway-badge">💡</span>
            <div class="takeaway-content">
              <strong>${isHi ? 'मूल सांस्कृतिक दृष्टि (Core Takeaway)' : 'Critical Observation & Takeaway'}</strong>
              <p>${info.takeaway}</p>
            </div>
          </div>
        </div>

        <!-- Article Footer Bar with Direct Subscription & Flip-Book Actions -->
        <footer class="article-card-footer-bar">
          <div style="font-size:0.95rem; color:var(--g-text-secondary); display:flex; align-items:center; gap:0.5rem;">
            <span>📮</span> <span>${isHi ? 'इस शोध लेख की मुद्रित प्रति अथवा सम्पूर्ण अंक डाक/ईमेल से प्राप्त करने हेतु:' : 'Enjoyed this excerpt? Receive full unabridged issues every month:'}</span>
          </div>
          <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
            <button type="button" class="btn-secondary" data-reader-jump="${idx + 1}">
              <span>📖</span> <span>${isHi ? `3D वाचक में पढ़ें (पृष्ठ ${idx + 1})` : `Read in 3D Flip-Book (Page ${idx + 1})`}</span>
            </button>
            <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true">
              <span>★</span> <span>${isHi ? 'मासिक पत्रिका सदस्यता लें' : 'Subscribe to Full Issue'}</span>
            </button>
          </div>
        </footer>
      </article>
      `;
    }).join('\n');

    const filterTabsHtml = `
      <div class="articles-filter-bar" role="tablist" aria-label="Article Filter Navigation">
        <button type="button" class="article-filter-pill active" data-article-target="all" role="tab" aria-selected="true">
          <span>✦</span> <span>${isHi ? 'समस्त 3 आलेख' : 'All 3 Monographs'}</span>
        </button>
        <button type="button" class="article-filter-pill" data-article-target="revival-of-nacha-in-urban-spaces" role="tab" aria-selected="false">
          <span>🎭</span> <span>${isHi ? '1. नाचा का पुनरुत्थान' : '1. Revival of Nacha'}</span>
        </button>
        <button type="button" class="article-filter-pill" data-article-target="remembering-habib-tanvir-scenography" role="tab" aria-selected="false">
          <span>🎋</span> <span>${isHi ? '2. हबीब तनवीर की रंग-शिल्प' : '2. Habib Tanvir Scenography'}</span>
        </button>
        <button type="button" class="article-filter-pill" data-article-target="voices-of-jashpur-poems-from-hill-valleys" role="tab" aria-selected="false">
          <span>📜</span> <span>${isHi ? '3. जशपुर के स्वर' : '3. Voices of Jashpur'}</span>
        </button>
      </div>
    `;

    const currentCover = siteData.magazine?.currentIssue?.coverImg || '/src/assets/images/mag-issue-14-cover.svg';
    const magPageBanner = siteData.magazinePageBanner ? `
      <div class="page-banner-creative" style="max-width:1140px; margin:0 auto 2.5rem auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid var(--g-border-subtle);">
        <img src="${siteData.magazinePageBanner}" alt="Magazine Banner" style="width:100%; max-height:360px; object-fit:cover; display:block;">
      </div>` : '';

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ ${isHi ? 'मासिक विचार एवं सांस्कृतिक पत्रिका' : 'Monthly Cultural Review & Public Archive'} ✦</span>
        <h1 class="page-title">${siteData.magazine.name[lang]}</h1>
        <p class="page-description">${siteData.magazine.description[lang]}</p>

        <!-- Subpage Stats Chips -->
        <div class="subpage-stats-bar">
          <div class="subpage-stat-chip">📖 <strong>14</strong> ${isHi ? 'प्रकाशित अंक' : 'Issues Published'}</div>
          <div class="subpage-stat-chip">✍️ <strong>80+</strong> ${isHi ? 'शोध व वैचारिक आलेख' : 'Critical Essays'}</div>
          <div class="subpage-stat-chip">🌐 <strong>100%</strong> ${isHi ? 'मुक्त डिजिटल अभिलेख' : 'Open Digital Access'}</div>
          <div class="subpage-stat-chip">📑 <strong>ISSN 2709-4112</strong></div>
        </div>
      </div>
    </div>

    <div class="container" style="padding-bottom: 5rem;">
      ${magPageBanner}
      <!-- INTENTION 1: HIGHLIGHT CURRENT MONTH MAGAZINE ISSUE (ELEGANT EDITORIAL HERO) -->
      <section class="magazine-hero-spotlight">
        <div class="magazine-hero-content">
          <div class="magazine-hero-eyebrow">
            <span>✦</span> <span>${isHi ? 'वर्तमान अंक • सितंबर २०२६' : 'CURRENT MONTH ISSUE • SEPTEMBER 2026'}</span> <span>✦</span>
          </div>
          <h2 class="magazine-hero-title">
            ${siteData.magazine.currentIssue.number}: ${siteData.magazine.currentIssue.title[lang]}
          </h2>
          <p class="magazine-hero-desc">
            ${siteData.magazine.subscriptionInfo[lang]}
          </p>

          <div class="magazine-hero-chips">
            <span class="mag-chip">📄 8 Curated Pages</span>
            <span class="mag-chip">⏱️ 18 min Total Read</span>
            <span class="mag-chip">🌐 Open Digital Edition</span>
            <span class="mag-chip">📑 ISSN Reg.</span>
          </div>

          <!-- Curated Table of Contents Preview in Hero -->
          <div class="mag-hero-toc">
            <div class="mag-hero-toc-title">${isHi ? 'इस अंक में:' : 'In This Edition:'}</div>
            <div class="mag-hero-toc-list">
              <div class="mag-hero-toc-item">
                <span>✦ <strong>${isHi ? 'शहरी मंचों पर नाचा का पुनरुत्थान' : 'The Revival of Nacha in Urban Spaces'}</strong> (Dr. Prabhat Mishra)</span>
                <span>⏱️ 6 min</span>
              </div>
              <div class="mag-hero-toc-item">
                <span>✦ <strong>${isHi ? 'हबीब तनवीर की रंग-शिल्प दृष्टि' : 'Remembering Habib Tanvir’s Scenography'}</strong> (Kavita S. Joshi)</span>
                <span>⏱️ 8 min</span>
              </div>
              <div class="mag-hero-toc-item">
                <span>✦ <strong>${isHi ? 'जशपुर के स्वर: पहाड़ी घाटियों से कविताएं' : 'Voices of Jashpur: Poems from Hill Valleys'}</strong> (Selected Poets)</span>
                <span>⏱️ 4 min</span>
              </div>
            </div>
          </div>

          <div class="magazine-hero-actions">
            <a href="#open-articles" class="btn-primary" style="background:#FF4500; border-color:#FF4500;">
              <span>📖</span> <span>${isHi ? 'प्रमुख आलेख पढ़ें' : 'Read Featured Essays'}</span>
            </a>
            <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true" style="background:#1A73E8; border-color:#1A73E8;">
              <span>★</span> <span>${isHi ? 'सदस्यता लें (प्रिंट / PDF)' : 'Subscribe (Print / PDF)'}</span>
            </button>
            <a href="${currentCover}" target="_blank" class="btn-secondary">
              <span>⬇</span> <span>${isHi ? 'कवर आर्ट' : 'Cover Art'}</span>
            </a>
          </div>
        </div>

        <div class="magazine-cover-display">
          <div class="magazine-cover-frame">
            <img src="${currentCover}" alt="Issue 14 Cover">
          </div>
        </div>
      </section>

      <!-- INTENTION 2: SHOWCASE PREVIOUS MONTH / ARCHIVAL ISSUES -->
      <section class="previous-issues-section">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1.25rem; margin-bottom:1.5rem;">
          <div>
            <span class="page-eyebrow">✦ ${isHi ? 'विगत अंक अभिलेखागार' : 'Archival Collections & Monographs'} ✦</span>
            <h3 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary); margin-top:0.25rem;">
              ${isHi ? 'विगत माह के अंक एवं विशेषांक' : 'Previous Month Issues & Special Monographs'}
            </h3>
            <p style="color:var(--g-text-secondary); font-size:1.02rem; margin-top:0.35rem; max-width:680px;">
              ${isHi ? 'हबीब तनवीर शताब्दी स्मृति, साल वनों की वाचिक काव्य-परंपरा, एवं बाल रंगमंच पर प्रकाशित ऐतिहासिक अंकों का डिजिटल संग्रह।' : 'Explore earlier monthly editions published by Chhattisgadhiya Cloud — preserving tribal oral balladeers, centenary stage retrospectives, and child theatre experiments.'}
            </p>
          </div>
          <button type="button" class="btn-secondary open-subscribe-btn" data-open-subscribe="true">
            <span>📮</span> <span>${isHi ? 'समस्त अंकों की सदस्यता' : 'Subscribe to All Issues'}</span>
          </button>
        </div>

        <div class="previous-issues-grid">
          ${previousIssuesCards}
        </div>
      </section>

      <!-- INTENTION 3: OPTION TO READ CURRENT ISSUE ESSAYS -->
      <section id="open-articles" style="margin-top:5.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1.25rem; margin-bottom:1.5rem;">
          <div>
            <span class="page-eyebrow">✦ ${isHi ? 'सार्वजनिक वाचन निबंध' : 'Current Issue Open Articles'} ✦</span>
            <h3 style="font-family:var(--font-serif); font-size:2.2rem; color:var(--g-text-primary); margin-top:0.25rem;">
              ${isHi ? 'अंक १४ से प्रमुख प्रकाशित आलेख' : 'Featured Critical Essays from Current Issue'}
            </h3>
            <p style="color:var(--g-text-secondary); font-size:1.02rem; margin-top:0.35rem; max-width:720px;">
              ${isHi ? 'शोधार्थियों, रंगकर्मियों एवं पाठकों हेतु इस माह के अंक से चयनित संपूर्ण लेख। प्रत्येक आलेख को सीधे पढ़ें, उद्धरण (Citation) कॉपी करें या 3D फ्लिप-बुक में देखें।' : 'Peer-reviewed essays and oral folklore monographs from the September 2026 edition, discoverable for researchers, drama students, and cultural practitioners.'}
            </p>
          </div>
          <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true">
            <span>📮</span> <span>${isHi ? 'मासिक पत्रिका सदस्यता लें' : 'Subscribe to Full Issue'}</span>
          </button>
        </div>

        ${filterTabsHtml}

        <div class="articles-list-container">
          ${articlesHtml}
        </div>
      </section>

      <!-- INTERACTIVE DIGITAL READER (FLIP-BOOK SPREAD & PDF TOOL) -->
      <section id="interactive-reader-section" style="margin-top:5.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1.25rem; margin-bottom:1.5rem;">
          <div>
            <span class="page-eyebrow">✦ ${isHi ? 'इंटरएक्टिव डिजिटल वाचक' : 'Interactive Reading Engine'} ✦</span>
            <h3 style="font-family:var(--font-serif); font-size:2rem; color:var(--g-text-primary); margin-top:0.25rem;">
              ${isHi ? 'डिजिटल पत्रिका पाठक (3D फ्लिप-बुक टूल)' : 'Interactive Digital Reader (Flip-Book & PDF Tool)'}
            </h3>
            <p style="color:var(--g-text-secondary); margin-top:0.35rem; max-width:760px; font-size:1.02rem;">
              ${isHi ? 'पत्रिका को 3D दो-पृष्ठीय फ्लिप-बुक या पठनीय पृष्ठ मोड में पढ़ें। आप किसी भी PDF अंक को सीधे ब्राउज़र में स्थानीय रूप से मार्कडाउन में भी बदल सकते हैं।' : 'Read Issue 14 as an authentic 3D open-book spread with tactile page turns, or switch to distraction-free reader mode. Parse any issue PDF directly into Markdown locally.'}
            </p>
          </div>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <a href="/src/assets/images/mag-issue-14-cover.svg" target="_blank" class="btn-secondary">
              <span>🖼️</span> <span>${isHi ? 'कवर आर्ट' : 'Cover Art'}</span>
            </a>
            <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true">
              <span>★</span> <span>${isHi ? 'डाक/PDF सदस्यता' : 'Subscribe (Print / PDF)'}</span>
            </button>
          </div>
        </div>

        <div class="magazine-shell">
          <div id="magazine-reader-mount"></div>
        </div>
      </section>

      <!-- EDITORIAL COUNCIL & ISSN STATEMENT -->
      <div class="visual-highlight-band" style="margin-top:5rem;">
        <div class="highlight-content">
          <span style="background:var(--c-blue); color:#FFFFFF; padding:0.25rem 0.75rem; border-radius:var(--radius-pill); font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;">
            ${isHi ? 'संपादकीय दृष्टि' : 'Editorial Board & Mission'}
          </span>
          <h3 style="font-family:var(--font-serif); font-size:1.85rem; color:var(--g-text-primary); margin-top:0.75rem;">
            ${isHi ? 'माटी की आवाज़ और समकालीन रंग-विमर्श' : 'Preserving Living Voices & Critical Theatre Discourse'}
          </h3>
          <p style="color:var(--g-text-secondary); font-size:1rem; line-height:1.75; max-width:680px; margin-top:0.5rem;">
            ${isHi ? '‘छत्तीसगढ़िया क्लाउड मासिक पत्रिका’ केवल एक पत्रिका नहीं, बल्कि माटी के कलाकारों, निर्देशकों और लोक गायकों का खुला मंच है। हम प्रत्येक अंक को शोधार्थियों, विश्वविद्यालयों और स्थानीय विद्यालयों को निःशुल्क उपलब्ध कराते हैं।' : 'Chhattisgadhiya Cloud Masik Patrika serves as an open tribunal for folk practitioners, directors, and researchers. Subsidized print runs are distributed directly to tribal village schools, community libraries, and drama schools across the country.'}
          </p>
        </div>
        <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true">
          <span>📮</span> <span>${isHi ? 'निःशुल्क सदस्यता प्राप्त करें' : 'Get Free Monthly Subscription'}</span>
        </button>
      </div>

    </div>

    <!-- =====================================================================
         INTENTION 4: INTERACTIVE SUBSCRIBE POPUP MODAL (NAME, PHONE, EMAIL)
         ===================================================================== -->
    <div class="modal-overlay" id="subscribe-modal" role="dialog" aria-modal="true" aria-labelledby="sub-modal-title">
      <div class="modal-dialog">
        <div class="modal-header">
          <button type="button" class="modal-close-btn" id="sub-modal-close" aria-label="Close modal">✕</button>
          <span class="modal-eyebrow">✦ ${isHi ? 'मासिक पत्रिका सदस्यता' : 'Monthly Journal Subscription'} ✦</span>
          <h3 class="modal-title" id="sub-modal-title">
            ${isHi ? 'पत्रिका सदस्यता पंजीकरण' : 'Subscribe to Chhattisgadhiya Cloud'}
          </h3>
          <p style="color:var(--g-text-secondary); font-size:0.92rem; margin-top:0.35rem; line-height:1.5;">
            ${isHi ? 'नया अंक प्रकाशित होते ही डिजिटल PDF व्हाट्सएप/ईमेल पर एवं मुद्रित प्रति आपके पते पर भेजी जाएगी।' : 'Receive high-res digital editions directly via WhatsApp/Email or receive print postal issues.'}
          </p>
        </div>

        <div class="modal-body">
          <!-- Form View -->
          <form id="subscribe-form">
            <!-- 1. Name -->
            <div class="modal-form-group">
              <label for="sub-name">${isHi ? 'पूरा नाम (Full Name) *' : 'Full Name *'}</label>
              <div class="modal-input-wrap">
                <span class="modal-input-icon">👤</span>
                <input type="text" id="sub-name" class="modal-input" required placeholder="${isHi ? 'उदा. रामेश्वर साहू' : 'e.g. Rameshwar Sahu'}">
              </div>
            </div>

            <!-- 2. Phone -->
            <div class="modal-form-group">
              <label for="sub-phone">${isHi ? 'मोबाइल / व्हाट्सएप नंबर (Phone) *' : 'Phone / WhatsApp Number *'}</label>
              <div class="modal-input-wrap">
                <span class="modal-input-icon">📱</span>
                <input type="tel" id="sub-phone" class="modal-input" required placeholder="${isHi ? 'उदा. +91 98765 43210' : 'e.g. +91 98765 43210'}">
              </div>
            </div>

            <!-- 3. Email -->
            <div class="modal-form-group">
              <label for="sub-email">${isHi ? 'ईमेल पता (Email Address) *' : 'Email Address *'}</label>
              <div class="modal-input-wrap">
                <span class="modal-input-icon">✉️</span>
                <input type="email" id="sub-email" class="modal-input" required placeholder="${isHi ? 'उदा. rameshwar@gmail.com' : 'e.g. rameshwar@gmail.com'}">
              </div>
            </div>

            <!-- 4. Format Selection -->
            <div class="modal-form-group">
              <label>${isHi ? 'वांछित संस्करण (Subscription Mode)' : 'Preferred Edition'}</label>
              <div class="modal-radio-group">
                <label class="modal-radio-label">
                  <input type="radio" name="sub_edition" value="digital" checked>
                  <span>🌐 ${isHi ? 'डिजिटल PDF (निःशुल्क)' : 'Digital PDF (Free)'}</span>
                </label>
                <label class="modal-radio-label">
                  <input type="radio" name="sub_edition" value="print">
                  <span>📬 ${isHi ? 'मुद्रित डाक प्रति' : 'Printed Postal'}</span>
                </label>
              </div>
            </div>

            <button type="submit" class="modal-submit-btn" id="sub-submit-btn">
              <span>🚀</span> <span>${isHi ? 'सदस्यता की पुष्टि करें' : 'Confirm Subscription'}</span>
            </button>
          </form>

          <!-- Success View (Shown upon submission) -->
          <div class="modal-success-state" id="subscribe-success">
            <div class="modal-success-icon">🎉</div>
            <h4 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--g-text-primary); margin-bottom:0.5rem;">
              ${isHi ? 'सदस्यता सफलतापूर्वक दर्ज हुई!' : 'Subscription Confirmed!'}
            </h4>
            <p id="sub-success-message" style="color:var(--g-text-secondary); font-size:0.98rem; line-height:1.65; margin-bottom:1.5rem;">
              ${isHi ? 'धन्यवाद! वर्तमान अंक (अंक १४) की डिजिटल प्रति आपके ईमेल और व्हाट्सएप पर भेज दी गई है।' : 'Thank you! Your monthly subscription is now active. Current Issue 14 link has been sent to your email.'}
            </p>
            <div style="background:var(--c-primary-light); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.5rem; text-align:left; font-size:0.88rem; color:var(--c-primary);">
              <div>✅ <strong>${isHi ? 'ग्राहक नाम:' : 'Subscriber:'}</strong> <span id="sub-res-name">-</span></div>
              <div>📱 <strong>${isHi ? 'व्हाट्सएप:' : 'WhatsApp:'}</strong> <span id="sub-res-phone">-</span></div>
              <div>✉️ <strong>${isHi ? 'ईमेल:' : 'Email:'}</strong> <span id="sub-res-email">-</span></div>
            </div>
            <button type="button" class="btn-primary" id="sub-success-close" style="width:100%;">
              <span>📖</span> <span>${isHi ? 'पत्रिका वाचन जारी रखें' : 'Continue Reading'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- =====================================================================
         MODAL 2: QUICK ISSUE EXCERPT READER MODAL
         ===================================================================== -->
    <div class="modal-overlay" id="excerpt-modal" role="dialog" aria-modal="true" aria-labelledby="excerpt-modal-title">
      <div class="modal-dialog excerpt-modal-dialog">
        <div class="modal-header">
          <button type="button" class="modal-close-btn" id="excerpt-modal-close" aria-label="Close modal">✕</button>
          <span class="modal-eyebrow" id="excerpt-modal-eyebrow">✦ ARCHIVAL MONOGRAPH ✦</span>
          <h3 class="modal-title" id="excerpt-modal-title">Issue Excerpt</h3>
          <div id="excerpt-modal-lead" style="font-size:0.92rem; color:var(--c-blue); font-weight:600; margin-top:0.35rem;"></div>
        </div>
        <div class="excerpt-modal-body">
          <div style="display:flex; gap:1.5rem; flex-wrap:wrap; margin-bottom:1.5rem; align-items:center;">
            <div style="width:120px; flex-shrink:0; border-radius:4px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.2);">
              <img id="excerpt-modal-cover" src="/src/assets/images/mag-issue-13.svg" alt="Cover" style="width:100%; display:block;">
            </div>
            <div style="flex:1; min-width:220px;">
              <div id="excerpt-modal-meta" style="font-size:0.85rem; color:var(--c-primary); font-weight:700; margin-bottom:0.5rem;"></div>
              <p id="excerpt-modal-text" style="font-size:1.02rem; color:var(--g-text-secondary); line-height:1.75;"></p>
            </div>
          </div>
          <div style="border-top:1px solid var(--g-border-subtle); padding-top:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
            <span style="font-size:0.85rem; color:var(--g-text-muted);">✦ Chhattisgadhiya Cloud Archival Research</span>
            <button type="button" class="btn-primary open-subscribe-btn" data-open-subscribe="true" style="font-size:0.85rem; padding:0.45rem 1rem;">
              <span>★</span> <span>${isHi ? 'सम्पूर्ण अंक मंगाएं' : 'Subscribe to Full Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: siteData.magazine.name[lang],
      desc: "Chhattisgadhiya Cloud Monthly Cultural Magazine with current issue spotlight, previous issue archives, and subscription popup",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'मासिक पत्रिका' : 'Magazine', href: canonical }],
      extraScripts: `
      <script type="module">
        import { siteData } from '/src/data/content.js';
        import { HybridMagazineReader } from '/src/reader/hybrid-reader.js';

        function initMagazine() {
          // Mount Flip-book Reader with rich structured pages
          const articles = siteData.magazine.currentIssue.articles.map((art, idx) => ({
            pageNumber: idx + 1,
            title: art.title['${lang}'],
            author: art.author['${lang}'],
            category: art.category['${lang}'],
            date: art.date,
            excerpt: art.excerpt['${lang}'],
            content: art.content['${lang}']
          }));

          window.magazineReaderInstance = new HybridMagazineReader('magazine-reader-mount', {
            lang: '${lang}',
            mode: 'flip',
            pages: articles
          });

          // ==========================================
          // ARTICLE FILTER TABS & TOOLBAR LOGIC
          // ==========================================
          const filterPills = document.querySelectorAll('.article-filter-pill');
          filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
              filterPills.forEach(p => {
                p.classList.remove('active');
                p.setAttribute('aria-selected', 'false');
              });
              pill.classList.add('active');
              pill.setAttribute('aria-selected', 'true');
              const targetId = pill.getAttribute('data-article-target');
              if (targetId === 'all') {
                const firstCard = document.querySelector('.magazine-article-card');
                if (firstCard) firstCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  targetEl.classList.remove('highlighted-article');
                  void targetEl.offsetWidth;
                  targetEl.classList.add('highlighted-article');
                }
              }
            });
          });

          // Citation Copy Buttons
          document.querySelectorAll('[data-cite]').forEach(btn => {
            btn.addEventListener('click', () => {
              const text = btn.getAttribute('data-cite');
              if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(() => {
                  const oldHtml = btn.innerHTML;
                  btn.innerHTML = '<span>✓</span> <span>' + ('${isHi}' === 'true' ? 'कॉपी हो गया!' : 'Citation Copied!') + '</span>';
                  btn.style.color = '#1E8E3E';
                  btn.style.borderColor = '#1E8E3E';
                  setTimeout(() => {
                    btn.innerHTML = oldHtml;
                    btn.style.color = '';
                    btn.style.borderColor = '';
                  }, 2200);
                });
              }
            });
          });

          // Audio Excerpt Simulation Buttons
          document.querySelectorAll('[data-audio]').forEach(btn => {
            btn.addEventListener('click', () => {
              const isPlaying = btn.classList.toggle('playing');
              if (isPlaying) {
                btn.innerHTML = '<span>⏸️</span> <span>' + ('${isHi}' === 'true' ? 'चल रहा है...' : 'Playing Excerpt...') + '</span>';
                btn.style.color = 'var(--c-primary)';
                btn.style.borderColor = 'var(--c-primary)';
                setTimeout(() => {
                  btn.classList.remove('playing');
                  btn.innerHTML = '<span>🔊</span> <span>' + ('${isHi}' === 'true' ? 'ऑडियो अंश' : 'Audio Excerpt') + '</span>';
                  btn.style.color = '';
                  btn.style.borderColor = '';
                }, 4000);
              } else {
                btn.innerHTML = '<span>🔊</span> <span>' + ('${isHi}' === 'true' ? 'ऑडियो अंश' : 'Audio Excerpt') + '</span>';
                btn.style.color = '';
                btn.style.borderColor = '';
              }
            });
          });

          // Jump to 3D Flip-Book Page Buttons
          document.querySelectorAll('[data-reader-jump]').forEach(btn => {
            btn.addEventListener('click', () => {
              const page = parseInt(btn.getAttribute('data-reader-jump'), 10);
              const readerSection = document.getElementById('interactive-reader-section') || document.getElementById('magazine-reader-mount');
              if (readerSection) {
                readerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                if (window.magazineReaderInstance && !isNaN(page)) {
                  setTimeout(() => window.magazineReaderInstance.goToPage(page), 400);
                }
              }
            });
          });

          // ==========================================
          // SUBSCRIBE MODAL LOGIC (NAME, PHONE, EMAIL)
          // ==========================================
          const subModal = document.getElementById('subscribe-modal');
          const subClose = document.getElementById('sub-modal-close');
          const subForm = document.getElementById('subscribe-form');
          const subSuccess = document.getElementById('subscribe-success');
          const subSuccessClose = document.getElementById('sub-success-close');
          const openSubBtns = document.querySelectorAll('[data-open-subscribe], .open-subscribe-btn');

          function openSubscribeModal() {
            if (subModal) {
              subModal.classList.add('active');
              if (subForm) subForm.style.display = 'block';
              if (subSuccess) subSuccess.style.display = 'none';
              const nameInput = document.getElementById('sub-name');
              if (nameInput) setTimeout(() => nameInput.focus(), 100);
            }
          }

          function closeSubscribeModal() {
            if (subModal) subModal.classList.remove('active');
          }

          openSubBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              openSubscribeModal();
            });
          });

          if (subClose) subClose.addEventListener('click', closeSubscribeModal);
          if (subSuccessClose) subSuccessClose.addEventListener('click', closeSubscribeModal);
          if (subModal) {
            subModal.addEventListener('click', (e) => {
              if (e.target === subModal) closeSubscribeModal();
            });
          }

          // Form Submit Handler with Name, Phone, Email
          if (subForm) {
            subForm.addEventListener('submit', (e) => {
              e.preventDefault();
              const name = document.getElementById('sub-name').value.trim();
              const phone = document.getElementById('sub-phone').value.trim();
              const email = document.getElementById('sub-email').value.trim();

              if (!name || !phone || !email) {
                alert('${isHi ? "कृपया सभी आवश्यक जानकारी (नाम, फोन, ईमेल) भरें।" : "Please fill in all required fields (Name, Phone, Email)."}');
                return;
              }

              // Update personalized feedback in success view
              const resName = document.getElementById('sub-res-name');
              const resPhone = document.getElementById('sub-res-phone');
              const resEmail = document.getElementById('sub-res-email');
              if (resName) resName.textContent = name;
              if (resPhone) resPhone.textContent = phone;
              if (resEmail) resEmail.textContent = email;

              // Transition to success state
              subForm.style.display = 'none';
              if (subSuccess) subSuccess.style.display = 'block';
            });
          }

          // ==========================================
          // EXCERPT READER MODAL LOGIC
          // ==========================================
          const excerptModal = document.getElementById('excerpt-modal');
          const excerptClose = document.getElementById('excerpt-modal-close');
          const excerptBtns = document.querySelectorAll('.open-excerpt-btn');

          function openExcerptModal(btn) {
            if (!excerptModal) return;
            const title = btn.getAttribute('data-issue-title') || 'Archival Issue';
            const number = btn.getAttribute('data-issue-number') || '';
            const month = btn.getAttribute('data-issue-month') || '';
            const lead = btn.getAttribute('data-issue-lead') || '';
            const excerpt = btn.getAttribute('data-issue-excerpt') || '';
            const cover = btn.getAttribute('data-issue-cover') || '';

            document.getElementById('excerpt-modal-title').textContent = title;
            document.getElementById('excerpt-modal-eyebrow').textContent = number + ' • ' + month;
            document.getElementById('excerpt-modal-lead').textContent = '📌 ' + lead;
            document.getElementById('excerpt-modal-text').textContent = excerpt;
            document.getElementById('excerpt-modal-meta').textContent = '📅 ' + month + ' • ' + number;
            const coverImg = document.getElementById('excerpt-modal-cover');
            if (coverImg && cover) coverImg.src = cover;

            excerptModal.classList.add('active');
          }

          function closeExcerptModal() {
            if (excerptModal) excerptModal.classList.remove('active');
          }

          excerptBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
              e.preventDefault();
              openExcerptModal(btn);
            });
          });

          if (excerptClose) excerptClose.addEventListener('click', closeExcerptModal);
          if (excerptModal) {
            excerptModal.addEventListener('click', (e) => {
              if (e.target === excerptModal) closeExcerptModal();
            });
          }

          // Escape key dismisses modals
          document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
              closeSubscribeModal();
              closeExcerptModal();
            }
          });
        }

        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', initMagazine);
        } else {
          initMagazine();
        }
      </script>
      `
    });
    fs.writeFileSync(path.join(__dirname, lang, 'magazine', 'index.html'), doc);
  }

  // 7. BLOG
  {
    const canonical = `/${lang}/blog/`;
    const alt = `/${altLang}/blog/`;

    const blogPageBanner = siteData.blogPageBanner ? `
      <div class="page-banner-creative" style="max-width:920px; margin:0 auto 2.5rem auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid var(--g-border-subtle);">
        <img src="${siteData.blogPageBanner}" alt="Blog Banner" style="width:100%; max-height:360px; object-fit:cover; display:block;">
      </div>` : '';

    const postsHtml = siteData.blog.posts.map(p => {
      const coverArt = p.coverImage || p.image || '';
      const bannerEl = coverArt ? `
        <div style="width:100%; max-height:280px; border-radius:12px; overflow:hidden; margin-bottom:1.25rem; border:1px solid var(--g-border-subtle); background:var(--g-surface-subtle);">
          <img src="${coverArt}" alt="${p.title[lang]}" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>` : '';
      return `
      <article class="production-card surface-card" style="margin-bottom:2rem;">
        ${bannerEl}
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
          <span style="font-size:0.75rem; font-weight:800; color:var(--c-primary); text-transform:uppercase; letter-spacing:0.08em;">${p.category}</span>
          <span style="font-size:0.85rem; color:var(--g-text-muted);">${p.date}</span>
        </div>
        <h2 style="font-family:var(--font-serif); font-size:1.85rem; color:var(--g-text-primary); margin-bottom:0.6rem;">${p.title[lang]}</h2>
        <div style="font-size:0.85rem; color:var(--g-text-secondary); margin-bottom:1.5rem;">
          By <strong>${p.author}</strong> • <em>301 Permanent Redirect Preserved from chhattisgadiyacloud.blogspot.com</em>
        </div>
        <p style="color:var(--g-text-secondary); font-size:1.05rem; line-height:1.8; margin-bottom:1.5rem;">
          ${p.excerpt[lang]}
        </p>
        <div style="background:var(--g-surface-subtle); padding:1.25rem 1.5rem; border-radius:var(--radius-sm); line-height:1.85; color:var(--g-text-primary); border-left:3px solid var(--c-blue);">
          ${p.content[lang]}
        </div>
      </article>
      `;
    }).join('\n');

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ Rehearsal Notes & Field Dispatches ✦</span>
        <h1 class="page-title">${isHi ? 'संस्था ब्लॉग' : 'Organisation Blog'}</h1>
        <p class="page-description">${siteData.blog.migratedNotice[lang]}</p>
      </div>
    </div>

    <div class="container page-content-container" style="max-width:920px;">
      ${blogPageBanner}
      ${postsHtml}
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'ब्लॉग' : 'Blog',
      desc: "Chhattisgadhiya Cloud blog migrated from blogspot preserving 301 redirects",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'ब्लॉग' : 'Blog', href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'blog', 'index.html'), doc);
  }

  // 8. ABOUT US
  {
    const canonical = `/${lang}/about/`;
    const alt = `/${altLang}/about/`;

    const aboutPageBanner = (siteData.aboutPageBanner || siteData.about?.bannerImage) ? `
      <div class="page-banner-creative" style="max-width:1140px; margin:0 auto 2.5rem auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid var(--g-border-subtle);">
        <img src="${siteData.aboutPageBanner || siteData.about?.bannerImage}" alt="About Chhattisgadhiya Cloud" style="width:100%; max-height:380px; object-fit:cover; display:block;">
      </div>` : '';

    const culturalRootsArt = siteData.about?.culturalRootsImage ? `
      <div style="margin-top:1.5rem; border-radius:12px; overflow:hidden; max-height:320px; border:1px solid var(--g-border-subtle); box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <img src="${siteData.about.culturalRootsImage}" alt="Cultural Roots Artwork" style="width:100%; height:100%; object-fit:cover; display:block;">
      </div>` : '';

    const leadershipThemes = [
      { color: '#C83200', bg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF7ED 100%)', badgeEn: 'Founder & Artistic Director', badgeHi: 'संस्थापक एवं कला निर्देशक', badgeBg: '#FFEDD5', badgeColor: '#9A3412', icon: '🎭' },
      { color: '#7C3AED', bg: 'linear-gradient(180deg, #FFFFFF 0%, #F5F3FF 100%)', badgeEn: 'Festival Curator & Scenography', badgeHi: 'उत्सव संयोजक एवं मंच परिकल्पना', badgeBg: '#EDE9FE', badgeColor: '#5B21B6', icon: '🏛️' },
      { color: '#D97706', bg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFBEB 100%)', badgeEn: 'Folk Music & Nacha Director', badgeHi: 'लोक संगीत एवं नाचा विधा प्रमुख', badgeBg: '#FEF3C7', badgeColor: '#92400E', icon: '🪕' }
    ];

    const teamHtml = siteData.about.team.map((m, idx) => {
      const theme = leadershipThemes[idx % leadershipThemes.length];
      const avatarSrc = m.image || m.avatar || '';
      const avatarEl = avatarSrc ? `
        <div style="width:72px; height:72px; border-radius:50%; overflow:hidden; border:3px solid ${theme.color}; margin-bottom:1.15rem; box-shadow:0 6px 16px ${theme.color}30;">
          <img src="${avatarSrc}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>` : `
        <div style="width:64px; height:64px; border-radius:50%; background:${theme.badgeBg}; border:2.5px solid ${theme.color}; display:flex; align-items:center; justify-content:center; color:${theme.color}; font-size:1.8rem; margin-bottom:1.15rem; box-shadow:0 4px 14px ${theme.color}25;">
          ${m.icon || theme.icon}
        </div>`;
      return `
      <div class="leadership-card" style="background:${theme.bg}; border-color:${theme.color}35;">
        <div class="leadership-card-top-bar" style="background:${theme.color};"></div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          ${avatarEl}
          <span style="display:inline-block; padding:0.25rem 0.75rem; border-radius:9999px; font-size:0.75rem; font-weight:700; letter-spacing:0.04em; text-transform:uppercase; background:${theme.badgeBg}; color:${theme.badgeColor}; border:1px solid ${theme.color}40;">
            ${isHi ? theme.badgeHi : theme.badgeEn}
          </span>
        </div>
        <h3 style="font-family:var(--font-serif); font-size:1.5rem; font-weight:700; color:var(--g-text-primary); margin-bottom:0.3rem;">${m.name}</h3>
        <div style="font-size:0.92rem; font-weight:700; color:${theme.color}; margin-bottom:0.85rem;">${m.role[lang]}</div>
        <p style="font-size:0.94rem; color:var(--g-text-secondary); line-height:1.75; margin-top:auto;">${m.bio[lang]}</p>
      </div>
      `;
    }).join('\n');

    const membersList = siteData.about.members || [];
    const membersHtml = membersList.map(m => {
      const color = m.color || '#EA580C';
      const avatarSrc = m.image || m.avatar || '';
      const avatarEl = avatarSrc ? `
        <div style="width:54px; height:54px; border-radius:14px; overflow:hidden; border:2px solid ${color}; margin-bottom:0.85rem; box-shadow:0 4px 10px ${color}25;">
          <img src="${avatarSrc}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover; display:block;">
        </div>` : `
        <div class="ensemble-icon-circle" style="background:${color}15; color:${color}; border:1.5px solid ${color}35;">
          ${m.icon || '🎭'}
        </div>`;
      const badgeText = m.badge ? (m.badge[lang] || m.badge.en) : (isHi ? 'नाट्य दल' : 'Ensemble');

      return `
      <div class="ensemble-card" style="border-color:${color}25; background:linear-gradient(180deg, #FFFFFF 0%, ${color}06 100%);">
        <div class="ensemble-card-top-bar" style="background:${color};"></div>
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          ${avatarEl}
          <span class="ensemble-badge" style="background:${color}15; color:${color}; border:1px solid ${color}35;">
            ${badgeText}
          </span>
        </div>
        <h4 class="ensemble-name">${m.name}</h4>
        <div class="ensemble-role" style="color:${color};">${m.role[lang]}</div>
        <p class="ensemble-bio">${m.bio[lang]}</p>
      </div>
      `;
    }).join('\n');

    const content = `
    <div class="page-header about-page-header">
      <div class="container">
        <span class="about-eyebrow-pill">✦ ${isHi ? 'सांस्कृतिक दर्शन एवं संस्था परिचय' : 'Artistic Ethos & Institutional Heritage'} ✦</span>
        <h1 class="page-title" style="font-family:var(--font-serif); font-weight:800; font-size:clamp(2.2rem, 4vw, 3.2rem);">${isHi ? 'हमारे बारे में' : 'About Chhattisgadhiya Cloud'}</h1>
        <p class="page-description" style="max-width:820px; font-size:1.12rem; line-height:1.8; color:var(--g-text-secondary);">
          ${isHi ? 'छत्तीसगढ़िया क्लाउड — रंगमंच, राष्ट्रीय समारोहों, बाल कार्यशालाओं और वैचारिक पत्रिकाओं का सृजन करने वाला एक स्वायत्त सांस्कृतिक संस्थान, जो माटी की जीवंत धरोहर को समकालीन भारतीय मंचों तक पहुँचाता है।' : 'A cultural institution producing theatre, national festivals, youth workshops, and intellectual publications — bringing the living spirit of Chhattisgarhi soil to national and global stages.'}
        </p>

        <!-- Subpage Stats Chips with Semantic Earth Tones -->
        <div class="subpage-stats-bar" style="margin-top:1.75rem;">
          <div class="subpage-stat-chip about-stat-chip-orange">🏛️ <strong>${isHi ? 'पंजीकृत सांस्कृतिक न्यास' : 'Regd. Cultural Trust'}</strong></div>
          <div class="subpage-stat-chip about-stat-chip-green">📍 <strong>${isHi ? 'जशपुर व रायपुर (छ.ग.)' : 'Jashpur & Raipur (C.G.)'}</strong></div>
          <div class="subpage-stat-chip about-stat-chip-amber">⏳ <strong>10+ ${isHi ? 'वर्षों की कला साधना' : 'Years Artistic Practice'}</strong></div>
          <div class="subpage-stat-chip about-stat-chip-blue">🤝 <strong>${isHi ? 'संस्कृति विभाग द्वारा समर्थित' : 'Dept. of Culture Supported'}</strong></div>
        </div>
      </div>
    </div>

    <div class="container page-content-container">
      ${aboutPageBanner}

      <!-- Mission & Vision Dual Themed Cards -->
      <div class="responsive-two-col" style="margin-bottom:4rem; gap:1.75rem;">
        <div class="about-mission-card">
          <div style="width:52px; height:52px; border-radius:14px; background:#FFEDD5; color:#EA580C; display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin-bottom:1.25rem; border:1px solid #FDBA74; box-shadow:0 4px 12px rgba(234,88,12,0.15);">
            🎯
          </div>
          <h2 style="font-family:var(--font-serif); font-size:1.75rem; color:#9A3412; margin-bottom:0.75rem; font-weight:700;">${isHi ? 'हमारा ध्येय (Mission)' : 'Our Mission'}</h2>
          <p style="color:var(--g-text-secondary); line-height:1.85; font-size:1.02rem;">${siteData.about.mission[lang]}</p>
        </div>

        <div class="about-vision-card">
          <div style="width:52px; height:52px; border-radius:14px; background:#E0F2FE; color:#0284C7; display:flex; align-items:center; justify-content:center; font-size:1.6rem; margin-bottom:1.25rem; border:1px solid #7DD3FC; box-shadow:0 4px 12px rgba(2,132,199,0.15);">
            👁️
          </div>
          <h2 style="font-family:var(--font-serif); font-size:1.75rem; color:#075985; margin-bottom:0.75rem; font-weight:700;">${isHi ? 'हमारी दृष्टि (Vision)' : 'Our Vision'}</h2>
          <p style="color:var(--g-text-secondary); line-height:1.85; font-size:1.02rem;">${siteData.about.vision[lang]}</p>
        </div>
      </div>

      <!-- The Philosophical Triad (Three Distinct Colorful Pillars) -->
      <div style="margin-bottom:4.5rem;">
        <div style="text-align:center; max-width:700px; margin:0 auto 2.5rem auto;">
          <span class="about-eyebrow-pill" style="background:#FEF3C7; color:#B45309; border-color:#FDE68A;">✦ ${isHi ? 'तीन मौलिक सांस्कृतिक स्तंभ' : 'The Cultural Triad'} ✦</span>
          <h2 style="font-family:var(--font-serif); font-size:clamp(1.9rem, 3.2vw, 2.5rem); color:var(--g-text-primary); margin-bottom:0.5rem; font-weight:800;">
            ${isHi ? 'हमारे कला-सृजन की तीन बुनियादें' : 'The Three Pillars of Our Dramaturgy'}
          </h2>
          <p style="color:var(--g-text-secondary); font-size:1rem; line-height:1.65;">
            ${isHi ? 'माटी की सुगंध, मंच का प्रयोग और नई पीढ़ी का सशक्तिकरण — हमारी प्रत्येक प्रस्तुति इन्हीं सूत्रों से बुनी जाती है।' : 'Organic soil, contemporary scenography, and youth empowerment form the three living axes of our work.'}
          </p>
        </div>

        <div class="about-triad-grid">
          <div class="about-triad-card triad-maati">
            <div class="triad-number">01</div>
            <h3 style="font-family:var(--font-serif); font-size:1.45rem; color:#14532D; margin-bottom:0.65rem; font-weight:700;">
              🌱 ${isHi ? 'माटी (The Living Soil)' : 'Maati (The Soil)'}
            </h3>
            <p style="color:var(--g-text-secondary); font-size:0.96rem; line-height:1.75;">
              ${isHi ? 'नाचा, गम्मत, पंथी नृत्य और सरगुजा-बस्तर की वाचिक लोकगाथाओं की जड़ों से सीधा जीवंत जुड़ाव।' : 'Direct organic roots in the oral epics, Nacha folk theatre, and ritual rhythms of rural Chhattisgarh.'}
            </p>
          </div>

          <div class="about-triad-card triad-prayog">
            <div class="triad-number">02</div>
            <h3 style="font-family:var(--font-serif); font-size:1.45rem; color:#881337; margin-bottom:0.65rem; font-weight:700;">
              🎭 ${isHi ? 'प्रयोग (Contemporary Staging)' : 'Prayog (The Stage)'}
            </h3>
            <p style="color:var(--g-text-secondary); font-size:0.96rem; line-height:1.75;">
              ${isHi ? 'पारंपरिक लोक रूपों का आधुनिक नाट्यशास्त्र, बहुआयामी प्रकाश विन्यास और राष्ट्रीय मंचों पर परिष्कृत रूपांतरण।' : 'Adapting traditional forms into avant-garde scenography, physical theatre, and national repertory showcases.'}
            </p>
          </div>

          <div class="about-triad-card triad-shilp">
            <div class="triad-number">03</div>
            <h3 style="font-family:var(--font-serif); font-size:1.45rem; color:#78350F; margin-bottom:0.65rem; font-weight:700;">
              🎨 ${isHi ? 'शिल्प (Youth & Community)' : 'Shilp (Community Craft)'}
            </h3>
            <p style="color:var(--g-text-secondary); font-size:0.96rem; line-height:1.75;">
              ${isHi ? 'उल्लास समर कैम्प एवं मासिक पत्रिका के माध्यम से नई पीढ़ी को कला में प्रशिक्षित व सशक्त करना।' : 'Democratising theatre through free youth residencies, puppet craft, and critical public scholarship.'}
            </p>
          </div>
        </div>
      </div>

      <!-- Cultural Roots Spotlight Canvas with Festive Folk Badges -->
      <div class="about-roots-canvas" style="margin-bottom:4.5rem;">
        <span class="about-eyebrow-pill" style="background:#FFEDD5; color:#C2410C; border-color:#FDBA74;">✦ ${isHi ? 'धरती से अटूट नाता' : 'Rooted in the Living Soil'} ✦</span>
        <h2 style="font-family:var(--font-serif); font-size:clamp(1.8rem, 3vw, 2.3rem); color:#78350F; margin-bottom:1rem; margin-top:0.5rem; font-weight:800;">
          ${isHi ? 'छत्तीसगढ़ी लोक परंपरा एवं हमारी नाटकीय भाषा' : 'Connection to Chhattisgarhi Culture'}
        </h2>
        <p style="color:#451A03; font-size:1.08rem; line-height:1.85; max-width:920px; font-weight:500;">
          ${siteData.about.culturalConnection[lang]}
        </p>

        <!-- Cultural Heritage Badges -->
        <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-top:1.5rem;">
          <span class="roots-pill-badge" style="background:#FEF3C7; color:#92400E; border:1px solid #F59E0B;">
            🌾 ${isHi ? 'नाचा एवं गम्मत (लोक व्यंग्य)' : 'Nacha & Gammat Folk Satire'}
          </span>
          <span class="roots-pill-badge" style="background:#FEE2E2; color:#991B1B; border:1px solid #F87171;">
            🥁 ${isHi ? 'पंथी एवं करमा (चक्रीय लयबद्ध गति)' : 'Panthi & Karma Kinetic Beats'}
          </span>
          <span class="roots-pill-badge" style="background:#FFEDD5; color:#9A3412; border:1px solid #FB923C;">
            🪔 ${isHi ? 'ढोकरा व भित्ति मंच-शिल्प' : 'Dhokra & Bamboo Scenography'}
          </span>
          <span class="roots-pill-badge" style="background:#DCFCE7; color:#166534; border:1px solid #4ADE80;">
            🌿 ${isHi ? 'सरगुजा व बस्तर वाचिक लोकगाथा' : 'Tribal Oral Ballads & Lore'}
          </span>
        </div>

        ${culturalRootsArt}
      </div>

      <!-- Core Leadership & Artists -->
      <div style="margin-bottom:4.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem; margin-bottom:2rem;">
          <div>
            <span class="about-eyebrow-pill" style="background:#FFE4E6; color:#BE123C; border-color:#FDA4AF;">✦ ${isHi ? 'रचनात्मक नेतृत्व' : 'Creative Leadership'} ✦</span>
            <h2 style="font-family:var(--font-serif); font-size:clamp(1.9rem, 3.2vw, 2.5rem); color:var(--g-text-primary); margin-top:0.25rem; font-weight:800;">
              ${isHi ? 'संस्था नेतृत्व एवं प्रमुख रंगकर्मी' : 'Our Directors & Artists'}
            </h2>
          </div>
          <span style="font-size:0.92rem; color:var(--g-text-secondary); font-weight:600;">
            ${siteData.about.team.length} ${isHi ? 'प्रमुख निर्देशक व विशेषज्ञ' : 'Core Curators & Directors'}
          </span>
        </div>

        <div class="leadership-grid">
          ${teamHtml}
        </div>
      </div>

      <!-- Brand New "Our Team" Repertory Ensemble Section -->
      <div style="margin-bottom:4.5rem;">
        <div style="display:flex; justify-content:space-between; align-items:flex-end; flex-wrap:wrap; gap:1rem; margin-bottom:2rem;">
          <div>
            <span class="about-eyebrow-pill" style="background:#EDE9FE; color:#6D28D9; border-color:#C4B5FD;">✦ ${isHi ? 'नाट्य दल एवं तकनीकी शिल्पी' : 'Repertory Ensemble & Production Crew'} ✦</span>
            <h2 style="font-family:var(--font-serif); font-size:clamp(1.9rem, 3.2vw, 2.5rem); color:var(--g-text-primary); margin-top:0.25rem; font-weight:800;">
              ${isHi ? 'हमारा दल' : 'Our Team'}
            </h2>
          </div>
          <span style="font-size:0.92rem; color:var(--g-text-secondary); font-weight:600;">
            ${membersList.length} ${isHi ? 'कलाकार, शिल्पी एवं शोधकर्मी' : 'Ensemble Performers & Technicians'}
          </span>
        </div>

        <div class="about-ensemble-grid">
          ${membersHtml}
        </div>
      </div>

      <!-- Historical Journey Milestones (Color-Coded Timeline) -->
      <div style="margin-bottom:2rem;">
        <span class="about-eyebrow-pill" style="background:#E0F2FE; color:#0369A1; border-color:#7DD3FC;">✦ ${isHi ? 'ऐतिहासिक यात्रा' : 'Our Journey'} ✦</span>
        <h2 style="font-family:var(--font-serif); font-size:clamp(1.9rem, 3.2vw, 2.5rem); color:var(--g-text-primary); margin-bottom:1.5rem; font-weight:800;">
          ${isHi ? 'छत्तीसगढ़िया क्लाउड के प्रमुख मील के पत्थर' : 'Milestones in Cultural Preservation'}
        </h2>

        <div class="about-milestone-colorful">
          <div class="milestone-colorful-item" style="--milestone-color:#EA580C;">
            <span class="milestone-year-badge" style="background:#FFEDD5; color:#C2410C; border:1px solid #FDBA74;">2014 • ${isHi ? 'संस्था स्थापना' : 'Trust Foundation'}</span>
            <h4 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.35rem; font-weight:700;">
              ${isHi ? 'संस्था की स्थापना एवं प्रथम लोक रंगशाला (जशपुर)' : 'Founding & First Grassroots Folk Workshop (Jashpur)'}
            </h4>
            <p style="color:var(--g-text-secondary); font-size:0.95rem; line-height:1.75;">
              ${isHi ? 'पारंपरिक नाचा कलाकारों एवं आदिवासी युवाओं को जोड़कर एक गैर-व्यावसायिक सांस्कृतिक संस्था का गठन किया गया।' : 'Established as a registered non-profit cultural trust to document oral Chhattisgarhi songs and train rural youth.'}
            </p>
          </div>

          <div class="milestone-colorful-item" style="--milestone-color:#D97706;">
            <span class="milestone-year-badge" style="background:#FEF3C7; color:#B45309; border:1px solid #FCD34D;">2018 • ${isHi ? 'जशरंग राष्ट्रीय महोत्सव' : 'Jashrang National Festival'}</span>
            <h4 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.35rem; font-weight:700;">
              ${isHi ? 'जशरंग राष्ट्रीय नाट्य समारोह का शुभारंभ' : 'Launch of Jashrang National Theatre Festival'}
            </h4>
            <p style="color:var(--g-text-secondary); font-size:0.95rem; line-height:1.75;">
              ${isHi ? 'राष्ट्रीय स्तर के प्रसिद्ध नाट्य दलों और निर्देशकों को जशपुर के खुले मंच पर आमंत्रित करने की शुरुआत हुई, जिसमें प्रतिवर्ष 12,000+ दर्शक जुड़ते हैं।' : 'Commenced annual winter festival hosting national repertories, tribal bards, and 12,000+ spectators.'}
            </p>
          </div>

          <div class="milestone-colorful-item" style="--milestone-color:#059669;">
            <span class="milestone-year-badge" style="background:#DCFCE7; color:#15803D; border:1px solid #86EFAC;">2022 • ${isHi ? 'रंग संदेश एवं अभिलेखागार' : 'Research & Archive'}</span>
            <h4 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.35rem; font-weight:700;">
              ${isHi ? 'मासिक विचार पत्रिका एवं डिजिटल अभिलेखागार' : 'Monthly Magazine & Digital Cultural Archive'}
            </h4>
            <p style="color:var(--g-text-secondary); font-size:0.95rem; line-height:1.75;">
              ${isHi ? '१४ अंकों का नियमित प्रकाशन, ISSN पंजीकरण एवं लोक रंगमंच के दुर्लभ संदर्भों को डिजिटल स्वरूप में संरक्षित करने का कार्य।' : 'Published 14 volumes of critical essays on folk scenography, tribal oral poetry, and theatrical reform.'}
            </p>
          </div>

          <div class="milestone-colorful-item" style="--milestone-color:#0284C7;">
            <span class="milestone-year-badge" style="background:#E0F2FE; color:#0369A1; border:1px solid #7DD3FC;">2026 • ${isHi ? 'डिजिटल विस्तार एवं राष्ट्रीय रंगमंच' : 'Global & National Outreach'}</span>
            <h4 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.35rem; font-weight:700;">
              ${isHi ? 'डिजिटल नाट्य प्रदर्शन एवं बहुभाषी सांस्कृतिक प्रसार' : 'Digital Repertory & Bilingual Cultural Outreach'}
            </h4>
            <p style="color:var(--g-text-secondary); font-size:0.95rem; line-height:1.75;">
              ${isHi ? 'छत्तीसगढ़िया क्लाउड के नाटकों और पत्रिकाओं का राष्ट्रीय राजधानी एवं वैश्विक मंचों पर प्रदर्शन और डिजिटल अभिलेखागार का विस्तार।' : 'Expanded bilingual digital repository, touring productions across metro circuits, and inter-state youth residencies.'}
            </p>
          </div>
        </div>
      </div>

    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'हमारे बारे में' : 'About Us',
      desc: "Learn about Chhattisgadhiya Cloud's mission, team, and artistic connection to Chhattisgarh",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'परिचय' : 'About Us', href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'about', 'index.html'), doc);
  }

  // 9. CONTACT
  {
    const canonical = `/${lang}/contact/`;
    const alt = `/${altLang}/contact/`;

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ Connect & Collaborate ✦</span>
        <h1 class="page-title">${isHi ? 'संपर्क करें' : 'Contact Us'}</h1>
        <p class="page-description">
          ${isHi ? 'नाट्य प्रस्तुति आमंत्रण, महोत्सव सहभागिता, मीडिया अथवा सामान्य पूछताछ हेतु संपर्क करें।' : 'Separate routes for general enquiries, stage production bookings, festival collaborations, and press requests.'}
        </p>
      </div>
    </div>

    <div class="container page-content-container">
      <div class="responsive-two-col" style="gap:2.5rem;">
        <div class="surface-card">
          <form id="contact-enquiry-form" onsubmit="event.preventDefault(); alert('${isHi ? "संदेश सफलतापूर्वक भेजा गया! हमारी टीम शीघ्र संपर्क करेगी।" : "Enquiry submitted successfully! A team member will respond shortly."}');">
            <div class="form-group">
              <label for="f-name">${isHi ? 'पूरा नाम *' : 'Full Name *'}</label>
              <input type="text" id="f-name" class="form-input" required placeholder="${isHi ? 'आपका नाम' : 'Your full name'}">
            </div>
            <div class="form-group">
              <label for="f-email">${isHi ? 'ईमेल पता *' : 'Email Address *'}</label>
              <input type="email" id="f-email" class="form-input" required placeholder="name@example.com">
            </div>
            <div class="form-group">
              <label for="f-phone">${isHi ? 'फोन / व्हाट्सएप नंबर' : 'Phone / WhatsApp Number'}</label>
              <input type="tel" id="f-phone" class="form-input" placeholder="+91 ...">
            </div>
            <div class="form-group">
              <label for="f-type">${isHi ? 'पूछताछ का प्रकार *' : 'Enquiry Route *'}</label>
              <select id="f-type" class="form-input">
                <option value="general">${isHi ? 'सामान्य पूछताछ' : 'General Public Enquiry'}</option>
                <option value="booking">${isHi ? 'नाटक मंचन बुकिंग (आमंत्रण)' : 'Stage Production Booking (Invite a Play)'}</option>
                <option value="press">${isHi ? 'प्रेस, मीडिया व महोत्सव' : 'Press, Media & Festival Programming'}</option>
                <option value="workshop">${isHi ? 'कार्यशाला व समर कैम्प' : 'Workshop & Summer Camp Enquiry'}</option>
                <option value="magazine">${isHi ? 'मासिक पत्रिका सदस्यता' : 'Magazine Subscription Order'}</option>
              </select>
            </div>
            <div class="form-group">
              <label for="f-msg">${isHi ? 'संदेश *' : 'Message *'}</label>
              <textarea id="f-msg" rows="5" class="form-input" required placeholder="${isHi ? 'अपना विवरण यहाँ लिखें...' : 'Describe your request...'}"></textarea>
            </div>
            <button type="submit" class="btn-primary" style="width:100%;">${isHi ? 'संदेश भेजें' : 'Submit Message'}</button>
          </form>
        </div>

        <div style="display:flex; flex-direction:column; gap:2rem;">
          
          <!-- Official Physical Address & Legal Status Card -->
          <div class="contact-address-card" style="background:#FFFFFF; padding:2.2rem; border-radius:var(--radius-lg); border:1px solid var(--g-border); box-shadow:var(--shadow-card); border-top:4px solid var(--c-primary);">
            <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.85rem;">
              <span style="font-size:1.6rem; line-height:1;">📍</span>
              <h3 style="font-family:var(--font-serif); font-size:1.4rem; color:var(--g-text-primary); margin:0;">
                ${isHi ? 'मुख्यालय एवं प्रशासनिक पता' : 'Headquarters & Registered Address'}
              </h3>
            </div>
            
            <p style="color:var(--g-text-primary); font-size:1.1rem; font-weight:600; line-height:1.6; margin-bottom:0.75rem;">
              📍 Kala Kendra Marg, Jashpur / Raipur, Chhattisgarh, India.
            </p>
            
            <div style="display:inline-flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg, #FFF5F0 0%, #FED7AA 100%); color:#B45309; border:1px solid rgba(255,69,0,0.2); padding:0.45rem 1rem; border-radius:var(--radius-pill); font-size:0.85rem; font-weight:700; margin-bottom:1.25rem;">
              <span>🏛️</span>
              <span>${isHi ? 'पंजीकृत सांस्कृतिक संस्था एवं सार्वजनिक न्यास' : 'Registered Cultural Society & Public Arts Trust'}</span>
            </div>

            <div style="font-size:0.9rem; color:var(--g-text-secondary); line-height:1.7; border-top:1px solid var(--g-border-subtle); padding-top:1rem; display:flex; flex-direction:column; gap:0.45rem;">
              <div><strong>${isHi ? 'कार्यालय समय:' : 'Office & Box Office Hours:'}</strong> ${isHi ? 'सोमवार - शनिवार, प्रातः 10:00 - सायं 6:00 बजे' : 'Monday – Saturday, 10:00 AM – 6:00 PM IST'}</div>
              <div><strong>${isHi ? 'रिहर्सल स्टूडियो:' : 'Rehearsal Studio & Residency:'}</strong> ${isHi ? 'कला केंद्र प्रेक्षागृह परिसर, जशपुर' : 'Kala Kendra Auditorium Complex, Jashpur Nagar'}</div>
            </div>
          </div>

          <!-- Direct Email Routing Card -->
          <div style="background:#FFFFFF; padding:2rem; border-radius:var(--radius-lg); border:1px solid var(--g-border); box-shadow:var(--shadow-card);">
            <div style="display:flex; align-items:center; gap:0.65rem; margin-bottom:0.85rem;">
              <span style="font-size:1.5rem; line-height:1;">✉️</span>
              <h3 style="font-family:var(--font-serif); font-size:1.35rem; color:var(--g-text-primary); margin:0;">
                ${isHi ? 'विभागीय ईमेल' : 'Direct Email Routing'}
              </h3>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.5rem; font-size:0.92rem;">
              <p style="color:var(--g-text-secondary); margin:0;">
                <strong>${isHi ? 'सामान्य पूछताछ:' : 'General Inquiries:'}</strong> 
                <a href="mailto:${siteData.contact.email}" style="color:var(--c-primary); font-weight:600; text-decoration:underline;">${siteData.contact.email}</a>
              </p>
              <p style="color:var(--g-text-secondary); margin:0;">
                <strong>${isHi ? 'प्रेस व मीडिया:' : 'Press & Media:'}</strong> 
                <a href="mailto:${siteData.contact.pressEmail}" style="color:var(--c-primary); font-weight:600; text-decoration:underline;">${siteData.contact.pressEmail}</a>
              </p>
              <p style="color:var(--g-text-secondary); margin:0;">
                <strong>${isHi ? 'नाट्य मंचन बुकिंग:' : 'Tour & Booking:'}</strong> 
                <a href="mailto:${siteData.contact.bookingEmail}" style="color:var(--c-primary); font-weight:600; text-decoration:underline;">${siteData.contact.bookingEmail}</a>
              </p>
            </div>
          </div>

          <!-- Press & Media Kit Callout -->
          <div style="background:linear-gradient(135deg, #FFF5F0 0%, #FFFFFF 100%); border:1px solid rgba(255,69,0,0.22); padding:1.75rem 2rem; border-radius:var(--radius-lg); box-shadow:var(--shadow-card);">
            <h3 style="font-family:var(--font-serif); font-size:1.25rem; color:var(--c-primary); margin-bottom:0.4rem;">
              ${isHi ? 'प्रेस एवं मीडिया किट' : 'Press & Media Kit'}
            </h3>
            <p style="color:var(--g-text-secondary); font-size:0.9rem; margin-bottom:1.15rem; line-height:1.6;">
              ${isHi ? 'आधिकारिक लोगो, नाट्य प्रस्तुतियां, उच्च गुणवत्ता छायाचित्र डाउनलोड करें।' : 'Looking for brand logos, high-resolution production stills, or press statements?'}
            </p>
            <a href="/${lang}/press/" class="btn-secondary" style="font-size:0.86rem; padding:0.55rem 1.35rem;">
              ${isHi ? 'प्रेस किट पृष्ठ देखें →' : 'Visit Press & Media Kit Page →'}
            </a>
          </div>
        </div>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'संपर्क' : 'Contact Us',
      desc: "Contact Chhattisgadhiya Cloud for production bookings, festival collaborations, and press",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'संपर्क' : 'Contact', href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'contact', 'index.html'), doc);
  }

  // 10. PRESS
  {
    const canonical = `/${lang}/press/`;
    const alt = `/${altLang}/press/`;

    const pressBanner = siteData.brandCrestBanner ? `
      <div class="page-banner-creative" style="max-width:1140px; margin:0 auto 2.5rem auto; border-radius:16px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.12); border:1px solid var(--g-border-subtle);">
        <img src="${siteData.brandCrestBanner}" alt="Chhattisgadhiya Cloud Official Crest & Brand" style="width:100%; max-height:360px; object-fit:cover; display:block;">
      </div>` : '';

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ Official Media Assets ✦</span>
        <h1 class="page-title">${siteData.pressKit.title[lang]}</h1>
        <p class="page-description">${siteData.pressKit.description[lang]}</p>
      </div>
    </div>

    <div class="container page-content-container">
      ${pressBanner}
      <div class="surface-card" style="margin-bottom:2.5rem;">
        <h2 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--g-text-primary); margin-bottom:0.5rem;">Short Organisation Profile</h2>
        <p style="color:var(--g-text-secondary); line-height:1.8; margin-bottom:1.5rem;">${siteData.pressKit.boilerplateShort[lang]}</p>
        <div style="display:flex; gap:1rem; flex-wrap:wrap;">
          <button class="btn-primary" onclick="alert('Downloading vector logo assets (SVG, PNG)...');">
            📥 Download Logo Package (SVG, PNG)
          </button>
          <button class="btn-secondary" onclick="alert('Downloading production press kit stills (.zip)...');">
            📥 Download High-Resolution Stills
          </button>
        </div>
      </div>

      <div class="responsive-two-col">
        <div class="surface-card">
          <h3 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.5rem;">Official Spelling Note</h3>
          <p style="color:var(--g-text-secondary); font-size:0.92rem; line-height:1.7;">
            Official brand spelling is <strong>Chhattisgadhiya Cloud</strong> (with an "h"). Matches the owned domain <code>chhattisgadhiyacloud.org</code>.
          </p>
        </div>
        <div class="surface-card">
          <h3 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.5rem;">Press Contact</h3>
          <p style="color:var(--g-text-secondary); font-size:0.92rem; line-height:1.7;">
            ${siteData.pressKit.contactPerson}
          </p>
        </div>
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: siteData.pressKit.title[lang],
      desc: "Press kit and media resources for Chhattisgadhiya Cloud",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: siteData.pressKit.title[lang], href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'press', 'index.html'), doc);
  }

  // 11. SUPPORT
  {
    const canonical = `/${lang}/support/`;
    const alt = `/${altLang}/support/`;

    const partnersHtml = siteData.partners.map(p => `
      <div class="production-card surface-card" style="text-align:center;">
        <div style="font-size:2.2rem; margin-bottom:0.5rem;">🏛️</div>
        <h3 style="font-family:var(--font-serif); font-size:1.3rem; color:var(--g-text-primary); margin-bottom:0.35rem;">${p.name}</h3>
        <span style="font-size:0.82rem; color:var(--c-primary); font-weight:700; text-transform:uppercase;">${p.category[lang]}</span>
      </div>
    `).join('\n');

    const content = `
    <div class="page-header">
      <div class="container">
        <span class="page-eyebrow">✦ Community & Institutional Backing ✦</span>
        <h1 class="page-title">${isHi ? 'सहयोग एवं साझीदार' : 'Support Us & Partners'}</h1>
        <p class="page-description">
          ${isHi ? 'संस्थागत संरक्षक, सहयोगी एवं सहभागिता के माध्यम। (ऑनलाइन दान भविष्य के लिए संरचित)' : 'Sponsors, cultural grant bodies, and ways to collaborate. (Online donations structured for future enablement).'}
        </p>
      </div>
    </div>

    <div class="container page-content-container">
      <div class="accent-callout-box" style="margin-bottom:3rem;">
        <h2 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--c-primary); margin-bottom:0.75rem;">
          ${isHi ? 'हमारे कार्यों में सहयोग के माध्यम' : 'Ways to Support Our Work'}
        </h2>
        <p style="color:var(--g-text-primary); font-size:1.05rem; line-height:1.8; max-width:800px; margin-bottom:1.5rem;">
          ${isHi ? 'चाहे आप किसी महोत्सव मंच के प्रायोजक हों, कला-रेजिडेंसी के शोधार्थी हों अथवा जशपुर में वालंटियर — आपका सहयोग भारतीय जमीनी रंगमंच और जनजातीय साहित्य को नई शक्ति देता है।' : 'Whether you are a cultural institution sponsoring a festival stage, an artist proposing a residency, or a volunteer in Jashpur, your partnership sustains grassroots Indian theatre and tribal literature.'}
        </p>
        <a href="/${lang}/contact/?subject=Sponsorship" class="btn-primary">${isHi ? 'सहयोग एवं प्रायोजन हेतु संपर्क' : 'Inquire About Sponsorship & Volunteering'}</a>
      </div>

      <h2 style="font-family:var(--font-serif); font-size:1.8rem; color:var(--g-text-primary); margin-bottom:1.5rem;">
        ${isHi ? 'संस्थागत एवं सांस्कृतिक साझीदार' : 'Institutional & Community Partners'}
      </h2>
      <div class="card-grid">
        ${partnersHtml}
      </div>
    </div>
    `;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'सहयोग एवं साझीदार' : 'Support Us & Partners',
      desc: "Partners and support opportunities for Chhattisgadhiya Cloud",
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: content,
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'सहयोग एवं साझीदार' : 'Support Us', href: canonical }]
    });
    fs.writeFileSync(path.join(__dirname, lang, 'support', 'index.html'), doc);
  }
});

// Root router: Immediately redirect to /en/ by default as requested by user
const rootHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#FF4500">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="apple-mobile-web-app-title" content="CG Cloud">
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="./favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="./src/assets/icons/icon-192.png">
  <link rel="apple-touch-icon" href="./apple-touch-icon.png">
  <script>
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
    // Relative redirect compatible with GitHub Pages subpaths, custom domain, and localhost
    const path = window.location.pathname.replace(/\\/+$/, '');
    window.location.replace(path + '/en/' + window.location.search + window.location.hash);
  </script>
  <meta http-equiv="refresh" content="0; url=en/">
  <title>Chhattisgadhiya Cloud</title>
</head>
<body style="background:#FFFFFF; color:#202124; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align:center; padding-top:20vh;">
  <h2>Redirecting to Chhattisgadhiya Cloud...</h2>
  <p><a href="en/" style="color:#FF4500; font-weight:bold;">Click here to enter</a></p>
</body>
</html>`;
fs.writeFileSync(path.join(__dirname, 'index.html'), rootHtml);

console.log('✅ Generated polished Google Material Design 3 Multi-Page Website with Search, Mobile Drawer, Stats, and Enhanced Footer.');
