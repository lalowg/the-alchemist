# THE ALCHEMIST — More Than a Drink

An experimental beverage studio whose website is a working instrument. The first viewport is a **flavour composer**: six dials feed a living WebGL liquid, a bench ticket writes the recipe and the naming engine gives the result a name nobody has ordered before. The rest of the site is set like a lab poster, with numbered plates, a periodic table of ingredients, a sticky apparatus diagram, a shelf of risograph-style glasses and a booking bench.

Production URL: `https://the-alchemist-mu.vercel.app`

> Fictional concept brand, built as a portfolio project. The studio, menu, sessions and address are illustrative. Generated recipes are playful sketches, not instructions.

---

## Concept

Most drinks sites show bottles and moodboards. THE ALCHEMIST lets the visitor do what the studio does: start from a question ("more sour, a little smoke, lots of lift?") and see an answer pour itself.

| You change | The liquid answers |
|---|---|
| Sweet | Magenta takes the lead; the swirls grow larger and slower |
| Sour | Golden tangerine; the flow speeds up and the edges sharpen |
| Bitter | Deep wine tones; the liquid thickens and slows |
| Botanical | Aqua veins; the pattern becomes finer and more leafy |
| Smoke | A drifting violet veil darkens the glass |
| Fizz | Bubbles rise and pop across the surface; the colours lift |

Every change also rewrites the **readings** (viscosity, turbidity, pressure, pH), the **flavour wheel** around the glass, the **formula** (`Sw6 Ac7 Bi2 Gr4 Sm1 Fz7`), the **bench ticket** (base, strength, modifiers, garnish, glass, method, serving temperature) and the **generated name**.

## Brand & positioning

- **Name:** alchemy turned ordinary things into precious ones. The studio does the same with peels, roots, tea and patience.
- **Promise:** "More than a drink." Each drink is an experiment you get to finish.
- **Tone:** curious, specific, a little mischievous. Lab language ("batch", "plate", "dose") is used with a wink rather than as jargon.
- **Conversion:** "Take a seat at the bench". The form requests a Tasting Flight, Lab Hour or Commission and can attach the visitor's composition. It is a demo, and nothing is sent.

## Audience

Curious drinkers aged 25–45 who follow bar culture, care as much about a great zero-proof drink as a cocktail, and enjoy being invited to play. Event planners looking for a signature drink are a secondary audience (Commission).

## Art direction

- **Archetype:** lab poster. Asymmetric grids, registration marks, plate numbers, rotated captions, outline type that fills with liquid.
- **Palette:** plum `#1B0B26` (ground), magenta `#FF2E88`, tangerine `#FF8A00`, aqua `#00C2A8`, with paper `#FFF1E6` and lilac-grey `#CDB8D9` for text. Two sections flip the ground: **Methods** is printed on paper, and **Studio** on tangerine.
- **Risograph cues:** offset shadows (tangerine under magenta), mis-registered colour slabs behind every glass, a fine grain over the whole page.
- **Imagery:** 100% original. WebGL liquid, inline SVG apparatus, SVG glasses generated from each drink's flavour data, and an SVG bench illustration. No photography.
- **How it differs from EMBER (the other food site):** EMBER is a dark, candlelit editorial menu. THE ALCHEMIST is vivid, playful and tool-first, with no candlelight, serif menus or plated food.
- **Logo:** an original mark (a round-bottomed flask holding a magenta liquid with a tangerine swirl, plus an aqua spark). `logo.svg` pairs it with the wordmark; `favicon.svg` is the mark on a plum tile.

## Typography

- **Bagel Fat One** (display): headlines, the generated names, numerals, element symbols and primary buttons. Its round, inflated letterforms read as liquid and playful.
- **Rethink Sans** (400/500/700, italic 400): body copy, labels, data and UI.
- Both load from Google Fonts with `display=swap`. Headings use `text-wrap: balance` and `overflow-wrap: normal`, and sizes are clamped so words never break mid-word.

## Motion language

