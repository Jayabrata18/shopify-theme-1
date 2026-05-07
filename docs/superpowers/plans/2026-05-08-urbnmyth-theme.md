# URBNMYTH Shopify Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete URBNMYTH Shopify theme — espresso-brown editorial dark luxury — with animated hero, side nav drawer, collection/product/cart pages, and hybrid JS fetch page transitions wired into Shopify's Liquid template system.

**Architecture:** Monolithic CSS design system (`urbnmyth.css`) + single JS bundle (`urbnmyth.js`). Liquid sections own server-side data rendering. `theme.liquid` is the global shell (loading screen, transition panel, nav drawer, cursor, footer). JS `init(root)` re-runs after every fetch page swap to wire interactive elements on new DOM. Cart uses Shopify Ajax Cart API; wishlist uses localStorage.

**Tech Stack:** Shopify Liquid 2.x, vanilla CSS (custom properties, keyframes, grid, clamp()), vanilla JS (fetch, IntersectionObserver, requestAnimationFrame, localStorage, DOMParser), Shopify Ajax Cart API (`/cart/add.js`, `/cart/change.js`), Shopify Recommendations API (`/recommendations/products.json`), Google Fonts (Cormorant Garamond + Montserrat), cdnfonts (Coolvetica)

**Verification:** `shopify theme dev --store=<store>.myshopify.com` to preview. Install Shopify CLI: `npm install -g @shopify/cli`. Browser console assertions documented per JS task.

---

### Task 1: Initialize git and scaffold file stubs

**Files:**
- Initialize: `.git/`
- Create: `assets/urbnmyth.css`, `assets/urbnmyth.js`, `assets/urbnmyth-logo.svg`
- Create: all section, snippet, template stubs listed below

- [ ] **Step 1: Initialize git**

```bash
cd "/Users/jayabratapramanik/Developer/NEW THEME"
git init
```

Expected: `Initialized empty Git repository`

- [ ] **Step 2: Create all new file stubs**

```bash
touch assets/urbnmyth.css assets/urbnmyth.js assets/urbnmyth-logo.svg
touch sections/hero.liquid sections/featured-products.liquid
touch sections/brand-manifesto.liquid sections/brand-story.liquid
touch sections/collection-header.liquid sections/product-grid.liquid
touch sections/product-media.liquid sections/product-info.liquid sections/product-recommendations.liquid
touch sections/cart-items.liquid sections/cart-summary.liquid sections/footer.liquid
touch snippets/product-card.liquid snippets/nav-drawer.liquid
touch snippets/icon-hamburger.liquid snippets/icon-close.liquid snippets/icon-heart.liquid
touch templates/cart.liquid
```

- [ ] **Step 3: Verify structure**

```bash
ls assets/urbnmyth* sections/*.liquid snippets/*.liquid templates/cart.liquid
```

Expected: all 23 new files listed without errors.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "chore: scaffold URBNMYTH theme file stubs"
```

---

### Task 2: CSS — Design tokens, reset, typography, grain, reveal base

**Files:**
- Write: `assets/urbnmyth.css`

- [ ] **Step 1: Write CSS foundation**

Replace the full content of `assets/urbnmyth.css` with:

```css
@import url('https://fonts.cdnfonts.com/css/coolvetica');

/* ================================================
   URBNMYTH — Design System
   ================================================ */

:root {
  --bg:         #1c1714;
  --surface:    #231e1a;
  --card:       #2d2620;
  --text:       #f0ece4;
  --text-muted: #a09880;
  --accent:     #CC0000;
  --gold:       #c9a96e;
  --border:     #3d342c;
  --highlight:  #f5f0e8;
  --font-display:   'Coolvetica', Impact, sans-serif;
  --font-editorial: 'Cormorant Garamond', Georgia, serif;
  --font-body:      'Montserrat', system-ui, sans-serif;
  --ease-drawer: cubic-bezier(0.77, 0, 0.175, 1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; overflow-x: hidden; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  font-size: clamp(0.875rem, 1vw, 1rem);
  line-height: 1.6;
  overflow-x: hidden;
  cursor: none;
}

img  { display: block; max-width: 100%; height: auto; }
a    { color: inherit; text-decoration: none; cursor: none; }
button { border: none; background: none; cursor: none; font-family: inherit; color: inherit; }
ul, ol { list-style: none; }
input, select { font-family: inherit; }

/* Grain texture helper (reused via class) */
.grain::after {
  content: '';
  position: fixed;
  inset: -50%;
  width: 200%;
  height: 200%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 100;
  opacity: 0.03;
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(1rem, 4vw, 4rem);
}

.section { padding: clamp(4rem, 8vw, 8rem) 0; }

/* Scroll reveal — JS adds .revealed */
.reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.reveal.revealed { opacity: 1; transform: translateY(0); }

:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
```

- [ ] **Step 2: Verify syntax with Node**

```bash
node -e "
const css = require('fs').readFileSync('assets/urbnmyth.css','utf8');
['--bg','--accent','--font-display','.reveal','.container'].forEach(s=>{
  if(!css.includes(s)) throw new Error('Missing: '+s);
});
console.log('CSS base: OK — '+Math.round(css.length/1024)+'kb');
"
```

Expected: `CSS base: OK — 2kb`

- [ ] **Step 3: Commit**

```bash
git add assets/urbnmyth.css
git commit -m "feat: css design tokens, reset, reveal base"
```

---

### Task 3: CSS — Loading screen, page transition, custom cursor

**Files:**
- Modify: `assets/urbnmyth.css` (append)

- [ ] **Step 1: Append**

```css
/* ——— Loading Screen ——— */
#loading-screen {
  position: fixed; inset: 0;
  background: var(--bg);
  z-index: 9000;
  display: flex; align-items: center; justify-content: center;
  transition: clip-path 0.6s var(--ease-drawer);
  clip-path: inset(0 0 0% 0);
}
#loading-screen.wipe-out { clip-path: inset(0 0 100% 0); }

#loading-monogram {
  font-family: var(--font-display);
  font-size: 6rem;
  color: var(--accent);
  animation: monogramPulse 1.5s ease-in-out infinite;
  letter-spacing: -0.02em;
}

/* ——— Page Transition Panel ——— */
#page-transition {
  position: fixed; inset: 0;
  background: var(--accent);
  z-index: 8999;
  clip-path: inset(0 100% 0 0);
  pointer-events: none;
  transition: clip-path 0.45s var(--ease-drawer);
}
#page-transition.wipe-in  { clip-path: inset(0 0% 0 0);   pointer-events: all; }
#page-transition.wipe-out { clip-path: inset(0 0 0 100%); }

/* ——— Custom Cursor ——— */
#cursor-ring {
  position: fixed; top: 0; left: 0;
  width: 28px; height: 28px;
  border: 1.5px solid var(--highlight);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
  mix-blend-mode: difference;
  display: flex; align-items: center; justify-content: center;
}
#cursor-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; flex-shrink: 0; }
#cursor-ring.cursor-hover { width: 56px; height: 56px; }

@media (hover: none) { #cursor-ring { display: none; } body, a, button { cursor: auto; } }
```

- [ ] **Step 2: Verify**

```bash
node -e "
const css = require('fs').readFileSync('assets/urbnmyth.css','utf8');
['#loading-screen','#page-transition','#cursor-ring','wipe-out','wipe-in'].forEach(s=>{
  if(!css.includes(s)) throw new Error('Missing: '+s);
});
console.log('CSS loading/transition/cursor: OK');
"
```

- [ ] **Step 3: Commit**

```bash
git add assets/urbnmyth.css
git commit -m "feat: css loading screen, page transition, custom cursor"
```

---

### Task 4: CSS — Nav drawer, hamburger, overlay

**Files:**
- Modify: `assets/urbnmyth.css` (append)

- [ ] **Step 1: Append**

```css
/* ——— Hamburger ——— */
#nav-toggle {
  position: fixed; top: 1.5rem; left: 1.5rem; z-index: 500;
  width: 44px; height: 44px;
  display: flex; flex-direction: column; justify-content: center; gap: 6px; padding: 0.5rem;
}
#nav-toggle span { display: block; width: 24px; height: 1.5px; background: var(--text); transition: 0.3s ease; transform-origin: center; }
body.drawer-open #nav-toggle span:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
body.drawer-open #nav-toggle span:nth-child(2) { opacity: 0; }
body.drawer-open #nav-toggle span:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

/* ——— Overlay ——— */
#drawer-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0);
  z-index: 300;
  pointer-events: none;
  transition: background 0.5s ease;
}
body.drawer-open #drawer-overlay { background: rgba(0,0,0,0.6); pointer-events: all; }

/* ——— Drawer ——— */
#nav-drawer {
  position: fixed; top: 0; left: 0;
  width: 320px; height: 100vh;
  background: var(--bg);
  z-index: 400;
  transform: translateX(-100%);
  transition: transform 0.5s var(--ease-drawer);
  display: flex; flex-direction: column;
  padding: 2rem 2.5rem;
  overflow-y: auto;
}
body.drawer-open #nav-drawer { transform: translateX(0); }

.drawer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 3rem; }
.drawer-wordmark { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: 0.15em; color: var(--text); }
.drawer-close { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: var(--text); transition: color 0.2s ease; }
.drawer-close:hover { color: var(--accent); }

.drawer-category {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.85rem 0 0.85rem 1rem;
  font-family: var(--font-display);
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  letter-spacing: 0.08em;
  color: var(--text);
  border-left: 4px solid transparent;
  opacity: 0; transform: translateX(-20px);
  transition: color 0.2s ease, border-color 0.2s ease, opacity 0.4s ease, transform 0.4s ease;
  position: relative;
}
body.drawer-open .drawer-category { opacity: 1; transform: translateX(0); }
.drawer-category::after { content: '→'; opacity: 0; transform: translateX(-8px); transition: opacity 0.2s, transform 0.2s; }
.drawer-category:hover::after,
.drawer-category.active::after { opacity: 1; transform: translateX(0); }
.drawer-category:hover, .drawer-category.active { color: var(--accent); border-left-color: var(--accent); }

.drawer-count { font-family: var(--font-body); font-size: 0.7rem; color: var(--text-muted); margin-right: auto; padding-left: 0.5rem; }
.drawer-divider { border: none; border-top: 1px solid var(--gold); opacity: 0.35; margin: 1.5rem 0; }
.drawer-links { display: flex; flex-direction: column; gap: 1rem; }
.drawer-link { font-family: var(--font-body); font-size: 0.78rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); transition: color 0.2s ease; }
.drawer-link:hover { color: var(--text); }

