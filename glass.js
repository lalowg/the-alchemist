/* THE ALCHEMIST — risograph-style glass renders for the shelf.
   Every glass is drawn as SVG from the drink's flavour data: a halo, a
   mis-registered colour slab, the liquid, ice or bubbles, the glass line,
   a highlight and a garnish. */

const G = {
  highball: {
    outline: 'M58 52L62 264Q63 276 76 276H124Q137 276 138 264L142 52',
    inner: 'M61 56L64 262Q65 273 76 273H124Q135 273 136 262L139 56Z',
    level: 92, shine: 'M71 72L74 252', rim: [140, 56],
  },
  rocks: {
    outline: 'M46 150L52 262Q53 276 68 276H132Q147 276 148 262L154 150',
    inner: 'M49 154L55 262Q56 273 68 273H132Q144 273 145 262L151 154Z',
    level: 182, shine: 'M60 168L64 256', rim: [152, 152],
  },
  coupe: {
    outline: 'M34 110Q36 178 100 182Q164 178 166 110M100 182V264M64 276Q100 262 136 276Z',
    inner: 'M37 113Q40 175 100 179Q160 175 163 113Z',
    level: 124, shine: 'M50 124Q56 160 80 170', rim: [164, 112],
  },
  nick: {
    outline: 'M56 96L60 128Q68 176 100 178Q132 176 140 128L144 96M100 178V264M64 276Q100 262 136 276Z',
    inner: 'M59 99L63 128Q70 173 100 175Q130 173 137 128L141 99Z',
    level: 112, shine: 'M68 110Q72 150 88 166', rim: [142, 98],
  },
  flute: {
    outline: 'M76 40Q70 150 100 196Q130 150 124 40M100 196V264M68 276Q100 264 132 276Z',
    inner: 'M79 43Q74 148 100 192Q126 148 121 43Z',
    level: 64, shine: 'M86 58Q83 130 96 176', rim: [123, 42],
  },
  bottle: {
    outline: 'M84 22H116V58Q116 76 138 96Q144 102 144 112V264Q144 276 132 276H68Q56 276 56 264V112Q56 102 62 96Q84 76 84 58Z',
    inner: 'M87 25H113V58Q113 78 135 98Q141 104 141 112V263Q141 273 132 273H68Q59 273 59 263V112Q59 104 65 98Q87 78 87 58Z',
    level: 116, shine: 'M68 122V252', rim: null,
  },
};

const top = (mix) => Object.entries(mix).sort((a, b) => b[1] - a[1])[0][0];

function garnish(d, g) {
  const lead = top(d.mix);
  if (!g.rim) {
    return '<rect x="80" y="10" width="40" height="16" rx="3" fill="#FF2E88" stroke="#FFF1E6" stroke-width="3"/>';
  }
  const [x, y] = g.rim;
  if (lead === 'smoke') {
    return `<g fill="none" stroke="#CDB8D9" stroke-width="3" stroke-linecap="round" opacity=".85"><path d="M92 ${y - 10}c-10-14 10-22 0-38s8-26 2-38"/><path d="M110 ${y - 14}c-8-12 8-18 0-30s6-20 2-30" opacity=".6"/></g>`;
  }
  if (lead === 'green') {
    return `<g transform="translate(${x - 6} ${y - 30}) rotate(24)"><path d="M0 34C-6 12 6-2 22 0C26 18 16 32 0 34Z" fill="#00C2A8" stroke="#FFF1E6" stroke-width="2.5"/><path d="M2 32L18 4" stroke="#FFF1E6" stroke-width="2"/></g>`;
  }
  if (lead === 'bitter') {
    return `<g fill="#FFF1E6">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle cx="${x - 70 + i * 9}" cy="${y - 3 + (i % 2) * 3}" r="1.8"/>`).join('')}</g>`;
  }
  // citrus wheel on the rim
  const spokes = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (i * Math.PI) / 3;
    return `<path d="M0 0L${(15 * Math.cos(a)).toFixed(1)} ${(15 * Math.sin(a)).toFixed(1)}"/>`;
  }).join('');
  return `<g transform="translate(${x - 4} ${y - 6})"><circle r="19" fill="#FFA21F" stroke="#FFF1E6" stroke-width="3"/><circle r="14" fill="#FFD27A"/><g stroke="#FFA21F" stroke-width="2">${spokes}</g></g>`;
}

export function glassSVG(d, cols, uid) {
  const g = G[d.glass] || G.coupe;
  const [a, b, c] = cols;
  const fizz = d.mix.fizz;
  let extras = '';
  if (d.glass === 'rocks') {
    extras += '<g transform="rotate(-12 100 205)"><rect x="72" y="178" width="54" height="54" rx="7" fill="#FFFFFF" fill-opacity=".22" stroke="#FFFFFF" stroke-opacity=".7" stroke-width="2.5"/><path d="M80 188h20" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/></g>';
  }
  if (fizz >= 4) {
    const n = Math.min(14, 4 + fizz);
    for (let i = 0; i < n; i++) {
      const bx = 70 + ((i * 37) % 62);
      const by = g.level + 18 + ((i * 53) % Math.max(40, 250 - g.level - 30));
      const r = 1.6 + (i % 3) * 1.1;
      extras += `<circle cx="${bx}" cy="${by}" r="${r}" fill="none" stroke="#FFF1E6" stroke-width="1.5" opacity=".8"/>`;
    }
  }
  const label = d.glass === 'bottle'
    ? `<rect x="68" y="168" width="64" height="62" rx="3" fill="#FFF1E6"/><text x="100" y="196" text-anchor="middle" font-family="Bagel Fat One, sans-serif" font-size="18" fill="#1B0B26">A·04</text><text x="100" y="216" text-anchor="middle" font-family="Rethink Sans, sans-serif" font-size="9" font-weight="700" letter-spacing="1.5" fill="#1B0B26">LIVE · 3.5 BAR</text>`
    : '';
  return `<svg viewBox="0 0 200 300" aria-hidden="true" focusable="false">
<defs>
<linearGradient id="lg-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>
<radialGradient id="rg-${uid}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${a}" stop-opacity=".45"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
<clipPath id="cp-${uid}"><path d="${g.inner}"/></clipPath>
</defs>
<circle cx="100" cy="190" r="100" fill="url(#rg-${uid})"/>
<ellipse cx="100" cy="282" rx="62" ry="7" fill="#000" opacity=".35"/>
<g class="riso"><g transform="translate(7 5)" clip-path="url(#cp-${uid})"><rect x="0" y="${g.level}" width="200" height="300" fill="${c}" opacity=".85"/></g></g>
<g clip-path="url(#cp-${uid})"><rect x="0" y="${g.level}" width="200" height="300" fill="url(#lg-${uid})"/><path d="M0 ${g.level}h200v6H0z" fill="#FFFFFF" opacity=".35"/>${extras}</g>
${label}
<path d="${g.outline}" fill="rgba(255,241,230,.07)" stroke="#FFF1E6" stroke-width="3.2" stroke-linejoin="round" stroke-linecap="round"/>
<path d="${g.shine}" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" opacity=".42"/>
${garnish(d, g)}
</svg>`;
}
