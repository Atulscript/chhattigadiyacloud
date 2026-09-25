// Generates the placeholder artwork for the homepage hero slider.
//   npm run hero-art
// Each scene is drawn as SVG (1920x1080, subject on the right so the slide
// text can sit on the left), then rendered with sharp to:
//   src/assets/images/hero/<name>.jpg|.webp            1920x1080 (desktop)
//   src/assets/images/hero/<name>-1280.jpg|.webp       1280x720
//   src/assets/images/hero/<name>-mobile.jpg|.webp     900x1200 portrait crop
// These are temporary: every slide image can be replaced from the admin panel
// (Pages > Homepage > Hero slider) without touching code.

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, 'src/assets/images/hero');
const W = 1920;
const H = 1080;

// Seeded random so the artwork is reproducible.
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- Shared pieces ----------
const defs = (extra = '') => `
  <defs>
    <filter id="blur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
    <filter id="blur80" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="80"/></filter>
    <radialGradient id="vignette" cx="60%" cy="45%" r="80%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.75"/>
    </radialGradient>
    ${extra}
  </defs>`;

const vignette = `<rect width="${W}" height="${H}" fill="url(#vignette)"/>`;

// Floating dust / sparks inside a light beam.
function particles(r, { n, x0, x1, y0, y1, color, max = 3 }) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = y0 + r() * (y1 - y0);
    out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.6 + r() * max).toFixed(1)}" fill="${color}" opacity="${(0.15 + r() * 0.6).toFixed(2)}"/>`;
  }
  return out;
}