@media (max-width: 480px) { #nav-drawer { width: 100vw; } }
```

- [ ] **Step 2: Verify**

```bash
node -e "
const css = require('fs').readFileSync('assets/urbnmyth.css','utf8');
['#nav-drawer','#nav-toggle','drawer-open','drawer-close','drawer-category'].forEach(s=>{
  if(!css.includes(s)) throw new Error('Missing: '+s);
});
console.log('CSS nav drawer: OK');
"
```

- [ ] **Step 3: Commit**

```bash
git add assets/urbnmyth.css
git commit -m "feat: css nav drawer and hamburger"
```

---

### Task 5: CSS — Hero, marquee, buttons, brand sections, product cards, collection grid, product page, cart, footer, keyframes, responsive

**Files:**
- Modify: `assets/urbnmyth.css` (append full remainder of styles)

- [ ] **Step 1: Append all remaining CSS**

```css
/* ——— Hero ——— */
.hero {
  position: relative; min-height: 100svh;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: var(--bg); overflow: hidden; padding: 0 1rem 5rem;
}
.hero-wordmark {
  font-family: var(--font-display);
  font-size: clamp(4rem, 12vw, 10rem);
  letter-spacing: 0.1em; color: var(--text); line-height: 1; text-align: center;
  display: flex; flex-wrap: wrap; justify-content: center; position: relative; z-index: 1;
}
.hero-wordmark .letter { display: inline-block; opacity: 0; transform: translateY(60px); }
.hero-wordmark .letter.animate { animation: letterDrop 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.hero-tagline {
  font-family: var(--font-editorial); font-style: italic; font-variant: small-caps;
  font-size: clamp(0.9rem, 1.5vw, 1.2rem); letter-spacing: 0.3em;
  color: var(--text); opacity: 0.8; margin-top: 1.5rem; text-align: center;
  position: relative; z-index: 1;
}
.hero-cta { position: relative; z-index: 1; margin-top: 3rem; }

/* ——— Buttons ——— */
.btn {
  display: inline-flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: clamp(0.8rem, 1vw, 0.95rem);
  letter-spacing: 0.15em; text-transform: uppercase;
  padding: 1rem 2.5rem; position: relative; overflow: hidden; transition: color 0.3s ease;
}
.btn > span { position: relative; z-index: 1; }
.btn::before { content: ''; position: absolute; inset: 0; transform: scaleX(0); transform-origin: left; transition: transform 0.4s ease; }
.btn:hover::before { transform: scaleX(1); }
.btn-outline { border: 1.5px solid var(--text); color: var(--text); }
.btn-outline::before { background: var(--accent); }
.btn-outline:hover { border-color: var(--accent); }
.btn-solid { background: var(--accent); color: var(--text); border: 1.5px solid var(--accent); }
.btn-solid:hover { transform: scale(1.02); box-shadow: 0 8px 32px rgba(204,0,0,0.3); }

/* ——— Marquee ——— */
.marquee-bar {
  position: absolute; bottom: 0; left: 0; width: 100%;
  background: var(--accent); padding: 0.75rem 0; overflow: hidden; z-index: 2;
}
.marquee-track { display: flex; white-space: nowrap; animation: marquee 20s linear infinite; }
.marquee-text {
  font-family: var(--font-body); font-size: 0.72rem; letter-spacing: 0.2em;
  text-transform: uppercase; color: var(--text); padding-right: 4rem; flex-shrink: 0;
}

/* ——— Section Title w/ Underline Draw ——— */
.section-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 6vw, 5rem);
  color: var(--text); line-height: 1.05;
  position: relative; display: inline-block;
}
.section-title::after {
  content: ''; position: absolute; bottom: -0.3em; left: 0;
  height: 3px; background: var(--accent); width: 0; transition: width 0.6s ease;
}
.section-title.underline-drawn::after { width: 100%; }

/* ——— Product Card ——— */
.product-card {
  background: var(--card); border: 1px solid var(--border);
  display: flex; flex-direction: column; overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease; position: relative;
}
.product-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.4); }

.product-card-image {
  aspect-ratio: 3/4; overflow: hidden; position: relative;
  background: linear-gradient(160deg, var(--surface) 0%, var(--card) 50%, var(--border) 100%);
}
.product-card-image::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.012) 20px, rgba(255,255,255,0.012) 21px);
}
.product-card-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
.product-card:hover .product-card-image img { transform: scale(1.05); }

.product-card-quick-add {
  position: absolute; bottom: 0; left: 0; right: 0;
  background: var(--accent); color: var(--text);
  font-family: var(--font-display); font-size: 0.82rem; letter-spacing: 0.15em; text-align: center;
  padding: 1rem; transform: translateY(100%); transition: transform 0.3s ease;
}
.product-card:hover .product-card-quick-add { transform: translateY(0); }

.product-card-body { padding: 1.25rem; flex: 1; display: flex; flex-direction: column; gap: 0.5rem; }
.product-card-name {
  font-family: var(--font-display); font-size: clamp(0.95rem, 2vw, 1.25rem);
  color: var(--text); letter-spacing: 0.04em;
  position: relative; display: inline-block;
}
.product-card-name::after {
  content: ''; position: absolute; bottom: -2px; left: 0;
  height: 1.5px; background: var(--accent); width: 0; transition: width 0.4s ease;
}
.product-card:hover .product-card-name::after { width: 100%; }
.product-card-category { font-family: var(--font-body); font-size: 0.68rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gold); }
.product-card-price { font-family: var(--font-editorial); font-size: clamp(1rem, 1.5vw, 1.2rem); color: var(--gold); margin-top: auto; }

/* ——— Product Grid ——— */
.product-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }

/* ——— Filter Bar ——— */
.filter-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 3rem; }
.filter-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.filter-pill {
  font-family: var(--font-body); font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase;
  padding: 0.5rem 1.2rem; background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.filter-pill:hover { border-color: var(--text-muted); color: var(--text); }
.filter-pill.active { background: var(--accent); border-color: var(--accent); color: var(--text); }
.sort-select {
  font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.1em;
  background: var(--surface); border: 1px solid var(--border); color: var(--text-muted);
  padding: 0.5rem 1rem; appearance: none; -webkit-appearance: none;
}

/* ——— Brand Manifesto ——— */
.manifesto { padding: clamp(5rem, 10vw, 10rem) 0; }
.manifesto-inner { position: relative; padding-left: 3rem; }
.manifesto-inner::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--accent); }
.manifesto-text { font-family: var(--font-display); font-size: clamp(1.8rem, 5vw, 4rem); color: var(--text); line-height: 1.2; letter-spacing: 0.02em; }

/* ——— Brand Story ——— */
.brand-story { padding: clamp(4rem, 8vw, 8rem) 0; }
.brand-story-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; }
.brand-story-copy { font-family: var(--font-editorial); font-style: italic; font-size: clamp(1rem, 1.5vw, 1.2rem); color: var(--text); line-height: 1.8; display: flex; flex-direction: column; gap: 1.5rem; }
.brand-story-panel {
  background: var(--card); border: 1px solid var(--border);
  padding: 4rem 2rem; display: flex; align-items: center; justify-content: center;
  position: relative; min-height: 400px; overflow: hidden;
}
.brand-story-year { font-family: var(--font-display); font-size: clamp(5rem, 10vw, 9rem); color: var(--gold); opacity: 0.12; letter-spacing: 0.05em; line-height: 1; text-align: center; }

/* ——— Product Page ——— */
.product-layout { display: grid; grid-template-columns: 3fr 2fr; gap: 4rem; align-items: start; padding: clamp(2rem, 5vw, 5rem) 0; }
.product-media-wrap { position: sticky; top: 2rem; }
.product-image-container {
  aspect-ratio: 3/4; position: relative; overflow: hidden;
  background: linear-gradient(160deg, var(--surface) 0%, var(--card) 50%, var(--border) 100%);
}
.product-image-container::after {
  content: ''; position: absolute; inset: 0;
  background: repeating-linear-gradient(-45deg, transparent, transparent 20px, rgba(255,255,255,0.012) 20px, rgba(255,255,255,0.012) 21px);
}
.product-image-container img { width: 100%; height: 100%; object-fit: cover; display: block; }
.product-watermark {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  font-family: var(--font-display); font-size: clamp(5rem, 15vw, 12rem);
  color: var(--text); opacity: 0.04; letter-spacing: 0.05em; pointer-events: none; z-index: 1;
}
.product-info { display: flex; flex-direction: column; gap: 1.5rem; }
.product-name { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem); color: var(--text); letter-spacing: 0.03em; line-height: 1.1; }
.product-badge { display: inline-block; font-family: var(--font-body); font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase; background: var(--accent); color: var(--text); padding: 0.3rem 0.8rem; }
.product-price { font-family: var(--font-editorial); font-size: clamp(1.5rem, 3vw, 2rem); color: var(--gold); }
.product-compare-price { text-decoration: line-through; opacity: 0.5; font-size: 0.8em; margin-left: 0.5rem; }
.product-description { font-family: var(--font-editorial); font-style: italic; font-size: clamp(0.95rem, 1.3vw, 1.1rem); color: var(--text); line-height: 1.8; opacity: 0.85; }

.option-label { font-family: var(--font-body); font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.6rem; }
.size-pills { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.size-pill {
  font-family: var(--font-body); font-size: 0.75rem; letter-spacing: 0.08em;
  padding: 0.6rem 1rem; border: 1.5px solid var(--border); color: var(--text); background: transparent;
  min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.2s, background 0.2s, color 0.2s;
}
.size-pill:hover { border-color: var(--accent); }
.size-pill.selected { background: var(--accent); border-color: var(--accent); }

.color-swatches { display: flex; gap: 0.75rem; }
.color-swatch { width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent; box-shadow: 0 0 0 1px var(--border); transition: box-shadow 0.2s; }
.color-swatch.selected { box-shadow: 0 0 0 2px var(--accent); }

.qty-selector { display: flex; align-items: center; border: 1px solid var(--border); width: fit-content; }
.qty-btn { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; color: var(--text); transition: color 0.2s, background 0.2s; }
.qty-btn:hover { color: var(--accent); background: var(--surface); }
.qty-input { width: 56px; height: 44px; text-align: center; background: transparent; border: none; border-left: 1px solid var(--border); border-right: 1px solid var(--border); color: var(--text); font-size: 0.9rem; }
.qty-input::-webkit-inner-spin-button, .qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }

.add-to-cart {
  width: 100%; padding: 1.2rem 2rem; background: var(--accent); color: var(--text);
  font-family: var(--font-display); font-size: 1rem; letter-spacing: 0.15em; text-transform: uppercase;
  transition: transform 0.2s, box-shadow 0.2s;
}
.add-to-cart:hover { transform: scale(1.02); box-shadow: 0 8px 32px rgba(204,0,0,0.35); }
.add-to-cart:disabled { opacity: 0.7; transform: none; box-shadow: none; }

