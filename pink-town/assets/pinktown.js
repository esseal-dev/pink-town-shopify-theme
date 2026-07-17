// PinkTown theme — global JS

// Formats cents using the shop's money format (set on window by theme.liquid),
// so JS-rendered prices match Liquid-rendered ones in any currency.
window.ptMoney = function (cents) {
  var format = window.PT_MONEY_FORMAT || '${{amount}}';
  var value = '';
  function delimit(num, precision, thousands, decimal) {
    var parts = (num / 100).toFixed(precision).split('.');
    var whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    return parts[1] ? whole + decimal + parts[1] : whole;
  }
  var match = format.match(/\{\{\s*(\w+)\s*\}\}/);
  var key = match ? match[1] : 'amount';
  switch (key) {
    case 'amount_no_decimals': value = delimit(cents, 0, ',', '.'); break;
    case 'amount_with_comma_separator': value = delimit(cents, 2, '.', ','); break;
    case 'amount_no_decimals_with_comma_separator': value = delimit(cents, 0, '.', ','); break;
    case 'amount_with_apostrophe_separator': value = delimit(cents, 2, "'", '.'); break;
    default: value = delimit(cents, 2, ',', '.');
  }
  return format.replace(/\{\{\s*\w+\s*\}\}/, value);
};

document.addEventListener('DOMContentLoaded', function () {
  initAnnouncement();
  initNav();
  initMobileNav();
  initCartDrawer();
  initAddToCart();
  initProductFilters();
  initPredictiveSearch();
  document.querySelectorAll('[data-loc-select]').forEach(function (sel) {
    sel.addEventListener('change', function () { sel.form.submit(); });
  });
});

// ── Predictive search overlay ─────────────────────────────────────────────────
function initPredictiveSearch() {
  var overlay = document.querySelector('[data-search-overlay]');
  if (!overlay) return;
  var input = overlay.querySelector('[data-search-input]');
  var results = overlay.querySelector('[data-search-results]');
  var openBtns = document.querySelectorAll('[data-search-open]');
  var closeBtn = overlay.querySelector('[data-search-close]');
  var timer = null;
  var lastQuery = '';

  function open() {
    overlay.dataset.on = '1';
    overlay.setAttribute('aria-hidden', 'false');
    overlay.removeAttribute('inert');
    setTimeout(function () { input.focus(); }, 120);
    document.addEventListener('keydown', onKey);
  }
  function close() {
    overlay.dataset.on = '0';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('inert', '');
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) { e.preventDefault(); open(); });
  });
  if (closeBtn) closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });

  input.addEventListener('input', function () {
    var q = input.value.trim();
    clearTimeout(timer);
    if (q.length < 2) { results.innerHTML = ''; lastQuery = ''; return; }
    timer = setTimeout(function () {
      if (q === lastQuery) return;
      lastQuery = q;
      var url = results.dataset.url + '?q=' + encodeURIComponent(q) +
        '&resources[limit]=8&resources[limit_scope]=each&section_id=predictive-search';
      fetch(url).then(function (r) { return r.text(); }).then(function (text) {
        if (input.value.trim() !== q) return;
        var holder = document.createElement('div');
        holder.innerHTML = text;
        var fresh = holder.querySelector('.pt-ps-results');
        results.innerHTML = fresh ? fresh.outerHTML : '';
      }).catch(function () {});
    }, 250);
  });
}

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
  if (drawer) { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); drawer.removeAttribute('inert'); }
  if (scrim) scrim.classList.add('is-open');
  if (openBtn) openBtn.setAttribute('aria-expanded', 'true');
}

function closeMobileNav() {
  var drawer = document.querySelector('.pt-nav-drawer');
  var scrim = document.querySelector('.pt-nav-scrim');
  var openBtn = document.querySelector('.pt-nav-hamburger');
  if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); drawer.setAttribute('inert', ''); }
  if (scrim) scrim.classList.remove('is-open');
  if (openBtn) openBtn.setAttribute('aria-expanded', 'false');
}

