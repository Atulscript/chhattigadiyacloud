// Static site generator for Chhattisgadhiya Cloud.
// Writes one HTML page per section and language (/en/…, /hi/…) from
// src/data/site-content.json, plus the PWA manifest, service worker, offline
// and 404 pages, sitemap and robots.txt.
// Layout and design system: src/site/. Page content: src/home/, src/magazine/, src/pages/.

const fs = require('fs');
const path = require('path');

const { siteData } = require('./src/data/content-node.js');
const magazinePages = require('./src/data/magazine-pages.json');
const { renderMagazinePage } = require('./src/magazine/components.js');
const { renderHeader, renderFooter } = require('./src/site/layout.js');
const { buildForms, renderFormDialogs } = require('./src/site/forms.js');
const { esc, icon } = require('./src/site/ui.js');
const pwa = require('./src/site/pwa.js');
const { renderHomePage } = require('./src/home/components.js');

const PAGES = {
  'whats-on': require('./src/pages/whats-on.js'),
  productions: require('./src/pages/plays.js'),
  events: require('./src/pages/festivals.js'),
  'training-workshops': require('./src/pages/workshops.js'),
  blog: require('./src/pages/blog.js'),
  about: require('./src/pages/about.js'),
  contact: require('./src/pages/contact.js'),
  press: require('./src/pages/press.js'),
  support: require('./src/pages/support.js'),
};

// Bump when CSS/JS change so browsers and the service worker fetch fresh copies.
const ASSET_VERSION = 5;
const SITE_URL = (siteData.siteUrl || `https://${siteData.domain}`).replace(/\/+$/, '');
const OG_IMAGE = '/src/assets/images/og-image.jpg';
// One display face per script plus Mukta (Latin + Devanagari) for body text.
const FONTS = {
  en: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Mukta:wght@400;600;700&display=swap',
  hi: 'https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Mukta:wght@400;600;700&display=swap',
};
const ASSETS = {
  siteCss: `src/site/site.css?v=${ASSET_VERSION}`,
  siteJs: `src/site/site.js?v=${ASSET_VERSION}`,
  homeCss: `src/home/home.css?v=${ASSET_VERSION}`,
  magazineCss: `src/magazine/magazine.css?v=${ASSET_VERSION}`,
  magazineJs: `src/magazine/magazine-reader.js?v=${ASSET_VERSION}`,
};