.wishlist-toggle {
  display: flex; align-items: center; gap: 0.5rem;
  font-family: var(--font-body); font-size: 0.78rem; letter-spacing: 0.1em;
  color: var(--text-muted); padding: 0.5rem 0; transition: color 0.2s; background: transparent; border: none;
}
.wishlist-toggle:hover, .wishlist-toggle.active { color: var(--accent); }

.product-tabs-nav { display: flex; border-bottom: 1px solid var(--border); }
.product-tab-btn {
  font-family: var(--font-body); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--text-muted); padding: 0.75rem 1.5rem;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
  transition: color 0.2s, border-color 0.2s; background: transparent; border-left: none; border-right: none; border-top: none;
}
.product-tab-btn.active { color: var(--text); border-bottom-color: var(--accent); }
.product-tab-content { display: none; padding: 1.5rem 0; font-family: var(--font-editorial); font-size: 1rem; color: var(--text); line-height: 1.8; opacity: 0; transition: opacity 0.3s ease; }
.product-tab-content.active { display: block; opacity: 1; }

/* ——— You Might Also Like ——— */
.product-recommendations { padding: clamp(3rem, 6vw, 6rem) 0; }
.recommendations-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }

/* ——— Cart Page ——— */
.cart-page-title { font-family: var(--font-display); font-size: clamp(2.5rem, 6vw, 5rem); color: var(--text); letter-spacing: 0.08em; margin-bottom: 3rem; }
.cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 4rem; align-items: start; padding-bottom: clamp(3rem, 6vw, 6rem); }

.cart-table { width: 100%; border-collapse: collapse; }
.cart-table th { font-family: var(--font-body); font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); text-align: left; padding: 0 1rem 1.5rem; border-bottom: 1px solid var(--border); }
.cart-table th:last-child { text-align: right; }
.cart-row { border-bottom: 1px solid var(--border); }
.cart-row td { padding: 1.5rem 1rem; vertical-align: middle; }

.cart-item-image-wrap { width: 80px; }
.cart-item-image { width: 80px; height: 100px; background: var(--card); overflow: hidden; }
.cart-item-image img { width: 100%; height: 100%; object-fit: cover; }
.cart-item-name { font-family: var(--font-display); font-size: 0.95rem; letter-spacing: 0.04em; color: var(--text); }
.cart-item-variant { font-family: var(--font-body); font-size: 0.72rem; color: var(--text-muted); margin-top: 0.25rem; }
.cart-remove { color: var(--accent); font-size: 1.2rem; padding: 0.5rem; transition: opacity 0.2s; }
.cart-remove:hover { opacity: 0.7; }
.cart-item-price { font-family: var(--font-editorial); font-size: 1.1rem; color: var(--gold); text-align: right; }

.cart-summary {
  background: var(--surface); border: 1px solid var(--border);
  padding: 2.5rem; position: sticky; top: 2rem;
  display: flex; flex-direction: column; gap: 1.25rem;
}
.cart-summary-row { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-body); font-size: 0.85rem; color: var(--text-muted); }
.cart-summary-row.total { border-top: 1px solid var(--border); padding-top: 1.25rem; }
.cart-summary-row.total .s-label { font-family: var(--font-display); font-size: 1.1rem; color: var(--text); letter-spacing: 0.08em; }
.cart-summary-row.total .s-value { font-family: var(--font-editorial); font-size: 1.6rem; color: var(--gold); }
.free-shipping-msg { color: #4caf50; }

.promo-wrap { display: flex; }
.promo-input { flex: 1; background: var(--bg); border: 1px solid var(--border); border-right: none; color: var(--text); padding: 0.75rem 1rem; font-size: 0.8rem; outline: none; transition: border-color 0.2s; }
.promo-input:focus { border-color: var(--gold); }
.promo-submit { background: var(--card); border: 1px solid var(--border); color: var(--text-muted); padding: 0.75rem 1rem; font-family: var(--font-body); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s, background 0.2s; }
.promo-submit:hover { color: var(--text); background: var(--surface); }

.cart-empty { padding: clamp(4rem, 10vw, 10rem) 0; text-align: center; }
.cart-empty-title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 4rem); color: var(--text); letter-spacing: 0.1em; margin-bottom: 2rem; }

/* ——— Footer ——— */
.footer { border-top: 1px solid rgba(201,169,110,0.35); padding: 3rem 0; }
.footer-grid { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 2rem; }
.footer-logo { font-family: var(--font-display); font-size: 1.2rem; letter-spacing: 0.15em; color: var(--text); }
.footer-nav { display: flex; gap: 2.5rem; justify-content: center; }
.footer-nav-link { font-family: var(--font-body); font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-muted); transition: color 0.2s; }
.footer-nav-link:hover { color: var(--text); }
.footer-social { display: flex; gap: 1.25rem; justify-content: flex-end; }
.footer-social-link { font-family: var(--font-body); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); transition: color 0.2s; }
.footer-social-link:hover { color: var(--accent); }
.footer-copy { font-family: var(--font-body); font-size: 0.65rem; color: var(--text-muted); text-align: center; margin-top: 2rem; opacity: 0.6; }

/* ——— Keyframes ——— */
@keyframes letterDrop {
  from { opacity: 0; transform: translateY(60px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes monogramPulse {
  0%, 100% { transform: scale(1);    opacity: 1; }
  50%       { transform: scale(1.15); opacity: 0.7; }
}
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ——— Responsive ——— */
@media (max-width: 1200px) {
  .product-grid { grid-template-columns: repeat(2, 1fr); }
  .cart-layout  { grid-template-columns: 1fr 320px; }
  .recommendations-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .product-grid       { grid-template-columns: repeat(2, 1fr); }
  .product-layout     { grid-template-columns: 1fr; }
  .product-media-wrap { position: static; }
  .brand-story-grid   { grid-template-columns: 1fr; }
  .cart-layout        { grid-template-columns: 1fr; }
  .footer-grid        { grid-template-columns: 1fr; text-align: center; }
  .footer-social      { justify-content: center; }
  .footer-nav         { flex-wrap: wrap; gap: 1.5rem; }
  .recommendations-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr; }
  .recommendations-grid { grid-template-columns: repeat(2, 1fr); overflow-x: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .hero-wordmark .letter { opacity: 1; transform: none; animation: none; }
  #loading-monogram      { animation: none; }
  #page-transition       { transition: none; }
  .reveal                { opacity: 1; transform: none; transition: none; }
  #cursor-ring           { display: none; }
}
```

- [ ] **Step 2: Verify total CSS**

```bash
node -e "
const css = require('fs').readFileSync('assets/urbnmyth.css','utf8');
const checks = ['@keyframes letterDrop','@keyframes marquee','.product-card','.cart-layout','.footer','.size-pill','.btn-outline','@media (max-width: 480px)'];
checks.forEach(s=>{ if(!css.includes(s)) throw new Error('Missing: '+s); });
console.log('CSS complete: OK — '+Math.round(css.length/1024)+'kb');
"
```

Expected: `CSS complete: OK — 20kb` (approximately)

- [ ] **Step 3: Commit**

```bash
git add assets/urbnmyth.css
git commit -m "feat: css complete — hero, cards, product, cart, footer, keyframes, responsive"
```

---

### Task 6: JS — Complete urbnmyth.js

**Files:**
- Write: `assets/urbnmyth.js`

- [ ] **Step 1: Write complete JS**

```javascript
'use strict';

/* ========= CURSOR ========= */
function initCursor() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ring = document.getElementById('cursor-ring');
  if (!ring || window.matchMedia('(hover: none)').matches) return;
  let cx = 0, cy = 0, mx = 0, my = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  (function lerp() {
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    ring.style.left = cx + 'px';
    ring.style.top  = cy + 'px';
    requestAnimationFrame(lerp);
  })();
  document.addEventListener('mouseover', e => {
    if (e.target.closest('a, button')) ring.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest('a, button')) ring.classList.remove('cursor-hover');
  });
}

/* ========= LOADING SCREEN ========= */
function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;
  setTimeout(() => {
    screen.classList.add('wipe-out');
    setTimeout(() => screen.remove(), 700);
  }, 2000);
}

/* ========= SCROLL REVEALS ========= */
function initScrollReveals(root) {
  const els = root.querySelectorAll('.reveal:not(.revealed)');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = Array.from(els).indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('revealed'), Math.min(idx * 80, 400));
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
}

/* ========= HERO LETTERS ========= */
function initHeroLetters(root) {
  const wm = root.querySelector('.hero-wordmark[data-animate]');
  if (!wm) return;
  const text = wm.textContent.trim();
  wm.innerHTML = [...text].map((c, i) =>
    `<span class="letter" style="animation-delay:${i * 80}ms">${c === ' ' ? '&nbsp;' : c}</span>`
  ).join('');
  requestAnimationFrame(() => wm.querySelectorAll('.letter').forEach(l => l.classList.add('animate')));
}

/* ========= UNDERLINE DRAWS ========= */
function initUnderlineDraws(root) {
  root.querySelectorAll('.section-title[data-underline]').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { el.classList.add('underline-drawn'); obs.disconnect(); }
    }, { threshold: 0.5 });
    obs.observe(el);
  });
  const colTitle = root.querySelector('.collection-title');
  if (colTitle) setTimeout(() => colTitle.classList.add('underline-drawn'), 300);
}

/* ========= NAV DRAWER ========= */
function initNavDrawer() {
  const toggle  = document.getElementById('nav-toggle');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('drawer-close');
  if (!toggle) return;
  const open  = () => { document.body.classList.add('drawer-open');    toggle.setAttribute('aria-expanded','true'); };
  const close = () => { document.body.classList.remove('drawer-open'); toggle.setAttribute('aria-expanded','false'); };
  toggle.addEventListener('click', () => document.body.classList.contains('drawer-open') ? close() : open());
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  updateActiveDrawerLink();
}

function updateActiveDrawerLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.drawer-category[href], .drawer-link[href]').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

/* ========= PAGE TRANSITIONS ========= */
function initPageTransitions() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
    if (href.includes('/checkout') || href.includes('/cart/add') || href.includes('/discount')) return;
    try {
      const url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return;
    } catch { return; }
    e.preventDefault();
    navigateTo(href);
  });
  window.addEventListener('popstate', e => { if (e.state?.href) navigateTo(e.state.href, false); });
}

