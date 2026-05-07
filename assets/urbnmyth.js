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