// Stylised human silhouette. Joints are given relative to the feet midpoint
// (ground) for a figure ~340 units tall, then scaled. Limbs taper (thigh >
// shin, upper arm > forearm) and the torso is shaped, so figures read as
// performers rather than stick men. `rims` draws blurred coloured copies
// behind the figure, which read as stage back-light on its edges.
function figure({ x, y, s = 1, pose, fill = '#0a0706', rim = null, rimOffset = [0, 0], rims = null, skirt = null, extra = '', back = '' }) {
  const p = pose;
  const seg = (a, b, w) => `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round"/>`;
  const limb = (a, b, c, w1, w2) => `${seg(a, b, w1)}${seg(b, c, w2)}<circle cx="${b[0]}" cy="${b[1]}" r="${(w1 + w2) / 4}" fill="${fill}"/>`;
  const n = p.neck; const h = p.hip;
  const ls = [n[0] - 25, n[1] + 14]; const rs = [n[0] + 25, n[1] + 14];
  const wx = (n[0] + h[0] * 2) / 3; const wy = h[1] - 34;
  const torso = `M${ls[0] - 6} ${ls[1]} Q${n[0]} ${n[1] + 2} ${rs[0] + 6} ${rs[1]}
    C${rs[0] + 8} ${rs[1] + 40} ${wx + 18} ${wy - 20} ${wx + 15} ${wy}
    C${wx + 16} ${wy + 14} ${h[0] + 25} ${h[1] - 8} ${h[0] + 24} ${h[1] + 4} L${h[0] - 24} ${h[1] + 4}
    C${h[0] - 25} ${h[1] - 8} ${wx - 16} ${wy + 14} ${wx - 15} ${wy}
    C${wx - 18} ${wy - 20} ${ls[0] - 8} ${ls[1] + 40} ${ls[0] - 6} ${ls[1]} Z`;
  const foot = (k, f) => { const dir = f[0] >= k[0] ? 1 : -1; return `<ellipse cx="${f[0] + dir * 8}" cy="${f[1] - 4}" rx="15" ry="6" fill="${fill}"/>`; };
  const body = `
    ${back}
    ${limb([h[0] - 11, h[1]], p.lknee, p.lfoot, 32, 20)}${foot(p.lknee, p.lfoot)}
    ${limb([h[0] + 11, h[1]], p.rknee, p.rfoot, 32, 20)}${foot(p.rknee, p.rfoot)}
    ${skirt ? `<path d="${skirt}" fill="${fill}"/>` : ''}
    <path d="${torso}" fill="${fill}"/>
    ${limb(ls, p.lelbow, p.lhand, 17, 12)}<circle cx="${p.lhand[0]}" cy="${p.lhand[1]}" r="8" fill="${fill}"/>
    ${limb(rs, p.relbow, p.rhand, 17, 12)}<circle cx="${p.rhand[0]}" cy="${p.rhand[1]}" r="8" fill="${fill}"/>
    ${seg(n, [p.head[0], p.head[1] + 10], 13)}
    <ellipse cx="${p.head[0]}" cy="${p.head[1]}" rx="16" ry="19" fill="${fill}"/>
    ${extra}`;
  const lights = rims || (rim ? [{ color: rim, offset: rimOffset }] : []);
  const rimLayer = lights.map((l) => `<g transform="translate(${x + l.offset[0]} ${y + l.offset[1]}) scale(${s})" filter="url(#blur10)" opacity="0.95">${body.split(fill).join(l.color)}</g>`).join('');
  return `${rimLayer}<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;
}

// Poses (y up is negative).
const POSES = {
  // Actor mid-speech: lunging forward, one arm raised to the light.
  declaim: { head: [-14, -322], neck: [-8, -298], hip: [0, -172], lknee: [-66, -98], lfoot: [-116, 0], rknee: [38, -84], rfoot: [84, 0],
    lelbow: [-66, -336], lhand: [-92, -404], relbow: [74, -262], rhand: [146, -246] },
  // Second actor, still, hand on heart.
  witness: { head: [4, -320], neck: [2, -296], hip: [0, -172], lknee: [-14, -90], lfoot: [-22, 0], rknee: [18, -88], rfoot: [30, 0],
    lelbow: [-30, -228], lhand: [-2, -262], relbow: [34, -214], rhand: [40, -150] },
  // Karma dancers: arms stretched to their neighbours at waist height.
  linkA: { head: [0, -322], neck: [0, -298], hip: [0, -172], lknee: [-24, -88], lfoot: [-34, 0], rknee: [26, -86], rfoot: [42, -6],
    lelbow: [-52, -232], lhand: [-90, -206], relbow: [52, -232], rhand: [90, -206] },
  linkB: { head: [6, -316], neck: [4, -292], hip: [0, -170], lknee: [-30, -92], lfoot: [-46, -8], rknee: [22, -84], rfoot: [28, 0],
    lelbow: [-52, -228], lhand: [-90, -204], relbow: [52, -228], rhand: [90, -204] },
  drummer: { head: [10, -318], neck: [6, -294], hip: [0, -172], lknee: [-30, -88], lfoot: [-44, 0], rknee: [30, -88], rfoot: [44, 0],
    lelbow: [-52, -236], lhand: [-80, -208], relbow: [58, -238], rhand: [84, -210] },
  // Bharatanatyam aramandi: knees turned out, one arm extended, one at the chest.
  classical: { head: [0, -304], neck: [0, -280], hip: [0, -160], lknee: [-92, -100], lfoot: [-66, 0], rknee: [92, -100], rfoot: [66, 0],
    lelbow: [-112, -270], lhand: [-196, -268], relbow: [76, -240], rhand: [20, -224] },
  // Small distant performers.
  small1: { head: [0, -320], neck: [0, -296], hip: [0, -172], lknee: [-40, -94], lfoot: [-50, 0], rknee: [36, -92], rfoot: [52, 0],
    lelbow: [-60, -330], lhand: [-70, -392], relbow: [60, -330], rhand: [70, -392] },
  small2: { head: [4, -316], neck: [2, -292], hip: [0, -170], lknee: [-30, -90], lfoot: [-40, 0], rknee: [50, -110], rfoot: [96, -60],
    lelbow: [-70, -282], lhand: [-128, -300], relbow: [64, -282], rhand: [122, -300] },
};

// Costume pieces (in figure coordinates).
const COSTUME = {
  cloak: '<path d="M18 -284 C90 -250 150 -160 170 -40 C120 -30 70 -60 30 -120 Z" fill="#0a0706"/>',
  kurta: 'M-24 -176 C-40 -130 -54 -96 -60 -64 L60 -64 C54 -96 40 -130 24 -176 Z',
  lehenga: 'M-22 -200 C-42 -150 -70 -92 -86 -52 Q0 -30 86 -52 C70 -92 42 -150 22 -200 Z',
  plume: '<path d="M2 -334 C10 -366 30 -392 52 -404 C40 -380 22 -358 10 -334 Z" fill="#0a0706"/><circle cx="-2" cy="-332" r="7" fill="#0a0706"/>',
  turban: '<path d="M-18 -330 C-18 -352 18 -356 20 -330 Z" fill="#0a0706"/><path d="M14 -348 C30 -380 34 -404 26 -420 C18 -396 10 -372 8 -350 Z" fill="#0a0706"/>',
  mandar: '<path d="M-86 -222 C-60 -236 60 -236 86 -222 C92 -210 92 -196 86 -186 C60 -174 -60 -174 -86 -186 C-92 -196 -92 -210 -86 -222 Z" fill="#0a0706"/>',
  // Pleated fan between the knees + jewellery for the classical dancer.
  fan: 'M-24 -170 L24 -170 L86 -86 C40 -64 -40 -64 -86 -86 Z',
  bun: '<circle cx="16" cy="-314" r="12" fill="#0a0706"/><path d="M-16 -318 Q0 -344 16 -320" stroke="#0a0706" stroke-width="8" fill="none"/>',
};

// ---------- Scene 1: The Stage Comes Alive ----------
function sceneStage() {
  const r = rng(11);
  const cx = 1330;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(`
    <linearGradient id="s1bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0b0a"/><stop offset="1" stop-color="#0a0505"/></linearGradient>
    <linearGradient id="s1curtain" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#3a0b0d"/><stop offset="0.25" stop-color="#7c1a1c"/><stop offset="0.5" stop-color="#420c0f"/><stop offset="0.75" stop-color="#8a2022"/><stop offset="1" stop-color="#3a0b0d"/>
    </linearGradient>
    <linearGradient id="s1beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a8" stop-opacity="0.85"/><stop offset="1" stop-color="#ffb866" stop-opacity="0.12"/></linearGradient>
    <radialGradient id="s1pool" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#ffd48a" stop-opacity="0.95"/><stop offset="0.6" stop-color="#e08a3a" stop-opacity="0.35"/><stop offset="1" stop-color="#e08a3a" stop-opacity="0"/></radialGradient>
    <linearGradient id="s1floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a150e"/><stop offset="1" stop-color="#0d0705"/></linearGradient>
  `)}
  <rect width="${W}" height="${H}" fill="url(#s1bg)"/>
  <!-- back curtain folds -->
  <g opacity="0.55">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 120}" y="0" width="120" height="820" fill="url(#s1curtain)"/>`).join('')}</g>
  <rect width="${W}" height="820" fill="#0a0404" opacity="0.45"/>
  <!-- warm back glow behind the actor -->
  <ellipse cx="${cx}" cy="520" rx="520" ry="360" fill="#b8442a" opacity="0.35" filter="url(#blur80)"/>
  <!-- stage floor -->
  <path d="M0 820 L${W} 820 L${W} ${H} L0 ${H} Z" fill="url(#s1floor)"/>
  <g stroke="#3b2014" stroke-width="2" opacity="0.6">${Array.from({ length: 22 }, (_, i) => `<line x1="${i * 96 - 40}" y1="820" x2="${(i * 96 - 40 - 960) * 1.6 + 960}" y2="${H}"/>`).join('')}</g>
  <!-- spotlight cone -->
  <path d="M${cx - 40} -20 L${cx + 40} -20 L${cx + 300} 860 L${cx - 300} 860 Z" fill="url(#s1beam)" opacity="0.55" filter="url(#blur30)"/>
  <path d="M${cx - 16} -20 L${cx + 16} -20 L${cx + 180} 860 L${cx - 180} 860 Z" fill="#fff1cf" opacity="0.18" filter="url(#blur10)"/>
  ${particles(r, { n: 160, x0: cx - 240, x1: cx + 240, y0: 40, y1: 800, color: '#ffe9c2', max: 2.4 })}
  <!-- pool of light -->
  <ellipse cx="${cx}" cy="850" rx="360" ry="70" fill="url(#s1pool)"/>
  <!-- actors -->
  ${figure({ x: 1610, y: 850, s: 0.98, pose: POSES.witness, rim: '#c85a34', rimOffset: [-4, -2], skirt: COSTUME.kurta })}
  ${figure({ x: cx, y: 858, s: 1.3, pose: POSES.declaim, rim: '#ffd08a', rimOffset: [0, -5], skirt: COSTUME.kurta, back: COSTUME.cloak })}
  <!-- haze drifting across the stage -->
  <ellipse cx="${cx}" cy="820" rx="620" ry="70" fill="#ffc98a" opacity="0.16" filter="url(#blur30)"/>
  <!-- reflection -->
  <ellipse cx="${cx}" cy="880" rx="140" ry="16" fill="#000" opacity="0.55" filter="url(#blur4)"/>
  <!-- front curtains (right edge) + valance -->
  <path d="M${W} 0 L${W - 170} 0 C${W - 150} 300 ${W - 210} 600 ${W - 120} ${H} L${W} ${H} Z" fill="url(#s1curtain)"/>
  <path d="M0 0 L${W} 0 L${W} 90 C1500 130 420 130 0 90 Z" fill="#5a1214"/>
  <path d="M0 86 C420 126 1500 126 ${W} 86" stroke="#c8913d" stroke-width="5" fill="none" opacity="0.8"/>
  ${vignette}