async function navigateTo(href, push = true) {
  const panel = document.getElementById('page-transition');
  if (!panel) { window.location.href = href; return; }
  panel.classList.add('wipe-in');
  panel.classList.remove('wipe-out');
  try {
    const res  = await fetch(href);
    const html = await res.text();
    const doc  = new DOMParser().parseFromString(html, 'text/html');
    const newMain = doc.getElementById('main-content');
    const curMain = document.getElementById('main-content');
    if (!newMain || !curMain) { window.location.href = href; return; }
    await new Promise(r => setTimeout(r, 450));
    curMain.innerHTML = newMain.innerHTML;
    document.title = doc.title;
    if (push) history.pushState({ href }, doc.title, href);
    updateActiveDrawerLink();
    window.scrollTo({ top: 0, behavior: 'instant' });
    init(curMain);
    panel.classList.add('wipe-out');
    panel.classList.remove('wipe-in');
    setTimeout(() => panel.classList.remove('wipe-out'), 500);
  } catch { window.location.href = href; }
}

/* ========= PRODUCT PAGE ========= */
function initProductPage(root) {
  initSizeSelector(root);
  initColorSwatches(root);
  initQtySelector(root);
  initProductTabs(root);
  initWishlist(root);
  initAddToCart(root);
}

function initSizeSelector(root) {
  const pills = root.querySelectorAll('.size-pill');
  if (!pills.length) return;
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      updateVariantId(root);
    });
  });
  root.querySelector('.size-pill')?.classList.add('selected');
}

function initColorSwatches(root) {
  const swatches = root.querySelectorAll('.color-swatch');
  if (!swatches.length) return;
  swatches.forEach(s => s.addEventListener('click', () => {
    swatches.forEach(x => x.classList.remove('selected'));
    s.classList.add('selected');
    updateVariantId(root);
  }));
  swatches[0]?.classList.add('selected');
}

function updateVariantId(root) {
  const dataEl = root.querySelector('[data-variants]');
  if (!dataEl) return;
  const variants = JSON.parse(dataEl.dataset.variants);
  const size  = root.querySelector('.size-pill.selected')?.dataset.value;
  const color = root.querySelector('.color-swatch.selected')?.dataset.value;
  const match = variants.find(v => {
    const opts = [v.option1, v.option2, v.option3];
    return (!size || opts.includes(size)) && (!color || opts.includes(color)) && v.available;
  }) || variants.find(v => {
    const opts = [v.option1, v.option2, v.option3];
    return (!size || opts.includes(size)) && (!color || opts.includes(color));
  });
  const idInput = root.querySelector('#variant-id');
  if (idInput && match) idInput.value = match.id;
  if (match) {
    const priceEl = root.querySelector('.product-price-value');
    if (priceEl) priceEl.textContent = formatMoney(match.price);
  }
}

function formatMoney(cents) {
  return '₹' + (cents / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function initQtySelector(root) {
  const input = root.querySelector('.qty-input');
  if (!input) return;
  root.querySelector('.qty-minus')?.addEventListener('click', () => {
    const v = parseInt(input.value, 10); if (v > 1) input.value = v - 1;
  });
  root.querySelector('.qty-plus')?.addEventListener('click', () => {
    input.value = parseInt(input.value, 10) + 1;
  });
}

function initProductTabs(root) {
  const btns     = root.querySelectorAll('.product-tab-btn');
  const contents = root.querySelectorAll('.product-tab-content');
  if (!btns.length) return;
  btns.forEach(btn => btn.addEventListener('click', () => {
    const t = btn.dataset.tab;
    btns.forEach(b => b.classList.remove('active'));
    contents.forEach(c => { c.classList.remove('active'); c.style.opacity = '0'; });
    btn.classList.add('active');
    const c = root.querySelector(`.product-tab-content[data-tab="${t}"]`);
    if (c) { c.classList.add('active'); requestAnimationFrame(() => c.style.opacity = '1'); }
  }));
  btns[0]?.click();
}

function initWishlist(root) {
  const btn = root.querySelector('.wishlist-toggle');
  if (!btn) return;
  const handle = btn.dataset.handle;
  const list   = getWishlist();
  if (list.includes(handle)) btn.classList.add('active');
  btn.addEventListener('click', () => {
    const l = getWishlist();
    const i = l.indexOf(handle);
    i === -1 ? l.push(handle) : l.splice(i, 1);
    localStorage.setItem('urbnmyth_wishlist', JSON.stringify(l));
    btn.classList.toggle('active', i === -1);
  });
}

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('urbnmyth_wishlist') || '[]'); }
  catch { return []; }
}

function initAddToCart(root) {
  const form = root.querySelector('.add-to-cart-form');
  if (!form) return;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn       = form.querySelector('.add-to-cart');
    const variantId = form.querySelector('#variant-id')?.value;
    const qty       = parseInt(form.querySelector('.qty-input')?.value || '1', 10);
    if (!variantId) return;
    btn.textContent = 'ADDING...';
    btn.disabled    = true;
    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: parseInt(variantId, 10), quantity: qty })
      });
      if (res.ok) { navigateTo('/cart'); }
      else {
        const d = await res.json();
        btn.textContent = d.description || 'SOLD OUT';
        setTimeout(() => { btn.textContent = 'ADD TO CART'; btn.disabled = false; }, 2500);
      }
    } catch { btn.textContent = 'ADD TO CART'; btn.disabled = false; }
  });
}

/* ========= CART PAGE ========= */
function initCartPage(root) {
  root.querySelectorAll('.cart-qty-form').forEach(form => {
    const input = form.querySelector('.cart-qty-input');
    const key   = form.dataset.key;
    if (!input || !key) return;
    const update = async qty => {
      if (qty < 0) return;
      input.value = qty;
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      });
      window.location.reload();
    };
    form.querySelector('.cart-qty-minus')?.addEventListener('click', () => update(parseInt(input.value,10) - 1));
    form.querySelector('.cart-qty-plus')?.addEventListener('click',  () => update(parseInt(input.value,10) + 1));
  });
  root.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      if (!key) return;
      await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity: 0 })
      });
      window.location.reload();
    });
  });
}

/* ========= PRODUCT RECOMMENDATIONS ========= */
function initProductRecommendations(root) {
  const container = root.querySelector('[data-recommendations]');
  if (!container) return;
  const pid = container.dataset.productId;
  if (!pid) return;
  fetch(`/recommendations/products.json?product_id=${pid}&limit=4`)
    .then(r => r.json())
    .then(data => {
      if (!data.products?.length) { container.closest('.product-recommendations')?.remove(); return; }
      container.innerHTML = data.products.map(p => `
        <a href="/products/${p.handle}" class="product-card reveal">
          <div class="product-card-image">
            ${p.featured_image ? `<img src="${p.featured_image.src}?width=400" alt="${p.title}" loading="lazy">` : ''}
            <div class="product-card-quick-add">QUICK ADD</div>
          </div>
          <div class="product-card-body">
            <span class="product-card-name">${p.title}</span>
            <span class="product-card-category">${p.product_type}</span>
            <span class="product-card-price">${formatMoney(p.price_min)}</span>
          </div>
        </a>`).join('');
      initScrollReveals(container);
    })
    .catch(() => container.closest('.product-recommendations')?.remove());
}

/* ========= FILTER PILLS ========= */
function initFilterPills(root) {
  root.querySelectorAll('.filter-pill[href]').forEach(pill => {
    pill.addEventListener('click', e => { e.preventDefault(); navigateTo(pill.getAttribute('href')); });
  });
}

/* ========= INIT (called after every page swap) ========= */
function init(root = document) {
  initScrollReveals(root);
  initHeroLetters(root);
  initUnderlineDraws(root);
  initProductPage(root);
  initCartPage(root);
  initProductRecommendations(root);
  initFilterPills(root);
}

/* ========= BOOTSTRAP ========= */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initLoadingScreen();
  initNavDrawer();
  initPageTransitions();
  init();
});
```

- [ ] **Step 2: Verify JS syntax**

```bash
node -e "
const js = require('fs').readFileSync('assets/urbnmyth.js','utf8');
const checks = ['initCursor','initLoadingScreen','navigateTo','initProductPage','initCartPage','initProductRecommendations','formatMoney','getWishlist'];
checks.forEach(fn => { if (!js.includes(fn)) throw new Error('Missing: '+fn); });
// Check no syntax errors by parsing
new Function(js);
console.log('JS: OK — '+Math.round(js.length/1024)+'kb');
"
```

Expected: `JS: OK — 6kb`

- [ ] **Step 3: Commit**

```bash
git add assets/urbnmyth.js
git commit -m "feat: complete urbnmyth.js — cursor, transitions, product, cart, wishlist"
```

---

### Task 7: SVG logo and icon snippets

**Files:**
- Write: `assets/urbnmyth-logo.svg`
- Write: `snippets/icon-hamburger.liquid`
- Write: `snippets/icon-close.liquid`
- Write: `snippets/icon-heart.liquid`

- [ ] **Step 1: Write SVG logo (gothic blackletter "um" monogram)**

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 60" fill="#CC0000">
  <!-- Gothic blackletter "u" -->
  <rect x="4" y="4" width="6" height="42"/>
  <rect x="4" y="4" width="22" height="6"/>
  <rect x="4" y="22" width="22" height="6"/>
  <rect x="4" y="46" width="22" height="6"/>
  <rect x="20" y="4" width="6" height="48"/>
  <!-- Gothic blackletter "m" -->
  <rect x="32" y="4" width="6" height="48"/>
  <rect x="32" y="4" width="38" height="6"/>
  <rect x="32" y="22" width="38" height="6"/>
  <rect x="52" y="4" width="6" height="48"/>
  <rect x="64" y="4" width="6" height="48"/>
</svg>
```

- [ ] **Step 2: Write hamburger icon snippet**

Content of `snippets/icon-hamburger.liquid`:
```html
<button id="nav-toggle" aria-label="Open navigation menu" aria-expanded="false" aria-controls="nav-drawer">
  <span></span>
  <span></span>
  <span></span>
</button>
```

- [ ] **Step 3: Write close icon snippet**

Content of `snippets/icon-close.liquid`:
```html
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <line x1="1" y1="1" x2="17" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="17" y1="1" x2="1" y2="17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>
```

- [ ] **Step 4: Write heart icon snippet**

Content of `snippets/icon-heart.liquid`:
```html
<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 13S1 8.5 1 4.5A3.5 3.5 0 0 1 8 3.036 3.5 3.5 0 0 1 15 4.5C15 8.5 8 13 8 13Z"
    stroke="currentColor" stroke-width="1.3" fill="{{ include.filled | default: 'none' }}"/>
</svg>
```

- [ ] **Step 5: Commit**

```bash
git add assets/urbnmyth-logo.svg snippets/icon-hamburger.liquid snippets/icon-close.liquid snippets/icon-heart.liquid
git commit -m "feat: svg logo and icon snippets"
```

---

### Task 8: Snippet — nav-drawer.liquid

**Files:**
- Write: `snippets/nav-drawer.liquid`