function initMobileNav() {
  var openBtn = document.querySelector('.pt-nav-hamburger');
  var closeBtn = document.querySelector('[data-nav-close]');
  var scrim = document.querySelector('.pt-nav-scrim');
  if (openBtn) {
    openBtn.addEventListener('click', openMobileNav);
    if (closeBtn) closeBtn.addEventListener('click', closeMobileNav);
    if (scrim) scrim.addEventListener('click', closeMobileNav);
  }

  document.querySelectorAll('[data-nav-drawer-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var group = btn.closest('[data-nav-drawer-group]');
      if (!group) return;
      var willOpen = group.dataset.open !== '1';
      group.dataset.open = willOpen ? '1' : '0';
      btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    });
  });
}

// ── Cart drawer ───────────────────────────────────────────────────────────────
function formatMoney(cents) {
  return window.ptMoney ? window.ptMoney(cents) : '$' + (cents / 100).toFixed(2);
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
    var freeShipCents = parseInt(shipEl.dataset.freeShipCents, 10) || 0;
    if (freeShipCents > 0) {
      var remaining = Math.max(0, freeShipCents - cart.total_price);
      var pct = Math.min(100, (cart.total_price / freeShipCents) * 100);
      var msgEl = shipEl.querySelector('.pt-ship-msg');
      var barFill = shipEl.querySelector('.pt-ship-bar i');
      if (msgEl) {
        msgEl.innerHTML = remaining > 0
          ? shipEl.dataset.iRemainingHtml.replace('%%AMOUNT%%', '<b>' + formatMoney(remaining) + '</b>')
          : '<span class="pt-ship-win">' + shipEl.dataset.iUnlockedHtml + '</span>';
      }
      if (barFill) barFill.style.width = pct + '%';
    }
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
  if (drawer) { drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false'); drawer.removeAttribute('inert'); }
  if (scrim) scrim.classList.add('is-open');
  fetchCart().then(renderCartItems);
}

function closeCartDrawer() {
  var drawer = document.querySelector('.pt-drawer');
  var scrim = document.querySelector('.pt-scrim');
  if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); drawer.setAttribute('inert', ''); }
  if (scrim) scrim.classList.remove('is-open');
}

function initCartDrawer() {
  var cartBtn = document.querySelector('.pt-nav-cart');
  var closeBtn = document.querySelector('.pt-drawer-x');
  var scrim = document.querySelector('.pt-scrim');
  var emptyShopBtn = document.querySelector('.pt-drawer-empty .pt-btn');
  var drawer = document.querySelector('.pt-drawer');
  var promoForm = document.querySelector('[data-drawer-promo-form]');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (scrim) scrim.addEventListener('click', closeCartDrawer);
  if (emptyShopBtn) emptyShopBtn.addEventListener('click', closeCartDrawer);

  if (promoForm && drawer) {
    promoForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = (promoForm.querySelector('input[name="discount"]').value || '').trim();
      if (!code) return;
      var root = drawer.dataset.rootUrl.replace(/\/$/, '');
      var redirect = encodeURIComponent(drawer.dataset.cartUrl);
      window.location.href = root + '/discount/' + encodeURIComponent(code) + '?redirect=' + redirect;
    });
  }

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
  }).then(function (r) {
    return r.json().then(function (data) {
      if (!r.ok) { ptShowToast(data.message || data.description || 'Could not update your bag'); }
      fetchCart().then(renderCartItems);
    });
  }).catch(function () {
    ptShowToast('Could not update your bag');
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
      }).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) throw new Error(data.message || data.description || 'Could not add to bag');

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
        });
      }).catch(function (err) {
        self.textContent = 'Add to bag';
        self.disabled = false;
        ptShowToast(err.message || 'Could not add to bag');
      });
    });
  });
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
