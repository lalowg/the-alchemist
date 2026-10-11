/* THE ALCHEMIST — flavour data, ingredients, shelf, and the naming engine.
   Everything here is fictional studio content written for a portfolio concept. */

export const AXES = [
  { key: 'sweet',  sym: 'Sw', label: 'Sweet',     colour: '#FF2E88', note: 'fruit, nectar, honeyed depth' },
  { key: 'sour',   sym: 'Ac', label: 'Sour',      colour: '#FFA21F', note: 'citrus, acid, brightness' },
  { key: 'bitter', sym: 'Bi', label: 'Bitter',    colour: '#E0397A', note: 'root, bark, pith, cacao' },
  { key: 'green',  sym: 'Gr', label: 'Botanical', colour: '#00C2A8', note: 'leaf, herb, garden' },
  { key: 'smoke',  sym: 'Sm', label: 'Smoke',     colour: '#A895C2', note: 'tea smoke, char, resin' },
  { key: 'fizz',   sym: 'Fz', label: 'Fizz',      colour: '#F4ECFF', note: 'carbonation, ferment, lift' },
];

export const DEFAULT_MIX = { sweet: 6, sour: 7, bitter: 2, green: 4, smoke: 1, fizz: 7 };

/* Families are periodic "groups"; periods run from light (1) to bold (3). */
export const FAMILIES = [
  { key: 'sour',   name: 'Acids',      colour: '#FFA21F' },
  { key: 'sweet',  name: 'Sugars',     colour: '#FF2E88' },
  { key: 'bitter', name: 'Bitters',    colour: '#B3205F' },
  { key: 'green',  name: 'Botanicals', colour: '#00C2A8' },
  { key: 'smoke',  name: 'Smokes',     colour: '#8E7AA8' },
  { key: 'fizz',   name: 'Ferments',   colour: '#E9DDF7' },
];

