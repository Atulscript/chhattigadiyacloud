// Generates the artwork for the homepage "Explore" cards (Plays, Festivals,
// Workshops, Magazine).
//   npm run card-art
// One art direction for all four: muted earthy palette, warm low-key light,
// soft depth-of-field haze, film grain and a gentle vignette, so the set reads
// as one editorial collection. Placeholders: each image can be replaced from
// the admin panel (Pages > Homepage > Featured tiles).
// Output: src/assets/images/cards/<name>.webp|.jpg (800x1000, 4:5) and
//         <name>-480.webp|.jpg (480x600).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { rng, particles, mask } = require('./generate-hero-art.js');

const W = 800;
const H = 1000;
const OUT = path.join(__dirname, 'src/assets/images/cards');

const defs = (extra = '') => `<defs>
  <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="blur50" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter>
  <radialGradient id="s4shade" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity="0.3"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
  ${extra}</defs>`;
const open = (extra) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(extra)}`;

// Scenes are 4:5 portraits. The card overlays its title and text on the
// lower part of the image, so each subject sits in the upper ~55%.

// ---------- 1. Plays: an empty stage, a folk mask in the spotlight ----------
function plays() {
  const r = rng(41);
  const swag = (x, flip) => `<path d="M${x} 0 C${x + (flip ? -40 : 40)} 260 ${x + (flip ? -150 : 150)} 520 ${x + (flip ? -60 : 60)} 1000 L${flip ? 800 : 0} 1000 L${flip ? 800 : 0} 0 Z" fill="url(#velvet)"/>`;
  return `${open(`
    <linearGradient id="velvet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b1210"/><stop offset="0.35" stop-color="#6e2019"/><stop offset="0.6" stop-color="#4a1511"/><stop offset="1" stop-color="#2a0c0a"/></linearGradient>
    <linearGradient id="back" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a110d"/><stop offset="1" stop-color="#0d0806"/></linearGradient>
    <linearGradient id="boards" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3020"/><stop offset="1" stop-color="#1a110b"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#back)"/>
  <g opacity="0.45">${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 70}" y="0" width="70" height="640" fill="url(#velvet)"/>`).join('')}</g>
  <ellipse cx="400" cy="420" rx="300" ry="260" fill="#b0643a" opacity="0.3" filter="url(#blur50)"/>
  <path d="M370 -10 L430 -10 L600 640 L200 640 Z" fill="#f2d3a0" opacity="0.2" filter="url(#blur24)"/>
  ${particles(r, { n: 90, x0: 230, x1: 570, y0: 20, y1: 620, color: '#f6dcb0', max: 1.6 })}
  <path d="M0 620 L${W} 620 L${W} ${H} L0 ${H} Z" fill="url(#boards)"/>
  <g stroke="#2a1a10" stroke-width="2" opacity="0.6">${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 60 - 50}" y1="620" x2="${(i * 60 - 50 - 400) * 2 + 400}" y2="${H}"/>`).join('')}</g>
  <ellipse cx="400" cy="640" rx="220" ry="34" fill="#f0c98e" opacity="0.45" filter="url(#blur10)"/>
  <!-- wooden stand with the mask -->
  <path d="M396 640 L396 470" stroke="#3a2416" stroke-width="10"/>
  <path d="M340 646 L400 626 L460 646" stroke="#3a2416" stroke-width="10" fill="none" stroke-linecap="round"/>
  ${mask(400, 390, 0.62, -4, { base: '#b4532f', crown: '#c99a3c', dot: '#eedbb4', line: '#3a150b', smile: true })}
  <!-- stool and a draped cloth -->
  <g transform="translate(560 640)"><rect x="-44" y="-70" width="88" height="14" rx="4" fill="#2e1d12"/><rect x="-38" y="-56" width="10" height="56" fill="#2e1d12"/><rect x="28" y="-56" width="10" height="56" fill="#2e1d12"/>
    <path d="M-40 -70 C-10 -90 40 -84 50 -64 L46 -10 C20 -30 -10 -30 -36 -18 Z" fill="#7a5a2a" opacity="0.9"/></g>
  <!-- footlights -->
  ${Array.from({ length: 9 }, (_, i) => `<ellipse cx="${80 + i * 80}" cy="${H - 12}" rx="26" ry="8" fill="#f6d28a" opacity="0.5" filter="url(#blur10)"/>`).join('')}
  ${swag(170, false)}${swag(630, true)}
  <path d="M0 0 L${W} 0 L${W} 90 C560 150 240 150 0 90 Z" fill="#561a15"/>
  <path d="M0 88 C240 146 560 146 ${W} 88" stroke="#b58a44" stroke-width="4" fill="none" opacity="0.8"/>
  </svg>`;
}

// ---------- 2. Festivals: paper lanterns, marigolds and bunting at night ----------
function festivals() {
  const r = rng(42);
  const lantern = (x, y, s, c, blur) => `<g transform="translate(${x} ${y}) scale(${s})"${blur ? ' filter="url(#blur4)"' : ''}>
    <path d="M0 -140 L0 -70" stroke="#2a1a14" stroke-width="3"/>
    <rect x="-18" y="-74" width="36" height="12" rx="3" fill="#3a2418"/>
    <ellipse cx="0" cy="0" rx="62" ry="70" fill="${c}"/>
    <ellipse cx="0" cy="0" rx="62" ry="70" fill="url(#lglow)"/>
    <g stroke="#6a2e14" stroke-width="2" fill="none" opacity="0.45"><ellipse cx="0" cy="0" rx="40" ry="70"/><ellipse cx="0" cy="0" rx="16" ry="70"/><path d="M-62 0 L62 0"/></g>
    <rect x="-18" y="62" width="36" height="12" rx="3" fill="#3a2418"/>
    <path d="M-8 74 L-8 110 M0 74 L0 118 M8 74 L8 110" stroke="#b8752c" stroke-width="3"/>
    <ellipse cx="0" cy="0" rx="120" ry="130" fill="${c}" opacity="0.18" filter="url(#blur24)"/></g>`;
  const garland = (x, n) => Array.from({ length: n }, (_, i) => `<circle cx="${(x + Math.sin(i * 0.9) * 5).toFixed(0)}" cy="${i * 26 - 10}" r="14" fill="${i % 3 ? '#c9711f' : '#d9a23a'}"/>`).join('');
  const bunting = Array.from({ length: 20 }, (_, i) => { const x = i * 42; const y = 40 + Math.sin((i / 19) * Math.PI) * 50; return `<path d="M${x} ${y.toFixed(0)} L${x + 38} ${(y + 2).toFixed(0)} L${x + 19} ${(y + 38).toFixed(0)} Z" fill="${['#8a2e1f', '#b8752c', '#2f5a3a', '#6a3a5a'][i % 4]}" opacity="0.85"/>`; }).join('');
  const bokeh = Array.from({ length: 40 }, () => `<circle cx="${(r() * 800).toFixed(0)}" cy="${(r() * 700).toFixed(0)}" r="${(6 + r() * 16).toFixed(0)}" fill="${['#f2c46d', '#e8955a', '#f6dca8'][Math.floor(r() * 3)]}" opacity="${(0.12 + r() * 0.25).toFixed(2)}" filter="url(#blur4)"/>`).join('');
  return `${open(`<linearGradient id="nsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1422"/><stop offset="0.7" stop-color="#2e1c1e"/><stop offset="1" stop-color="#1a100c"/></linearGradient>
    <radialGradient id="lglow" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff2cf" stop-opacity="0.85"/><stop offset="0.6" stop-color="#fff2cf" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.25"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#nsky)"/>
  ${bokeh}
  <path d="M0 40 Q400 150 ${W} 40" stroke="#2a1a14" stroke-width="2" fill="none"/>
  ${bunting}
  ${lantern(600, 310, 0.7, '#c05a2a', true)}${lantern(170, 290, 0.6, '#b8862c', true)}
  ${lantern(400, 330, 1.1, '#d0662c', false)}${lantern(640, 470, 0.85, '#b8452a', false)}${lantern(170, 480, 0.8, '#c9892e', false)}
  <g filter="url(#blur4)">${garland(60, 26)}</g><g>${garland(750, 22)}</g>
  ${particles(r, { n: 50, x0: 0, x1: W, y0: 0, y1: 700, color: '#f6dca8', max: 1.4 })}
  </svg>`;
}

// ---------- 3. Workshops: a mask-making worktable ----------
function workshops() {
  const r = rng(43);
  const bowl = (x, y, c) => `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="18" rx="54" ry="16" fill="#000" opacity="0.35" filter="url(#blur4)"/><path d="M-50 0 Q0 52 50 0 Z" fill="#7a4a26"/><ellipse cx="0" cy="0" rx="50" ry="15" fill="#5a331a"/><ellipse cx="0" cy="2" rx="42" ry="11" fill="${c}"/></g>`;
  const brush = (x, y, rot, c) => `<g transform="translate(${x} ${y}) rotate(${rot})"><rect x="0" y="-5" width="230" height="10" rx="5" fill="#6b4226"/><rect x="230" y="-7" width="26" height="14" fill="#b8b0a0"/><path d="M256 -7 L300 0 L256 7 Z" fill="${c}"/></g>`;
  return `${open(`<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5a3c26"/><stop offset="1" stop-color="#2a1a10"/></linearGradient>
    <radialGradient id="lamp" cx="45%" cy="25%" r="70%"><stop offset="0" stop-color="#f6d8a4" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#wood)"/>
  <g stroke="#2e1d12" stroke-width="2.5" opacity="0.55">${Array.from({ length: 13 }, (_, i) => `<path d="M-20 ${i * 80 + 30} C220 ${i * 80 + 10} 560 ${i * 80 + 50} 820 ${i * 80 + 22}" fill="none"/>`).join('')}</g>
  <!-- script pages under the work -->
  <g transform="translate(60 520) rotate(-10)"><rect width="300" height="380" fill="#e6d8bd"/>${Array.from({ length: 18 }, (_, i) => `<line x1="30" y1="${40 + i * 18}" x2="${i % 5 === 4 ? 180 : 270}" y2="${40 + i * 18}" stroke="#8a7a66" stroke-width="3" opacity="0.4"/>`).join('')}</g>
  <!-- unfinished clay mask (unpainted) and a painted one -->
  ${mask(250, 250, 0.72, -12, { base: '#a86a44', crown: '#8a5434', dot: '#c58a5c', line: '#4a2614', smile: false })}
  ${mask(560, 300, 0.7, 10, { base: '#c05a2e', crown: '#2f5a3a', dot: '#eedbb4', line: '#2a0f07', smile: true })}
  ${bowl(560, 560, '#b8452a')}${bowl(680, 470, '#d9a23a')}${bowl(470, 660, '#2f5a3a')}${bowl(690, 640, '#e9dcc0')}
  ${brush(120, 480, -18, '#b8452a')}${brush(360, 760, -30, '#2f5a3a')}
  <!-- clay tools -->
  <g transform="translate(90 120) rotate(30)"><rect width="180" height="12" rx="6" fill="#8a6a4a"/><circle cx="186" cy="6" r="10" fill="#b8b0a0"/></g>
  ${Array.from({ length: 22 }, () => `<circle cx="${(300 + r() * 480).toFixed(0)}" cy="${(420 + r() * 380).toFixed(0)}" r="${(2 + r() * 6).toFixed(0)}" fill="${['#b8452a', '#d9a23a', '#2f5a3a'][Math.floor(r() * 3)]}" opacity="0.7"/>`).join('')}
  <rect width="${W}" height="${H}" fill="url(#lamp)"/>
  ${particles(r, { n: 40, x0: 100, x1: 700, y0: 0, y1: 500, color: '#f6e2bc', max: 1.3 })}
  </svg>`;
}

// ---------- 4. Magazine: a reading table with a stack of issues ----------
function magazine() {
  const r = rng(44);
  const book = (y, w, h, c, band, dx) => `<g transform="translate(${400 - w / 2 + dx} ${y})"><rect width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="0" y="${h * 0.35}" width="${w}" height="${Math.max(4, h * 0.18)}" fill="${band}" opacity="0.8"/><rect width="${w}" height="${h}" rx="4" fill="url(#bookshade)"/></g>`;
  const petals = Array.from({ length: 18 }, () => { const x = 80 + r() * 640; const y = 640 + r() * 300; return `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="9" ry="15" fill="${r() > 0.5 ? '#c9711f' : '#d9a23a'}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})" opacity="0.9"/>`; }).join('');
  return `${open(`<linearGradient id="desk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241812"/><stop offset="0.55" stop-color="#3a2618"/><stop offset="1" stop-color="#1e140d"/></linearGradient>
    <linearGradient id="bookshade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.25"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.06"/><stop offset="1" stop-color="#000" stop-opacity="0.3"/></linearGradient>
    <radialGradient id="glow" cx="72%" cy="30%" r="60%"><stop offset="0" stop-color="#f4d29a" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#desk)"/>
  <!-- wall with a Gond-dot frieze behind the desk -->
  <rect width="${W}" height="420" fill="#2c1e16"/>
  <g fill="#b8862c" opacity="0.35">${Array.from({ length: 40 }, (_, i) => `<circle cx="${10 + i * 20}" cy="${150 + Math.sin(i / 2) * 12}" r="4"/>`).join('')}</g>
  <path d="M0 420 L${W} 420" stroke="#4a3220" stroke-width="6"/>
  <!-- stack of issues -->
  <ellipse cx="400" cy="560" rx="250" ry="30" fill="#000" opacity="0.4" filter="url(#blur10)"/>
  ${book(505, 400, 50, '#6e2a1c', '#c9974a', 6)}${book(462, 380, 44, '#2f4a36', '#d9c39a', -10)}${book(424, 392, 40, '#b8752c', '#3a2418', 4)}${book(390, 370, 36, '#4a2a3a', '#e0c890', -6)}
  <!-- open magazine on top -->
  <g transform="translate(400 330) rotate(-4)">
    <path d="M-220 20 Q-110 -12 0 12 L0 70 Q-110 50 -220 74 Z" fill="#e9dcc2"/>
    <path d="M0 12 Q110 -12 220 20 L220 74 Q110 50 0 70 Z" fill="#dccfb4"/>
    <path d="M-220 20 Q-110 -12 0 12 Q110 -12 220 20" fill="none" stroke="#a8977c" stroke-width="2"/>
    <rect x="30" y="10" width="160" height="40" fill="#8a3a22" opacity="0.55" transform="skewY(-4)"/>
    ${Array.from({ length: 3 }, (_, i) => `<line x1="-200" y1="${30 + i * 12}" x2="-30" y2="${22 + i * 12}" stroke="#8a7a66" stroke-width="3" opacity="0.45"/>`).join('')}
  </g>
  <!-- reading glasses -->
  <g transform="translate(560 640) rotate(-12)" fill="none" stroke="#1e140d" stroke-width="6">
    <circle cx="-40" cy="0" r="30"/><circle cx="40" cy="0" r="30"/><path d="M-10 0 Q0 -10 10 0"/><path d="M-70 -4 L-120 -20"/>
    <circle cx="-40" cy="0" r="27" fill="#f4d29a" opacity="0.12" stroke="none"/>
  </g>
  <!-- brass diya -->
  <g transform="translate(170 620)">
    <ellipse cx="0" cy="12" rx="70" ry="18" fill="#000" opacity="0.35" filter="url(#blur4)"/>
    <path d="M-60 -6 Q0 36 60 -6 Z" fill="#a8752e"/><ellipse cx="0" cy="-6" rx="60" ry="14" fill="#c9974a"/>
    <ellipse cx="18" cy="-34" rx="8" ry="20" fill="#f6d28a"/><ellipse cx="18" cy="-30" rx="3.5" ry="9" fill="#fff4d6"/>
    <circle cx="18" cy="-30" r="70" fill="#f2b45c" opacity="0.3" filter="url(#blur24)"/>
  </g>
  ${petals}
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${particles(r, { n: 50, x0: 0, x1: W, y0: 0, y1: 520, color: '#f6e2bc', max: 1.2 })}
  </svg>`;
}

// Shared grade: soft focus, muted colour, warm tint and vignette.
async function grade(svg) {
  const w = W * 2; const h = H * 2;
  const img = await sharp(Buffer.from(svg), { density: 144 }).resize(w, h).blur(0.6)
    .modulate({ saturation: 0.72, brightness: 1.02 }).png().toBuffer();
  const tone = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs><radialGradient id="v" cx="50%" cy="50%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.45"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="#b8804a" opacity="0.10"/><rect width="${w}" height="${h}" fill="url(#v)"/></svg>`);
  return sharp(img).composite([{ input: tone }]).png().toBuffer();
}

// Film grain, added to the pixels at the final size so it survives
// downscaling (luminance noise, slightly stronger in the mid-tones).
async function addGrain(png, seed, amount = 14) {
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const r = rng(seed);
  for (let i = 0; i < data.length; i += 3) {
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 765;
    const n = (r() - 0.5) * 2 * amount * (0.55 + lum * (1 - lum) * 1.8);
    for (let c = 0; c < 3; c++) data[i + c] = Math.max(0, Math.min(255, Math.round(data[i + c] + n)));
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [name, fn] of Object.entries({ 'plays-stage': plays, 'festival-lanterns': festivals, 'workshop-table': workshops, 'magazine-desk': magazine })) {
    const png = await grade(fn());
    for (const [width, suffix] of [[800, ''], [480, '-480']]) {
      const height = Math.round((width * H) / W);
      const sized = await sharp(png).resize(width, height).png().toBuffer();
      const img = sharp(await addGrain(sized, width));
      await img.clone().webp({ quality: 74, effort: 6 }).toFile(path.join(OUT, `${name}${suffix}.webp`));
      await img.clone().jpeg({ quality: 76, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${name}${suffix}.jpg`));
    }
    console.log('card art:', name);
  }
})();
