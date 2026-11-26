// Gera as cordilheiras (SVG) do site. Uso, na pasta do site: node tools/gen-land.js .
const fs = require('fs');
const path = require('path');
const site = process.argv[2];
const W = 1440, H = 900;

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

const f = (n) => Math.round(n * 10) / 10;

function smooth(P) {
  let d = `M0 ${H}L${f(P[0][0])} ${f(P[0][1])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + `L${W} ${H}Z`;
}

function ridge({ seed, y, amp, rough = 0.52, step = 4 }) {
  const r = rng(seed);
  const n = 128;
  const pts = new Array(n + 1);
  pts[0] = y + (r() - 0.5) * amp * 0.6;
  pts[n] = y + (r() - 0.5) * amp * 0.6;
  let a = amp;
  for (let s = n; s > 1; s /= 2) {
    for (let i = s / 2; i < n; i += s) pts[i] = (pts[i - s / 2] + pts[i + s / 2]) / 2 + (r() - 0.5) * a;
    a *= rough;
  }
  const P = [];
  for (let i = 0; i <= n; i += step) P.push([(i / n) * W, pts[i]]);
  return smooth(P);
}

function dune({ y, waves }) {
  const P = [];
  for (let i = 0; i <= 24; i++) {
    const x = (i / 24) * W;
    let v = y;
    waves.forEach(([amp, len, phase]) => { v += amp * Math.sin((x / len) * Math.PI * 2 + phase); });
    P.push([x, v]);
  }
  return smooth(P);
}

const ridges = {
  hero1: ridge({ seed: 11, y: 470, amp: 170 }),
  hero2: ridge({ seed: 23, y: 548, amp: 150 }),
  hero3: ridge({ seed: 37, y: 628, amp: 120 }),
  hero4: ridge({ seed: 41, y: 708, amp: 90 }),
  hero5: ridge({ seed: 53, y: 792, amp: 56 }),
  sky1: ridge({ seed: 61, y: 560, amp: 180 }),
  sky2: ridge({ seed: 73, y: 640, amp: 140 }),
  sky3: ridge({ seed: 89, y: 724, amp: 100 }),
  sky4: ridge({ seed: 97, y: 806, amp: 56 }),
  dune1: dune({ y: 700, waves: [[46, 1500, 0.6], [18, 520, 2.1]] }),
  dune2: dune({ y: 770, waves: [[40, 1300, 2.4], [14, 460, 0.3]] }),
  dune3: dune({ y: 846, waves: [[30, 1100, 4.1], [10, 380, 1.7]] }),
  want1: ridge({ seed: 101, y: 690, amp: 150 }),
  want2: ridge({ seed: 113, y: 796, amp: 80 }),
};

// Paisagens estÃ¡ticas, usadas como fundo em CSS.
function scene(sky, layers, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice">
<defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1">${sky.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>
<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#s)"/>${extra}
${layers.map(([d, c], i) => `<path d="${d}" fill="${c}"/>${i < layers.length - 1 ? `<rect y="${520 + i * 80}" width="${W}" height="140" fill="url(#m)"/>` : ''}`).join('\n')}
</svg>
`;
}

fs.writeFileSync(path.join(site, 'assets/land-night.svg'), scene(
  [[0, '#02070a'], [0.55, '#0b2a3a'], [1, '#2f6c86']],
  [[ridges.sky1, '#1f4d63'], [ridges.sky2, '#123649'], [ridges.sky3, '#0a2230'], [ridges.sky4, '#03090d']],
  '<circle cx="1010" cy="430" r="26" fill="#cfe1ea" opacity=".85"/>',
));
fs.writeFileSync(path.join(site, 'assets/land-mist.svg'), scene(
  [[0, '#f3f6f7'], [0.6, '#dbe7ec'], [1, '#bfd8e3']],
  [[ridges.hero1, '#cddde4'], [ridges.hero2, '#adc7d3'], [ridges.hero3, '#86a9ba'], [ridges.hero4, '#5d879c']],
));

// Troca o d="" de cada <path data-ridge="nome"> nos HTML.
['index.html', 'briefing.html'].forEach((file) => {
  const p = path.join(site, file);
  if (!fs.existsSync(p)) return;
  let html = fs.readFileSync(p, 'utf8');
  let count = 0;
  html = html.replace(/<path data-ridge="(\w+)"( d="[^"]*")?/g, (m, name) => {
    if (!ridges[name]) throw new Error(`cordilheira desconhecida: ${name}`);
    count++;
    return `<path data-ridge="${name}" d="${ridges[name]}"`;
  });
  fs.writeFileSync(p, html);
  console.log(file, count, 'cordilheiras');
});
