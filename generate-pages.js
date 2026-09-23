// Static site generator for Chhattisgadhiya Cloud.
// Writes one HTML page per section and language (/en/…, /hi/…) from
// src/data/site-content.json. Layout and design system: src/site/.
// Page content: src/home/ (homepage), src/magazine/ and src/pages/.

const fs = require('fs');
const path = require('path');

const { siteData } = require('./src/data/content-node.js');
const magazinePages = require('./src/data/magazine-pages.json');
const { renderMagazinePage } = require('./src/magazine/components.js');
const { renderHeader, renderFooter } = require('./src/site/layout.js');
const { renderFormDialogs } = require('./src/site/forms.js');
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

// Legacy build outputs still referenced by src/app.js and the service worker.
const cssRaw = fs.readFileSync(path.join(__dirname, 'src', 'styles.css'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'src', 'styles.min.css'), cssRaw
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;\}/g, '}').trim());
const hybridReaderRaw = fs.readFileSync(path.join(__dirname, 'src', 'reader', 'hybrid-reader.js'), 'utf8');
fs.writeFileSync(path.join(__dirname, 'src', 'reader', 'hybrid-reader.bundle.js'),
  hybridReaderRaw.replace('export class HybridMagazineReader', 'class HybridMagazineReader') + '\nif (typeof window !== "undefined") { window.HybridMagazineReader = HybridMagazineReader; }\n');

const ASSET_VERSION = 3;
// One display face per script plus Mukta (Latin + Devanagari) for body text.
const FONTS = {
  en: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500&family=Mukta:wght@400;600;700&display=swap',
  hi: 'https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&family=Mukta:wght@400;600;700&display=swap',
};