// profile order: sweet, sour, bitter, green, smoke, fizz
export const ELEMENTS = [
  { n: 1,  sym: 'Bg', name: 'Bergamot',       fam: 'sour',   period: 1, p: [2, 6, 2, 3, 0, 0], note: 'Perfumed, floral citrus. We cold-press the peel into a cordial so the oil, not the juice, carries the drink.', use: 'Cordial · peel oil', pairs: ['White peach', 'Shiso', 'Lapsang'] },
  { n: 2,  sym: 'Yz', name: 'Yuzu',           fam: 'sour',   period: 2, p: [2, 8, 1, 2, 0, 0], note: 'Somewhere between mandarin, grapefruit and lime. Our default acid, clarified until it pours like glass.', use: 'Clarified juice', pairs: ['Lychee', 'Koji', 'Lemongrass'] },
  { n: 3,  sym: 'Fl', name: 'Finger lime',    fam: 'sour',   period: 3, p: [1, 9, 2, 3, 0, 1], note: 'Pearls of caviar-like acid that burst on the tongue. Added at the last second, never shaken.', use: 'Whole pearls', pairs: ['Gentian', 'Water kefir', 'Fig leaf'] },
  { n: 4,  sym: 'Wp', name: 'White peach',    fam: 'sweet',  period: 1, p: [6, 2, 0, 1, 0, 0], note: 'Soft stone-fruit sweetness. Roasted skins go into a syrup; the flesh becomes a clear peach water.', use: 'Peach water · skin syrup', pairs: ['Bergamot', 'Kombucha', 'Thyme'] },
  { n: 5,  sym: 'Ly', name: 'Lychee',         fam: 'sweet',  period: 2, p: [8, 2, 0, 1, 0, 0], note: 'Rose-edged and juicy. We freeze small spheres of it as a garnish that melts into the last sip.', use: 'Frozen pearls', pairs: ['Yuzu', 'Shiso', 'Black cardamom'] },
  { n: 6,  sym: 'Dm', name: 'Date molasses',  fam: 'sweet',  period: 3, p: [9, 1, 3, 0, 2, 0], note: 'Dark, toffee-like and almost savoury. A few drops give a spirit-free drink the weight of a long pour.', use: 'Drops · glaze', pairs: ['Cacao nib', 'Lapsang', 'Koji'] },
  { n: 7,  sym: 'Cy', name: 'Chicory',        fam: 'bitter', period: 1, p: [2, 0, 5, 2, 2, 0], note: 'Roasted root with a coffee-like bitterness. Gentle enough to sit underneath fruit without fighting it.', use: 'Cold infusion', pairs: ['Date molasses', 'Bergamot', 'Kombucha'] },
  { n: 8,  sym: 'Cn', name: 'Cacao nib',      fam: 'bitter', period: 2, p: [3, 1, 7, 0, 3, 0], note: 'Roasted, crushed and steeped in fat, then frozen and strained. The drink keeps the aroma and loses the weight.', use: 'Fat-wash', pairs: ['Black cardamom', 'White peach', 'Charred cedar'] },
  { n: 9,  sym: 'Gn', name: 'Gentian',        fam: 'bitter', period: 3, p: [1, 1, 10, 2, 0, 0], note: 'The mountain root behind most classic bitters. One drop changes a drink; three change your mind about it.', use: 'Tincture', pairs: ['Finger lime', 'Fig leaf', 'Water kefir'] },
  { n: 10, sym: 'Lg', name: 'Lemongrass',     fam: 'green',  period: 1, p: [1, 3, 0, 6, 0, 0], note: 'Clean, lemony and green. Bruised, vacuum-infused for ten minutes, and gone before it turns grassy.', use: 'Vacuum infusion', pairs: ['Yuzu', 'Koji', 'Lychee'] },
  { n: 11, sym: 'Fg', name: 'Fig leaf',       fam: 'green',  period: 2, p: [3, 0, 2, 8, 1, 0], note: 'Coconut, walnut and green fig in one leaf. Toasted lightly so the oils open up.', use: 'Toasted-leaf syrup', pairs: ['Gentian', 'Finger lime', 'Chicory'] },
  { n: 12, sym: 'Sh', name: 'Shiso',          fam: 'green',  period: 3, p: [1, 2, 1, 10, 0, 0], note: 'Mint, cumin and anise at once. Our loudest botanical, used as a leaf, a water and a salt.', use: 'Leaf · water · salt', pairs: ['Bergamot', 'Lychee', 'Water kefir'] },
  { n: 13, sym: 'Bc', name: 'Black cardamom', fam: 'smoke',  period: 1, p: [1, 0, 2, 2, 6, 0], note: 'Dried over open fire, so it tastes of camphor and woodsmoke rather than sweet spice.', use: 'Toasted pods', pairs: ['Lychee', 'Cacao nib', 'Kombucha'] },
  { n: 14, sym: 'Cd', name: 'Charred cedar',  fam: 'smoke',  period: 2, p: [0, 0, 3, 3, 8, 0], note: 'A plank torched at the bench and trapped under a cloche with the glass. Smoke you can see before you taste it.', use: 'Cloche smoke', pairs: ['Cacao nib', 'Gentian', 'Date molasses'] },
  { n: 15, sym: 'Lp', name: 'Lapsang',        fam: 'smoke',  period: 3, p: [1, 0, 3, 1, 10, 0], note: 'Pine-smoked black tea, cold-brewed for sixteen hours. The backbone of our smokiest drinks.', use: 'Cold brew', pairs: ['Bergamot', 'Date molasses', 'Finger lime'] },
  { n: 16, sym: 'Wk', name: 'Water kefir',    fam: 'fizz',   period: 1, p: [2, 3, 0, 1, 0, 6], note: 'A living culture that turns sugar water into a soft, naturally sparkling base in two days.', use: 'Live base', pairs: ['Shiso', 'Finger lime', 'Gentian'] },
  { n: 17, sym: 'Kb', name: 'Kombucha',       fam: 'fizz',   period: 2, p: [2, 5, 2, 1, 0, 8], note: 'Fermented in-house from green tea, then pushed to a higher pressure than you would expect.', use: 'Second ferment', pairs: ['White peach', 'Chicory', 'Black cardamom'] },
  { n: 18, sym: 'Kj', name: 'Koji',           fam: 'fizz',   period: 3, p: [4, 2, 1, 0, 1, 7], note: 'The mould behind miso and sake. We grow it on rice and use the amazake for body, savour and a slow natural fizz.', use: 'Amazake', pairs: ['Yuzu', 'Lemongrass', 'Date molasses'] },
];

