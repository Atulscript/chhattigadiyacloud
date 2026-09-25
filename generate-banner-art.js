// Generates the placeholder artwork for the page-title banner sliders.
//   npm run banner-art
// Each inner page gets three related images (see PAGE_BANNERS below and
// siteData.pageBanners). Scenes are drawn as SVG with the shared helpers from
// generate-hero-art.js and written to src/assets/images/hero/ as:
//   <name>-banner.jpg|.webp          1920x640 strip (tablet/desktop)
//   <name>-banner-1280.jpg|.webp     1280x427
//   <name>-banner-mobile.jpg|.webp   900x960, subject high, dark below
// All of them can be replaced from the admin panel (Pages > Page Headers).

const fs = require('fs');
const path = require('path');
const {
  W, H, rng, defs, vignette, particles, figure, POSES, COSTUME, mask, SCENES, renderBanner, OUT,
} = require('./generate-hero-art.js');

const svgOpen = (extraDefs) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs(extraDefs)}`;
const mirror = (pose) => Object.fromEntries(Object.entries(pose).map(([k, [x, y]]) => [k, [-x, y]]));

// Extra poses for the banner scenes.
const P = {
  talk: { head: [10, -322], neck: [6, -298], hip: [0, -172], lknee: [-20, -88], lfoot: [-40, 0], rknee: [26, -90], rfoot: [46, 0],
    lelbow: [-40, -228], lhand: [-30, -176], relbow: [62, -262], rhand: [120, -292] },
  listen: { head: [8, -318], neck: [4, -294], hip: [0, -172], lknee: [-16, -88], lfoot: [-30, 0], rknee: [22, -88], rfoot: [34, 0],
    lelbow: [-34, -226], lhand: [4, -250], relbow: [36, -226], rhand: [12, -262] },
  poet: { head: [4, -320], neck: [2, -296], hip: [0, -172], lknee: [-14, -90], lfoot: [-24, 0], rknee: [18, -88], rfoot: [30, 0],
    lelbow: [-40, -222], lhand: [-46, -168], relbow: [52, -248], rhand: [74, -278] },
  teacher: { head: [0, -322], neck: [0, -298], hip: [0, -172], lknee: [-24, -90], lfoot: [-36, 0], rknee: [24, -90], rfoot: [36, 0],
    lelbow: [-70, -310], lhand: [-96, -360], relbow: [70, -310], rhand: [96, -360] },
  flute: { head: [0, -322], neck: [0, -298], hip: [0, -172], lknee: [-14, -90], lfoot: [-24, 0], rknee: [18, -88], rfoot: [30, 0],
    lelbow: [-40, -270], lhand: [-10, -318], relbow: [44, -270], rhand: [40, -316] },
};

// ---------- Theatre ----------
function sceneRehearsal() {
  const r = rng(101);
  const lamp = (x, flip) => `<g transform="translate(${x} 0)">
      <path d="M0 860 L0 380" stroke="#2a211c" stroke-width="8"/><path d="M-40 860 L0 820 L40 860" stroke="#2a211c" stroke-width="8" fill="none"/>
      <path d="M-34 330 L34 330 L${flip ? -10 : 10} 390 Z" fill="#2a211c"/>
      <ellipse cx="0" cy="370" rx="26" ry="10" fill="#fff4d6"/>
      <path d="M-26 372 L26 372 L${flip ? -420 : 420} 900 L${flip ? -700 : 700} 900 Z" fill="#fff0c8" opacity="0.10" filter="url(#blur30)"/>
    </g>`;
  return `${svgOpen(`<linearGradient id="rbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16110e"/><stop offset="1" stop-color="#0b0807"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#rbg)"/>
  <g stroke="#221a15" stroke-width="3">${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 140}" y1="0" x2="${i * 140}" y2="820"/>`).join('')}</g>
  <ellipse cx="1330" cy="600" rx="560" ry="300" fill="#e9b877" opacity="0.2" filter="url(#blur80)"/>
  <path d="M0 820 L${W} 820 L${W} ${H} L0 ${H} Z" fill="#1c140f"/>
  <g stroke="#2e2118" stroke-width="2">${Array.from({ length: 22 }, (_, i) => `<line x1="${i * 96 - 40}" y1="820" x2="${(i * 96 - 40 - 960) * 1.6 + 960}" y2="${H}"/>`).join('')}</g>
  ${lamp(900, false)}${lamp(1780, true)}
  ${particles(r, { n: 80, x0: 1000, x1: 1700, y0: 200, y1: 800, color: '#ffe9c2', max: 2 })}
  <!-- chair + script pages -->
  <g fill="#0a0706"><rect x="1560" y="700" width="90" height="12"/><rect x="1560" y="600" width="12" height="112"/><rect x="1570" y="712" width="10" height="120"/><rect x="1640" y="712" width="10" height="120"/></g>
  <g fill="#e8dcc4" opacity="0.8"><path d="M1180 866 l60 -8 l8 30 l-60 8 z"/><path d="M1250 872 l56 4 l-4 28 l-56 -4 z"/></g>
  ${figure({ x: 1200, y: 850, s: 1.12, pose: P.talk, rim: '#f3c98b', rimOffset: [-4, -3], skirt: COSTUME.kurta })}
  ${figure({ x: 1470, y: 850, s: 1.08, pose: mirror(P.listen), rim: '#f3c98b', rimOffset: [4, -3], skirt: COSTUME.lehenga })}
  ${vignette}</svg>`;
}

function sceneCurtainCall() {
  const r = rng(102);
  const petals = Array.from({ length: 90 }, () => {
    const c = ['#ff7a2f', '#ffd36b', '#ff4f6d', '#fff1d0'][Math.floor(r() * 4)];
    return `<ellipse cx="${(900 + r() * 1020).toFixed(0)}" cy="${(40 + r() * 700).toFixed(0)}" rx="${(4 + r() * 6).toFixed(1)}" ry="${(2 + r() * 3).toFixed(1)}" fill="${c}" opacity="${(0.5 + r() * 0.5).toFixed(2)}" transform="rotate(${(r() * 180).toFixed(0)} 0 0)"/>`;
  }).join('');
  const cast = [900, 1040, 1180, 1320, 1460, 1600];
  return `${svgOpen(`
    <linearGradient id="ccurt" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3a0b0d"/><stop offset="0.5" stop-color="#8a2022"/><stop offset="1" stop-color="#3a0b0d"/></linearGradient>
    <radialGradient id="cglow" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#ffcf8a" stop-opacity="0.8"/><stop offset="1" stop-color="#ffcf8a" stop-opacity="0"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="#140807"/>
  <g opacity="0.5">${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 120}" y="0" width="120" height="820" fill="url(#ccurt)"/>`).join('')}</g>
  <ellipse cx="1380" cy="560" rx="700" ry="420" fill="url(#cglow)"/>
  <path d="M0 820 L${W} 820 L${W} ${H} L0 ${H} Z" fill="#1d0f0a"/>
  <ellipse cx="1380" cy="850" rx="620" ry="60" fill="#ffb866" opacity="0.35" filter="url(#blur30)"/>
  ${cast.map((x, i) => figure({ x, y: 850, s: 0.95, pose: i % 2 ? P.teacher : POSES.small1, rim: '#ffd08a', rimOffset: [0, -3], skirt: i % 2 ? COSTUME.lehenga : COSTUME.kurta })).join('')}
  ${petals}
  <path d="M${W} 0 L${W - 150} 0 C${W - 130} 300 ${W - 190} 600 ${W - 110} ${H} L${W} ${H} Z" fill="url(#ccurt)"/>
  <path d="M0 0 L${W} 0 L${W} 80 C1500 120 420 120 0 80 Z" fill="#5a1214"/>
  ${vignette}</svg>`;
}

function sceneSeats() {
  const r = rng(103);
  let rows = '';
  for (let i = 0; i < 9; i++) {
    const y = 520 + i * 62; const sc = 0.55 + i * 0.09; const n = 18 - i;
    const w = 78 * sc;
    for (let j = 0; j < n + 6; j++) {
      const x = 1360 + (j - (n + 6) / 2) * (w + 8 * sc) + (i % 2) * w * 0.5;
      rows += `<path d="M${x.toFixed(0)} ${y} q0 ${(-46 * sc).toFixed(0)} ${(w / 2).toFixed(0)} ${(-46 * sc).toFixed(0)} q${(w / 2).toFixed(0)} 0 ${(w / 2).toFixed(0)} ${(46 * sc).toFixed(0)} z" fill="${i % 2 ? '#6e1518' : '#7c1a1c'}"/>`;
    }
  }
  return `${svgOpen(`<radialGradient id="sbg" cx="65%" cy="30%" r="80%"><stop offset="0" stop-color="#3a1512"/><stop offset="1" stop-color="#0b0605"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#sbg)"/>
  <!-- balcony + exit glow -->
  <path d="M700 330 Q1300 250 1920 330 L1920 380 Q1300 300 700 380 Z" fill="#2a0f0d"/>
  <path d="M700 330 Q1300 250 1920 330" stroke="#c8913d" stroke-width="3" fill="none" opacity="0.7"/>
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${760 + i * 100}" cy="${318 - Math.sin((i / 11) * Math.PI) * 40}" r="5" fill="#ffd79a"/><circle cx="${760 + i * 100}" cy="${318 - Math.sin((i / 11) * Math.PI) * 40}" r="16" fill="#ffc46b" opacity="0.3" filter="url(#blur4)"/>`).join('')}
  <!-- spotlight beam crossing the house -->
  <path d="M1900 0 L1960 0 L1350 900 L1150 900 Z" fill="#ffe2a8" opacity="0.14" filter="url(#blur30)"/>
  ${particles(r, { n: 120, x0: 1150, x1: 1900, y0: 0, y1: 900, color: '#ffe9c2', max: 2 })}
  <g opacity="0.95">${rows}</g>
  <!-- ghost light on the stage edge -->
  <path d="M1720 ${H} L1720 780" stroke="#1a1310" stroke-width="10"/>
  <circle cx="1720" cy="770" r="14" fill="#fff7e0"/><circle cx="1720" cy="770" r="80" fill="#ffd79a" opacity="0.35" filter="url(#blur30)"/>
  <path d="M1690 740 L1750 740 L1745 800 L1695 800 Z" fill="none" stroke="#1a1310" stroke-width="4"/>
  ${vignette}</svg>`;
}

// ---------- Festivals ----------
function sceneLanterns() {
  const r = rng(104);
  const strings = [[700, 180, 1920, 160, 300], [600, 260, 1920, 250, 220], [900, 120, 1920, 90, 180]];
  const bulbs = strings.map(([x0, y0, x1, y1, sag]) => {
    let o = `<path d="M${x0} ${y0} Q${(x0 + x1) / 2} ${y0 + sag} ${x1} ${y1}" stroke="#2a1d17" stroke-width="2" fill="none"/>`;
    for (let t = 0.03; t < 1; t += 0.045) {
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * ((x0 + x1) / 2) + t * t * x1;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * (y0 + sag) + t * t * y1;
      const c = ['#ffd27a', '#ff9a45', '#ffe9b0'][Math.floor(r() * 3)];
      o += `<circle cx="${x.toFixed(0)}" cy="${(y + 10).toFixed(0)}" r="22" fill="${c}" opacity="0.35" filter="url(#blur10)"/><circle cx="${x.toFixed(0)}" cy="${(y + 10).toFixed(0)}" r="6" fill="${c}"/>`;
    }
    return o;
  }).join('');
  let crowd = '';
  for (let i = 0; i < 26; i++) {
    const x = i * 76 + r() * 20; const s = 0.9 + r() * 0.3;
    crowd += `<g transform="translate(${x.toFixed(0)} ${(1000 + r() * 20).toFixed(0)}) scale(${s.toFixed(2)})"><circle cx="0" cy="-70" r="24" fill="#08060a"/><path d="M-56 30 C-54 -20 -34 -44 0 -44 C34 -44 54 -20 56 30 Z" fill="#08060a"/></g>`;
  }
  return `${svgOpen(`<linearGradient id="lsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0b22"/><stop offset="0.7" stop-color="#2b1433"/><stop offset="1" stop-color="#4a1e2c"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#lsky)"/>
  ${particles(r, { n: 90, x0: 0, x1: W, y0: 0, y1: 420, color: '#fff6e0', max: 1.5 })}
  <!-- trees -->
  ${Array.from({ length: 24 }, (_, i) => { const x = i * 84 + r() * 30; const h = 200 + r() * 260; const b = 720; return `<path d="M${(x - 5).toFixed(0)} ${b} L${x.toFixed(0)} ${(b - h * 0.6).toFixed(0)} L${(x + 5).toFixed(0)} ${b} Z" fill="#120a16"/><ellipse cx="${x.toFixed(0)}" cy="${(b - h * 0.62).toFixed(0)}" rx="${(h * 0.17).toFixed(0)}" ry="${(h * 0.4).toFixed(0)}" fill="#120a16"/>`; }).join('')}
  <path d="M0 700 L${W} 700 L${W} ${H} L0 ${H} Z" fill="#150c14"/>
  <!-- open-air stage -->
  <rect x="1060" y="560" width="660" height="260" fill="#3a1a14"/>
  <ellipse cx="1390" cy="640" rx="360" ry="200" fill="#ff9a45" opacity="0.45" filter="url(#blur80)"/>
  <path d="M1040 560 L1740 560 L1740 540 L1040 540 Z" fill="#c8913d"/>
  ${[1180, 1300, 1420, 1560].map((x, i) => figure({ x, y: 820, s: 0.5, pose: [POSES.small1, POSES.linkA, POSES.small2, POSES.drummer][i], rim: '#ffd08a', skirt: COSTUME.lehenga })).join('')}
  <path d="M1020 820 L1760 820 L1800 860 L980 860 Z" fill="#241410"/>
  ${bulbs}
  <!-- bunting -->
  ${Array.from({ length: 30 }, (_, i) => { const x = 620 + i * 44; const y = 70 + Math.sin((i / 29) * Math.PI) * 60; const c = ['#e2531b', '#f3a246', '#2e8a6a', '#b8336a'][i % 4]; return `<path d="M${x} ${y} L${x + 40} ${y + 2} L${x + 20} ${y + 42} Z" fill="${c}" opacity="0.9"/>`; }).join('')}
  ${crowd}
  ${vignette}</svg>`;
}

function scenePoet() {
  const r = rng(105);
  let heads = '';
  for (let i = 0; i < 22; i++) heads += `<g transform="translate(${(i * 92 + r() * 20).toFixed(0)} ${1040 + (i % 2) * 20})"><circle cx="0" cy="-64" r="26" fill="#07050a"/><path d="M-60 30 C-58 -20 -36 -40 0 -40 C36 -40 58 -20 60 30 Z" fill="#07050a"/></g>`;
  const bokeh = Array.from({ length: 26 }, () => `<circle cx="${(700 + r() * 1200).toFixed(0)}" cy="${(80 + r() * 520).toFixed(0)}" r="${(10 + r() * 30).toFixed(0)}" fill="${['#ffb35c', '#ff6f91', '#ffd98a'][Math.floor(r() * 3)]}" opacity="${(0.08 + r() * 0.18).toFixed(2)}" filter="url(#blur10)"/>`).join('');
  return `${svgOpen(`<radialGradient id="pbg" cx="70%" cy="40%" r="70%"><stop offset="0" stop-color="#2b1726"/><stop offset="1" stop-color="#08050a"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#pbg)"/>
  ${bokeh}
  <path d="M1340 -20 L1390 -20 L1560 860 L1170 860 Z" fill="#ffe2a8" opacity="0.28" filter="url(#blur30)"/>
  ${particles(r, { n: 120, x0: 1200, x1: 1540, y0: 20, y1: 840, color: '#fff0d0', max: 2 })}
  <path d="M0 860 L${W} 860 L${W} ${H} L0 ${H} Z" fill="#120a0e"/>
  <ellipse cx="1365" cy="870" rx="260" ry="40" fill="#ffc98a" opacity="0.5" filter="url(#blur10)"/>
  <!-- mic stand -->
  <path d="M1440 860 L1440 560 L1410 530" stroke="#0a0706" stroke-width="7" fill="none"/>
  <path d="M1410 860 L1440 846 L1470 860" stroke="#0a0706" stroke-width="7" fill="none"/>
  <ellipse cx="1404" cy="524" rx="12" ry="18" fill="#0a0706" transform="rotate(-40 1404 524)"/>
  ${figure({ x: 1360, y: 860, s: 1.12, pose: P.poet, rim: '#ffd08a', rimOffset: [0, -4], skirt: COSTUME.kurta,
    extra: '<path d="M60 -300 l40 -8 l4 36 l-40 8 z" fill="#0a0706"/>' })}
  <!-- lotus motif on the backdrop -->
  <g transform="translate(1365 330)" opacity="0.35" fill="none" stroke="#f7c46a" stroke-width="3">
    ${Array.from({ length: 7 }, (_, i) => `<path d="M0 0 C-40 -60 -20 -120 0 -150 C20 -120 40 -60 0 0 Z" transform="rotate(${-72 + i * 24})"/>`).join('')}
  </g>
  ${heads}
  ${vignette}</svg>`;
}

function sceneMandar() {
  const r = rng(106);
  const bokeh = Array.from({ length: 40 }, () => `<circle cx="${(620 + r() * 1300).toFixed(0)}" cy="${(60 + r() * 700).toFixed(0)}" r="${(12 + r() * 40).toFixed(0)}" fill="${['#ff9a45', '#ffd36b', '#e2531b', '#2fd3c5'][Math.floor(r() * 4)]}" opacity="${(0.08 + r() * 0.22).toFixed(2)}" filter="url(#blur10)"/>`).join('');
  return `${svgOpen(`<linearGradient id="mbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0d0a"/><stop offset="1" stop-color="#3a1a0e"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#mbg)"/>
  ${bokeh}
  <ellipse cx="1380" cy="560" rx="460" ry="380" fill="#ff8a2b" opacity="0.35" filter="url(#blur80)"/>
  ${particles(r, { n: 200, x0: 1000, x1: 1800, y0: 200, y1: 1000, color: '#ffc46b', max: 2.2 })}
  <path d="M0 900 L${W} 900 L${W} ${H} L0 ${H} Z" fill="#170b07"/>
  <ellipse cx="1380" cy="900" rx="420" ry="50" fill="#ffb060" opacity="0.3" filter="url(#blur30)"/>
  ${figure({ x: 1380, y: 900, s: 1.5, pose: POSES.drummer, rim: '#ffb35c', rimOffset: [0, -5], skirt: COSTUME.kurta, extra: COSTUME.turban + COSTUME.mandar })}
  <!-- drum lacing catches the light -->
  <g transform="translate(1380 900) scale(1.5)" stroke="#ffcf85" stroke-width="1.4" opacity="0.7">
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${-70 + i * 17}" y1="-230" x2="${-62 + i * 17}" y2="-180"/>`).join('')}
  </g>
  ${vignette}</svg>`;
}

// ---------- Workshops ----------
function sceneKidsCircle() {
  const r = rng(107);
  const kids = Array.from({ length: 11 }, (_, i) => {
    const a = (i / 11) * Math.PI * 2 + 0.3;
    const x = 1360 + Math.cos(a) * 330; const y = 830 + Math.sin(a) * 95;
    return { x, y, s: 0.5 + (y - 735) / 190 * 0.18, pose: i % 2 ? POSES.linkA : POSES.linkB, back: Math.sin(a) < 0 };
  }).sort((a, b) => a.y - b.y);
  return `${svgOpen(`<linearGradient id="kbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1d14"/><stop offset="1" stop-color="#140d09"/></linearGradient>
    <linearGradient id="kfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3a22"/><stop offset="1" stop-color="#24160d"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#kbg)"/>
  <!-- tall windows with light shafts -->
  ${[900, 1180, 1460, 1740].map((x) => `<rect x="${x}" y="120" width="120" height="360" rx="60" fill="#ffe6b0" opacity="0.8"/><path d="M${x} 480 L${x + 120} 480 L${x - 160} ${H} L${x - 420} ${H} Z" fill="#ffe0a0" opacity="0.10" filter="url(#blur30)"/>`).join('')}
  <path d="M0 640 L${W} 640 L${W} ${H} L0 ${H} Z" fill="url(#kfloor)"/>
  <g stroke="#6b4629" stroke-width="2" opacity="0.5">${Array.from({ length: 20 }, (_, i) => `<line x1="${i * 110 - 60}" y1="640" x2="${(i * 110 - 60 - 960) * 1.8 + 960}" y2="${H}"/>`).join('')}</g>
  ${particles(r, { n: 120, x0: 700, x1: 1900, y0: 120, y1: 900, color: '#fff0c8', max: 2 })}
  <ellipse cx="1360" cy="830" rx="380" ry="110" fill="#000" opacity="0.25" filter="url(#blur10)"/>
  ${kids.filter((k) => k.back).map((k) => figure({ x: k.x, y: k.y, s: k.s, pose: k.pose, rim: '#ffd9a0', skirt: COSTUME.kurta })).join('')}
  ${figure({ x: 1360, y: 830, s: 0.95, pose: P.teacher, rim: '#ffd9a0', rimOffset: [0, -3], skirt: COSTUME.lehenga })}
  ${kids.filter((k) => !k.back).map((k) => figure({ x: k.x, y: k.y, s: k.s, pose: k.pose, rim: '#ffd9a0', skirt: COSTUME.lehenga })).join('')}
  ${vignette}</svg>`;
}

function sceneMaskWorkshop() {
  const r = rng(108);
  const pots = [['#d9432b', 1620, 820], ['#e7a92e', 1710, 850], ['#1f6f73', 1800, 820], ['#fbe7b0', 1560, 900]].map(([c, x, y]) => `
    <ellipse cx="${x}" cy="${y + 40}" rx="40" ry="12" fill="#000" opacity="0.4"/>
    <path d="M${x - 36} ${y} L${x - 30} ${y + 44} Q${x} ${y + 56} ${x + 30} ${y + 44} L${x + 36} ${y} Z" fill="#6b3b1d"/>
    <ellipse cx="${x}" cy="${y}" rx="36" ry="11" fill="${c}"/>`).join('');
  return `${svgOpen(`<radialGradient id="wbg" cx="68%" cy="20%" r="80%"><stop offset="0" stop-color="#3d2718"/><stop offset="1" stop-color="#0c0806"/></radialGradient>
    <linearGradient id="wtable" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4226"/><stop offset="1" stop-color="#2a1a10"/></linearGradient>
    <radialGradient id="s4shade" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#wbg)"/>
  <!-- hanging lamp -->
  <path d="M1380 0 L1380 120" stroke="#1a120d" stroke-width="4"/>
  <path d="M1320 170 L1440 170 L1400 120 L1360 120 Z" fill="#1a120d"/>
  <ellipse cx="1380" cy="176" rx="40" ry="10" fill="#fff0c8"/>
  <path d="M1330 176 L1430 176 L1760 820 L1000 820 Z" fill="#ffd9a0" opacity="0.14" filter="url(#blur30)"/>
  ${particles(r, { n: 100, x0: 1050, x1: 1750, y0: 180, y1: 800, color: '#ffe9c2', max: 2 })}
  <!-- table -->
  <path d="M760 620 L1920 620 L1920 ${H} L560 ${H} Z" fill="url(#wtable)"/>
  <path d="M760 620 L1920 620" stroke="#8a5a36" stroke-width="3"/>
  ${mask(1180, 740, 0.55, -70, { base: '#d9432b', crown: '#e7a92e', dot: '#fbe7b0', line: '#3a0d07', smile: true })}
  ${mask(1420, 790, 0.6, 12, { base: '#fbe7b0', crown: '#2e5a38', dot: '#d9432b', line: '#3a1a07', smile: false })}
  ${pots}
  <g transform="translate(1260 930) rotate(-24)"><rect width="300" height="14" rx="7" fill="#2e5a38"/><path d="M300 -5 L370 7 L300 19 Z" fill="#d9432b"/></g>
  <g transform="translate(1000 880) rotate(8)"><rect width="260" height="12" rx="6" fill="#6b3b1d"/><path d="M260 -5 L320 6 L260 17 Z" fill="#e7a92e"/></g>
  <!-- paint splashes -->
  ${Array.from({ length: 16 }, () => `<circle cx="${(900 + r() * 950).toFixed(0)}" cy="${(660 + r() * 380).toFixed(0)}" r="${(3 + r() * 8).toFixed(0)}" fill="${['#d9432b', '#e7a92e', '#1f6f73'][Math.floor(r() * 3)]}" opacity="0.7"/>`).join('')}
  ${vignette}</svg>`;
}

// ---------- Visual art ----------
function sceneGondTree() {
  const r = rng(109);
  const leaf = (x, y, rot, c) => `<g transform="translate(${x} ${y}) rotate(${rot})">
    <path d="M0 0 C30 -40 90 -40 120 0 C90 40 30 40 0 0 Z" fill="${c}"/>
    <path d="M6 0 L114 0" stroke="#1a1030" stroke-width="3"/>
    ${Array.from({ length: 5 }, (_, i) => `<circle cx="${24 + i * 18}" cy="-10" r="3.5" fill="#fff4d6"/><circle cx="${24 + i * 18}" cy="10" r="3.5" fill="#fff4d6"/>`).join('')}
  </g>`;
  const colors = ['#e2531b', '#f3a246', '#2e8a6a', '#d94f8a', '#3aa6c9'];
  let leaves = '';
  for (let i = 0; i < 46; i++) {
    const a = r() * Math.PI * 2; const d = 120 + r() * 300;
    leaves += leaf((1360 + Math.cos(a) * d * 1.25).toFixed(0), (400 + Math.sin(a) * d * 0.72).toFixed(0), (a * 57 + 90).toFixed(0), colors[i % colors.length]);
  }
  const bird = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})">
    <path d="M0 0 C20 -40 80 -40 100 -10 L130 -20 L110 0 C90 30 20 30 0 0 Z" fill="${c}"/>
    <circle cx="96" cy="-14" r="5" fill="#1a1030"/>
    <path d="M10 0 C30 -10 60 -10 80 0" stroke="#fff4d6" stroke-width="3" fill="none" stroke-dasharray="2 6"/>
    <path d="M0 0 L-40 -20 L-30 6 Z" fill="${c}"/></g>`;
  return `${svgOpen(`<radialGradient id="gbg" cx="70%" cy="40%" r="75%"><stop offset="0" stop-color="#2a1b4a"/><stop offset="1" stop-color="#0c0818"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#gbg)"/>
  <!-- trunk: striped Gond fill -->
  <path d="M1320 1080 C1330 900 1310 760 1300 640 C1290 560 1250 520 1200 480 L1230 460 C1290 500 1340 540 1360 600 C1380 540 1440 500 1500 470 L1520 490 C1460 530 1420 580 1410 660 C1400 780 1400 900 1410 1080 Z" fill="#8a4a1e"/>
  <g stroke="#f3a246" stroke-width="3" opacity="0.8">${Array.from({ length: 22 }, (_, i) => `<path d="M1320 ${1060 - i * 26} Q1365 ${1050 - i * 26} 1405 ${1060 - i * 26}" fill="none"/>`).join('')}</g>
  ${leaves}
  ${bird(1080, 300, 0.9, '#3aa6c9')}${bird(1560, 250, 0.8, '#d94f8a')}${bird(1640, 520, 0.75, '#f3a246')}
  <!-- deer at the foot of the tree -->
  <g transform="translate(1540 900)" fill="#e2531b">
    <path d="M0 0 C20 -60 120 -70 160 -40 L180 -90 L200 -86 L186 -36 C196 -20 190 10 170 10 L160 80 L146 80 L146 20 L40 20 L36 80 L22 80 L20 10 C0 10 -6 4 0 0 Z"/>
    <path d="M186 -86 L170 -130 M190 -88 L206 -132" stroke="#e2531b" stroke-width="6"/>
    ${Array.from({ length: 8 }, (_, i) => `<circle cx="${40 + i * 16}" cy="-20" r="4" fill="#fff4d6"/>`).join('')}
  </g>
  ${particles(r, { n: 160, x0: 800, x1: W, y0: 0, y1: H, color: '#fff4d6', max: 1.8 })}
  ${vignette}</svg>`;
}

function sceneBackstage() {
  const r = rng(110);
  const bulbs = [];
  for (let i = 0; i <= 8; i++) { bulbs.push([1040 + i * 60, 190], [1040 + i * 60, 770]); }
  for (let i = 1; i < 10; i++) { bulbs.push([1010, 190 + i * 58], [1550, 190 + i * 58]); }
  return `${svgOpen(`<linearGradient id="bkbg" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0c0908"/><stop offset="1" stop-color="#241814"/></linearGradient>
    <radialGradient id="s4shade" cx="30%" cy="25%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="0.5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.55"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#bkbg)"/>
  <ellipse cx="1280" cy="480" rx="520" ry="420" fill="#ffcf8a" opacity="0.18" filter="url(#blur80)"/>
  <!-- mirror -->
  <rect x="1030" y="210" width="500" height="540" rx="10" fill="#1c1a22"/>
  <rect x="1030" y="210" width="500" height="540" rx="10" fill="none" stroke="#3a2a20" stroke-width="16"/>
  <path d="M1060 240 L1180 240 L1060 420 Z" fill="#fff" opacity="0.05"/>
  ${mask(1280, 470, 0.72, 0, { base: '#b8336a', crown: '#e7a92e', dot: '#fbe7b0', line: '#2a0717', smile: true })}
  ${bulbs.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="26" fill="#ffd79a" opacity="0.35" filter="url(#blur10)"/><circle cx="${x}" cy="${y}" r="11" fill="#fff4d8"/>`).join('')}
  <!-- dressing table -->
  <path d="M900 800 L1680 800 L1720 840 L860 840 Z" fill="#3a2418"/>
  <rect x="860" y="840" width="860" height="240" fill="#1d130d"/>
  <g fill="#0a0706"><rect x="1120" y="760" width="30" height="40" rx="6"/><ellipse cx="1210" cy="792" rx="34" ry="10"/><rect x="1380" y="740" width="16" height="60"/></g>
  <!-- costume on a rail -->
  <path d="M1640 120 L1900 120" stroke="#5a4636" stroke-width="6"/>
  <path d="M1760 120 L1760 160" stroke="#5a4636" stroke-width="4"/>
  <path d="M1700 180 L1820 180 L1860 520 L1660 520 Z" fill="#7c1a1c"/>
  <g stroke="#e7a92e" stroke-width="4" opacity="0.8"><path d="M1668 500 L1852 500"/><path d="M1676 460 L1846 460" stroke-dasharray="6 8"/></g>
  <path d="M1700 180 Q1760 230 1820 180" fill="none" stroke="#e7a92e" stroke-width="5"/>
  ${particles(r, { n: 60, x0: 950, x1: 1650, y0: 150, y1: 800, color: '#ffe9c2', max: 1.8 })}
  ${vignette}</svg>`;
}

// ---------- Place & roots ----------
function sceneSalSunrise() {
  const r = rng(111);
  const tree = (x, base, h, c) => `<path d="M${x - 4} ${base} L${x} ${base - h * 0.6} L${x + 4} ${base} Z" fill="${c}"/><ellipse cx="${x}" cy="${base - h * 0.62}" rx="${h * 0.18}" ry="${h * 0.42}" fill="${c}"/>`;
  const layer = (base, n, hmin, hmax, c) => Array.from({ length: n }, (_, i) => tree(i * (W / n) + r() * 40, base + r() * 10, hmin + r() * (hmax - hmin), c)).join('');
  const hut = (x, y) => `<g fill="#1a0f0c"><rect x="${x}" y="${y - 40}" width="80" height="40"/><path d="M${x - 16} ${y - 36} L${x + 40} ${y - 76} L${x + 96} ${y - 36} Z"/></g><rect x="${x + 30}" y="${y - 28}" width="16" height="16" fill="#ffb35c"/>`;
  return `${svgOpen(`<linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a2150"/><stop offset="0.45" stop-color="#b8566a"/><stop offset="0.72" stop-color="#f39a4a"/><stop offset="1" stop-color="#ffd78a"/></linearGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#dsky)"/>
  <circle cx="1400" cy="560" r="110" fill="#fff0c4"/>
  <circle cx="1400" cy="560" r="260" fill="#ffd27a" opacity="0.4" filter="url(#blur80)"/>
  <g fill="none" stroke="#2a1830" stroke-width="3">${Array.from({ length: 6 }, () => { const x = 900 + r() * 800; const y = 160 + r() * 200; return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} q12 -10 24 0 q12 -10 24 0"/>`; }).join('')}</g>
  <path d="M0 620 Q300 540 700 600 T1400 570 T${W} 590 L${W} ${H} L0 ${H} Z" fill="#7a3a4a" opacity="0.7"/>
  ${layer(700, 22, 140, 220, '#5a2a3a')}
  <path d="M0 720 Q400 660 900 710 T${W} 700 L${W} ${H} L0 ${H} Z" fill="#3a1a26"/>
  ${hut(1180, 780)}${hut(1560, 800)}
  ${layer(860, 16, 220, 360, '#1e0f16')}
  <path d="M0 860 Q500 820 1000 850 T${W} 840 L${W} ${H} L0 ${H} Z" fill="#12080c"/>
  ${figure({ x: 1400, y: 862, s: 0.95, pose: P.flute, rim: '#ffcf8a', rimOffset: [0, -3], skirt: COSTUME.kurta,
    extra: '<path d="M-30 -318 L80 -300" stroke="#0a0706" stroke-width="7" stroke-linecap="round"/>' })}
  ${vignette}</svg>`;
}

function sceneDiyas() {
  const r = rng(112);
  const rangoli = Array.from({ length: 5 }, (_, k) => {
    const rad = 300 - k * 55; const c = ['#e2531b', '#f3a246', '#d94f8a', '#2e8a6a', '#fbe7b0'][k];
    return `<g transform="translate(1360 900) scale(1 0.34)">${Array.from({ length: 16 }, (_, i) => `<path d="M0 0 C${rad * 0.25} ${-rad * 0.35} ${rad * 0.2} ${-rad * 0.8} 0 ${-rad} C${-rad * 0.2} ${-rad * 0.8} ${-rad * 0.25} ${-rad * 0.35} 0 0 Z" fill="${c}" opacity="0.85" transform="rotate(${i * 22.5 + k * 11})"/>`).join('')}</g>`;
  }).join('');
  const diya = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="0" rx="46" ry="16" fill="#8a3a14"/><path d="M-46 0 Q0 34 46 0" fill="#5a2410"/>
    <ellipse cx="0" cy="-26" rx="9" ry="22" fill="#ffd27a"/><ellipse cx="0" cy="-22" rx="4" ry="10" fill="#fff6d6"/>
    <ellipse cx="0" cy="-24" rx="60" ry="64" fill="#ffae45" opacity="0.35" filter="url(#blur10)"/></g>`;
  const ring = Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return diya((1360 + Math.cos(a) * 380).toFixed(0), (900 + Math.sin(a) * 130).toFixed(0), (0.8 + Math.sin(a) * 0.2).toFixed(2)); }).join('');
  const garland = (x) => Array.from({ length: 14 }, (_, i) => `<circle cx="${x + Math.sin(i * 0.9) * 6}" cy="${i * 30}" r="14" fill="${i % 3 ? '#f39a1e' : '#ffcf3a'}"/>`).join('');
  return `${svgOpen(`<radialGradient id="dbg" cx="70%" cy="70%" r="70%"><stop offset="0" stop-color="#3a1a0e"/><stop offset="1" stop-color="#0a0605"/></radialGradient>`)}
  <rect width="${W}" height="${H}" fill="url(#dbg)"/>
  ${[980, 1160, 1560, 1740].map(garland).join('')}
  <ellipse cx="1360" cy="880" rx="560" ry="220" fill="#ff9a3a" opacity="0.25" filter="url(#blur80)"/>
  ${rangoli}
  ${ring}
  ${particles(r, { n: 160, x0: 900, x1: 1820, y0: 300, y1: 900, color: '#ffd27a', max: 2 })}
  ${vignette}</svg>`;
}

