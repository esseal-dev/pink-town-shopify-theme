// PinkTown theme — global JS

document.addEventListener('DOMContentLoaded', function () {
  initAnnouncement();
  initNav();
  initMobileNav();
  initCartDrawer();
  initAddToCart();
  initWishlist();
  initProductFilters();
});

// ── Announcement bar rotation ─────────────────────────────────────────────────
function initAnnouncement() {
  const msgs = document.querySelectorAll('.pt-anno-msg');
  if (msgs.length < 2) {
    if (msgs[0]) msgs[0].dataset.on = '1';
    return;
  }
  let i = 0;
  msgs[0].dataset.on = '1';
  setInterval(function () {
    msgs[i].dataset.on = '0';
    i = (i + 1) % msgs.length;
    msgs[i].dataset.on = '1';
  }, 3600);
}

// ── Nav scroll state ──────────────────────────────────────────────────────────
function initNav() {
  var nav = document.querySelector('.pt-nav');
  if (!nav) return;
  function onScroll() { nav.dataset.scrolled = window.scrollY > 8 ? '1' : '0'; }
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ── Mobile nav drawer ─────────────────────────────────────────────────────────
function openMobileNav() {
  var drawer = document.querySelector('.pt-nav-drawer');
  var scrim = document.querySelector('.pt-nav-scrim');
  var openBtn = document.querySelector('.pt-nav-hamburger');
  closeCartDrawer();
  if (drawer) { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); }
  if (scrim) scrim.classList.add('is-open');
  if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
}

function closeMobileNav() {
  var drawer = document.querySelector('.pt-nav-drawer');
  var scrim = document.querySelector('.pt-nav-scrim');
  var openBtn = document.querySelector('.pt-nav-hamburger');
  if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }
  if (scrim) scrim.classList.remove('is-open');
  if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
}

function initMobileNav() {
  var openBtn = document.querySelector('.pt-nav-hamburger');
  var closeBtn = document.querySelector('[data-nav-close]');
  var scrim = document.querySelector('.pt-nav-scrim');
  if (!openBtn) return;
  openBtn.addEventListener('click', openMobileNav);
  if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
  if (scrim) scrim.addEventListener('click', closeMobileNav);
}

// ── Cart drawer ───────────────────────────────────────────────────────────────
var FREE_SHIP_CENTS = 3500;

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2).replace(/\.00$/, '');
}

function fetchCart() {
  return fetch('/cart.js').then(function (r) { return r.json(); });
}