</svg>`;
}

// ---------- Scene 2: Celebrating Art & Culture (folk dance at dusk) ----------
function sceneFolk() {
  const r = rng(22);
  const trees = Array.from({ length: 18 }, (_, i) => {
    const x = i * 118 + r() * 40 - 20;
    const h = 180 + r() * 150;
    return `<path d="M${x} 760 L${x + 6} ${760 - h * 0.55} L${x + 12} 760 Z" fill="#150b14"/><ellipse cx="${x + 6}" cy="${760 - h * 0.6}" rx="${36 + r() * 30}" ry="${h * 0.42}" fill="#150b14"/>`;
  }).join('');
  // Circle dance in depth: nearer dancers larger and lower.
  const dancers = [
    { x: 1030, y: 846, pose: POSES.linkA, s: 0.78 },
    { x: 1150, y: 856, pose: POSES.linkB, s: 0.86 },
    { x: 1282, y: 866, pose: POSES.linkA, s: 0.92 },
    { x: 1440, y: 868, pose: POSES.linkB, s: 0.94 },
    { x: 1580, y: 860, pose: POSES.linkA, s: 0.88 },
    { x: 1730, y: 850, pose: POSES.drummer, s: 0.9, drum: true },
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(`
    <linearGradient id="s2sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#140f2e"/><stop offset="0.45" stop-color="#4a1f4a"/><stop offset="0.72" stop-color="#c2502c"/><stop offset="0.86" stop-color="#f3a246"/><stop offset="1" stop-color="#f7c46a"/>
    </linearGradient>
    <radialGradient id="s2fire" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="#fff0b3"/><stop offset="0.35" stop-color="#ffb13b"/><stop offset="0.7" stop-color="#e2531b" stop-opacity="0.6"/><stop offset="1" stop-color="#e2531b" stop-opacity="0"/></radialGradient>
    <linearGradient id="s2ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a130c"/><stop offset="1" stop-color="#0b0605"/></linearGradient>
  `)}
  <rect width="${W}" height="${H}" fill="url(#s2sky)"/>
  <circle cx="1560" cy="610" r="120" fill="#ffd98a" opacity="0.85" filter="url(#blur30)"/>
  ${particles(r, { n: 70, x0: 0, x1: W, y0: 0, y1: 360, color: '#fff6e0', max: 1.6 })}
  <!-- hills + sal forest -->
  <path d="M0 700 Q300 610 640 680 T1300 650 T${W} 670 L${W} 780 L0 780 Z" fill="#2b1328" opacity="0.9"/>
  ${trees}
  <path d="M0 760 L${W} 760 L${W} ${H} L0 ${H} Z" fill="url(#s2ground)"/>
  <!-- bonfire glow -->
  <ellipse cx="1360" cy="800" rx="520" ry="150" fill="#ff8a2b" opacity="0.35" filter="url(#blur80)"/>
  <ellipse cx="1360" cy="760" rx="120" ry="150" fill="url(#s2fire)" filter="url(#blur10)"/>
  ${particles(r, { n: 90, x0: 1240, x1: 1480, y0: 380, y1: 760, color: '#ffc46b', max: 2.6 })}
  <!-- dancers in a line, arms linked -->
  ${dancers.map((d) => figure({ x: d.x, y: d.y, s: d.s, pose: d.pose, rim: '#ff9a45', rimOffset: [0, -3],
    skirt: d.drum ? COSTUME.kurta : COSTUME.lehenga, extra: d.drum ? COSTUME.turban + COSTUME.mandar : COSTUME.plume })).join('')}
  <ellipse cx="1360" cy="880" rx="560" ry="46" fill="#ffb060" opacity="0.18" filter="url(#blur30)"/>
  ${vignette}
</svg>`;
}