/* Signature shelf — Season 04 (illustrative menu) */
export const DRINKS = [
  { id: 'neon-orchard',    name: 'Neon Orchard',    glass: 'highball', mood: ['bright'],          zero: true,  mix: { sweet: 6, sour: 7, bitter: 1, green: 3, smoke: 0, fizz: 8 }, line: 'White peach water, clarified yuzu, kombucha pushed to 3.5 bar.', method: 'Clarify · Carbonate', garnish: 'Frozen lychee pearl' },
  { id: 'gentian-hour',    name: 'Gentian Hour',    glass: 'rocks',    mood: ['bitter'],          zero: false, mix: { sweet: 3, sour: 2, bitter: 8, green: 4, smoke: 1, fizz: 0 }, line: 'Gentian tincture, toasted fig-leaf syrup, dry vermouth, one clear cube.', method: 'Infuse', garnish: 'Expressed grapefruit oil' },
  { id: 'lapsang-lantern', name: 'Lapsang Lantern', glass: 'nick',     mood: ['smoky'],           zero: false, mix: { sweet: 4, sour: 1, bitter: 3, green: 1, smoke: 8, fizz: 0 }, line: 'Sixteen-hour lapsang cold brew, date molasses, rice-koji gin.', method: 'Infuse · Smoke', garnish: 'Cedar smoke under a cloche' },
  { id: 'shiso-static',    name: 'Shiso Static',    glass: 'flute',    mood: ['bright'],          zero: true,  mix: { sweet: 2, sour: 5, bitter: 1, green: 8, smoke: 0, fizz: 7 }, line: 'Shiso water, finger lime pearls, water kefir, a pinch of shiso salt.', method: 'Ferment · Carbonate', garnish: 'Single shiso leaf' },
  { id: 'koji-velvet',     name: 'Koji Velvet',     glass: 'coupe',    mood: ['bitter', 'smoky'], zero: false, mix: { sweet: 5, sour: 2, bitter: 3, green: 1, smoke: 2, fizz: 2 }, line: 'Amazake, cacao-nib fat-washed rum, a drop of black cardamom.', method: 'Ferment · Fat-wash', garnish: 'Cacao dust, half the rim' },
  { id: 'bergamot-wire',   name: 'Bergamot Wire',   glass: 'coupe',    mood: ['bright', 'bitter'], zero: false, mix: { sweet: 2, sour: 8, bitter: 4, green: 3, smoke: 0, fizz: 2 }, line: 'Bergamot cordial, chicory, dry gin, stirred very cold.', method: 'Infuse · Clarify', garnish: 'Bergamot coin' },
  { id: 'midnight-cacao',  name: 'Midnight Cacao',  glass: 'rocks',    mood: ['bitter', 'smoky'], zero: true,  mix: { sweet: 5, sour: 1, bitter: 6, green: 0, smoke: 5, fizz: 0 }, line: 'Cold-brewed cacao husk, date molasses, charred cedar, served over clear ice.', method: 'Infuse · Smoke', garnish: 'Torched orange zest' },
  { id: 'kombucha-comet',  name: 'Kombucha Comet',  glass: 'bottle',   mood: ['bright'],          zero: true,  mix: { sweet: 3, sour: 6, bitter: 2, green: 4, smoke: 0, fizz: 9 }, line: 'Green-tea kombucha, lemongrass, bergamot. Bottled at the bench, opened at the table.', method: 'Ferment · Carbonate', garnish: 'None — the bubbles are the garnish' },
];

/* ------------------------------------------------------------------ */
/* Naming engine                                                        */
/* ------------------------------------------------------------------ */
const ADJ = {
  sweet:  ['Velvet', 'Candied', 'Honeyed', 'Satin', 'Ripe', 'Glazed'],
  sour:   ['Electric', 'Vivid', 'Citric', 'Razor', 'Neon', 'Bright'],
  bitter: ['Noble', 'Brooding', 'Gilded', 'Stern', 'Dark', 'Grave'],
  green:  ['Verdant', 'Wild', 'Feral', 'Mossy', 'Garden', 'Leafy'],
  smoke:  ['Smouldering', 'Ashen', 'Charred', 'Midnight', 'Hushed', 'Lantern'],
  fizz:   ['Restless', 'Sparking', 'Fizzing', 'Giddy', 'Popping', 'Lively'],
};
const NOUN = {
  sweet:  ['Nectar', 'Orchard', 'Bloom', 'Peach Moon', 'Syrup Saint', 'Halo'],
  sour:   ['Volt', 'Citrine', 'Lightning', 'Riot', 'Zest Engine', 'Flare'],
  bitter: ['Elixir', 'Oath', 'Tonic', 'Root Hour', 'Verdict', 'Relic'],
  green:  ['Canopy', 'Thicket', 'Meadow', 'Fern Club', 'Greenhouse', 'Hedge'],
  smoke:  ['Cinder', 'Pyre', 'Ash Choir', 'Lantern', 'Bonfire', 'Haze'],
  fizz:   ['Comet', 'Static', 'Spark', 'Fizz Machine', 'Satellite', 'Fireworks'],
};