- [ ] **Step 1: Write nav drawer snippet**

```liquid
<nav id="nav-drawer" role="navigation" aria-label="Main navigation">
  <div class="drawer-header">
    <a href="/" class="drawer-wordmark">URBNMYTH</a>
    <button id="drawer-close" class="drawer-close" aria-label="Close navigation menu">
      {% render 'icon-close' %}
    </button>
  </div>

  <ul class="drawer-categories">
    {%- assign categories = 't-shirts,polos,shirts,jackets,hoodies,pants' | split: ',' -%}
    {%- assign labels = 'T-SHIRTS,POLOS,SHIRTS,JACKETS,HOODIES,PANTS' | split: ',' -%}
    {%- for handle in categories -%}
      {%- assign label = labels[forloop.index0] -%}
      <li style="transition-delay: {{ forloop.index0 | times: 80 }}ms">
        <a href="/collections/{{ handle }}"
           class="drawer-category{% if request.path contains handle %} active{% endif %}">
          <span>{{ label }}</span>
          {%- if collections[handle] -%}
            <span class="drawer-count">({{ collections[handle].products_count }})</span>
          {%- endif -%}
        </a>
      </li>
    {%- endfor -%}
  </ul>

  <hr class="drawer-divider">

  <ul class="drawer-links">
    <li><a href="/" class="drawer-link{% if request.path == '/' %} active{% endif %}">HOME</a></li>
    <li><a href="/collections/all" class="drawer-link">COLLECTIONS</a></li>
    <li><a href="/pages/about" class="drawer-link">ABOUT</a></li>
    <li><a href="/pages/contact" class="drawer-link">CONTACT</a></li>
  </ul>
</nav>

<div id="drawer-overlay" aria-hidden="true"></div>
```

- [ ] **Step 2: Commit**

```bash
git add snippets/nav-drawer.liquid
git commit -m "feat: nav drawer snippet with category counts and stagger"
```

---

### Task 9: Snippet — product-card.liquid

**Files:**
- Write: `snippets/product-card.liquid`

- [ ] **Step 1: Write product card snippet**

```liquid
{%- comment -%}
  Usage: {% render 'product-card', product: product %}
{%- endcomment -%}

<a href="{{ product.url }}" class="product-card reveal">
  <div class="product-card-image">
    {%- if product.featured_image -%}
      {{
        product.featured_image
        | image_url: width: 600
        | image_tag:
          loading: 'lazy',
          alt: product.featured_image.alt | default: product.title,
          widths: '300, 600',
          sizes: '(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw'
      }}
    {%- endif -%}
    <div class="product-card-quick-add">QUICK ADD</div>
  </div>
  <div class="product-card-body">
    <span class="product-card-name">{{ product.title }}</span>
    <span class="product-card-category">{{ product.type }}</span>
    <span class="product-card-price">
      {{ product.price_min | money }}
      {%- if product.price_min != product.price_max %} – {{ product.price_max | money }}{%- endif -%}
    </span>
  </div>
</a>
```

- [ ] **Step 2: Commit**

```bash
git add snippets/product-card.liquid
git commit -m "feat: product card snippet"
```

---

### Task 10: Sections — Homepage (hero, featured-products, brand-manifesto, brand-story)

**Files:**
- Write: `sections/hero.liquid`
- Write: `sections/featured-products.liquid`
- Write: `sections/brand-manifesto.liquid`
- Write: `sections/brand-story.liquid`

- [ ] **Step 1: Write hero.liquid**

```liquid
<section class="hero">
  <div class="hero-grain" aria-hidden="true"></div>

  <h1 class="hero-wordmark" data-animate>{{ section.settings.wordmark | default: 'URBNMYTH' }}</h1>

  <p class="hero-tagline">{{ section.settings.tagline | default: 'WHERE MYTH MEETS THE URBAN' }}</p>

  <div class="hero-cta">
    <a href="{{ section.settings.cta_url | default: '/collections/all' }}" class="btn btn-outline">
      <span>{{ section.settings.cta_text | default: 'EXPLORE COLLECTION' }}</span>
    </a>
  </div>

  <div class="marquee-bar" aria-hidden="true">
    <div class="marquee-track">
      {%- assign marquee = section.settings.marquee_text | default: 'NEW ARRIVALS — SS25 DROP — URBNMYTH.IN — SHOP NOW — ' -%}
      {%- for i in (1..8) -%}
        <span class="marquee-text">{{ marquee }}</span>
      {%- endfor -%}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Hero",
  "settings": [
    { "type": "text",    "id": "wordmark",     "label": "Wordmark",    "default": "URBNMYTH" },
    { "type": "text",    "id": "tagline",      "label": "Tagline",     "default": "WHERE MYTH MEETS THE URBAN" },
    { "type": "text",    "id": "cta_text",     "label": "CTA text",    "default": "EXPLORE COLLECTION" },
    { "type": "url",     "id": "cta_url",      "label": "CTA URL",     "default": "/collections/all" },
    { "type": "text",    "id": "marquee_text", "label": "Marquee text","default": "NEW ARRIVALS — SS25 DROP — URBNMYTH.IN — SHOP NOW — " }
  ],
  "presets": [{ "name": "Hero" }]
}
{% endschema %}
```

- [ ] **Step 2: Write featured-products.liquid**

```liquid
{%- assign col = collections[section.settings.collection] -%}

<section class="section">
  <div class="container">
    <div class="product-grid">
      {%- if col != blank -%}
        {%- for product in col.products limit: 3 -%}
          {% render 'product-card', product: product %}
        {%- endfor -%}
      {%- else -%}
        {%- for i in (1..3) -%}
          <div class="product-card reveal">
            <div class="product-card-image"></div>
            <div class="product-card-body">
              <span class="product-card-name">SAMPLE PRODUCT {{ i }}</span>
              <span class="product-card-category">CATEGORY</span>
              <span class="product-card-price">₹1,999</span>
            </div>
          </div>
        {%- endfor -%}
      {%- endif -%}
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Featured Products",
  "settings": [
    { "type": "collection", "id": "collection", "label": "Collection" }
  ],
  "presets": [{ "name": "Featured Products" }]
}
{% endschema %}
```

- [ ] **Step 3: Write brand-manifesto.liquid**

```liquid
<section class="manifesto">
  <div class="container">
    <div class="manifesto-inner reveal">
      <p class="manifesto-text">{{ section.settings.text | default: "WE DON'T FOLLOW TRENDS. WE BURY THEM." }}</p>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Brand Manifesto",
  "settings": [
    { "type": "text", "id": "text", "label": "Manifesto text", "default": "WE DON'T FOLLOW TRENDS. WE BURY THEM." }
  ],
  "presets": [{ "name": "Brand Manifesto" }]
}
{% endschema %}
```

- [ ] **Step 4: Write brand-story.liquid**

```liquid
<section class="brand-story">
  <div class="container">
    <div class="brand-story-grid">
      <div class="brand-story-copy reveal">
        {{ section.settings.copy | default: "<p>URBNMYTH is a language spoken in alleyways and auction houses alike. Born from the streets of Delhi, dressed in the silence of old money.</p><p>Every piece is a relic from a future that hasn't arrived yet. We don't make clothes — we make mythology.</p>" }}
      </div>
      <div class="brand-story-panel reveal" data-reveal-delay="160">
        <span class="brand-story-year">EST. {{ section.settings.year | default: '2024' }}</span>
      </div>
    </div>
  </div>
</section>

{% schema %}
{
  "name": "Brand Story",
  "settings": [
    { "type": "richtext", "id": "copy", "label": "Brand copy" },
    { "type": "text",     "id": "year", "label": "Established year", "default": "2024" }
  ],
  "presets": [{ "name": "Brand Story" }]
}
{% endschema %}
```

- [ ] **Step 5: Commit**

```bash
git add sections/hero.liquid sections/featured-products.liquid sections/brand-manifesto.liquid sections/brand-story.liquid
git commit -m "feat: homepage sections — hero, featured products, manifesto, brand story"
```

---

### Task 11: Section — footer.liquid

**Files:**
- Write: `sections/footer.liquid`

- [ ] **Step 1: Write footer.liquid**

```liquid
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-logo">
        <a href="/">URBNMYTH</a>
      </div>
      <nav class="footer-nav" aria-label="Footer navigation">
        <a href="/"                  class="footer-nav-link">HOME</a>
        <a href="/collections/all"   class="footer-nav-link">COLLECTIONS</a>
        <a href="/pages/about"       class="footer-nav-link">ABOUT</a>
        <a href="/pages/contact"     class="footer-nav-link">CONTACT</a>
      </nav>
      <div class="footer-social">
        {%- if section.settings.instagram != blank -%}
          <a href="{{ section.settings.instagram }}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Instagram">INSTAGRAM</a>
        {%- endif -%}
        {%- if section.settings.twitter != blank -%}
          <a href="{{ section.settings.twitter }}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Twitter/X">TWITTER</a>
        {%- endif -%}
      </div>
    </div>
    <p class="footer-copy">© {{ 'now' | date: '%Y' }} URBNMYTH. All rights reserved.</p>
  </div>
</footer>

{% schema %}
{
  "name": "Footer",
  "settings": [
    { "type": "url", "id": "instagram", "label": "Instagram URL" },
    { "type": "url", "id": "twitter",   "label": "Twitter/X URL" }
  ]
}
{% endschema %}
```

- [ ] **Step 2: Commit**

```bash
git add sections/footer.liquid
git commit -m "feat: footer section"
```

---

### Task 12: Template — index.json (homepage)

**Files:**
- Overwrite: `templates/index.json`

- [ ] **Step 1: Write index.json**

```json
{
  "sections": {
    "hero": {
      "type": "hero",
      "settings": {
        "wordmark": "URBNMYTH",
        "tagline": "WHERE MYTH MEETS THE URBAN",
        "cta_text": "EXPLORE COLLECTION",
        "cta_url": "/collections/all",
        "marquee_text": "NEW ARRIVALS — SS25 DROP — URBNMYTH.IN — SHOP NOW — "
      }
    },
    "featured_products": {
      "type": "featured-products",
      "settings": {}
    },
    "manifesto": {
      "type": "brand-manifesto",
      "settings": {
        "text": "WE DON'T FOLLOW TRENDS. WE BURY THEM."
      }
    },
    "brand_story": {
      "type": "brand-story",
      "settings": {
        "year": "2024"
      }
    }
  },
  "order": ["hero", "featured_products", "manifesto", "brand_story"]
}
```

- [ ] **Step 2: Verify JSON is valid**

```bash
node -e "
const t = JSON.parse(require('fs').readFileSync('templates/index.json','utf8'));
const order = t.order;
order.forEach(k => { if (!t.sections[k]) throw new Error('Missing section: '+k); });
console.log('index.json: OK — sections: '+order.join(', '));
"
```

