# URBNMYTH Shopify Theme — Design Spec
**Date:** 2026-05-08
**Brand:** URBNMYTH (urbnmyth.in)
**Aesthetic:** Old money luxury meets dark editorial streetwear — cinematic, heavy animation
**Inspiration:** 5feet11.com

---

## 1. Decisions & Constraints

| Decision | Choice |
|---|---|
| Output | Shopify theme (not standalone HTML) |
| Base theme | Gut and replace existing Dawn-derived theme |
| Routing | Hybrid — Shopify URLs + JS `fetch` page transitions with clip-path wipe |
| Cart | Full `/cart` page (Liquid template) |
| Wishlist | localStorage (key: `urbnmyth_wishlist`) |
| Cart state | Shopify Ajax Cart API — no localStorage needed |
| Filters | Shopify native product filtering via URL params |

---

## 2. File Structure

```
assets/
  urbnmyth.css
  urbnmyth.js
  urbnmyth-logo.svg

layout/
  theme.liquid          ← shell: <head>, fonts, loading screen, transition wipe, drawer, cursor, footer

sections/
  hero.liquid
  featured-products.liquid
  brand-manifesto.liquid
  brand-story.liquid
  collection-header.liquid
  product-grid.liquid
  product-media.liquid
  product-info.liquid
  product-recommendations.liquid
  cart-items.liquid
  cart-summary.liquid

snippets/
  product-card.liquid
  nav-drawer.liquid
  icon-heart.liquid
  icon-close.liquid
  icon-hamburger.liquid

templates/
  index.json
  collection.json
  product.json
  cart.liquid           ← Liquid (not JSON) for server-side cart data

config/
  settings_schema.json
  settings_data.json
```

---

## 3. Design Tokens

```css
:root {
  --bg:         #1c1714;   /* espresso brown */
  --surface:    #231e1a;   /* warm dark brown */
  --card:       #2d2620;   /* medium brown — cards, panels */
  --text:       #f0ece4;   /* warm cream — primary */
  --text-muted: #a09880;   /* muted tan — secondary, labels */
  --accent:     #CC0000;   /* brand red — CTAs, active, underlines */
  --gold:       #c9a96e;   /* old money gold — prices, dividers */
  --border:     #3d342c;   /* warm brown — card borders */
  --highlight:  #f5f0e8;   /* near-white cream — hover emphasis */

  --font-display:   'Coolvetica', Impact, sans-serif;
  --font-editorial: 'Cormorant Garamond', Georgia, serif;
  --font-body:      'Montserrat', system-ui, sans-serif;
}
```

Grain texture: inline SVG `feTurbulence` filter at 3% opacity on `--bg` surfaces. No external image file.

Accent colour is also exposed as a Shopify theme setting and written to `:root { --accent: ... }` via a `<style>` tag in `theme.liquid`.

---

## 4. Typography Scale

| Role | Font | Size | Notes |
|---|---|---|---|
| Hero wordmark | Coolvetica | `clamp(4rem, 12vw, 10rem)` | Wide letter-spacing, cream |
| Page titles | Coolvetica | `clamp(2.5rem, 6vw, 5rem)` | Cream |
| Product names (card) | Coolvetica | `clamp(1rem, 2vw, 1.4rem)` | Cream |
| Section headings | Coolvetica | `clamp(1.8rem, 4vw, 3rem)` | Cream |
| Editorial body | Cormorant Garamond | `clamp(1rem, 1.5vw, 1.25rem)` | Cream, italic |
| Prices | Cormorant Garamond | `clamp(1.1rem, 2vw, 1.5rem)` | Gold |
| Nav / labels / body | Montserrat | `clamp(0.75rem, 1vw, 0.9rem)` | Cream or muted |
| Category pills | Montserrat | `0.7rem` | Uppercase, wide tracking |

Font loading strategy — two separate mechanisms:

In `theme.liquid` `<head>` (HTML preconnect + Google Fonts stylesheet link):
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet">
```

At top of `urbnmyth.css` (Coolvetica via CSS import):
```css
@import url('https://fonts.cdnfonts.com/css/coolvetica');
```

---

## 5. Animation Inventory

| Name | Mechanism | Duration |
|---|---|---|
| Loading screen | `um` monogram scale pulse → `clip-path: inset(0 0 100% 0)` wipe up | 1.5s pulse + 0.6s wipe |
| Page transition | Red `#CC0000` panel `clip-path` sweeps left→right then reveals | 0.5s in + 0.4s out |
| Hero letters | `@keyframes letterDrop`: `translateY(60px) opacity:0` → normal, 80ms stagger per character | 0.6s each |
| Marquee | `@keyframes marquee`: `translateX(0)` → `translateX(-50%)`, infinite linear | 20s |
| Scroll reveals | `IntersectionObserver` adds `.revealed`: `translateY(40px) opacity:0` → normal | 0.7s ease-out, staggered by index |
| Nav drawer | `translateX(-100%)` → `translateX(0)`, `cubic-bezier(0.77,0,0.175,1)` | 0.5s |
| Drawer item stagger | `transition-delay: n * 80ms` on each `<li>` when `.open` added | 80ms × 6 |
| Underline draw | `::after` `width: 0` → `100%` on `.active` class | 0.6s ease |
| Card hover lift | `translateY(-8px)` + deepened `box-shadow` | 0.3s ease |
| Button fill sweep | `::before` `scaleX(0)` → `scaleX(1)`, `transform-origin: left` | 0.4s ease |
| Custom cursor lerp | JS `cx += (mx - cx) * 0.12` on `requestAnimationFrame` | Continuous |

