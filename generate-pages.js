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
const magazinePages = require('./src/data/magazine-pages.json');
const { renderMagazinePage } = require('./src/magazine/components.js');
const { renderHeader, renderFooter } = require('./src/site/layout.js');
const { renderHomePage } = require('./src/home/components.js');

// Automatically compile and minify styles.css into styles.min.css
const cssRaw = fs.readFileSync(path.join(__dirname, 'src', 'styles.css'), 'utf8');
const cssMin = cssRaw
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s+/g, ' ')
  .replace(/\s*([\{\}\:\;\,])\s*/g, '$1')
  .replace(/;\}/g, '}')
  .trim();
fs.writeFileSync(path.join(__dirname, 'src', 'styles.min.css'), cssMin);

// Load and prepare HybridMagazineReader for zero-dependency browser usage
const hybridReaderRaw = fs.readFileSync(path.join(__dirname, 'src', 'reader', 'hybrid-reader.js'), 'utf8');
const hybridReaderClean = hybridReaderRaw.replace('export class HybridMagazineReader', 'class HybridMagazineReader');
fs.writeFileSync(path.join(__dirname, 'src', 'reader', 'hybrid-reader.bundle.js'), hybridReaderClean + '\nif (typeof window !== "undefined") { window.HybridMagazineReader = HybridMagazineReader; }\n');

// Artwork Mapping
const playArtworkMap = {
  'kahani-vasu-ki': '/src/assets/images/play-vasu.svg',
  'vincent-a-flashback': '/src/assets/images/play-vincent.svg',
  'gabar-ghichor': '/src/assets/images/play-gabar.svg',
  'raja-ravi-verma': '/src/assets/images/play-raja.svg'
};

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