function renderCartItems(cart) {
  var drawer = document.querySelector('.pt-drawer');
  if (!drawer) return;

  var badge = document.querySelector('.pt-nav-cart-badge');
  if (badge) {
    badge.textContent = cart.item_count;
    badge.style.display = cart.item_count > 0 ? '' : 'none';
  }

  var countEl = drawer.querySelector('.pt-drawer-count');
  if (countEl) countEl.textContent = '(' + cart.item_count + ')';

  var emptyEl = drawer.querySelector('.pt-drawer-empty');
  var shipEl = drawer.querySelector('.pt-ship');
  var itemsEl = drawer.querySelector('.pt-drawer-items');
  var footEl = drawer.querySelector('.pt-drawer-foot');

  if (cart.item_count === 0) {
    if (emptyEl) emptyEl.style.display = '';
    if (shipEl) shipEl.style.display = 'none';
    if (itemsEl) itemsEl.style.display = 'none';
    if (footEl) footEl.style.display = 'none';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';
  if (shipEl) {
    shipEl.style.display = '';
    var remaining = Math.max(0, FREE_SHIP_CENTS - cart.total_price);
    var pct = Math.min(100, (cart.total_price / FREE_SHIP_CENTS) * 100);
    var msgEl = shipEl.querySelector('.pt-ship-msg');
    var barFill = shipEl.querySelector('.pt-ship-bar i');
    if (msgEl) {
      msgEl.innerHTML = remaining > 0
        ? "You're <b>" + formatMoney(remaining) + '</b> away from <b>free shipping</b>'
        : "✨ You've unlocked free shipping";
    }
    if (barFill) barFill.style.width = pct + '%';
  }
  if (itemsEl) {
    itemsEl.style.display = '';
    var html = cart.items.map(function (it, idx) {
      var imgSrc = it.image ? it.image.replace(/(\.\w+)$/, '_64x64$1') : '';
      var variant = (it.variant_title && it.variant_title !== 'Default Title') ? it.variant_title : '';
      return '<div class="pt-line" data-line="' + (idx + 1) + '">'
        + '<div class="pt-ph" style="width:64px;flex:none;border-radius:12px;aspect-ratio:1/1;background:#f6dde4;overflow:hidden;">'
        + (imgSrc ? '<img src="' + imgSrc + '" alt="" width="64" height="64" style="width:100%;height:100%;object-fit:cover;">' : '')
        + '</div>'
        + '<div class="pt-line-mid">'
        + (variant ? '<span class="pt-line-cat">' + variant + '</span>' : '')
        + '<b class="pt-line-name">' + it.title + '</b>'
        + '<div class="pt-qty">'
        + '<button type="button" onclick="ptChangeQty(' + (idx + 1) + ',' + (it.quantity - 1) + ')" aria-label="Decrease">−</button>'
        + '<span>' + it.quantity + '</span>'
        + '<button type="button" onclick="ptChangeQty(' + (idx + 1) + ',' + (it.quantity + 1) + ')" aria-label="Increase">+</button>'
        + '</div></div>'
        + '<div class="pt-line-end">'
        + '<b>' + formatMoney(it.final_line_price) + '</b>'
        + '<button class="pt-line-rm" type="button" onclick="ptChangeQty(' + (idx + 1) + ',0)">Remove</button>'
        + '</div></div>';
    }).join('');

    itemsEl.querySelectorAll('.pt-line').forEach(function (el) { el.remove(); });
    var extrasEl = itemsEl.querySelector('.pt-cart-extras');
    if (extrasEl) {
      extrasEl.insertAdjacentHTML('beforebegin', html);
    } else {
      itemsEl.insertAdjacentHTML('afterbegin', html);
    }
  }

  if (footEl) {
    footEl.style.display = '';
    var totalEl = footEl.querySelector('.pt-drawer-sub b');
    var checkoutBtn = footEl.querySelector('.pt-checkout-btn');
    if (totalEl) totalEl.textContent = formatMoney(cart.total_price);
    if (checkoutBtn) checkoutBtn.textContent = 'Checkout · ' + formatMoney(cart.total_price);
  }
}

function openCartDrawer() {
  var drawer = document.querySelector('.pt-drawer');
  var scrim = document.querySelector('.pt-scrim');
  closeMobileNav();
  if (drawer) drawer.classList.add('is-open');
  if (scrim) scrim.classList.add('is-open');
  fetchCart().then(renderCartItems);
}

function closeCartDrawer() {
  var drawer = document.querySelector('.pt-drawer');
  var scrim = document.querySelector('.pt-scrim');
  if (drawer) drawer.classList.remove('is-open');
  if (scrim) scrim.classList.remove('is-open');
}

function initCartDrawer() {
  var cartBtn = document.querySelector('.pt-nav-cart');
  var closeBtn = document.querySelector('.pt-drawer-x');
  var scrim = document.querySelector('.pt-scrim');
  var emptyShopBtn = document.querySelector('.pt-drawer-empty .pt-btn');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (scrim) scrim.addEventListener('click', closeCartDrawer);
  if (emptyShopBtn) emptyShopBtn.addEventListener('click', closeCartDrawer);

  fetchCart().then(function (cart) {
    var badge = document.querySelector('.pt-nav-cart-badge');
    if (badge) {
      badge.textContent = cart.item_count;
      badge.style.display = cart.item_count > 0 ? '' : 'none';
    }
  });
}

function ptChangeQty(line, qty) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ line: line, quantity: qty })
  }).then(function () {
    fetchCart().then(renderCartItems);
  });
}

