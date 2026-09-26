// Generates the footer background artwork.
//   npm run footer-art
// A night scene in the site's folk style: moon, stars, a Gond-style tree and
// dancers round a fire along the sal-forest ridge. Art sits on the right and
// along the bottom so the footer text on the left stays readable.
// Output: src/assets/images/footer-bg.webp|.jpg (1920x760) and
//         footer-bg-1000.webp|.jpg (1000 wide, phones and tablets).

const path = require('path');
const sharp = require('sharp');
const { rng, particles, figure, POSES, COSTUME } = require('./generate-hero-art.js');

const W = 1920;
const H = 760;
const OUT = path.join(__dirname, 'src/assets/images');

function svg() {
  const r = rng(707);
  const colors = ['#c2502c', '#d9962b', '#2e8a6a', '#b8336a', '#3a8fb0'];
  // Gond tree: striped trunk, dotted leaves.
  let leaves = '';
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2; const d = 90 + r() * 230;
    const x = 1640 + Math.cos(a) * d * 1.2; const y = 250 + Math.sin(a) * d * 0.7;
    const c = colors[i % colors.length];
    leaves += `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${(a * 57 + 90).toFixed(0)})"><path d="M0 0 C24 -32 72 -32 96 0 C72 32 24 32 0 0 Z" fill="${c}"/><path d="M6 0 L90 0" stroke="#150d1c" stroke-width="2.5"/>${[20, 36, 52, 68].map((cx) => `<circle cx="${cx}" cy="-8" r="3" fill="#f6e7c8"/><circle cx="${cx}" cy="8" r="3" fill="#f6e7c8"/>`).join('')}</g>`;
  }
  const trees = Array.from({ length: 34 }, (_, i) => {
    const x = i * 60 + r() * 30; const h = 90 + r() * 150; const b = 690;
    return `<path d="M${(x - 3).toFixed(0)} ${b} L${x.toFixed(0)} ${(b - h * 0.6).toFixed(0)} L${(x + 3).toFixed(0)} ${b} Z" fill="#0f0a10"/><ellipse cx="${x.toFixed(0)}" cy="${(b - h * 0.62).toFixed(0)}" rx="${(h * 0.16).toFixed(0)}" ry="${(h * 0.4).toFixed(0)}" fill="#0f0a10"/>`;
  }).join('');
  const dancers = [1180, 1265, 1350, 1520, 1605].map((x, i) => figure({
    x, y: 712, s: 0.34, pose: i % 2 ? POSES.linkA : POSES.linkB, fill: '#0a0608', rim: '#ff9a45', rimOffset: [0, -2], skirt: COSTUME.lehenga, extra: COSTUME.plume,
  })).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <defs>
    <filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="blur40" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#120d1c"/><stop offset="0.75" stop-color="#1c1018"/><stop offset="1" stop-color="#241410"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  ${particles(r, { n: 180, x0: 700, x1: W, y0: 0, y1: 520, color: '#f6e7c8', max: 1.6 })}
  ${particles(r, { n: 60, x0: 0, x1: 700, y0: 0, y1: 400, color: '#f6e7c8', max: 1.1 })}
  <circle cx="1420" cy="110" r="42" fill="#f6e2b8" opacity="0.9"/>
  <circle cx="1420" cy="110" r="115" fill="#f6d28a" opacity="0.18" filter="url(#blur40)"/>
  <g opacity="0.55">
    <path d="M1600 700 C1610 560 1596 470 1580 410 L1600 400 C1616 440 1630 470 1640 510 C1650 470 1670 430 1700 400 L1716 412 C1690 460 1676 520 1676 700 Z" fill="#7a3f1a"/>
    ${leaves}
  </g>
  <path d="M0 640 Q300 600 700 630 T1400 610 T${W} 620 L${W} ${H} L0 ${H} Z" fill="#1a0f14"/>
  ${trees}
  <ellipse cx="1435" cy="712" rx="180" ry="36" fill="#ff8a2b" opacity="0.35" filter="url(#blur40)"/>
  <ellipse cx="1435" cy="700" rx="16" ry="26" fill="#ffc46b" filter="url(#blur10)"/>
  ${particles(r, { n: 40, x0: 1390, x1: 1480, y0: 560, y1: 700, color: '#ffc46b', max: 1.8 })}
  ${dancers}
  <path d="M0 712 L${W} 712 L${W} ${H} L0 ${H} Z" fill="#120a0a"/>
  <!-- dotted folk border along the bottom -->
  ${Array.from({ length: 96 }, (_, i) => `<circle cx="${i * 20 + 10}" cy="736" r="2.4" fill="#d9962b" opacity="0.5"/>`).join('')}
</svg>`;
}

(async () => {
  const png = await sharp(Buffer.from(svg()), { density: 144 }).resize(W * 2, H * 2).png().toBuffer();
  const out = async (w, file) => {
    const img = sharp(png).resize(w);
    await img.clone().webp({ quality: 70, effort: 6 }).toFile(path.join(OUT, `${file}.webp`));
    await img.clone().jpeg({ quality: 72, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${file}.jpg`));
  };
  await out(1920, 'footer-bg');
  await out(1000, 'footer-bg-1000');
  console.log('footer art written');
})();