Expected: `index.json: OK — sections: hero, featured_products, manifesto, brand_story`

- [ ] **Step 3: Commit**

```bash
git add templates/index.json
git commit -m "feat: homepage template — wires hero, featured products, manifesto, brand story"
```

---

### Task 13: Sections — Collection page (collection-header, product-grid)

**Files:**
- Write: `sections/collection-header.liquid`
- Write: `sections/product-grid.liquid`

- [ ] **Step 1: Write collection-header.liquid**

```liquid
<div class="container">
  <div class="section" style="padding-bottom: 0;">
    <h1 class="section-title collection-title" data-underline>
      {{ collection.title | upcase | default: 'THE COLLECTION' }}
    </h1>
  </div>

  <div class="filter-bar">
    <div class="filter-pills">
      <a href="{{ collection.url }}"
         class="filter-pill{% unless current_tags %} active{% endunless %}">
        ALL
      </a>
      {%- for tag in collection.all_tags -%}
        {%- if tag != blank -%}
          <a href="{{ collection.url }}/{{ tag | handleize }}"
             class="filter-pill{% if current_tags contains tag %} active{% endif %}">
            {{ tag | upcase }}
          </a>
        {%- endif -%}
      {%- endfor -%}
    </div>

    <select class="sort-select" onchange="navigateTo(this.value)" aria-label="Sort products">
      {%- for option in collection.sort_options -%}
        <option value="{{ collection.url }}?sort_by={{ option.value }}"
          {%- if collection.sort_by == option.value %} selected{%- endif -%}>
          {{ option.name }}
        </option>
      {%- endfor -%}
    </select>
  </div>
</div>

{% schema %}
{
  "name": "Collection Header",
  "settings": [],
  "presets": [{ "name": "Collection Header" }]
}
{% endschema %}
```

- [ ] **Step 2: Write product-grid.liquid**

```liquid
<section class="section" style="padding-top: 1rem;">
  <div class="container">
    {%- if collection.products.size > 0 -%}
      <div class="product-grid">
        {%- for product in collection.products -%}
          {% render 'product-card', product: product %}
        {%- endfor -%}
      </div>

      {%- if paginate.pages > 1 -%}
        <div style="text-align:center; margin-top: 4rem;">
          {{ paginate | default_pagination: next: 'NEXT →', previous: '← PREV' }}
        </div>
      {%- endif -%}
    {%- else -%}
      <p style="font-family: var(--font-display); font-size: 2rem; color: var(--text-muted); text-align: center; padding: 6rem 0;">
        NO PRODUCTS FOUND
      </p>
    {%- endif -%}
  </div>
</section>

{% schema %}
{
  "name": "Product Grid",
  "settings": [],
  "presets": [{ "name": "Product Grid" }]
}
{% endschema %}
```

- [ ] **Step 3: Commit**

```bash
git add sections/collection-header.liquid sections/product-grid.liquid
git commit -m "feat: collection page sections — header with filter pills, product grid"
```

---

### Task 14: Template — collection.json

**Files:**
- Overwrite: `templates/collection.json`

- [ ] **Step 1: Write collection.json**

```json
{
  "sections": {
    "collection_header": {
      "type": "collection-header",
      "settings": {}
    },
    "product_grid": {
      "type": "product-grid",
      "settings": {}
    }
  },
  "order": ["collection_header", "product_grid"]
}
```

- [ ] **Step 2: Verify**

```bash
node -e "
const t = JSON.parse(require('fs').readFileSync('templates/collection.json','utf8'));
console.log('collection.json: OK — sections: '+t.order.join(', '));
"
```

Expected: `collection.json: OK — sections: collection_header, product_grid`

- [ ] **Step 3: Commit**

```bash
git add templates/collection.json
git commit -m "feat: collection template"
```

---

### Task 15: Sections — Product page (product-media, product-info, product-recommendations)

**Files:**
- Write: `sections/product-media.liquid`
- Write: `sections/product-info.liquid`
- Write: `sections/product-recommendations.liquid`

- [ ] **Step 1: Write product-media.liquid**

```liquid
<div class="product-media-wrap">
  <div class="product-image-container">
    {%- if product.featured_image -%}
      {{
        product.featured_image
        | image_url: width: 1200
        | image_tag:
          loading: 'eager',
          alt: product.featured_image.alt | default: product.title,
          widths: '600, 900, 1200',
          sizes: '(max-width: 768px) 100vw, 60vw'
      }}
    {%- endif -%}
    <span class="product-watermark" aria-hidden="true">UM</span>
  </div>
</div>

{% schema %}
{
  "name": "Product Media",
  "settings": [],
  "presets": [{ "name": "Product Media" }]
}
{% endschema %}
```

- [ ] **Step 2: Write product-info.liquid**

```liquid
<div class="product-info">
  {%- assign current_variant = product.selected_or_first_available_variant -%}

  <span class="product-badge">{{ product.type | upcase | default: 'APPAREL' }}</span>

  <h1 class="product-name">{{ product.title }}</h1>

  <p class="product-price">
    <span class="product-price-value">{{ current_variant.price | money }}</span>
    {%- if current_variant.compare_at_price > current_variant.price -%}
      <span class="product-compare-price">{{ current_variant.compare_at_price | money }}</span>
    {%- endif -%}
  </p>

  {%- if product.description != blank -%}
    <div class="product-description">{{ product.description | strip_html | truncatewords: 40 }}</div>
  {%- endif -%}

  <form class="add-to-cart-form" action="/cart/add" method="post">
    <input type="hidden" id="variant-id" name="id" value="{{ current_variant.id }}">
    <div data-variants="{{ product.variants | json | escape }}"></div>

    {%- assign size_option = nil -%}
    {%- assign color_option = nil -%}
    {%- for option in product.options_with_values -%}
      {%- assign opt_lower = option.name | downcase -%}
      {%- if opt_lower == 'size' -%}{%- assign size_option = option -%}{%- endif -%}
      {%- if opt_lower == 'color' or opt_lower == 'colour' -%}{%- assign color_option = option -%}{%- endif -%}
    {%- endfor -%}

    {%- if size_option -%}
      <div>
        <p class="option-label">SIZE</p>
        <div class="size-pills">
          {%- for value in size_option.values -%}
            <button type="button" class="size-pill" data-value="{{ value }}">{{ value }}</button>
          {%- endfor -%}
        </div>
      </div>
    {%- endif -%}

    {%- if color_option -%}
      <div>
        <p class="option-label">COLOUR</p>
        <div class="color-swatches">
          {%- for value in color_option.values -%}
            {%- assign color_lower = value | handleize -%}
            <button type="button" class="color-swatch"
              data-value="{{ value }}"
              style="background: {{ value | downcase | replace: ' ', '' }};"
              aria-label="{{ value }}">
            </button>
          {%- endfor -%}
        </div>
      </div>
    {%- endif -%}

    <div>
      <p class="option-label">QUANTITY</p>
      <div class="qty-selector">
        <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
        <input type="number" name="quantity" class="qty-input" value="1" min="1" aria-label="Quantity">
        <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
      </div>
    </div>

    <button type="submit" class="add-to-cart">ADD TO CART</button>
  </form>

  <button class="wishlist-toggle" data-handle="{{ product.handle }}" aria-label="Add to wishlist" aria-pressed="false">
    {% render 'icon-heart' %}
    WISHLIST
  </button>

  <div class="product-tabs">
    <div class="product-tabs-nav" role="tablist">
      <button class="product-tab-btn" data-tab="description" role="tab" aria-selected="true">DESCRIPTION</button>
      <button class="product-tab-btn" data-tab="materials" role="tab">MATERIALS</button>
      <button class="product-tab-btn" data-tab="sizeguide" role="tab">SIZE GUIDE</button>
    </div>
    <div class="product-tab-content" data-tab="description" role="tabpanel">
      {{ product.description }}
    </div>
    <div class="product-tab-content" data-tab="materials" role="tabpanel">
      {%- if product.metafields.custom.materials != blank -%}
        {{ product.metafields.custom.materials.value }}
      {%- else -%}
        <p>100% Premium Cotton. Garment-dyed. Pre-shrunk. Machine wash cold.</p>
      {%- endif -%}
    </div>
    <div class="product-tab-content" data-tab="sizeguide" role="tabpanel">
      {%- if product.metafields.custom.size_guide != blank -%}
        {{ product.metafields.custom.size_guide.value }}
      {%- else -%}
        <p>XS: Chest 34–36" — S: 36–38" — M: 38–40" — L: 40–42" — XL: 42–44" — XXL: 44–46"</p>
      {%- endif -%}
    </div>
  </div>
</div>

{% schema %}
{
  "name": "Product Info",
  "settings": [],
  "presets": [{ "name": "Product Info" }]
}
{% endschema %}
```

- [ ] **Step 3: Write product-recommendations.liquid**

```liquid
{%- if product.id -%}
  <section class="product-recommendations">
    <div class="container">
      <h2 class="section-title" data-underline style="font-size: clamp(1.5rem, 3vw, 2.5rem); margin-bottom: 2.5rem;">
        YOU MIGHT ALSO LIKE
      </h2>
      <div class="recommendations-grid" data-recommendations data-product-id="{{ product.id }}">
        <!-- Populated by JS via /recommendations/products.json -->
      </div>
    </div>
  </section>
{%- endif -%}

{% schema %}
{
  "name": "Product Recommendations",
  "settings": [],
  "presets": [{ "name": "Product Recommendations" }]
}
{% endschema %}
```

- [ ] **Step 4: Commit**

```bash
git add sections/product-media.liquid sections/product-info.liquid sections/product-recommendations.liquid
git commit -m "feat: product page sections — media, info with variants/tabs, recommendations"
```

---

### Task 16: Template — product.json

**Files:**
- Overwrite: `templates/product.json`

- [ ] **Step 1: Write product.json**

```json
{
  "sections": {
    "product_main": {
      "type": "main-product",
      "settings": {}
    },
    "product_recommendations": {
      "type": "product-recommendations",
      "settings": {}
    }
  },
  "order": ["product_main", "product_recommendations"]
}
```

Wait — the product page uses a split layout (media left, info right) that needs both sections in one layout container. We need a `main-product` section that renders both `product-media` and `product-info` side by side. Let me correct this:

- [ ] **Step 1 (corrected): Create sections/main-product.liquid**

```liquid
<div class="container">
  <div class="product-layout">
    <div class="product-media-col">
      {% render 'product-media-inner' %}
    </div>
    <div class="product-info-col">
      {% render 'product-info-inner' %}
    </div>
  </div>
</div>
```