// ---------- Scene 3: Where Art Meets Performance (classical dancer) ----------
function sceneClassical() {
  const r = rng(33);
  const cx = 1340;
  const petals = Array.from({ length: 24 }, (_, i) => {
    const a = (i / 24) * Math.PI * 2;
    const x = cx + Math.cos(a) * 330; const y = 470 + Math.sin(a) * 330;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="#f7c46a" opacity="0.8"/>`;
  }).join('');
  const diyas = Array.from({ length: 9 }, (_, i) => {
    const x = 900 + i * 110;
    return `<ellipse cx="${x}" cy="880" rx="26" ry="9" fill="#5a2a12"/><ellipse cx="${x}" cy="862" rx="7" ry="16" fill="#ffd27a"/><ellipse cx="${x}" cy="862" rx="40" ry="46" fill="#ffae45" opacity="0.35" filter="url(#blur10)"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(`
    <radialGradient id="s3bg" cx="70%" cy="45%" r="70%"><stop offset="0" stop-color="#3a1030"/><stop offset="0.6" stop-color="#140818"/><stop offset="1" stop-color="#07040a"/></radialGradient>
    <radialGradient id="s3halo" cx="50%" cy="50%" r="50%"><stop offset="0.55" stop-color="#f08a3a" stop-opacity="0"/><stop offset="0.8" stop-color="#f08a3a" stop-opacity="0.55"/><stop offset="1" stop-color="#f08a3a" stop-opacity="0"/></radialGradient>
  `)}
  <rect width="${W}" height="${H}" fill="url(#s3bg)"/>
  <!-- coloured side lights -->
  <path d="M${W} 120 L${cx + 60} 520 L${cx + 60} 700 L${W} 980 Z" fill="#1fb5a8" opacity="0.28" filter="url(#blur30)"/>
  <path d="M700 60 L${cx - 60} 500 L${cx - 60} 700 L700 1040 Z" fill="#e0327a" opacity="0.3" filter="url(#blur30)"/>
  <!-- halo ring (temple lamp aura) -->
  <circle cx="${cx}" cy="470" r="360" fill="url(#s3halo)"/>
  <circle cx="${cx}" cy="470" r="330" fill="none" stroke="#f7c46a" stroke-width="3" opacity="0.7"/>
  <circle cx="${cx}" cy="470" r="300" fill="none" stroke="#f7c46a" stroke-width="1.5" stroke-dasharray="4 10" opacity="0.6"/>
  ${petals}
  ${particles(r, { n: 120, x0: 900, x1: 1800, y0: 80, y1: 820, color: '#ffd9ef', max: 2 })}
  <!-- floor -->
  <path d="M0 880 L${W} 880 L${W} ${H} L0 ${H} Z" fill="#0b0508"/>
  <ellipse cx="${cx}" cy="900" rx="420" ry="40" fill="#e0327a" opacity="0.25" filter="url(#blur30)"/>
  ${diyas}
  <!-- dancer: magenta rim on one side, teal on the other -->
  ${figure({ x: cx, y: 880, s: 1.55, pose: POSES.classical,
    rims: [{ color: '#ff4f9a', offset: [-8, -2] }, { color: '#28e0cf', offset: [8, -2] }],
    skirt: COSTUME.fan, extra: COSTUME.bun })}
  <!-- fan pleats catch the light -->
  <g transform="translate(${cx} 880) scale(1.55)" stroke="#c8913d" stroke-width="1.6" opacity="0.8">
    <path d="M-12 -168 L-50 -80 M0 -168 L0 -70 M12 -168 L50 -80 M-6 -168 L-26 -76 M6 -168 L26 -76"/>
  </g>
  ${vignette}
</svg>`;
}

// ---------- Scene 4: Stories Told Through Art (folk masks) ----------
function mask(x, y, s, rot, c) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <ellipse cx="0" cy="0" rx="150" ry="195" fill="#000" opacity="0.5" filter="url(#blur30)" transform="translate(24 30)"/>
    <path d="M-150 -60 C-160 -200 160 -200 150 -60 C150 90 70 200 0 205 C-70 200 -150 90 -150 -60 Z" fill="${c.base}"/>
    <path d="M-150 -60 C-160 -200 160 -200 150 -60 C150 90 70 200 0 205 C-70 200 -150 90 -150 -60 Z" fill="url(#s4shade)"/>
    <!-- crown -->
    <path d="M-140 -110 L-110 -220 L-60 -150 L0 -250 L60 -150 L110 -220 L140 -110 Z" fill="${c.crown}"/>
    ${[-110, -55, 0, 55, 110].map((cx) => `<circle cx="${cx}" cy="-128" r="9" fill="${c.dot}"/>`).join('')}
    <!-- brows, eyes -->
    <path d="M-112 -40 Q-66 -86 -20 -46" stroke="${c.line}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M112 -40 Q66 -86 20 -46" stroke="${c.line}" stroke-width="12" fill="none" stroke-linecap="round"/>
    <path d="M-104 -6 Q-66 -40 -28 -6 Q-66 22 -104 -6 Z" fill="#0b0605"/>
    <path d="M104 -6 Q66 -40 28 -6 Q66 22 104 -6 Z" fill="#0b0605"/>
    <circle cx="-66" cy="-8" r="7" fill="${c.dot}"/><circle cx="66" cy="-8" r="7" fill="${c.dot}"/>
    <!-- nose, cheeks, mouth -->
    <path d="M0 -20 L-18 60 L18 60 Z" fill="${c.line}" opacity="0.7"/>
    <path d="M-120 40 Q-100 70 -70 60 M120 40 Q100 70 70 60" stroke="${c.dot}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M-60 100 Q0 ${c.smile ? 160 : 80} 60 100 Q0 ${c.smile ? 130 : 120} -60 100 Z" fill="#240707"/>
    <!-- tilak + dotted border -->
    <path d="M0 -110 L-10 -60 L0 -40 L10 -60 Z" fill="${c.dot}"/>
    ${Array.from({ length: 22 }, (_, i) => { const a = Math.PI * (0.1 + (i / 21) * 0.8); return `<circle cx="${(Math.cos(a) * 128).toFixed(1)}" cy="${(40 + Math.sin(a) * 140).toFixed(1)}" r="4.5" fill="${c.dot}" opacity="0.9"/>`; }).join('')}
  </g>`;
}
function sceneMasks() {
  const r = rng(44);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(`
    <radialGradient id="s4bg" cx="72%" cy="40%" r="75%"><stop offset="0" stop-color="#3a2317"/><stop offset="0.55" stop-color="#1a0f0b"/><stop offset="1" stop-color="#080504"/></radialGradient>
    <radialGradient id="s4shade" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>
  `)}
  <rect width="${W}" height="${H}" fill="url(#s4bg)"/>
  <!-- Gond-style painted wall pattern, faint -->
  <g opacity="0.14" stroke="#e8b46a" stroke-width="3" fill="none">
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${900 + i * 120} 0 Q${960 + i * 120} 540 ${900 + i * 120} ${H}"/>`).join('')}
  </g>
  ${particles(r, { n: 260, x0: 880, x1: W, y0: 0, y1: H, color: '#e8b46a', max: 2.2 })}
  <!-- key light -->
  <ellipse cx="1360" cy="420" rx="560" ry="420" fill="#ffb35c" opacity="0.22" filter="url(#blur80)"/>
  <!-- hanging strings -->
  <path d="M1180 0 L1180 150 M1560 0 L1560 250" stroke="#8a6a44" stroke-width="3"/>
  ${mask(1180, 420, 1.05, -8, { base: '#d9432b', crown: '#e7a92e', dot: '#fbe7b0', line: '#3a0d07', smile: true })}
  ${mask(1570, 560, 0.95, 9, { base: '#1f6f73', crown: '#d9432b', dot: '#f7d77e', line: '#07222a', smile: false })}
  <!-- brushes -->
  <g transform="translate(980 860) rotate(-18)">
    <rect x="0" y="0" width="360" height="16" rx="8" fill="#6b3b1d"/><path d="M360 -6 L440 8 L360 22 Z" fill="#e7a92e"/>
  </g>
  <g transform="translate(1100 930) rotate(-8)">
    <rect x="0" y="0" width="300" height="14" rx="7" fill="#2e5a38"/><path d="M300 -5 L370 7 L300 19 Z" fill="#d9432b"/>
  </g>
  ${vignette}
</svg>`;
}

// ---------- Scene 5: A Celebration of Creativity (audience + stage) ----------
function sceneAudience() {
  const r = rng(55);
  const beams = [
    ['#ff7a2f', 900, 0.34], ['#ff3f8e', 1150, 0.3], ['#ffd36b', 1380, 0.38], ['#2fd3c5', 1620, 0.3], ['#9d6bff', 1820, 0.26],
  ].map(([c, x, o]) => `<path d="M${x - 24} -20 L${x + 24} -20 L${1350 + (x - 1350) * 0.25 + 120} 700 L${1350 + (x - 1350) * 0.25 - 120} 700 Z" fill="${c}" opacity="${o}" filter="url(#blur30)"/>`).join('');
  let heads = '';
  for (let row = 0; row < 3; row++) {
    const y = 960 + row * 70;
    for (let i = 0; i < 20; i++) {
      const x = i * 104 + (row % 2) * 52 + r() * 24;
      const s = 1 + row * 0.25;
      heads += `<g transform="translate(${x.toFixed(1)} ${y}) scale(${s})"><circle cx="0" cy="-58" r="${(24 + r() * 5).toFixed(1)}" fill="#07050a"/><path d="M-58 20 C-56 -20 -36 -36 0 -36 C36 -36 56 -20 58 20 Z" fill="#07050a"/></g>`;
    }
  }
  const performers = [
    { x: 1190, pose: POSES.small2, s: 0.6 }, { x: 1300, pose: POSES.small1, s: 0.66 },
    { x: 1410, pose: POSES.small2, s: 0.64 }, { x: 1520, pose: POSES.linkA, s: 0.6 },
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs(`
    <linearGradient id="s5bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0a1c"/><stop offset="0.7" stop-color="#1b0f24"/><stop offset="1" stop-color="#060409"/></linearGradient>
    <linearGradient id="s5stage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf8a" stop-opacity="0.9"/><stop offset="1" stop-color="#6a2a1a" stop-opacity="0.6"/></linearGradient>
  `)}
  <rect width="${W}" height="${H}" fill="url(#s5bg)"/>
  <!-- stage frame -->
  <rect x="820" y="160" width="1060" height="600" fill="#2a1414"/>
  <ellipse cx="1350" cy="560" rx="560" ry="260" fill="#ff8a3d" opacity="0.4" filter="url(#blur80)"/>
  ${beams}
  ${particles(r, { n: 180, x0: 860, x1: 1860, y0: 0, y1: 700, color: '#fff0d6', max: 2 })}
  <path d="M820 700 L1880 700 L1940 770 L760 770 Z" fill="url(#s5stage)"/>
  ${performers.map((p) => figure({ x: p.x, y: 702, s: p.s, pose: p.pose, rim: '#ffd9a0', rimOffset: [0, -2], skirt: COSTUME.kurta })).join('')}
  <!-- proscenium arch -->
  <path d="M780 ${H} L780 150 Q1350 60 1920 150 L1920 0 L720 0 L720 ${H} Z" fill="#0c0a14"/>
  <path d="M790 ${H} L790 158 Q1350 70 1920 158" stroke="#c8913d" stroke-width="4" fill="none" opacity="0.8"/>
  <!-- phone lights in the crowd -->
  ${particles(r, { n: 14, x0: 200, x1: 1800, y0: 860, y1: 920, color: '#cfe8ff', max: 3 })}
  ${heads}
  ${vignette}
</svg>`;
}

