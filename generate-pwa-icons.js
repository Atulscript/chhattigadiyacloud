const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ICONS_DIR = path.join(__dirname, 'src', 'assets', 'icons');
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR, { recursive: true });
}

const standardSvg = fs.readFileSync(path.join(__dirname, 'favicon.svg'));

// Maskable SVG with full-bleed square background and centered logo symbol in safe zone
const maskableSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="maskBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF4500"/>
      <stop offset="60%" stop-color="#E03D00"/>
      <stop offset="100%" stop-color="#D84315"/>
    </linearGradient>
    <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#maskBg)"/>
  <g transform="translate(136, 136) scale(10)" stroke="#FFFFFF" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="9.5" stroke="#FFFFFF" stroke-width="1.8" stroke-dasharray="2.2 3.2"/>
    <path d="M8 11.5c1.2 2 2.8 2.8 4 2.8s2.8-.8 4-2.8" stroke="#FFFFFF" stroke-width="1.8"/>
    <circle cx="9" cy="8.5" r="1.3" fill="#FFFFFF" stroke="none"/>
    <circle cx="15" cy="8.5" r="1.3" fill="#FFFFFF" stroke="none"/>
    <path d="M9 16c1.5 1.2 4.5 1.2 6 0" stroke="url(#goldGlow)" stroke-width="2"/>
  </g>
</svg>
`);

async function generate() {
  console.log('Generating PWA icons with sharp...');

  // Standard 192x192
  await sharp(standardSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-192.png'));
  console.log('✔ icon-192.png');

  // Standard 512x512
  await sharp(standardSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-512.png'));
  console.log('✔ icon-512.png');

  // Maskable 192x192
  await sharp(maskableSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-192-maskable.png'));
  console.log('✔ icon-192-maskable.png');

  // Maskable 512x512
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, 'icon-512-maskable.png'));
  console.log('✔ icon-512-maskable.png');

  // Apple Touch Icon 180x180
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, 'apple-touch-icon.png'));
  await sharp(standardSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'));
  console.log('✔ apple-touch-icon.png (180x180)');

  console.log('All PWA icons generated successfully!');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