Actually, Shopify sections can't `render` other sections. The correct approach is to put the full split layout directly in one section. Replace the two separate sections with one unified `main-product.liquid` section:

- [ ] **Step 1 (final): Create sections/main-product.liquid with full split layout**

```liquid
{%- assign current_variant = product.selected_or_first_available_variant -%}

<div class="container">
  <div class="product-layout">

    <!-- ——— Media (left 60%) ——— -->
    <div class="product-media-wrap">
      <div class="product-image-container">
        {%- if product.featured_image -%}
          {{
            product.featured_image
            | image_url: width: 1200
            | image_tag:
              loading: 'eager',
              alt: product.featured_image.alt | default: product.title,
              widths: '600, 900, 1200',
              sizes: '(max-width: 768px) 100vw, 60vw'
          }}
        {%- endif -%}
        <span class="product-watermark" aria-hidden="true">UM</span>
      </div>
    </div>

    <!-- ——— Info (right 40%) ——— -->
    <div class="product-info">
      <span class="product-badge">{{ product.type | upcase | default: 'APPAREL' }}</span>

      <h1 class="product-name">{{ product.title }}</h1>

      <p class="product-price">
        <span class="product-price-value">{{ current_variant.price | money }}</span>
        {%- if current_variant.compare_at_price > current_variant.price -%}
          <span class="product-compare-price">{{ current_variant.compare_at_price | money }}</span>
        {%- endif -%}
      </p>

      {%- if product.description != blank -%}
        <div class="product-description">{{ product.description | strip_html | truncatewords: 40 }}</div>
      {%- endif -%}

      <form class="add-to-cart-form" action="/cart/add" method="post">
        <input type="hidden" id="variant-id" name="id" value="{{ current_variant.id }}">
        <div data-variants="{{ product.variants | json | escape }}" style="display:none"></div>

        {%- assign size_option  = nil -%}
        {%- assign color_option = nil -%}
        {%- for option in product.options_with_values -%}
          {%- assign opt_lower = option.name | downcase -%}
          {%- if opt_lower == 'size' -%}{%- assign size_option = option -%}{%- endif -%}
          {%- if opt_lower contains 'color' or opt_lower contains 'colour' -%}{%- assign color_option = option -%}{%- endif -%}
        {%- endfor -%}

        {%- if size_option -%}
          <div>
            <p class="option-label">SIZE</p>
            <div class="size-pills">
              {%- for value in size_option.values -%}
                <button type="button" class="size-pill" data-value="{{ value }}">{{ value }}</button>
              {%- endfor -%}
            </div>
          </div>
        {%- endif -%}

        {%- if color_option -%}
          <div>
            <p class="option-label">COLOUR</p>
            <div class="color-swatches">
              {%- for value in color_option.values -%}
                <button type="button" class="color-swatch"
                  data-value="{{ value }}"
                  style="background-color: {{ value | downcase | replace: ' ', '' }};"
                  aria-label="{{ value }}">
                </button>
              {%- endfor -%}
            </div>
          </div>
        {%- endif -%}

        <div>
          <p class="option-label">QUANTITY</p>
          <div class="qty-selector">
            <button type="button" class="qty-btn qty-minus" aria-label="Decrease quantity">−</button>
            <input type="number" name="quantity" class="qty-input" value="1" min="1" aria-label="Quantity">
            <button type="button" class="qty-btn qty-plus" aria-label="Increase quantity">+</button>
          </div>
        </div>

        <button type="submit" class="add-to-cart">ADD TO CART</button>
      </form>

      <button class="wishlist-toggle" data-handle="{{ product.handle }}" aria-label="Toggle wishlist" aria-pressed="false">
        {% render 'icon-heart' %}
        <span>WISHLIST</span>
      </button>

      <div class="product-tabs">
        <div class="product-tabs-nav" role="tablist">
          <button class="product-tab-btn" data-tab="description" role="tab" aria-selected="true">DESCRIPTION</button>
          <button class="product-tab-btn" data-tab="materials" role="tab" aria-selected="false">MATERIALS</button>
          <button class="product-tab-btn" data-tab="sizeguide" role="tab" aria-selected="false">SIZE GUIDE</button>
        </div>
        <div class="product-tab-content" data-tab="description" role="tabpanel">{{ product.description }}</div>
        <div class="product-tab-content" data-tab="materials" role="tabpanel">
          {%- if product.metafields.custom.materials != blank -%}
            {{ product.metafields.custom.materials.value }}
          {%- else -%}
            <p>100% Premium Cotton. Garment-dyed. Pre-shrunk. Machine wash cold.</p>
          {%- endif -%}
        </div>
        <div class="product-tab-content" data-tab="sizeguide" role="tabpanel">
          {%- if product.metafields.custom.size_guide != blank -%}
            {{ product.metafields.custom.size_guide.value }}
          {%- else -%}
            <p>XS: Chest 34–36" &mdash; S: 36–38" &mdash; M: 38–40" &mdash; L: 40–42" &mdash; XL: 42–44" &mdash; XXL: 44–46"</p>
          {%- endif -%}
        </div>
      </div>
    </div>
    <!-- end product-info -->

  </div>
  <!-- end product-layout -->
</div>

{% schema %}
{
  "name": "Main Product",
  "settings": [],
  "presets": [{ "name": "Main Product" }]
}
{% endschema %}
```

- [ ] **Step 2: Write product.json**

```json
{
  "sections": {
    "main_product": {
      "type": "main-product",
      "settings": {}
    },
    "product_recommendations": {
      "type": "product-recommendations",
      "settings": {}
    }
  },
  "order": ["main_product", "product_recommendations"]
}
```

- [ ] **Step 3: Verify product.json**

```bash
node -e "
const t = JSON.parse(require('fs').readFileSync('templates/product.json','utf8'));
console.log('product.json: OK — '+t.order.join(', '));
"
```

Expected: `product.json: OK — main_product, product_recommendations`

- [ ] **Step 4: Commit**

```bash
git add sections/main-product.liquid sections/product-recommendations.liquid templates/product.json
git commit -m "feat: product page — split layout section and template"
```

---

### Task 17: Cart sections and template (cart.liquid)

**Files:**
- Write: `sections/cart-items.liquid`
- Write: `sections/cart-summary.liquid`
- Write: `templates/cart.liquid`
- Delete: `templates/cart.json` (replaced by cart.liquid)

- [ ] **Step 1: Write cart-items.liquid**

```liquid
{%- if cart.item_count > 0 -%}
  <table class="cart-table" aria-label="Shopping cart">
    <thead>
      <tr>
        <th></th>
        <th>PRODUCT</th>
        <th>QUANTITY</th>
        <th>PRICE</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {%- for item in cart.items -%}
        <tr class="cart-row">
          <td class="cart-item-image-wrap">
            <div class="cart-item-image">
              {%- if item.image -%}
                {{ item.image | image_url: width: 160 | image_tag: loading: 'lazy', alt: item.title }}
              {%- endif -%}
            </div>
          </td>
          <td>
            <a href="{{ item.url }}" class="cart-item-name">{{ item.product.title }}</a>
            {%- unless item.variant.title == 'Default Title' -%}
              <p class="cart-item-variant">{{ item.variant.title }}</p>
            {%- endunless -%}
          </td>
          <td>
            <div class="cart-qty-form" data-key="{{ item.key }}">
              <div class="qty-selector">
                <button type="button" class="qty-btn cart-qty-minus" aria-label="Decrease quantity">−</button>
                <input type="number" class="qty-input cart-qty-input" value="{{ item.quantity }}" min="0" aria-label="Quantity for {{ item.title }}">
                <button type="button" class="qty-btn cart-qty-plus" aria-label="Increase quantity">+</button>
              </div>
            </div>
          </td>
          <td class="cart-item-price">{{ item.final_line_price | money }}</td>
          <td>
            <button class="cart-remove cart-remove-btn" data-key="{{ item.key }}" aria-label="Remove {{ item.product.title }} from cart">×</button>
          </td>
        </tr>
      {%- endfor -%}
    </tbody>
  </table>
{%- else -%}
  <div class="cart-empty">
    <h2 class="cart-empty-title">YOUR CART IS EMPTY</h2>
    <a href="/collections/all" class="btn btn-solid"><span>CONTINUE SHOPPING</span></a>
  </div>
{%- endif -%}

{% schema %}
{
  "name": "Cart Items",
  "settings": [],
  "presets": [{ "name": "Cart Items" }]
}
{% endschema %}
```

- [ ] **Step 2: Write cart-summary.liquid**

```liquid
{%- assign threshold_cents = settings.free_shipping_threshold | default: 999 | times: 100 -%}

<div class="cart-summary">
  <div class="cart-summary-row">
    <span>SUBTOTAL</span>
    <span>{{ cart.total_price | money }}</span>
  </div>

  <div class="cart-summary-row">
    <span>SHIPPING</span>
    {%- if cart.total_price >= threshold_cents -%}
      <span class="free-shipping-msg">FREE ✓</span>
    {%- else -%}
      <span>₹99</span>
    {%- endif -%}
  </div>

  <div class="cart-summary-row total">
    <span class="s-label">TOTAL</span>
    <span class="s-value">{{ cart.total_price | money }}</span>
  </div>

  <a href="/checkout" class="btn btn-solid" style="width:100%; justify-content:center;">
    <span>PROCEED TO CHECKOUT</span>
  </a>

  <form action="/discount/{{ discount_code }}" method="post" class="promo-wrap">
    <input type="text" name="discount" class="promo-input" placeholder="PROMO CODE" aria-label="Promo code">
    <button type="submit" class="promo-submit">APPLY</button>
  </form>

  <div style="display:flex; gap:0.75rem; justify-content:center; margin-top:0.5rem; opacity:0.5;">
    <!-- Payment icons (inline SVG badges) -->
    <span style="font-family:var(--font-body);font-size:0.65rem;letter-spacing:0.1em;color:var(--text-muted);">VISA</span>
    <span style="font-family:var(--font-body);font-size:0.65rem;letter-spacing:0.1em;color:var(--text-muted);">MASTERCARD</span>
    <span style="font-family:var(--font-body);font-size:0.65rem;letter-spacing:0.1em;color:var(--text-muted);">UPI</span>
    <span style="font-family:var(--font-body);font-size:0.65rem;letter-spacing:0.1em;color:var(--text-muted);">RAZORPAY</span>
  </div>
</div>

{% schema %}
{
  "name": "Cart Summary",
  "settings": [],
  "presets": [{ "name": "Cart Summary" }]
}
{% endschema %}
```

- [ ] **Step 3: Write templates/cart.liquid**