const SCENES = {
  'stage-alive': { svg: sceneStage, focusX: 1330 },
  'folk-celebration': { svg: sceneFolk, focusX: 1380 },
  'classical-dance': { svg: sceneClassical, focusX: 1320 },
  'masks-stories': { svg: sceneMasks, focusX: 1380 },
  'creative-stage': { svg: sceneAudience, focusX: 1350 },
};

async function render(name, { svg, focusX }) {
  const src = Buffer.from(svg());
  fs.writeFileSync(path.join(OUT, 'src', `${name}.svg`), src);
  const base = sharp(src, { density: 144 }).resize(W * 2, H * 2); // 2x for crisp downscales
  const png = await base.png().toBuffer();
  const out = async (img, file, q) => {
    await img.clone().jpeg({ quality: q, mozjpeg: true, progressive: true }).toFile(path.join(OUT, `${file}.jpg`));
    await img.clone().webp({ quality: q - 4, effort: 6 }).toFile(path.join(OUT, `${file}.webp`));
  };
  await out(sharp(png).resize(1920, 1080), name, 78);
  await out(sharp(png).resize(1280, 720), `${name}-1280`, 76);
  // Mobile: a 3:4 portrait frame with the subject in the upper part and a
  // fade to dark below, where the slide text sits on phones.
  const cw = 1250 * 2;
  const left = Math.max(0, Math.min(W * 2 - cw, Math.round(focusX * 2 - cw / 2)));
  const top = await sharp(png).extract({ left, top: 0, width: cw, height: H * 2 }).resize(900).toBuffer();
  const th = Math.round((900 * H * 2) / cw);
  const fade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
    <stop offset="${((th - 260) / 1200).toFixed(3)}" stop-color="#0b0706" stop-opacity="0"/><stop offset="${(th / 1200).toFixed(3)}" stop-color="#0b0706"/></linearGradient></defs>
    <rect width="900" height="1200" fill="url(#f)"/></svg>`);
  const mobile = sharp({ create: { width: 900, height: 1200, channels: 3, background: '#0b0706' } })
    .composite([{ input: top, left: 0, top: 0 }, { input: fade, left: 0, top: 0 }]);
  await out(sharp(await mobile.png().toBuffer()), `${name}-mobile`, 76);
}

(async () => {
  fs.mkdirSync(path.join(OUT, 'src'), { recursive: true });
  for (const [name, scene] of Object.entries(SCENES)) {
    await render(name, scene);
    console.log('hero art:', name);
  }
})();