export function hashMix(mix, seed = 0) {
  let h = 2166136261 ^ seed;
  for (const a of AXES) { h ^= Math.round(mix[a.key]) + 31; h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function ranked(mix) {
  return AXES.map((a) => ({ ...a, v: mix[a.key] })).sort((x, y) => y.v - x.v);
}

export function nameFor(mix, seed = 0) {
  const r = ranked(mix);
  const h = hashMix(mix, seed);
  const top = r[0].v === 0 ? 'fizz' : r[0].key;
  const second = r[1].v === 0 ? top : r[1].key;
  const adj = ADJ[second][h % ADJ[second].length];
  const noun = NOUN[top][(h >>> 5) % NOUN[top].length];
  const no = 10 + (h % 89);
  return { title: `${adj} ${noun}`, no };
}

export function formula(mix) {
  return AXES.map((a) => ({ sym: a.sym, v: Math.round(mix[a.key]) }));
}

const PERIOD = (v) => (v >= 7 ? 3 : v >= 4 ? 2 : 1);
const pick = (fam, v) => ELEMENTS.find((e) => e.fam === fam && e.period === PERIOD(v));

const BASE = {
  sweet: 'White peach water', sour: 'Clarified yuzu', bitter: 'Chicory cold infusion',
  green: 'Shiso water', smoke: 'Lapsang cold brew', fizz: 'Water kefir',
};
const GARNISH = {
  sweet: 'Frozen lychee pearl', sour: 'Expressed bergamot peel', bitter: 'Cacao dust on half the rim',
  green: 'A single shiso leaf', smoke: 'Cedar smoke under a cloche', fizz: 'None — the bubbles are the garnish',
};
const STRENGTH = {
  zero: 'Spirit-free', low: '+ 20 ml dry vermouth', full: '+ 45 ml rice-koji gin',
};

export function recipeFor(mix, strength = 'zero') {
  const r = ranked(mix);
  const top = r[0].v === 0 ? 'fizz' : r[0].key;
  const mods = r.slice(1, 3).filter((x) => x.v > 0).map((x) => pick(x.key, x.v)).filter(Boolean);
  let glass = 'Coupe';
  if (mix.fizz >= 7) glass = mix.green > mix.sweet ? 'Flute' : 'Highball';
  else if (mix.smoke >= 6) glass = 'Nick & Nora';
  else if (mix.bitter >= 6) glass = 'Rocks, one clear cube';
  let method = 'Stirred, served up';
  if (mix.fizz >= 6) method = `Force-carbonated at ${(2 + mix.fizz * 0.2).toFixed(1)} bar`;
  else if (mix.sour >= 6) method = 'Milk-clarified overnight, stirred';
  else if (mix.smoke >= 6) method = 'Smoked under a cloche at the table';
  const temp = mix.fizz >= 6 ? '−2 °C' : mix.smoke >= 6 ? '6 °C' : '0 °C';
  return {
    base: BASE[top],
    spirit: STRENGTH[strength] || STRENGTH.zero,
    mods: mods.map((m) => m.name),
    garnish: GARNISH[top],
    glass, method, temp,
  };
}

/* physical "readings" for the specimen annotations */
export function readings(mix) {
  const vis = (mix.sweet * 0.6 + mix.bitter * 0.25 + mix.smoke * 0.15) / 10;
  const turb = (mix.smoke * 0.55 + mix.bitter * 0.3 + mix.sweet * 0.15) / 10;
  const bar = mix.fizz * 0.38;
  const ph = 7 - mix.sour * 0.42 - mix.fizz * 0.06;
  return { vis, turb, bar, ph: Math.max(2.4, ph) };
}

export function mixFromProfile(p) {
  const o = {};
  AXES.forEach((a, i) => { o[a.key] = p[i]; });
  return o;
}
