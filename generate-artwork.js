// Generates lightweight modern artistic SVG artworks representing Chhattisgarhi Theatre, Art & Dance
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'src', 'assets', 'images');

const artworks = {
  'hero-art.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FF4500" stop-opacity="0.9"/>
          <stop offset="50%" stop-color="#FF7A00" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#1A73E8" stop-opacity="0.85"/>
        </linearGradient>
        <radialGradient id="sun" cx="70%" cy="30%" r="50%">
          <stop offset="0%" stop-color="#FBBC04" stop-opacity="0.9"/>
          <stop offset="100%" stop-color="#FF4500" stop-opacity="0"/>
        </radialGradient>
        <filter id="blur1">
          <feGaussianBlur stdDeviation="30"/>
        </filter>
      </defs>
      <rect width="800" height="500" fill="#F8F9FA"/>
      <circle cx="620" cy="180" r="160" fill="url(#sun)"/>
      <circle cx="180" cy="320" r="140" fill="#E8F0FE" filter="url(#blur1)"/>
      
      <!-- Folk Mandar Drum & Dancing Figures Geometry -->
      <g stroke="#1A73E8" stroke-width="2" fill="none" opacity="0.25">
        <circle cx="400" cy="250" r="220" stroke-dasharray="8 8"/>
        <circle cx="400" cy="250" r="160"/>
        <circle cx="400" cy="250" r="100" stroke-dasharray="4 4"/>
      </g>

      <!-- Nataraja / Karma Dance Motion Fluid Curves -->
      <path d="M 150,420 C 250,200 450,120 650,280 C 720,340 760,420 800,450 L 800,500 L 0,500 Z" fill="url(#g1)" opacity="0.15"/>
      <path d="M 50,480 C 200,310 380,260 550,380 C 650,450 720,480 800,490 L 800,500 L 0,500 Z" fill="#FF4500" opacity="0.12"/>
      
      <!-- Stylized Theatre Mask & Folk Motif -->
      <g transform="translate(340, 130)">
        <rect x="0" y="0" width="120" height="150" rx="60" fill="#FFFFFF" stroke="#FF4500" stroke-width="4" filter="drop-shadow(0 10px 20px rgba(0,0,0,0.08))"/>
        <circle cx="40" cy="55" r="8" fill="#1A73E8"/>
        <circle cx="80" cy="55" r="8" fill="#1A73E8"/>
        <path d="M 40,95 Q 60,115 80,95" stroke="#FF4500" stroke-width="4" stroke-linecap="round" fill="none"/>
        <path d="M 60,25 L 60,45" stroke="#FBBC04" stroke-width="3" stroke-linecap="round"/>
        <!-- Traditional Tribal Forehead Mark -->
        <circle cx="60" cy="35" r="4" fill="#FF4500"/>
      </g>

      <!-- Sal Forest Ambient Leaves Motif -->
      <path d="M 80,120 Q 110,90 140,120 Q 110,150 80,120 Z" fill="#34A853" opacity="0.7"/>
      <path d="M 700,100 Q 730,70 760,100 Q 730,130 700,100 Z" fill="#FBBC04" opacity="0.8"/>
      <path d="M 720,380 Q 750,350 780,380 Q 750,410 720,380 Z" fill="#FF4500" opacity="0.6"/>
    </svg>
  `,

  'play-vasu.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="gVasu" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFF3E0"/>
          <stop offset="100%" stop-color="#FFE0B2"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#gVasu)"/>
      <circle cx="480" cy="120" r="90" fill="#FF4500" opacity="0.15"/>
      <!-- Tribal Red Earth Valley Lines -->
      <path d="M0,320 Q 150,220 300,300 T 600,280 L 600,400 L 0,400 Z" fill="#D84315" opacity="0.85"/>
      <path d="M0,360 Q 200,280 400,350 T 600,340 L 600,400 L 0,400 Z" fill="#BF360C"/>
      <!-- Mandar Folk Drum -->
      <g transform="translate(180, 110)">
        <ellipse cx="120" cy="80" rx="90" ry="45" fill="#3E2723" stroke="#FFB000" stroke-width="4"/>
        <ellipse cx="60" cy="80" rx="20" ry="45" fill="#5D4037" stroke="#FFF" stroke-width="2"/>
        <ellipse cx="180" cy="80" rx="20" ry="45" fill="#5D4037" stroke="#FFF" stroke-width="2"/>
        <line x1="60" y1="35" x2="180" y2="35" stroke="#FFB000" stroke-width="3"/>
        <line x1="60" y1="125" x2="180" y2="125" stroke="#FFB000" stroke-width="3"/>
        <line x1="70" y1="40" x2="170" y2="120" stroke="#FFF" stroke-width="1.5" stroke-dasharray="4 4"/>
        <line x1="70" y1="120" x2="170" y2="40" stroke="#FFF" stroke-width="1.5" stroke-dasharray="4 4"/>
      </g>
      <text x="50" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="28" fill="#BF360C">KAHANI VASU KI</text>
      <text x="50" y="100" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#D84315">Folk Musical Drama • Directed by Suresh Thakur</text>
    </svg>
  `,

  'play-vincent.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="gVincent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E8F0FE"/>
          <stop offset="100%" stop-color="#D2E3FC"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#gVincent)"/>
      <!-- Starry Night & Chhattisgarhi Murals Fusion Swirls -->
      <path d="M 80,180 C 180,60 320,80 420,160 C 520,240 560,180 620,120" fill="none" stroke="#1A73E8" stroke-width="12" stroke-linecap="round" opacity="0.6"/>
      <path d="M 60,220 C 160,100 300,120 400,200 C 500,280 540,220 600,160" fill="none" stroke="#FBBC04" stroke-width="8" stroke-linecap="round" opacity="0.8"/>
      <circle cx="480" cy="100" r="45" fill="#FBBC04" filter="drop-shadow(0 0 20px #FBBC04)"/>
      <circle cx="480" cy="100" r="30" fill="#FFF"/>
      <!-- Paint Palette & Brush -->
      <g transform="translate(120, 210)">
        <path d="M0,50 C0,10 50,0 100,20 C150,40 180,90 140,130 C110,160 50,150 20,120 C0,100 0,70 0,50 Z" fill="#FFFFFF" stroke="#1A73E8" stroke-width="3"/>
        <circle cx="40" cy="60" r="10" fill="#EA4335"/>
        <circle cx="75" cy="45" r="10" fill="#FBBC04"/>
        <circle cx="110" cy="60" r="10" fill="#34A853"/>
        <circle cx="115" cy="95" r="10" fill="#1A73E8"/>
      </g>
      <text x="50" y="70" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="28" fill="#174EA6">VINCENT: A FLASHBACK</text>
      <text x="50" y="100" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#1A73E8">Visual Scenography • Directed by Meenakshi Kashyap</text>
    </svg>
  `,

  'play-gabar.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="gGabar" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FCE8E6"/>
          <stop offset="100%" stop-color="#FAD2CF"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#gGabar)"/>
      <circle cx="100" cy="200" r="180" fill="#EA4335" opacity="0.12"/>
      <circle cx="500" cy="200" r="150" fill="#FBBC04" opacity="0.2"/>
      <!-- Nacha Comic Stage Mask -->
      <g transform="translate(230, 90)">
        <path d="M20,40 Q 70,0 120,40 Q 140,110 70,160 Q 0,110 20,40 Z" fill="#FFFFFF" stroke="#EA4335" stroke-width="4" filter="drop-shadow(0 10px 15px rgba(234, 67, 53, 0.2))"/>
        <!-- Big Smiling Folk Expression -->
        <circle cx="45" cy="70" r="7" fill="#202124"/>
        <circle cx="95" cy="70" r="7" fill="#202124"/>
        <path d="M 40,110 Q 70,145 100,110 Z" fill="#EA4335"/>
        <!-- Traditional Festive Feathers -->
        <path d="M 70,0 C 60,-40 90,-40 70,-10" stroke="#FBBC04" stroke-width="4" fill="none"/>
        <path d="M 50,5 C 30,-30 60,-35 50,-5" stroke="#34A853" stroke-width="3" fill="none"/>
        <path d="M 90,5 C 110,-30 80,-35 90,-5" stroke="#1A73E8" stroke-width="3" fill="none"/>
      </g>
      <text x="50" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="28" fill="#C5221F">GABAR GHICHOR</text>
      <text x="50" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#D93025">Nacha Folk Farce & Satire • Directed by Hemant Banjare</text>
    </svg>
  `,

  'play-raja.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <defs>
        <linearGradient id="gRaja" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FEF7E0"/>
          <stop offset="100%" stop-color="#FEEFC3"/>
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#gRaja)"/>
      <!-- Royal Gold Archway -->
      <path d="M 120,400 L 120,180 C 120,80 480,80 480,180 L 480,400 Z" fill="#FFFFFF" stroke="#FBBC04" stroke-width="4"/>
      <path d="M 160,400 L 160,200 C 160,120 440,120 440,200 L 440,400 Z" fill="#FFF9E6" stroke="#E37400" stroke-width="2" stroke-dasharray="6 6"/>
      <!-- Lithographic Press Roller & Easel -->
      <g transform="translate(250, 160)">
        <rect x="0" y="0" width="100" height="80" rx="6" fill="#F9AB00" stroke="#B06000" stroke-width="3"/>
        <circle cx="50" cy="40" r="22" fill="#FFFFFF" stroke="#B06000" stroke-width="3"/>
        <line x1="50" y1="20" x2="50" y2="60" stroke="#B06000" stroke-width="3"/>
        <line x1="30" y1="40" x2="70" y2="40" stroke="#B06000" stroke-width="3"/>
      </g>
      <text x="50" y="60" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="26" fill="#B06000">RAJA RAVI VERMA</text>
      <text x="50" y="90" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#E37400">The Untold Story • Directed by Suresh Thakur</text>
    </svg>
  `,

  'festival-jashrang.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
      <rect width="600" height="350" fill="#E8F0FE"/>
      <circle cx="500" cy="80" r="100" fill="#FF4500" opacity="0.15"/>
      <circle cx="100" cy="260" r="80" fill="#FBBC04" opacity="0.2"/>
      <!-- Stage Amphitheatre Lighting Beams -->
      <polygon points="300,20 100,350 500,350" fill="#1A73E8" opacity="0.1"/>
      <polygon points="300,20 200,350 400,350" fill="#FF4500" opacity="0.08"/>
      <!-- Spotlight Icons -->
      <circle cx="300" cy="40" r="14" fill="#FBBC04"/>
      <path d="M 220,240 Q 300,190 380,240" stroke="#1A73E8" stroke-width="5" fill="none"/>
      <!-- Festival Banner Callout -->
      <rect x="150" y="100" width="300" height="70" rx="35" fill="#FFFFFF" stroke="#1A73E8" stroke-width="3" filter="drop-shadow(0 8px 16px rgba(26,115,232,0.15))"/>
      <text x="300" y="142" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" fill="#1A73E8" text-anchor="middle">JASHRANG FESTIVAL</text>
    </svg>
  `,

  'festival-kavita.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
      <rect width="600" height="350" fill="#FEF7E0"/>
      <circle cx="120" cy="100" r="80" fill="#34A853" opacity="0.15"/>
      <circle cx="480" cy="220" r="90" fill="#FF4500" opacity="0.12"/>
      <!-- Quill & Musical Notes -->
      <g transform="translate(250, 80)">
        <path d="M60,0 C20,30 10,80 0,140 C30,120 70,80 80,40 Z" fill="#FBBC04" stroke="#E37400" stroke-width="3"/>
        <line x1="60" y1="0" x2="0" y2="140" stroke="#E37400" stroke-width="2"/>
        <circle cx="100" cy="60" r="8" fill="#1A73E8"/>
        <path d="M108,60 L108,20 L130,10 L130,40" stroke="#1A73E8" stroke-width="3" fill="none"/>
      </g>
      <text x="300" y="270" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="22" fill="#B06000" text-anchor="middle">JASPUR KAVITA UTSAV</text>
      <text x="300" y="295" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#5F6368" text-anchor="middle">Poetry & Music Conclave</text>
    </svg>
  `,

  'camp-ullas.svg': `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
      <rect width="600" height="350" fill="#E6F4EA"/>
      <circle cx="520" cy="60" r="70" fill="#FBBC04" opacity="0.4"/>
      <!-- Sun Rays & Playful Geometry -->
      <circle cx="300" cy="140" r="55" fill="#34A853" opacity="0.2"/>
      <!-- Joyful Child Theatre Puppet Silhouette -->
      <g transform="translate(230, 80)">
        <circle cx="70" cy="40" r="24" fill="#FF4500"/>
        <path d="M40,110 C40,75 100,75 100,110 Z" fill="#1A73E8"/>
        <line x1="30" y1="80" x2="10" y2="55" stroke="#FF4500" stroke-width="6" stroke-linecap="round"/>
        <line x1="110" y1="80" x2="130" y2="55" stroke="#FF4500" stroke-width="6" stroke-linecap="round"/>
      </g>
      <text x="300" y="250" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="24" fill="#137333" text-anchor="middle">ULLAS SUMMER CAMP</text>
      <text x="300" y="280" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="14" fill="#5F6368" text-anchor="middle">Creative Arts & Drama Residency for Youth</text>
    </svg>
  `
};

for (const [filename, content] of Object.entries(artworks)) {
  fs.writeFileSync(path.join(imgDir, filename), content.trim());
}

console.log('✅ Generated 7 custom modern SVG artworks!');