// ── Add to cart ───────────────────────────────────────────────────────────────
function initAddToCart() {
  document.querySelectorAll('.pt-add-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var variantId = this.dataset.variantId;
      var productTitle = this.dataset.productTitle || 'Item';
      if (!variantId) return;

      var self = this;
      self.textContent = 'Adding…';
      self.disabled = true;

      fetch('/cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: variantId, quantity: 1 })
      }).then(function () {
        self.textContent = 'Added ✓';
        self.classList.add('is-added');
        ptShowToast(productTitle + ' added to bag');
        fetchCart().then(function (cart) {
          var badge = document.querySelector('.pt-nav-cart-badge');
          if (badge) {
            badge.textContent = cart.item_count;
            badge.style.display = cart.item_count > 0 ? '' : 'none';
          }
        });
        setTimeout(function () {
          self.textContent = 'Add to bag';
          self.classList.remove('is-added');
          self.disabled = false;
        }, 1400);
      }).catch(function () {
        self.textContent = 'Add to bag';
        self.disabled = false;
      });
    });
  });
}

// ── Wishlist (localStorage) ───────────────────────────────────────────────────
var PT_WISHLIST_KEY = 'pt_wishlist';

function ptLoadWishlist() {
  try { return JSON.parse(localStorage.getItem(PT_WISHLIST_KEY)) || []; } catch (e) { return []; }
}
function ptSaveWishlist(list) {
  try { localStorage.setItem(PT_WISHLIST_KEY, JSON.stringify(list)); } catch (e) {}
  window.dispatchEvent(new CustomEvent('pt:wishlist-change', { detail: list }));
}

function ptSyncWishlistBadge() {
  var badge = document.querySelector('.pt-nav-wish-badge');
  if (!badge) return;
  var count = ptLoadWishlist().length;
  badge.textContent = count;
  badge.style.display = count > 0 ? '' : 'none';
}

function initWishlist() {
  var list = ptLoadWishlist();

  function syncButtons() {
    document.querySelectorAll('.pt-wish-btn').forEach(function (btn) {
      var handle = btn.dataset.productHandle;
      btn.dataset.on = list.includes(handle) ? '1' : '0';
      var svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', list.includes(handle) ? 'currentColor' : 'none');
    });
    ptSyncWishlistBadge();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.pt-wish-btn');
    if (!btn) return;
    var handle = btn.dataset.productHandle;
    if (!handle) return;
    if (list.includes(handle)) {
      list = list.filter(function (x) { return x !== handle; });
    } else {
      list = list.concat([handle]);
    }
    ptSaveWishlist(list);
    syncButtons();
  });

  syncButtons();
}

// ── Product collection filters ────────────────────────────────────────────────
function initProductFilters() {
  var grid = document.querySelector('.pt-prod-grid[data-filterable]');
  var filtersEl = document.querySelector('.pt-filters');
  if (!grid || !filtersEl) return;

  filtersEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.pt-chip');
    if (!btn) return;
    var filter = btn.dataset.filter;
    filtersEl.querySelectorAll('.pt-chip').forEach(function (b) { b.dataset.on = '0'; });
    btn.dataset.on = '1';
    grid.querySelectorAll('.pt-card').forEach(function (card) {
      var cats = (card.dataset.cat || '').split(' ');
      card.style.display = (!filter || cats.indexOf(filter) !== -1) ? '' : 'none';
    });
  });
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function ptShowToast(msg) {
  var toast = document.querySelector('.pt-toast');
  if (!toast) return;
  var msgEl = toast.querySelector('.pt-toast-msg');
  if (msgEl) msgEl.textContent = msg;
  toast.classList.add('is-on');
  clearTimeout(window._ptToastTimer);
  window._ptToastTimer = setTimeout(function () { toast.classList.remove('is-on'); }, 2400);
}

// Expose globals
window.ptChangeQty = ptChangeQty;
window.ptShowToast = ptShowToast;
window.ptOpenCart = openCartDrawer;