function renderHtmlDocument({ lang, title, desc, canonicalUrl, altUrl, contentHtml, crumbs, extraScripts = '', extraHead = '' }) {
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
  <link rel="stylesheet" href="/src/site/site.css?v=1">${extraHead ? `\n  ${extraHead}` : ''}
  ${(canonicalUrl === '/en/' || canonicalUrl === '/hi/') ? '<link rel="preload" as="image" href="/src/assets/images/hero-art.svg" fetchpriority="high">' : ''}
</head>
<body>
  ${renderHeader({ lang, currentPath: canonicalUrl, altUrl, siteData })}
  ${renderBreadcrumb(crumbs)}
  <main id="main">
    ${contentHtml}
  </main>
  ${renderFooter({ lang, siteData, altUrl })}
  <script src="/src/site/site.js?v=1" defer></script>
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
  // Sections come from src/home/components.js; copy lives in siteData.homepage.
  {
    const canonical = `/${lang}/`;
    const alt = `/${altLang}/`;

    const doc = renderHtmlDocument({
      lang,
      title: isHi ? 'होम' : 'Home',
      desc: isHi
        ? 'छत्तीसगढ़िया क्लाउड — छत्तीसगढ़ से रंगमंच, समारोह, कार्यशालाएं और मासिक पत्रिका।'
        : 'Chhattisgadhiya Cloud — theatre, festivals, workshops and a monthly magazine from Chhattisgarh.',
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: renderHomePage(siteData, lang),
      crumbs: [],
      extraHead: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600&display=swap">
  <link rel="stylesheet" href="/src/home/home.css?v=1">`
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
  // Sections come from src/magazine/components.js; issue data, prices and the
  // preview length live in siteData.magazine and src/data/magazine-pages.json.
  {
    const canonical = `/${lang}/magazine/`;
    const alt = `/${altLang}/magazine/`;

    const doc = renderHtmlDocument({
      lang,
      title: siteData.magazine.name[lang],
      desc: isHi
        ? 'छत्तीसगढ़िया क्लाउड मासिक पत्रिका — नवीनतम अंक, पिछले अंक, डिजिटल व मुद्रित प्रति, और 5 पृष्ठों का निःशुल्क पूर्वावलोकन।'
        : 'Chhattisgadhiya Cloud Masik Patrika — the latest issue, previous issues, digital and print copies, and a free 5-page preview.',
      canonicalUrl: canonical,
      altUrl: alt,
      contentHtml: renderMagazinePage(siteData.magazine, magazinePages, lang, siteData.contact),
      crumbs: [{ label: isHi ? 'होम' : 'Home', href: `/${lang}/` }, { label: isHi ? 'मासिक पत्रिका' : 'Magazine', href: canonical }],
      extraHead: `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Noto+Serif+Devanagari:wght@400;600&display=swap">
  <link rel="stylesheet" href="/src/magazine/magazine.css?v=3">`,
      extraScripts: '<script src="/src/magazine/magazine-reader.js?v=1" defer></script>'
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

    const renderSocialLinks = (social, accentColor = '#C83200') => {
      if (!social) return '';
      const links = [];

      if (social.linkedin) {
        links.push(`
          <a href="${social.linkedin}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" style="--btn-accent:${accentColor};" title="LinkedIn Profile" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28z"/></svg>
          </a>`);
      }

      if (social.twitter || social.x) {
        const twitterUrl = social.twitter || social.x;
        links.push(`
          <a href="${twitterUrl}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" style="--btn-accent:${accentColor};" title="X / Twitter" aria-label="X / Twitter">
            <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>`);
      }

      if (social.instagram) {
        links.push(`
          <a href="${social.instagram}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" style="--btn-accent:${accentColor};" title="Instagram Profile" aria-label="Instagram">
            <svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>`);
      }

      if (social.youtube) {
        links.push(`
          <a href="${social.youtube}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" style="--btn-accent:${accentColor};" title="YouTube Channel" aria-label="YouTube">
            <svg viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>`);
      }

      if (social.portfolio || social.website) {
        const webUrl = social.portfolio || social.website;
        links.push(`
          <a href="${webUrl}" target="_blank" rel="noopener noreferrer" class="social-icon-btn" style="--btn-accent:${accentColor};" title="Artistic Portfolio / Dossier" aria-label="Portfolio">
            <svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm7.93 9h-3.18a15.65 15.65 0 0 0-1.38-5.07A8.03 8.03 0 0 1 19.93 11zM12 4.07A13.72 13.72 0 0 1 13.68 11h-3.36A13.72 13.72 0 0 1 12 4.07zM4.07 13h3.18a15.65 15.65 0 0 0 1.38 5.07A8.03 8.03 0 0 1 4.07 13zm3.18-2H4.07a8.03 8.03 0 0 1 4.56-5.07A15.65 15.65 0 0 0 7.25 11zm3.07 2h3.36A13.72 13.72 0 0 1 12 19.93 13.72 13.72 0 0 1 10.32 13zm5.05 5.07A15.65 15.65 0 0 0 16.75 13h3.18a8.03 8.03 0 0 1-4.56 5.07z"/></svg>
          </a>`);
      }

      if (social.email) {
        links.push(`
          <a href="mailto:${social.email}" class="social-icon-btn" style="--btn-accent:${accentColor};" title="Email Contact" aria-label="Email">
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
          </a>`);
      }

      if (links.length === 0) return '';
      return `<div class="profile-social-row">${links.join('')}</div>`;
    };

    // Featured Director (Leftmost dedicated square card)
    const featured = (siteData.about.team && siteData.about.team[0]) || {};
    const featuredImg = featured.image || '/src/assets/images/team/dir-suresh-thakur.svg';
    const featuredColor = featured.color || '#C83200';
    const featuredBadge = featured.badge ? (featured.badge[lang] || featured.badge.en) : (isHi ? 'संस्थापक एवं कला निर्देशक' : 'Founder & Artistic Director');

    const featuredHtml = `
      <div class="director-featured-card">
        <div class="director-featured-card-top-bar"></div>
        <div class="director-featured-img-wrap">
          <img src="${featuredImg}" alt="${featured.name}" loading="lazy">
        </div>
        <span class="director-featured-badge">${featuredBadge}</span>
        <h3 class="director-featured-name">${featured.name}</h3>
        <div class="director-featured-role">${featured.role[lang]}</div>
        <p class="director-featured-bio">${featured.bio[lang]}</p>
        ${renderSocialLinks(featured.social, featuredColor)}
      </div>
    `;

    // Fellow Directors / Curators (Right side grid)
    const peerDirectors = (siteData.about.team && siteData.about.team.slice(1)) || [];
    const peerDirectorsHtml = peerDirectors.map(m => {
      const mColor = m.color || '#7C3AED';
      const mImg = m.image || '/src/assets/images/hero-art.svg';
      const mBadge = m.badge ? (m.badge[lang] || m.badge.en) : (isHi ? 'निर्देशक व संयोजक' : 'Curator & Director');

      return `
      <div class="director-peer-card" style="border-color:${mColor}35;">
        <div class="director-peer-card-top-bar" style="background:${mColor};"></div>
        <div class="director-peer-header">
          <div class="director-peer-img-wrap" style="border:2.5px solid ${mColor};">
            <img src="${mImg}" alt="${m.name}" loading="lazy">
          </div>
          <div class="director-peer-meta">
            <span class="director-peer-badge" style="background:${mColor}15; color:${mColor}; border:1px solid ${mColor}35;">
              ${mBadge}
            </span>
            <h3 class="director-peer-name">${m.name}</h3>
            <div class="director-peer-role" style="color:${mColor};">${m.role[lang]}</div>
          </div>
        </div>
        <p class="director-peer-bio">${m.bio[lang]}</p>
        ${renderSocialLinks(m.social, mColor)}
      </div>
      `;
    }).join('\n');

    // Our Team: Repertory Ensemble & Production Crew (Centered balanced composition)
    const membersList = siteData.about.members || [];
    const membersHtml = membersList.map(m => {
      const color = m.color || '#EA580C';
      const avatarSrc = m.image || '/src/assets/images/team/team-rameshwar-mandavi.svg';
      const badgeText = m.badge ? (m.badge[lang] || m.badge.en) : (isHi ? 'नाट्य दल' : 'Ensemble');

      return `
      <div class="ensemble-card" style="border-color:${color}30; background:linear-gradient(180deg, #FFFFFF 0%, ${color}06 100%);">
        <div class="ensemble-card-top-bar" style="background:${color};"></div>
        <div class="ensemble-avatar-wrap" style="border:3px solid ${color}; box-shadow:0 8px 24px ${color}20;">
          <img src="${avatarSrc}" alt="${m.name}" loading="lazy">
        </div>
        <span class="ensemble-badge" style="background:${color}15; color:${color}; border:1px solid ${color}35;">
          ${badgeText}
        </span>
        <h4 class="ensemble-name">${m.name}</h4>
        <div class="ensemble-role" style="color:${color};">${m.role[lang]}</div>
        <p class="ensemble-bio">${m.bio[lang]}</p>
        ${renderSocialLinks(m.social, color)}
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

        <div class="directors-spotlight-layout">
          ${featuredHtml}
          <div class="directors-peer-grid">
            ${peerDirectorsHtml}
          </div>
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