function renderHtmlDocument({
  lang, title, fullTitle = '', desc, canonicalUrl, altUrl, contentHtml,
  extraScripts = '', extraHead = '', preloadImage = '', allForms = false, standalone = false,
}) {
  const altLang = lang === 'hi' ? 'en' : 'hi';
  // Pages served at arbitrary URLs (404, offline) resolve links against a <base> set at runtime.
  const root = standalone ? './' : canonicalUrl.split('/').filter(Boolean).map(() => '..').join('/') + '/';
  const header = renderHeader({ lang, currentPath: canonicalUrl, altUrl, siteData });
  const footer = renderFooter({ lang, siteData, altUrl, currentPath: canonicalUrl });
  const formIds = allForms
    ? Object.keys(buildForms(siteData)).filter((id) => id !== 'contact')
    : [...`${header}${contentHtml}${footer}`.matchAll(/data-cc-form="([a-z]+)"/g)].map((m) => m[1]);
  const clientConfig = JSON.stringify({
    whatsapp: ((siteData.contact && siteData.contact.phone) || '').replace(/\D/g, ''),
    email: (siteData.contact && siteData.contact.email) || '',
    formsEndpoint: siteData.formsEndpoint || '',
  });
  const pageTitle = esc(fullTitle || `${title} | ${siteData.orgName[lang]}`);
  const description = esc(desc);
  const enUrl = `${SITE_URL}${lang === 'en' ? canonicalUrl : altUrl}`;
  const hiUrl = `${SITE_URL}${lang === 'hi' ? canonicalUrl : altUrl}`;
  const seo = standalone ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${SITE_URL}${canonicalUrl}">
  <link rel="alternate" hreflang="en" href="${enUrl}">
  <link rel="alternate" hreflang="hi" href="${hiUrl}">
  <link rel="alternate" hreflang="x-default" href="${enUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${esc(siteData.orgName[lang])}">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${SITE_URL}${canonicalUrl}">
  <meta property="og:image" content="${SITE_URL}${OG_IMAGE}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${esc(siteData.orgName[lang])}: ${esc(siteData.tagline[lang])}">
  <meta property="og:locale" content="${lang === 'hi' ? 'hi_IN' : 'en_IN'}">
  <meta property="og:locale:alternate" content="${lang === 'hi' ? 'en_IN' : 'hi_IN'}">
  <meta name="twitter:card" content="summary_large_image">`;

  const rawHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  ${standalone ? pwa.BASE_SCRIPT : ''}
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${pageTitle}</title>
  <meta name="description" content="${description}">
  <script>try{if(localStorage.getItem('cc-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
  <meta name="theme-color" content="${pwa.THEME}">
  <meta name="color-scheme" content="light">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="default">
  <meta name="apple-mobile-web-app-title" content="CG Cloud">
  <meta name="application-name" content="CG Cloud">
  <meta name="format-detection" content="telephone=no">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="/src/assets/icons/icon-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  ${seo}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS[lang]}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${FONTS[lang]}"></noscript>
  <link rel="stylesheet" href="/${ASSETS.siteCss}">${extraHead ? `\n  ${extraHead}` : ''}${preloadImage ? `\n  <link rel="preload" as="image" href="${preloadImage}" fetchpriority="high">` : ''}
  <script>window.CC_CONFIG=${clientConfig};
    if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('${root}sw.js', { scope: '${root}' }).catch(function () {}); });
  </script>
</head>
<body>
  ${header}
  <main id="main">
    ${contentHtml}
  </main>
  ${footer}
  ${renderFormDialogs(formIds, siteData, lang)}
  <script src="/${ASSETS.siteJs}" defer></script>
  ${extraScripts}
</body>
</html>`;

  // Root-relative links become relative so the site works on GitHub Pages sub-paths.
  return rawHtml.replace(/(href|src|action)="\/(en|hi|src|favicon|manifest|apple-touch-icon|sw\.js)/g, `$1="${root}$2`);
}

function write(file, content) {
  const full = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

['en', 'hi'].forEach((lang) => {
  const isHi = lang === 'hi';
  const altLang = isHi ? 'en' : 'hi';

  write(`${lang}/index.html`, renderHtmlDocument({
    lang,
    title: isHi ? 'होम' : 'Home',
    fullTitle: isHi ? 'छत्तीसगढ़िया क्लाउड — छत्तीसगढ़ का रंगमंच और लोक कला' : 'Chhattisgadhiya Cloud — Theatre and folk art from Chhattisgarh',
    desc: isHi
      ? 'छत्तीसगढ़िया क्लाउड — जशपुर, छत्तीसगढ़ से रंगमंच, समारोह, कार्यशालाएं और मासिक पत्रिका।'
      : 'Chhattisgadhiya Cloud — theatre, festivals, workshops and a monthly magazine from Jashpur, Chhattisgarh.',
    canonicalUrl: `/${lang}/`,
    altUrl: `/${altLang}/`,
    contentHtml: renderHomePage(siteData, lang),
    extraHead: `<link rel="stylesheet" href="/${ASSETS.homeCss}">`,
    preloadImage: ((siteData.homepage || {}).hero || {}).photo || '/src/assets/images/hero-art.svg',
  }));

  write(`${lang}/magazine/index.html`, renderHtmlDocument({
    lang,
    title: siteData.magazine.name[lang],
    desc: isHi
      ? 'छत्तीसगढ़िया क्लाउड मासिक पत्रिका — नवीनतम अंक, पिछले अंक, डिजिटल व मुद्रित प्रति, और 5 पृष्ठों का निःशुल्क पूर्वावलोकन।'
      : 'Chhattisgadhiya Cloud Masik Patrika — the latest issue, previous issues, digital and print copies, and a free 5-page preview.',
    canonicalUrl: `/${lang}/magazine/`,
    altUrl: `/${altLang}/magazine/`,
    contentHtml: renderMagazinePage(siteData.magazine, magazinePages, lang, siteData.contact),
    extraHead: `<link rel="stylesheet" href="/${ASSETS.magazineCss}">`,
    extraScripts: `<script src="/${ASSETS.magazineJs}" defer></script>`,
  }));

  Object.entries(PAGES).forEach(([slug, page]) => {
    const { title, desc, content } = page.render(siteData, lang);
    write(`${lang}/${slug}/index.html`, renderHtmlDocument({
      lang, title, desc,
      canonicalUrl: `/${lang}/${slug}/`,
      altUrl: `/${altLang}/${slug}/`,
      contentHtml: content,
      allForms: slug === 'contact', // deep links like /contact/#form-camp open any form
    }));
  });
});

// Not-found and offline pages: bilingual, served at arbitrary URLs.
function standalonePage(kind) {
  const copy = kind === '404'
    ? { title: 'Page not found', h1: 'This page could not be found', hiH1: 'यह पृष्ठ नहीं मिला', text: 'The link may be old or mistyped. Try one of these instead:', hiText: 'लिंक पुराना या गलत हो सकता है। इनमें से कोई पृष्ठ देखें:' }
    : { title: 'You are offline', h1: 'You are offline', hiH1: 'आप ऑफ़लाइन हैं', text: 'Pages you have opened before still work. Check your connection and try again.', hiText: 'पहले खोले गए पृष्ठ अब भी खुलेंगे। इंटरनेट जांचकर फिर कोशिश करें।' };
  const links = [['en/', 'Home'], ['en/whats-on/', "What's On"], ['en/productions/', 'Plays'], ['en/magazine/', 'Magazine'], ['en/contact/', 'Contact'], ['hi/', 'हिन्दी होम']];
  return renderHtmlDocument({
    lang: 'en',
    title: copy.title,
    desc: copy.text,
    canonicalUrl: '/',
    altUrl: '/hi/',
    standalone: true,
    contentHtml: `
  <section class="cc-section">
    <div class="cc-wrap cc-wrap--narrow cc-empty" style="border-style:solid">
      <p class="cc-kicker">${kind === '404' ? '404' : icon('globe')}</p>
      <h1 class="cc-h1" style="margin-top:0.5rem">${copy.h1}</h1>
      <p lang="hi" class="cc-lead" style="margin:0.25rem auto 0; font-family:var(--cc-text)">${copy.hiH1}</p>
      <p>${copy.text}<br><span lang="hi">${copy.hiText}</span></p>
      <div class="cc-actions">
        ${kind === 'offline' ? '<button type="button" class="cc-btn cc-btn--primary" onclick="location.reload()">Try again</button>' : ''}
        ${links.map(([href, label], i) => `<a class="cc-btn ${i === 0 && kind === '404' ? 'cc-btn--primary' : 'cc-btn--secondary'}" href="${href}"${href.startsWith('hi') ? ' lang="hi"' : ''}>${label}</a>`).join('')}
      </div>
    </div>
  </section>`,
  }).replace(/(href|src)="\.\/\.?\/?/g, '$1="');
}
write('404.html', standalonePage('404'));
write('offline.html', standalonePage('offline'));

// Root: redirect to /en/ (GitHub Pages sub-path, custom domain or localhost).
write('index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Chhattisgadhiya Cloud</title>
  <meta name="description" content="Theatre, festivals, workshops and a monthly magazine from Jashpur, Chhattisgarh.">
  <link rel="canonical" href="${SITE_URL}/en/">
  <meta name="theme-color" content="${pwa.THEME}">
  <link rel="manifest" href="manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="apple-touch-icon.png">
  <meta http-equiv="refresh" content="0; url=en/">
  <script>location.replace('en/' + location.search + location.hash);</script>
</head>
<body style="background:${pwa.THEME}; color:#1C1A17; font-family:system-ui, sans-serif; text-align:center; padding-top:20vh;">
  <p><a href="en/" style="color:#2E5A38; font-weight:bold;">Chhattisgadhiya Cloud</a></p>
</body>
</html>
`);

// PWA and SEO files
const SLUGS = ['', 'magazine', ...Object.keys(PAGES)];
write('manifest.webmanifest', JSON.stringify(pwa.manifest(siteData), null, 2) + '\n');
write('sw.js', pwa.serviceWorker(`v${ASSET_VERSION}`, [
  'en/', 'hi/', 'offline.html', 'manifest.webmanifest', 'favicon.svg',
  'src/assets/icons/icon-192.png', 'src/assets/icons/icon-512.png',
  ASSETS.siteCss, ASSETS.siteJs, ASSETS.homeCss,
  'src/assets/images/hero-art.svg', 'src/assets/images/motif-border.svg', 'src/assets/images/footer-art-frieze.svg',
]));
write('sitemap.xml', pwa.sitemap(SITE_URL, SLUGS, new Date().toISOString().slice(0, 10)));
write('robots.txt', pwa.robots(SITE_URL));

console.log(`Generated ${SLUGS.length * 2} pages, 404, offline page, manifest, service worker (v${ASSET_VERSION}), sitemap and robots.txt.`);
