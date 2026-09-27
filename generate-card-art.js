// Generates the artwork for the homepage "Explore" cards (Plays, Festivals,
// Workshops, Magazine).
//   npm run card-art
// One art direction for all four: muted earthy palette, warm low-key light,
// soft depth-of-field haze, film grain and a gentle vignette, so the set reads
// as one editorial collection. Placeholders: each image can be replaced from
// the admin panel (Pages > Homepage > Featured tiles).
// Output: src/assets/images/cards/<name>.webp|.jpg (800x600) and
//         <name>-480.webp|.jpg (480x360).

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { rng, particles, figure, POSES, COSTUME, mask } = require('./generate-hero-art.js');

const W = 800;
const H = 600;
const OUT = path.join(__dirname, 'src/assets/images/cards');

const defs = (extra = '') => `<defs>
  <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
  <filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
  <filter id="blur50" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="50"/></filter>
  <radialGradient id="s4shade" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity="0.3"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
  ${extra}</defs>`;
const open = (extra) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(extra)}`;

const P = {
  sit: { head: [0, -236], neck: [0, -214], hip: [0, -96], lknee: [-62, -44], lfoot: [18, -12], rknee: [62, -44], rfoot: [-18, -12],
    lelbow: [-44, -150], lhand: [-56, -76], relbow: [44, -150], rhand: [56, -76] },
  sitRaise: { head: [0, -236], neck: [0, -214], hip: [0, -96], lknee: [-62, -44], lfoot: [18, -12], rknee: [62, -44], rfoot: [-18, -12],
    lelbow: [-44, -150], lhand: [-56, -76], relbow: [40, -250], rhand: [48, -310] },
  guide: { head: [6, -322], neck: [4, -298], hip: [0, -172], lknee: [-20, -88], lfoot: [-36, 0], rknee: [24, -88], rfoot: [40, 0],
    lelbow: [-48, -236], lhand: [-40, -186], relbow: [70, -262], rhand: [124, -254] },
};

// ---------- 1. Plays: a folk performer in a single warm spotlight ----------
function plays() {
  const r = rng(31);
  return `${open(`
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c120d"/><stop offset="1" stop-color="#0e0907"/></linearGradient>
    <linearGradient id="fold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a1210"/><stop offset="0.5" stop-color="#4a1d18"/><stop offset="1" stop-color="#2a1210"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity="0.55">${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 70}" y="0" width="70" height="470" fill="url(#fold)"/>`).join('')}</g>
  <ellipse cx="470" cy="300" rx="260" ry="220" fill="#a85a32" opacity="0.35" filter="url(#blur50)"/>
  <path d="M440 -10 L500 -10 L660 480 L300 480 Z" fill="#f2cf98" opacity="0.2" filter="url(#blur24)"/>
  ${particles(r, { n: 70, x0: 330, x1: 620, y0: 20, y1: 460, color: '#f6dcb0', max: 1.6 })}
  <path d="M0 470 L${W} 470 L${W} ${H} L0 ${H} Z" fill="#1a110c"/>
  <ellipse cx="480" cy="488" rx="190" ry="26" fill="#e9b877" opacity="0.4" filter="url(#blur10)"/>
  ${figure({ x: 480, y: 486, s: 1.05, pose: POSES.declaim, rim: '#e9c088', rimOffset: [0, -3], skirt: COSTUME.kurta, back: COSTUME.cloak })}
  ${figure({ x: 690, y: 480, s: 0.8, pose: POSES.witness, rim: '#9a5a38', rimOffset: [-2, -2], skirt: COSTUME.lehenga })}
  <!-- out-of-focus curtain edge in the foreground -->
  <path d="M0 0 L130 0 C110 200 150 400 100 ${H} L0 ${H} Z" fill="#3a1512" filter="url(#blur10)"/>
  </svg>`;
}

// ---------- 2. Festivals: dancers round a fire under festival lights ----------
function festivals() {
  const r = rng(32);
  const bokeh = Array.from({ length: 34 }, (_, i) => {
    const x = 20 + i * 24 + r() * 10; const y = 70 + Math.sin(i / 5) * 40 + r() * 16;
    return `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(10 + r() * 9).toFixed(0)}" fill="${['#f2c46d', '#e8955a', '#f6dca8'][i % 3]}" opacity="${(0.35 + r() * 0.3).toFixed(2)}" filter="url(#blur4)"/>`;
  }).join('');
  const dancers = [250, 330, 410, 530, 610].map((x, i) => figure({ x, y: 470, s: 0.52, pose: i % 2 ? POSES.linkA : POSES.linkB,
    rim: '#f0a560', rimOffset: [0, -2], skirt: COSTUME.lehenga, extra: COSTUME.plume })).join('');
  const garland = Array.from({ length: 11 }, (_, i) => `<circle cx="${(700 + Math.sin(i * 0.8) * 10).toFixed(0)}" cy="${i * 30 - 10}" r="18" fill="${i % 3 ? '#c9711f' : '#d9a23a'}"/>`).join('');
  return `${open(`<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d1624"/><stop offset="0.6" stop-color="#3b2224"/><stop offset="1" stop-color="#5a3322"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${bokeh}
  <path d="M0 400 Q200 370 420 395 T${W} 385 L${W} ${H} L0 ${H} Z" fill="#20130f"/>
  <ellipse cx="470" cy="470" rx="260" ry="70" fill="#f08a3a" opacity="0.4" filter="url(#blur50)"/>
  <ellipse cx="470" cy="455" rx="26" ry="40" fill="#f6c46b" filter="url(#blur10)"/>
  ${particles(r, { n: 50, x0: 420, x1: 520, y0: 300, y1: 450, color: '#f6c46b', max: 1.8 })}
  ${dancers}
  <path d="M0 470 L${W} 470 L${W} ${H} L0 ${H} Z" fill="#150c09"/>
  <!-- blurred marigold garland in the foreground for depth -->
  <g filter="url(#blur4)">${garland}</g>
  </svg>`;
}

// ---------- 3. Workshops: a circle of young learners in window light ----------
function workshops() {
  const r = rng(33);
  const kids = [
    [150, 470, 0.5, P.sit], [250, 452, 0.46, P.sitRaise], [355, 444, 0.44, P.sit], [575, 444, 0.44, P.sit], [680, 452, 0.46, P.sit], [770, 470, 0.5, P.sitRaise],
  ].map(([x, y, s, pose]) => figure({ x, y, s, pose, rim: '#f2d3a0', rimOffset: [-2, -2], skirt: null })).join('');
  return `${open(`<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a1d"/><stop offset="1" stop-color="#241911"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3f28"/><stop offset="1" stop-color="#2a1c12"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#wall)"/>
  <rect x="60" y="60" width="120" height="220" rx="60" fill="#f4dfb4" opacity="0.85"/>
  <path d="M60 280 L180 280 L520 600 L240 600 Z" fill="#f4dfb4" opacity="0.14" filter="url(#blur24)"/>
  <path d="M0 380 L${W} 380 L${W} ${H} L0 ${H} Z" fill="url(#floor)"/>
  <g stroke="#6b4a2e" stroke-width="1.5" opacity="0.45">${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 64 - 40}" y1="380" x2="${(i * 64 - 40 - 400) * 1.7 + 400}" y2="${H}"/>`).join('')}</g>
  ${particles(r, { n: 90, x0: 80, x1: 560, y0: 60, y1: 560, color: '#f6e2bc', max: 1.5 })}
  <ellipse cx="460" cy="470" rx="330" ry="50" fill="#000" opacity="0.25" filter="url(#blur10)"/>
  ${figure({ x: 465, y: 470, s: 0.78, pose: P.guide, rim: '#f2d3a0', rimOffset: [-3, -2], skirt: COSTUME.lehenga })}
  ${kids}
  </svg>`;
}

// ---------- 4. Magazine: editorial still life of book, mask and lamp ----------
function magazine() {
  const r = rng(34);
  const lines = (x0, y0, w, n, skew) => Array.from({ length: n }, (_, i) => `<line x1="${x0}" y1="${y0 + i * 14}" x2="${x0 + w - (i % 4 === 3 ? 60 : 0)}" y2="${y0 + i * 14 + skew}" stroke="#8a7a66" stroke-width="3" stroke-linecap="round" opacity="0.45"/>`).join('');
  const marigold = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="0" cy="-14" rx="7" ry="13" fill="${i % 2 ? '#c9711f' : '#d98a2b'}" transform="rotate(${i * 30})"/>`).join('')}<circle r="8" fill="#9a4f14"/></g>`;
  return `${open(`<linearGradient id="table" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4a3322"/><stop offset="1" stop-color="#20150d"/></linearGradient>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9dcc2"/><stop offset="1" stop-color="#d6c5a6"/></linearGradient>
    <linearGradient id="page2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#cdbb9b"/><stop offset="1" stop-color="#eadfc6"/></linearGradient>
    <radialGradient id="light" cx="25%" cy="20%" r="80%"><stop offset="0" stop-color="#f4d7a2" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#table)"/>
  <g stroke="#2a1b11" stroke-width="2" opacity="0.5">${Array.from({ length: 9 }, (_, i) => `<path d="M-20 ${i * 76 + 20} C200 ${i * 76 + 5} 520 ${i * 76 + 40} 820 ${i * 76 + 18}" fill="none"/>`).join('')}</g>
  <!-- block-printed cloth -->
  <path d="M470 330 L820 270 L820 620 L560 620 Z" fill="#7a2e1f"/>
  <g fill="#d9a23a" opacity="0.55">${Array.from({ length: 40 }, (_, i) => `<circle cx="${520 + (i % 8) * 40 + (Math.floor(i / 8) % 2) * 20}" cy="${340 + Math.floor(i / 8) * 55}" r="5"/>`).join('')}</g>
  <!-- open book -->
  <g transform="translate(90 170) rotate(-8)">
    <path d="M10 20 L300 0 L300 330 L10 350 Z" fill="#000" opacity="0.35" filter="url(#blur10)" transform="translate(16 18)"/>
    <path d="M0 10 Q140 -10 290 12 L290 330 Q140 310 0 330 Z" fill="url(#page2)"/>
    <path d="M290 12 Q440 -10 580 10 L580 330 Q440 310 290 330 Z" fill="url(#page)"/>
    <path d="M290 12 L290 330" stroke="#a8977c" stroke-width="3"/>
    ${lines(30, 50, 230, 17, -1)}
    ${lines(320, 50, 230, 12, 1)}
    <rect x="330" y="230" width="200" height="80" fill="#9a6b3f" opacity="0.35"/>
  </g>
  ${mask(610, 190, 0.42, 14, { base: '#b0512f', crown: '#c79a3a', dot: '#ecd9b0', line: '#3a150b', smile: true })}
  <!-- brass diya with flame -->
  <g transform="translate(160 500)">
    <ellipse cx="0" cy="10" rx="70" ry="18" fill="#000" opacity="0.35" filter="url(#blur4)"/>
    <path d="M-60 -6 Q0 36 60 -6 Z" fill="#a8752e"/><ellipse cx="0" cy="-6" rx="60" ry="14" fill="#c9974a"/>
    <ellipse cx="18" cy="-34" rx="8" ry="20" fill="#f6d28a"/><ellipse cx="18" cy="-30" rx="3.5" ry="9" fill="#fff4d6"/>
    <circle cx="18" cy="-30" r="60" fill="#f2b45c" opacity="0.28" filter="url(#blur24)"/>
  </g>
  ${marigold(690, 470, 1.1)}${marigold(740, 520, 0.9)}${marigold(640, 540, 0.8)}
  <!-- quill -->
  <path d="M430 540 C500 470 580 440 660 420 C600 460 530 500 440 548 Z" fill="#d9ccb0" opacity="0.9"/>
  <path d="M430 540 L660 420" stroke="#8a7a66" stroke-width="2"/>
  <rect width="${W}" height="${H}" fill="url(#light)"/>
  ${particles(r, { n: 40, x0: 0, x1: 500, y0: 0, y1: 300, color: '#f6e2bc', max: 1.2 })}
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
  for (const [name, fn] of Object.entries({ plays, festivals, workshops, magazine })) {
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