```liquid
{% layout 'theme' %}

<div class="container">
  <h1 class="cart-page-title" style="padding-top: clamp(2rem, 5vw, 5rem);">YOUR CART</h1>

  {%- if cart.item_count > 0 -%}
    <div class="cart-layout">
      <div>
        {% section 'cart-items' %}
      </div>
      <div>
        {% section 'cart-summary' %}
      </div>
    </div>
  {%- else -%}
    {% section 'cart-items' %}
  {%- endif -%}
</div>
```

- [ ] **Step 4: Remove old cart.json if it exists**

```bash
rm -f templates/cart.json
```

- [ ] **Step 5: Commit**

```bash
git add sections/cart-items.liquid sections/cart-summary.liquid templates/cart.liquid
git rm --cached templates/cart.json 2>/dev/null || true
git commit -m "feat: cart page — items table, summary panel, liquid template"
```

---

### Task 18: Layout — theme.liquid (main shell)

**Files:**
- Overwrite: `layout/theme.liquid`

- [ ] **Step 1: Write theme.liquid**

```liquid
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#1c1714">
  <title>
    {%- if template == 'index' -%}
      {{ shop.name }} — {{ shop.description | default: 'WHERE MYTH MEETS THE URBAN' }}
    {%- elsif template == 'product' -%}
      {{ product.title }} — {{ shop.name }}
    {%- elsif template == 'collection' -%}
      {{ collection.title }} — {{ shop.name }}
    {%- else -%}
      {{ page_title }} — {{ shop.name }}
    {%- endif -%}
  </title>

  {%- if settings.favicon != blank -%}
    <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32 }}">
  {%- endif -%}

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap">

  <!-- URBNMYTH Design System -->
  {{ 'urbnmyth.css' | asset_url | stylesheet_tag }}

  <!-- Dynamic accent color from theme settings -->
  <style>
    :root { --accent: {{ settings.accent_color | default: '#CC0000' }}; }
  </style>

  {{ content_for_header }}
</head>

<body class="grain">

  <!-- Loading Screen (first visit only, JS removes it) -->
  <div id="loading-screen" aria-hidden="true">
    <div id="loading-monogram">um</div>
  </div>

  <!-- Page Transition Wipe Panel -->
  <div id="page-transition" aria-hidden="true"></div>

  <!-- Custom Cursor -->
  <div id="cursor-ring" aria-hidden="true">
    <div id="cursor-dot"></div>
  </div>

  <!-- Hamburger Toggle -->
  {% render 'icon-hamburger' %}

  <!-- Side Nav Drawer -->
  {% render 'nav-drawer' %}

  <!-- Main Content -->
  <main id="main-content" role="main" tabindex="-1">
    {{ content_for_layout }}
  </main>

  <!-- Footer -->
  {% section 'footer' %}

  <!-- JS Bundle -->
  <script src="{{ 'urbnmyth.js' | asset_url }}" defer></script>

</body>
</html>
```

- [ ] **Step 2: Verify theme.liquid has required elements**

```bash
node -e "
const liq = require('fs').readFileSync('layout/theme.liquid','utf8');
['#loading-screen','#page-transition','#cursor-ring','content_for_layout','content_for_header','urbnmyth.css','urbnmyth.js','render \'nav-drawer\'','id=\"main-content\"'].forEach(s=>{
  if(!liq.includes(s)) throw new Error('Missing: '+s);
});
console.log('theme.liquid: OK');
"
```

Expected: `theme.liquid: OK`

- [ ] **Step 3: Commit**

```bash
git add layout/theme.liquid
git commit -m "feat: theme.liquid shell — loading screen, transition, cursor, nav, main, footer"
```

---

### Task 19: Config — settings_schema.json and settings_data.json

**Files:**
- Overwrite: `config/settings_schema.json`
- Overwrite: `config/settings_data.json`

- [ ] **Step 1: Write settings_schema.json**

```json
[
  {
    "name": "theme_info",
    "theme_name": "URBNMYTH",
    "theme_version": "1.0.0",
    "theme_author": "URBNMYTH",
    "theme_documentation_url": "https://urbnmyth.in",
    "theme_support_url": "https://urbnmyth.in"
  },
  {
    "name": "Brand",
    "settings": [
      {
        "type": "image_picker",
        "id": "favicon",
        "label": "Favicon"
      },
      {
        "type": "color",
        "id": "accent_color",
        "label": "Accent colour",
        "default": "#CC0000",
        "info": "Brand red used for CTAs, active states, underlines"
      },
      {
        "type": "text",
        "id": "free_shipping_threshold",
        "label": "Free shipping threshold (₹)",
        "default": "999",
        "info": "Orders above this amount get free shipping"
      }
    ]
  }
]
```

- [ ] **Step 2: Write settings_data.json**

```json
{
  "current": {
    "accent_color": "#CC0000",
    "free_shipping_threshold": "999"
  },
  "presets": {}
}
```

- [ ] **Step 3: Verify both JSON files are valid**

```bash
node -e "
JSON.parse(require('fs').readFileSync('config/settings_schema.json','utf8'));
JSON.parse(require('fs').readFileSync('config/settings_data.json','utf8'));
console.log('Config JSON: OK');
"
```

Expected: `Config JSON: OK`

- [ ] **Step 4: Commit**

```bash
git add config/settings_schema.json config/settings_data.json
git commit -m "feat: theme settings schema — accent color, free shipping threshold"
```

---

### Task 20: Final — clean up old Dawn sections, verify, and preview

**Files:**
- Delete: old sections not needed by URBNMYTH
- Verify: all new files present and valid

- [ ] **Step 1: Remove Dawn sections that conflict with URBNMYTH**

```bash
cd "/Users/jayabratapramanik/Developer/NEW THEME"
# Remove Dawn sections we've replaced or don't need
rm -f sections/announcement-bar.liquid sections/apps.liquid sections/bulk-quick-order-list.liquid
rm -f sections/cart-drawer.liquid sections/cart-icon-bubble.liquid sections/cart-live-region-text.liquid
rm -f sections/cart-notification-button.liquid sections/cart-notification-product.liquid
rm -f sections/collage.liquid sections/collapsible-content.liquid sections/collection-list.liquid
rm -f sections/contact-form.liquid sections/custom-liquid.liquid sections/email-signup-banner.liquid
rm -f sections/featured-blog.liquid sections/featured-collection.liquid sections/featured-product.liquid
```

- [ ] **Step 2: Remove old Dawn templates we've replaced**

```bash
rm -f templates/404.json templates/blog.json templates/list-collections.json
rm -f templates/page.contact.json templates/search.json
```

- [ ] **Step 3: Verify all URBNMYTH files exist**

```bash
node -e "
const fs = require('fs');
const required = [
  'assets/urbnmyth.css',
  'assets/urbnmyth.js',
  'assets/urbnmyth-logo.svg',
  'layout/theme.liquid',
  'sections/hero.liquid',
  'sections/featured-products.liquid',
  'sections/brand-manifesto.liquid',
  'sections/brand-story.liquid',
  'sections/collection-header.liquid',
  'sections/product-grid.liquid',
  'sections/main-product.liquid',
  'sections/product-recommendations.liquid',
  'sections/cart-items.liquid',
  'sections/cart-summary.liquid',
  'sections/footer.liquid',
  'snippets/product-card.liquid',
  'snippets/nav-drawer.liquid',
  'snippets/icon-hamburger.liquid',
  'snippets/icon-close.liquid',
  'snippets/icon-heart.liquid',
  'templates/index.json',
  'templates/collection.json',
  'templates/product.json',
  'templates/cart.liquid',
  'config/settings_schema.json',
  'config/settings_data.json'
];
required.forEach(f => {
  if (!fs.existsSync(f)) throw new Error('Missing: '+f);
  const size = fs.statSync(f).size;
  if (size === 0) throw new Error('Empty file: '+f);
});
console.log('All '+required.length+' required files present and non-empty: OK');
"
```

Expected: `All 26 required files present and non-empty: OK`

- [ ] **Step 4: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove unused Dawn sections and templates"
```

- [ ] **Step 5: Preview in Shopify development store**

```bash
# Requires Shopify CLI: npm install -g @shopify/cli
shopify theme dev --store=<your-store>.myshopify.com
```

Open the URL shown (typically `http://127.0.0.1:9292`). Verify:
- Loading screen shows "um" monogram pulsing in red on espresso background, then wipes up
- Hero shows "URBNMYTH" wordmark with staggered letter drop animation
- Tagline appears in Cormorant italic small-caps
- Red marquee ticker scrolls at bottom of hero
- Hamburger icon visible top-left, opens/closes drawer with staggered category animation
- Drawer overlay dims page correctly
- Custom cream cursor follows mouse with lerp lag, red dot center
- Page transitions wipe red panel on navigation
- Footer renders with gold top border

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore: URBNMYTH theme v1.0 complete"
```

---

## Self-Review Checklist

Spec coverage verification:

| Spec requirement | Task that covers it |
|---|---|
| Color palette (#1c1714 bg, #CC0000 accent, #c9a96e gold) | Task 2 — `:root` tokens |
| Coolvetica + Cormorant + Montserrat fonts | Tasks 2, 18 — CSS @import + HTML link |
| SVG gothic blackletter "um" monogram | Task 7 |
| Loading screen with monogram pulse + clip-path wipe | Tasks 3, 6 |
| Custom cursor with lerp + red dot | Tasks 3, 6 |
| Page transitions: clip-path red panel wipe | Tasks 3, 6 |
| Hero letter stagger animation | Tasks 5, 6, 10 |
| Red marquee ticker | Tasks 5, 10 |
| Hamburger + left nav drawer (320px/100vw) | Tasks 4, 7, 8 |
| Drawer category stagger (80ms) + counts | Tasks 4, 8 |
| Featured products 3-col with hover effects | Tasks 5, 9, 10 |
| Brand manifesto with red left bar + scroll reveal | Tasks 5, 10 |
| Brand story 2-col + "EST. 2024" faded gold | Tasks 5, 10 |
| Collection page: filter pills + sort + 3-col grid | Tasks 5, 13 |
| Product page: 60/40 split, size pills, color swatches, tabs | Tasks 5, 15, 16 |
| Wishlist (localStorage) | Task 6 |
| Add to cart (Shopify Ajax) | Task 6 |
| Product recommendations (Shopify API) | Tasks 6, 15 |
| Cart page: table + sticky summary + promo + free shipping | Tasks 5, 17 |
| Responsive (1200/768/480) + mobile drawer 100vw | Tasks 5, 4 |
| Shopify theme settings (accent color, shipping threshold) | Task 19 |
| Accessibility: aria-labels, focus-visible, reduced-motion | Tasks 3, 5, 6, 7, 8 |
| Scroll reveals (IntersectionObserver) | Tasks 2, 6 |
| theme.liquid shell | Task 18 |