`prefers-reduced-motion`: disables `letterDrop`, page transitions, cursor lerp. All elements appear at rest.

---

## 6. Custom Cursor

- `#cursor-ring`: 28px circle, `border: 1.5px solid var(--highlight)`, `position: fixed`, `pointer-events: none`, `z-index: 9999`, `mix-blend-mode: difference`
- `#cursor-dot`: 6px circle, `background: var(--accent)`, centered inside ring
- Hover over `a, button`: adds `.cursor-hover` → ring scales to 2× via CSS transition
- Lerp factor: 0.12

---

## 7. Page Designs

### 7.1 Homepage (`/` → `index.json`)

**`hero.liquid`**
- Full viewport (`100svh`), `--bg` background + SVG grain overlay
- "URBNMYTH" in Coolvetica: JS splits into `<span>` per character, `letterDrop` keyframe with 80ms stagger per letter
- Tagline "WHERE MYTH MEETS THE URBAN" in Cormorant italic small-caps below wordmark
- CTA button "EXPLORE COLLECTION": outlined style, cream border; hover = red fill sweep + cream text, `0.4s`
- Red marquee ticker: `position: absolute; bottom: 0; width: 100%`, `--accent` bg, cream text, "NEW ARRIVALS — SS25 DROP — URBNMYTH.IN — SHOP NOW — " repeating

**`featured-products.liquid`**
- 3-col grid, pulls first 3 products from `featured_collection` theme setting
- Uses `snippets/product-card.liquid`
- Card hover: lifts, red underline draws, "SHOP NOW" slides up from hidden overflow

**`brand-manifesto.liquid`**
- Full-width, `--bg` bg
- 4px red vertical bar on left edge
- "WE DON'T FOLLOW TRENDS. WE BURY THEM." in large Coolvetica
- Scroll-reveal via `IntersectionObserver`

**`brand-story.liquid`**
- CSS grid 2 equal columns
- Left: Cormorant editorial text (configurable via schema)
- Right: `--card` tall panel, "EST. 2024" in Coolvetica `10vw` at `opacity: 0.15`, centered absolutely

### 7.2 Collection Page (`/collections/:handle` → `collection.json`)

**`collection-header.liquid`**
- Page title in Coolvetica large cream
- Red underline draws in on `.page-loaded` class (added by JS post-transition)
- Filter pills: ALL + collection tags, active = `--accent` bg
- Sort dropdown right-aligned
- Filtering/sorting via URL params: `?sort_by=` and `?filter.p.tag=` (Shopify native)

**`product-grid.liquid`**
- Liquid `for product in collection.products` loop → calls `product-card.liquid`
- CSS grid: 3 col → 2 col at 768px → 1 col at 480px
- Staggered scroll-reveal on cards

### 7.3 Product Page (`/products/:handle` → `product.json`)

**`product-media.liquid`**
- Left 60%, sticky on desktop
- `product.featured_image | image_url | image_tag` with responsive sizes
- "UM" watermark: absolute, Coolvetica, `opacity: 0.06`, centered
- Mobile: stacks above info

**`product-info.liquid`**
- Right 40%, sticky on desktop
- Product name: Coolvetica large cream
- Category badge: small red pill (from product type or tag)
- Price: Cormorant gold; shows compare-at strike-through if on sale
- Description: Cormorant italic cream
- Size pills: loop over size option values; selected = `--accent` bg; wired to variant JS
- Colour swatches: 4px border on selected, loop over colour option values
- Qty: `− [n] +` controls, min 1
- ADD TO CART: full-width red Coolvetica button, `POST /cart/add.js`, redirect to `/cart`
- WISHLIST: heart icon toggle, localStorage `urbnmyth_wishlist` array of handles
- Tabs: DESCRIPTION / MATERIALS / SIZE GUIDE — content from product metafields (fallback: hardcoded placeholder); tab switch = fade

**`product-recommendations.liquid`**
- Shopify Recommendations API: `/recommendations/products.json?product_id={{ product.id }}&limit=4`
- 4-card horizontal scroll mobile, 4-col grid desktop
- Uses `product-card.liquid`

### 7.4 Cart Page (`/cart` → `cart.liquid`)