// New scenes and the existing hero scenes, with the vertical focus used for
// the 3:1 banner strip.
const BANNER_SCENES = {
  rehearsal: { svg: sceneRehearsal, focusX: 1340, focusY: 600 },
  'curtain-call': { svg: sceneCurtainCall, focusX: 1380, focusY: 640 },
  'theatre-seats': { svg: sceneSeats, focusX: 1340, focusY: 560 },
  'lantern-night': { svg: sceneLanterns, focusX: 1380, focusY: 560 },
  'poet-mic': { svg: scenePoet, focusX: 1370, focusY: 560 },
  mandar: { svg: sceneMandar, focusX: 1380, focusY: 560 },
  'kids-circle': { svg: sceneKidsCircle, focusX: 1360, focusY: 640 },
  'mask-workshop': { svg: sceneMaskWorkshop, focusX: 1380, focusY: 700 },
  'gond-tree': { svg: sceneGondTree, focusX: 1360, focusY: 450 },
  backstage: { svg: sceneBackstage, focusX: 1300, focusY: 480 },
  'sal-sunrise': { svg: sceneSalSunrise, focusX: 1400, focusY: 640 },
  diyas: { svg: sceneDiyas, focusX: 1360, focusY: 780 },
  'stage-alive': { ...SCENES['stage-alive'], focusY: 600 },
  'folk-celebration': { ...SCENES['folk-celebration'], focusY: 640 },
  'classical-dance': { ...SCENES['classical-dance'], focusY: 600 },
  'masks-stories': { ...SCENES['masks-stories'], focusY: 500 },
  'creative-stage': { ...SCENES['creative-stage'], focusY: 540 },
};

module.exports = { BANNER_SCENES };

if (require.main === module) {
  (async () => {
    fs.mkdirSync(path.join(OUT, 'src'), { recursive: true });
    const only = process.argv.slice(2);
    for (const [name, scene] of Object.entries(BANNER_SCENES)) {
      if (only.length && !only.includes(name)) continue;
      await renderBanner(name, scene);
      console.log('banner art:', name);
    }
  })();
}
