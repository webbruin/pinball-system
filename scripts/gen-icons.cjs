// Generate 9 category icons (SVG -> PNG 512x512) into /tmp/category-icons/
// Style (per reference): transparent background, no outline, warm flat cartoon,
// soft shading, dot eyes + pink blush. No colored rounded base.
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = '/tmp/category-icons';
fs.mkdirSync(OUT, { recursive: true });

const C = {
  yellow: '#F7C162',
  orange: '#F2A965',
  darkred: '#C9324B',
  rose: '#D6658E',
  coral: '#F58882',
  cream: '#FDEFCF',
  cream2: '#F3E7D4',
  eye: '#B81A00',
  brown: '#C44313',
  purple: '#A847E2',
  purple2: '#C543BE',
  shadeYellow: '#E8A44C',
  shadeOrange: '#D9883F',
  shadeRed: '#A5273F',
  shadeRose: '#B84F72',
  shadeCream: '#DCC4A8',
};

const icons = [
  // 1. 中外名酒 — wine bottle
  { name: '中外名酒', glyph: `
    <path d="M184 218 h144 v112 a36 36 0 0 1 -36 36 h-72 a36 36 0 0 1 -36 -36 z" fill="${C.darkred}"/>
    <path d="M184 300 h144 v30 a36 36 0 0 1 -36 36 h-72 a36 36 0 0 1 -36 -36 z" fill="${C.shadeRed}" opacity="0.45"/>
    <rect x="230" y="158" width="52" height="66" rx="12" fill="${C.darkred}"/>
    <rect x="238" y="162" width="12" height="52" rx="6" fill="${C.coral}" opacity="0.5"/>
    <rect x="236" y="126" width="40" height="36" rx="10" fill="${C.yellow}"/>
    <rect x="208" y="240" width="96" height="70" rx="16" fill="${C.cream}"/>
    <circle cx="242" cy="268" r="9" fill="${C.eye}"/>
    <circle cx="270" cy="268" r="9" fill="${C.eye}"/>
    <circle cx="244" cy="265" r="3" fill="${C.cream}"/>
    <circle cx="272" cy="265" r="3" fill="${C.cream}"/>
    <path d="M242 290 Q256 304 270 290" stroke="${C.eye}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="228" cy="286" r="8" fill="${C.coral}" opacity="0.8"/>
    <circle cx="284" cy="286" r="8" fill="${C.coral}" opacity="0.8"/>` },

  // 2. 休闲食品 — chocolate chip cookie
  { name: '休闲食品', glyph: `
    <circle cx="256" cy="268" r="128" fill="${C.shadeYellow}"/>
    <circle cx="256" cy="256" r="128" fill="${C.yellow}"/>
    <circle cx="190" cy="196" r="16" fill="${C.brown}"/>
    <circle cx="320" cy="204" r="16" fill="${C.brown}"/>
    <circle cx="338" cy="302" r="14" fill="${C.brown}"/>
    <circle cx="176" cy="304" r="14" fill="${C.brown}"/>
    <circle cx="256" cy="342" r="13" fill="${C.brown}"/>
    <circle cx="224" cy="254" r="13" fill="${C.eye}"/>
    <circle cx="288" cy="254" r="13" fill="${C.eye}"/>
    <circle cx="228" cy="250" r="4.5" fill="${C.cream}"/>
    <circle cx="292" cy="250" r="4.5" fill="${C.cream}"/>
    <path d="M226 302 Q256 324 286 302" stroke="${C.eye}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="202" cy="286" r="11" fill="${C.coral}" opacity="0.8"/>
    <circle cx="310" cy="286" r="11" fill="${C.coral}" opacity="0.8"/>` },

  // 3. 外设产品 — game controller
  { name: '外设产品', glyph: `
    <rect x="140" y="190" width="232" height="150" rx="52" fill="${C.orange}"/>
    <rect x="152" y="200" width="208" height="26" rx="13" fill="${C.cream}" opacity="0.55"/>
    <ellipse cx="256" cy="336" rx="90" ry="12" fill="${C.shadeOrange}" opacity="0.4"/>
    <g fill="${C.darkred}">
      <rect x="176" y="246" width="36" height="12" rx="5"/>
      <rect x="188" y="234" width="12" height="36" rx="5"/>
    </g>
    <circle cx="326" cy="238" r="10" fill="${C.darkred}"/>
    <circle cx="340" cy="262" r="10" fill="${C.darkred}"/>
    <circle cx="232" cy="258" r="13" fill="${C.eye}"/>
    <circle cx="280" cy="258" r="13" fill="${C.eye}"/>
    <circle cx="236" cy="254" r="4.5" fill="${C.cream}"/>
    <circle cx="284" cy="254" r="4.5" fill="${C.cream}"/>
    <path d="M234 294 Q256 312 278 294" stroke="${C.eye}" stroke-width="9" fill="none" stroke-linecap="round"/>
    <circle cx="212" cy="286" r="10" fill="${C.coral}" opacity="0.8"/>
    <circle cx="300" cy="286" r="10" fill="${C.coral}" opacity="0.8"/>` },

  // 4. 学习用品 — book
  { name: '学习用品', glyph: `
    <rect x="150" y="184" width="212" height="176" rx="28" fill="${C.rose}"/>
    <path d="M150 320 h212 v26 a14 14 0 0 1 -14 14 h-184 a14 14 0 0 1 -14 -14 z" fill="${C.cream}"/>
    <rect x="162" y="196" width="188" height="18" rx="9" fill="${C.cream}" opacity="0.5"/>
    <rect x="212" y="230" width="88" height="64" rx="14" fill="${C.cream}"/>
    <circle cx="244" cy="256" r="9" fill="${C.eye}"/>
    <circle cx="268" cy="256" r="9" fill="${C.eye}"/>
    <circle cx="246" cy="253" r="3" fill="${C.cream}"/>
    <circle cx="270" cy="253" r="3" fill="${C.cream}"/>
    <path d="M244 276 Q256 288 268 276" stroke="${C.eye}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <circle cx="232" cy="272" r="7" fill="${C.coral}" opacity="0.8"/>
    <circle cx="280" cy="272" r="7" fill="${C.coral}" opacity="0.8"/>` },

  // 5. 床上用品 — bed + pillow face + moon
  { name: '床上用品', glyph: `
    <rect x="128" y="214" width="256" height="140" rx="30" fill="${C.cream2}"/>
    <rect x="128" y="324" width="256" height="30" rx="15" fill="${C.shadeCream}" opacity="0.5"/>
    <rect x="150" y="230" width="104" height="82" rx="22" fill="${C.cream}"/>
    <circle cx="184" cy="262" r="8" fill="${C.eye}"/>
    <circle cx="214" cy="262" r="8" fill="${C.eye}"/>
    <circle cx="186" cy="259" r="2.8" fill="${C.cream}"/>
    <circle cx="216" cy="259" r="2.8" fill="${C.cream}"/>
    <path d="M184 280 Q199 292 214 280" stroke="${C.eye}" stroke-width="6.5" fill="none" stroke-linecap="round"/>
    <circle cx="172" cy="274" r="7" fill="${C.coral}" opacity="0.8"/>
    <circle cx="226" cy="274" r="7" fill="${C.coral}" opacity="0.8"/>
    <rect x="260" y="230" width="118" height="112" rx="20" fill="${C.coral}"/>
    <g fill="${C.rose}" opacity="0.5">
      <rect x="270" y="240" width="12" height="92" rx="6"/>
      <rect x="290" y="240" width="12" height="92" rx="6"/>
      <rect x="310" y="240" width="12" height="92" rx="6"/>
      <rect x="330" y="240" width="12" height="92" rx="6"/>
    </g>
    <circle cx="372" cy="136" r="30" fill="${C.yellow}"/>
    <path d="M360 136 q7 7 14 0" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M380 136 q7 7 14 0" stroke="${C.eye}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M150 120 Q150 130 160 130 Q150 130 150 140 Q150 130 140 130 Q150 130 150 120 z" fill="${C.yellow}"/>
    <circle cx="196" cy="112" r="6" fill="${C.coral}"/>` },

  // 6. 户外装备 — tent + sun + cloud
  { name: '户外装备', glyph: `
    <circle cx="150" cy="140" r="40" fill="${C.yellow}" opacity="0.3"/>
    <circle cx="150" cy="140" r="30" fill="${C.yellow}"/>
    <g fill="${C.cream}">
      <circle cx="360" cy="142" r="18"/>
      <circle cx="380" cy="134" r="22"/>
      <circle cx="400" cy="142" r="16"/>
      <rect x="360" y="140" width="40" height="20" rx="10"/>
    </g>
    <path d="M256 186 L372 386 H140 Z" fill="${C.orange}"/>
    <path d="M256 186 L306 386 H140 Z" fill="${C.cream}" opacity="0.25"/>
    <path d="M256 226 L302 386 H210 Z" fill="${C.darkred}"/>
    <circle cx="238" cy="300" r="9" fill="${C.cream}"/>
    <circle cx="274" cy="300" r="9" fill="${C.cream}"/>
    <circle cx="241" cy="297" r="3" fill="${C.darkred}"/>
    <circle cx="277" cy="297" r="3" fill="${C.darkred}"/>
    <path d="M240 332 Q256 348 272 332" stroke="${C.cream}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="224" cy="322" r="7" fill="${C.coral}" opacity="0.8"/>
    <circle cx="288" cy="322" r="7" fill="${C.coral}" opacity="0.8"/>` },

  // 7. 玩具潮玩 — teddy bear
  { name: '玩具潮玩', glyph: `
    <ellipse cx="256" cy="350" rx="70" ry="50" fill="${C.coral}"/>
    <ellipse cx="256" cy="354" rx="44" ry="30" fill="${C.cream}"/>
    <circle cx="188" cy="166" r="30" fill="${C.yellow}"/>
    <circle cx="324" cy="166" r="30" fill="${C.yellow}"/>
    <circle cx="188" cy="166" r="15" fill="${C.coral}"/>
    <circle cx="324" cy="166" r="15" fill="${C.coral}"/>
    <circle cx="256" cy="234" r="92" fill="${C.yellow}"/>
    <path d="M256 142 l-20 -14 v28 z" fill="${C.purple}"/>
    <path d="M256 142 l20 -14 v28 z" fill="${C.purple}"/>
    <circle cx="256" cy="142" r="8" fill="${C.purple2}"/>
    <circle cx="222" cy="234" r="14" fill="${C.eye}"/>
    <circle cx="290" cy="234" r="14" fill="${C.eye}"/>
    <circle cx="227" cy="229" r="5" fill="${C.cream}"/>
    <circle cx="295" cy="229" r="5" fill="${C.cream}"/>
    <ellipse cx="256" cy="260" rx="10" ry="7" fill="${C.brown}"/>
    <path d="M238 280 Q256 296 274 280" stroke="${C.eye}" stroke-width="8" fill="none" stroke-linecap="round"/>
    <circle cx="198" cy="258" r="12" fill="${C.coral}" opacity="0.8"/>
    <circle cx="314" cy="258" r="12" fill="${C.coral}" opacity="0.8"/>` },

  // 8. 生活日用 — house
  { name: '生活日用', glyph: `
    <rect x="322" y="150" width="40" height="66" rx="10" fill="${C.rose}"/>
    <path d="M256 128 L404 244 H108 Z" fill="${C.darkred}"/>
    <path d="M256 128 L300 244 H108 Z" fill="${C.coral}" opacity="0.35"/>
    <rect x="140" y="244" width="232" height="150" rx="20" fill="${C.yellow}"/>
    <rect x="140" y="360" width="232" height="34" rx="17" fill="${C.shadeYellow}" opacity="0.45"/>
    <rect x="196" y="284" width="44" height="44" rx="12" fill="${C.cream}"/>
    <rect x="272" y="284" width="44" height="44" rx="12" fill="${C.cream}"/>
    <circle cx="218" cy="306" r="9" fill="${C.eye}"/>
    <circle cx="294" cy="306" r="9" fill="${C.eye}"/>
    <circle cx="221" cy="303" r="3" fill="${C.cream}"/>
    <circle cx="297" cy="303" r="3" fill="${C.cream}"/>
    <path d="M230 346 Q256 366 282 346" stroke="${C.eye}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="178" cy="330" r="11" fill="${C.coral}" opacity="0.8"/>
    <circle cx="334" cy="330" r="11" fill="${C.coral}" opacity="0.8"/>` },

  // 9. 粮油调味 — sauce bottle
  { name: '粮油调味', glyph: `
    <rect x="176" y="206" width="160" height="180" rx="34" fill="${C.darkred}"/>
    <rect x="176" y="352" width="160" height="34" rx="17" fill="${C.shadeRed}" opacity="0.45"/>
    <rect x="214" y="170" width="84" height="44" rx="12" fill="${C.darkred}"/>
    <rect x="222" y="176" width="14" height="32" rx="7" fill="${C.coral}" opacity="0.5"/>
    <rect x="226" y="130" width="60" height="46" rx="12" fill="${C.yellow}"/>
    <rect x="196" y="242" width="120" height="78" rx="16" fill="${C.cream}"/>
    <circle cx="242" cy="272" r="10" fill="${C.eye}"/>
    <circle cx="270" cy="272" r="10" fill="${C.eye}"/>
    <circle cx="244" cy="269" r="3.5" fill="${C.cream}"/>
    <circle cx="272" cy="269" r="3.5" fill="${C.cream}"/>
    <path d="M242 296 Q256 310 270 296" stroke="${C.eye}" stroke-width="7" fill="none" stroke-linecap="round"/>
    <circle cx="228" cy="292" r="8" fill="${C.coral}" opacity="0.8"/>
    <circle cx="284" cy="292" r="8" fill="${C.coral}" opacity="0.8"/>` },
];

function buildSvg(glyph) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${glyph}</svg>`;
}

(async () => {
  const map = {};
  for (const ic of icons) {
    const svg = buildSvg(ic.glyph);
    const pngPath = path.join(OUT, `${ic.name}.png`);
    await sharp(Buffer.from(svg)).png().toFile(pngPath);
    map[ic.name] = pngPath;
    console.log('generated', pngPath);
  }
  fs.writeFileSync(path.join(OUT, 'map.json'), JSON.stringify(map, null, 2));
  console.log('done ->', OUT);
})();