**`cart-items.liquid`**
- Liquid `for` loop over `cart.items`
- Columns: image thumbnail, name + variant (Coolvetica/Montserrat), qty `−/+` via `/cart/change.js`, price gold, `×` remove red
- Empty state: centered "YOUR CART IS EMPTY" Coolvetica + "CONTINUE SHOPPING" red button

**`cart-summary.liquid`**
- Sticky right panel on desktop, stacks below items on mobile
- Subtotal: `cart.total_price | money`
- Shipping: if `cart.total_price >= 99900` → "FREE SHIPPING ✓" green; else "₹99"
- Total: large Cormorant gold
- PROCEED TO CHECKOUT: full-width red Coolvetica button → `/checkout`
- Promo code: `<form action="/discount/{{ code }}">` input, dark bg, gold border on focus
- Payment icons: SVG badges row (Visa, Mastercard, UPI, Razorpay)

### 7.5 Nav Drawer (`snippets/nav-drawer.liquid`, inside `theme.liquid`)

- Always in DOM, `translateX(-100%)` default
- Hamburger `#nav-toggle`: fixed top-left, `z-index: 200`, 3-line SVG cream
- `#drawer-overlay`: fixed full-screen, `background: rgba(0,0,0,0.6)`, pointer dismisses drawer
- Drawer bg: `--bg` + SVG grain, 320px desktop, 100vw mobile
- Top: URBNMYTH wordmark + `×` close button
- Categories with item counts (from `collections[handle].products_count`). Required collection handles: `t-shirts`, `polos`, `shirts`, `jackets`, `hoodies`, `pants`. Each count is wrapped in a Liquid `{% if collections[handle] %}` guard so missing collections degrade gracefully (count hidden, link still shows):
  - T-SHIRTS, POLOS, SHIRTS, JACKETS, HOODIES, PANTS
  - Coolvetica, cream; hover = red + `→` slides in via `::after`
  - Active (matches `request.path`): red colour + 4px red left border
  - Stagger: `transition-delay: n * 80ms` on `.drawer-open`
- Gold `<hr>` divider
- Secondary links: HOME / COLLECTIONS / ABOUT / CONTACT (Montserrat)

---

## 8. Shopify Theme Settings (`settings_schema.json`)

| Setting | Type | Default |
|---|---|---|
| `featured_collection` | collection picker | `featured` |
| `marquee_text` | text | `NEW ARRIVALS — SS25 DROP — URBNMYTH.IN — SHOP NOW —` |
| `brand_tagline` | text | `WHERE MYTH MEETS THE URBAN` |
| `accent_color` | color | `#CC0000` |
| `free_shipping_threshold` | number | `999` |
| `brand_story_copy` | richtext | placeholder editorial copy |
| `brand_story_year` | text | `2024` |

---

## 9. Shopify Ajax Cart API

| Action | Endpoint | Payload |
|---|---|---|
| Add to cart | `POST /cart/add.js` | `{ id: variantId, quantity: n }` |
| Update qty | `POST /cart/change.js` | `{ id: lineItemKey, quantity: n }` |
| Remove item | `POST /cart/change.js` | `{ id: lineItemKey, quantity: 0 }` |
| Apply discount | `POST /discount/:code` | form submit |

After add: redirect to `/cart`. After qty change on cart page: page reload or targeted DOM update.

---

## 10. Hybrid Page Transitions

`urbnmyth.js` intercepts all same-origin `<a>` clicks that are not `/cart/add`, `/checkout`, or external:
1. Prevent default
2. Add `.transition-out` to `#page-transition` (red panel clips in from left)
3. `fetch(href)` the new page
4. Parse response HTML, extract `<main>` innerHTML
5. Update `document.title`, `history.pushState`
6. Swap `<main>` innerHTML
7. Remove `.transition-out`, add `.transition-in` (red panel clips out to right)
8. Call `init()` on new content (scroll reveals, underline draws, product variant JS)
9. Update active drawer link

---

## 11. Responsive Breakpoints

| Breakpoint | Changes |
|---|---|
| `≤1200px` | Product grid → 2 col |
| `≤768px` | Grid → 2 col, cart stacks, product page stacks, brand story → 1 col |
| `≤480px` | Grid → 1 col, hero text smaller, drawer full 100vw |

All tap targets: minimum 44×44px. Font sizes: `clamp()` throughout.

---

## 12. Accessibility

- All interactive elements keyboard-navigable (`:focus-visible` red outline)
- `aria-label` on: hamburger, close button, qty controls, wishlist toggle
- `aria-expanded` on drawer toggle
- `prefers-reduced-motion`: disables `letterDrop`, page transitions, cursor lerp

---

## 13. Out of Scope

- Search page
- Blog / editorial section
- Customer account pages
- Checkout (Shopify-owned)
- Product reviews
- Size guide metafields (uses placeholder copy for now)
- Wishlist page
