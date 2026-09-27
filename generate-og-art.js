// Generates the link-preview (Open Graph) image for every page, per language.
//   npm run og-art
// Each is 1200x630: the page's first banner artwork, a warm dark fade on the
// left, the page name, the organisation name and a dotted folk border.
// Output: src/assets/images/og/<lang>-<page>.jpg (page "home" for the home page).
// generate-pages.js uses these when present, else og-image.jpg.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const siteData = require('./src/data/site-content.json');
const { PAGES } = require('./src/site/layout.js');

const W = 1200;
const H = 630;
const OUT = path.join(__dirname, 'src/assets/images/og');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const file = (src) => path.join(__dirname, src.replace(/^\//, ''));

const pages = [{ id: 'home', label: null, art: ((siteData.homepage || {}).heroSlides || [])[0] }]
  .concat([...PAGES.explore, ...PAGES.organisation].map((p) => ({ id: p.id, label: p.label, art: ((siteData.pageBanners || {})[p.id] || [])[0] })));

function overlay(lang, title, sub, brand = true) {
  const font = lang === 'hi' ? "'FreeSerif', 'Noto Serif Devanagari', serif" : "'DejaVu Serif', 'Liberation Serif', serif";
  const dots = Array.from({ length: 60 }, (_, i) => `<circle cx="${i * 20 + 10}" cy="${H - 18}" r="2.6" fill="#F5B82E" opacity="0.7"/>`).join('');
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#140c08" stop-opacity="0.94"/><stop offset="0.55" stop-color="#140c08" stop-opacity="0.72"/><stop offset="1" stop-color="#140c08" stop-opacity="0.1"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <rect x="0" y="0" width="${W}" height="10" fill="#C8441A"/>
  <circle cx="110" cy="130" r="38" fill="#A0461E"/>
  <circle cx="110" cy="130" r="26" fill="none" stroke="#FFF6EC" stroke-width="3" stroke-dasharray="4 6"/>
  <path d="M96 128c5 8 11 11 14 11s9-3 14-11" fill="none" stroke="#FFF6EC" stroke-width="3" stroke-linecap="round"/>
  ${brand ? `<text x="166" y="140" font-family="'DejaVu Sans', sans-serif" font-size="30" font-weight="700" fill="#FFF6EC">${esc(siteData.orgName.en)}</text>` : ''}
  <text x="80" y="330" font-family="${font}" font-size="${title.length > 18 ? 76 : 92}" font-weight="700" fill="#FFFFFF">${esc(title)}</text>
  <rect x="82" y="366" width="90" height="6" rx="3" fill="#F5B82E"/>
  <text x="80" y="430" font-family="${font}" font-size="34" font-style="italic" fill="#F3E7D6">${esc(sub)}</text>
  ${dots}
</svg>`);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const p of pages) {
    const src = p.art && p.art.image && fs.existsSync(file(p.art.image)) ? file(p.art.image) : path.join(__dirname, 'src/assets/images/og-image.jpg');
    const base = await sharp(src).resize(W, H, { fit: 'cover', position: 'right' }).toBuffer();
    for (const lang of ['en', 'hi']) {
      const title = p.label ? p.label[lang] : siteData.orgName[lang];
      const sub = siteData.tagline[lang];
      await sharp(base).composite([{ input: overlay(lang, title, sub, p.id !== 'home') }]).jpeg({ quality: 78, mozjpeg: true, progressive: true })
        .toFile(path.join(OUT, `${lang}-${p.id}.jpg`));
    }
  }
  console.log(`link-preview images written for ${pages.length} pages x 2 languages`);
})();