The signature motion is **filling**:
- Section titles start as outlines and **fill with magenta from the bottom up**, like a glass being poured.
- The generated name **transmutes**: its letters cycle through alchemical glyphs (△ ▽ ◇ ✶) before settling.
- Elements in the periodic table **bubble up** with a springy overshoot, staggered across the grid.
- In Methods the apparatus changes state as you scroll: curds settle, leaves sway under vacuum, cultures breathe, fine bubbles race up and the pressure needle swings.
- Bench-ticket fields flash when a value changes; glasses lift and their colour slabs slip out of register on hover.

## Signature interaction — how to use it

1. Move any of the six **flavour dials** with the mouse, touch or arrow keys. The liquid, wheel, readings, name and ticket update immediately.
2. **Drag across the glass** to stir it (horizontal swipes on touch). A tap drops a small swirl, and **Stir the glass** does the same from the keyboard.
3. **Transmute** generates a surprising new composition with a fresh batch number.
4. **Save to shelf** adds the drink to "Your batch log" in the Shelf section (session only).
5. In **Elements**, select an ingredient and press **Dose into the composer** to rebalance the dials towards it. In **Shelf**, open any drink and choose **Load into the composer**.
6. **Pause liquid** freezes the animation at any time.

## Tech

- Static HTML, CSS and ES modules with no build step and no libraries.
- `liquid.js`: a raw WebGL1 renderer that draws a single full-screen triangle. The fragment shader uses domain-warped fBm noise inside a round vessel, a three-colour flavour mix, a smoke veil, two layers of procedural bubbles, a pointer-driven stir vortex, a pour ripple, a rim highlight and grain. Uniforms ease towards their targets, so changes melt rather than cut.
- `data.js`: axes, the 18 elements, the Season 04 shelf, the naming engine (word banks keyed by the leading and second flavours, seeded per batch), recipe and readings logic.
- `glass.js`: SVG glass renders (highball, rocks, coupe, Nick & Nora, flute, bottle) generated from flavour data.
- `main.js`: composer state, pointer stirring, periodic table, sticky Methods, shelf, dialog, session batch log, form validation, navigation.

## Local development

```bash
npx serve .
```
Then open the printed local URL. Modules need to be served over HTTP, so opening `index.html` from disk will not work.

## Accessibility

- One `<h1>`, landmarks, a skip link and labelled sections. All controls are native (`input[type=range]`, radios, buttons, `<dialog>`), so they work by keyboard with visible `:focus-visible` rings.
- The canvas is decorative (`aria-hidden`). Its state is announced through a polite live region (name, leading flavours, glass) after you stop adjusting a dial. The formula has screen-reader text ("Sweet 6, Sour 7…").
- Every pointer action has a button equivalent (Stir the glass, Dose, Load, Transmute).
- The form validates inline with `aria-invalid`, associated error messages and focus moved to the first problem. The success message states plainly that nothing was sent.
- `prefers-reduced-motion: reduce`: the liquid renders as a still image that still updates when you change the dials. Reveals, glyph scrambles, ticker and apparatus loops are disabled.
- Contrast: body text is paper/lilac on plum and plum on paper/tangerine. Magenta buttons use plum text (≈5.3:1).

## Performance

- One WebGL context. DPR is capped at 2 on desktop and 1.5 on mobile, and the liquid renders at 80% of that because it is soft. Adaptive quality lowers the resolution further if frames run slow.
- The render loop runs only while the composer is on screen (IntersectionObserver) and the tab is visible, and stops when paused.
- If WebGL is unavailable or the context is lost, a designed CSS fallback (blurred colour fields in a glass ring, tinted from the same flavour data) takes over.
- Fonts are limited to the weights in use; there are no images to download.

## Known limitations

- The liquid is an artistic visualisation, not a fluid simulation. The readings are playful approximations.
- On touch devices, vertical swipes over the glass scroll the page (by design), so stirring uses horizontal swipes or taps.
- The batch log uses `sessionStorage` and clears when the tab closes.

## Credit

Designed & built by Saad Bashir — https://www.linkedin.com/in/saadbashirmarketing/