function renderHtmlDocument({ lang, title, desc, canonicalUrl, altUrl, contentHtml, extraScripts = '', extraHead = '', preloadImage = '' }) {
  const altLang = lang === 'hi' ? 'en' : 'hi';
  const root = canonicalUrl.split('/').filter(Boolean).map(() => '..').join('/') + '/';
  const header = renderHeader({ lang, currentPath: canonicalUrl, altUrl, siteData });
  const footer = renderFooter({ lang, siteData, altUrl, currentPath: canonicalUrl });
  const formIds = [...`${header}${contentHtml}${footer}`.matchAll(/data-cc-form="([a-z]+)"/g)].map((m) => m[1]);
  const clientConfig = JSON.stringify({
    whatsapp: ((siteData.contact && siteData.contact.phone) || '').replace(/\D/g, ''),
    email: (siteData.contact && siteData.contact.email) || '',
    formsEndpoint: siteData.formsEndpoint || '',
  });

  const rawHtml = `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${title} | ${siteData.orgName[lang]}</title>
  <meta name="description" content="${desc.replace(/"/g, '&quot;')}">
  <script>try{if(localStorage.getItem('cc-theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}</script>
  <meta name="theme-color" content="#FAF6EF">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-title" content="CG Cloud">
  <meta name="application-name" content="Chhattisgadhiya Cloud">
  <meta name="format-detection" content="telephone=no">
  <link rel="manifest" href="/manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="/src/assets/icons/icon-192.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="canonical" href="https://chhattisgadhiyacloud.org${canonicalUrl}">
  <link rel="alternate" hreflang="${lang}" href="https://chhattisgadhiyacloud.org${canonicalUrl}">
  <link rel="alternate" hreflang="${altLang}" href="https://chhattisgadhiyacloud.org${altUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="${FONTS[lang]}" media="print" onload="this.media='all'">
  <noscript><link rel="stylesheet" href="${FONTS[lang]}"></noscript>
  <link rel="stylesheet" href="/src/site/site.css?v=${ASSET_VERSION}">${extraHead ? `\n  ${extraHead}` : ''}${preloadImage ? `\n  <link rel="preload" as="image" href="${preloadImage}" fetchpriority="high">` : ''}
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
  <script src="/src/site/site.js?v=${ASSET_VERSION}" defer></script>
  ${extraScripts}
</body>
</html>`;

  // Root-relative links become relative so the site works on GitHub Pages sub-paths.
  return rawHtml.replace(/(href|src|action)="\/(en|hi|src|favicon|manifest|apple-touch-icon|sw\.js)/g, `$1="${root}$2`);
}

function write(lang, slug, html) {
  const dir = path.join(__dirname, lang, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

['en', 'hi'].forEach((lang) => {
  const isHi = lang === 'hi';
  const altLang = isHi ? 'en' : 'hi';

  // Home
  write(lang, '', renderHtmlDocument({
    lang,
    title: isHi ? 'होम' : 'Home',
    desc: isHi
      ? 'छत्तीसगढ़िया क्लाउड — जशपुर, छत्तीसगढ़ से रंगमंच, समारोह, कार्यशालाएं और मासिक पत्रिका।'
      : 'Chhattisgadhiya Cloud — theatre, festivals, workshops and a monthly magazine from Jashpur, Chhattisgarh.',
    canonicalUrl: `/${lang}/`,
    altUrl: `/${altLang}/`,
    contentHtml: renderHomePage(siteData, lang),
    extraHead: `<link rel="stylesheet" href="/src/home/home.css?v=${ASSET_VERSION}">`,
    preloadImage: ((siteData.homepage || {}).hero || {}).photo || '/src/assets/images/hero-art.svg',
  }));

  // Magazine
  write(lang, 'magazine', renderHtmlDocument({
    lang,
    title: siteData.magazine.name[lang],
    desc: isHi
      ? 'छत्तीसगढ़िया क्लाउड मासिक पत्रिका — नवीनतम अंक, पिछले अंक, डिजिटल व मुद्रित प्रति, और 5 पृष्ठों का निःशुल्क पूर्वावलोकन।'
      : 'Chhattisgadhiya Cloud Masik Patrika — the latest issue, previous issues, digital and print copies, and a free 5-page preview.',
    canonicalUrl: `/${lang}/magazine/`,
    altUrl: `/${altLang}/magazine/`,
    contentHtml: renderMagazinePage(siteData.magazine, magazinePages, lang, siteData.contact),
    extraHead: `<link rel="stylesheet" href="/src/magazine/magazine.css?v=${ASSET_VERSION + 2}">`,
    extraScripts: '<script src="/src/magazine/magazine-reader.js?v=1" defer></script>',
  }));

  // Content pages
  Object.entries(PAGES).forEach(([slug, page]) => {
    const { title, desc, content } = page.render(siteData, lang);
    write(lang, slug, renderHtmlDocument({
      lang, title, desc,
      canonicalUrl: `/${lang}/${slug}/`,
      altUrl: `/${altLang}/${slug}/`,
      contentHtml: content,
    }));
  });
});

// Root: redirect to /en/ (works on GitHub Pages sub-paths, custom domains and localhost).
fs.writeFileSync(path.join(__dirname, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="theme-color" content="#FAF6EF">
  <link rel="manifest" href="./manifest.webmanifest">
  <link rel="icon" type="image/svg+xml" href="./favicon.svg">
  <link rel="apple-touch-icon" href="./apple-touch-icon.png">
  <script>
    if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('./sw.js').catch(function () {}); });
    var p = window.location.pathname.replace(/\\/+$/, '');
    window.location.replace(p + '/en/' + window.location.search + window.location.hash);
  </script>
  <meta http-equiv="refresh" content="0; url=en/">
  <title>Chhattisgadhiya Cloud</title>
</head>
<body style="background:#FAF6EF; color:#1C1A17; font-family:system-ui, sans-serif; text-align:center; padding-top:20vh;">
  <p><a href="en/" style="color:#2E5A38; font-weight:bold;">Chhattisgadhiya Cloud</a></p>
</body>
</html>`);

console.log('Generated site: home, magazine and', Object.keys(PAGES).length, 'content pages in English and Hindi.');
