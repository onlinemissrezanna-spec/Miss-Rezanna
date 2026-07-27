/**
 * MISS REZANNA - Wishlist Management System
 * Handles guest localStorage persistence, heart toggling, badge counters,
 * and a luxury Slide-Over Wishlist Drawer across all storefront pages.
 */

const WISHLIST_STORAGE_KEY = 'miss_rezanna_wishlist';

function getWishlistItems() {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error reading wishlist from localStorage:', e);
    return [];
  }
}

function saveWishlistItems(items) {
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    updateWishlistUI();
  } catch (e) {
    console.error('Error saving wishlist to localStorage:', e);
  }
}

function isInWishlist(productId) {
  const items = getWishlistItems();
  return items.some(item => String(item.id) === String(productId));
}

function toggleWishlist(product) {
  if (!product || !product.id) return;
  let items = getWishlistItems();
  const existsIndex = items.findIndex(item => String(item.id) === String(product.id));
  let added = false;

  if (existsIndex > -1) {
    items.splice(existsIndex, 1);
    showWishlistToast(`Removed "${product.name || 'Item'}" from your Wishlist`);
  } else {
    items.push({
      id: product.id,
      name: product.name || 'Luxury Ensemble',
      price: product.price || 0,
      image: product.image || 'images/logo.png',
      addedAt: new Date().toISOString()
    });
    added = true;
    showWishlistToast(`Added "${product.name || 'Item'}" to your Wishlist 💖`);
  }

  saveWishlistItems(items);
  if (added) {
    openWishlistDrawer();
  }
}

function removeFromWishlist(productId) {
  let items = getWishlistItems();
  const filtered = items.filter(item => String(item.id) !== String(productId));
  saveWishlistItems(filtered);
  renderWishlistDrawerItems();
}

function moveWishlistItemToCart(productId) {
  const items = getWishlistItems();
  const target = items.find(item => String(item.id) === String(productId));
  if (target) {
    // Add to cart if cart manager exists
    if (typeof window.addToCart === 'function') {
      window.addToCart({
        id: target.id,
        name: target.name,
        price: target.price,
        image: target.image,
        quantity: 1
      });
    } else {
      let cart = [];
      try {
        const raw = localStorage.getItem('miss_rezanna_cart');
        cart = raw ? JSON.parse(raw) : [];
      } catch(e) {}
      cart.push({ id: target.id, name: target.name, price: target.price, image: target.image, quantity: 1 });
      localStorage.setItem('miss_rezanna_cart', JSON.stringify(cart));
    }
    removeFromWishlist(productId);
    showWishlistToast(`Moved "${target.name}" to Shopping Bag 🛍️`);
  }
}

function updateWishlistUI() {
  const items = getWishlistItems();
  const count = items.length;

  // Update header wishlist counters & badges
  document.querySelectorAll('[data-wishlist-count]').forEach(el => {
    el.textContent = count;
  });

  // Update heart buttons active state
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const id = btn.getAttribute('data-wishlist-id');
    if (isInWishlist(id)) {
      btn.classList.add('in-wishlist');
      btn.style.color = '#e03e2d';
    } else {
      btn.classList.remove('in-wishlist');
      btn.style.color = '';
    }
  });

  renderWishlistDrawerItems();
}

/* ==========================================================================
   WISHLIST DRAWER UI
   ========================================================================== */

function injectWishlistDrawerHTML() {
  if (document.getElementById('wishlistDrawerBackdrop')) return;

  const html = `
    <div class="wishlist-backdrop" id="wishlistDrawerBackdrop" onclick="closeWishlistDrawer()"></div>
    <div class="wishlist-drawer" id="wishlistDrawer">
      <div class="wishlist-drawer-header">
        <div class="wishlist-header-title">
          <span style="font-family:'Cormorant Garamond',serif;font-size:22px;letter-spacing:0.05em;">Your Wishlist</span>
          <span class="wishlist-count-badge" id="wishlistHeaderCount">0 Items</span>
        </div>
        <button class="wishlist-close-btn" onclick="closeWishlistDrawer()" aria-label="Close Wishlist">✕</button>
      </div>

      <div class="wishlist-drawer-body" id="wishlistDrawerBody">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  injectWishlistStyles();
}

function renderWishlistDrawerItems() {
  const container = document.getElementById('wishlistDrawerBody');
  const countBadge = document.getElementById('wishlistHeaderCount');
  if (!container) return;

  const items = getWishlistItems();
  if (countBadge) countBadge.textContent = `${items.length} ${items.length === 1 ? 'Item' : 'Items'}`;

  if (items.length === 0) {
    container.innerHTML = `
      <div class="wishlist-empty-state">
        <div style="font-size:48px;margin-bottom:12px;opacity:0.6;">💖</div>
        <h3 style="font-family:'Cormorant Garamond',serif;font-size:20px;margin-bottom:8px;color:#111;">Your Wishlist is Empty</h3>
        <p style="font-size:13px;color:#666;max-width:240px;margin:0 auto 20px;line-height:1.5;">Save your favorite handcrafted kurtis and luxury ensembles here to view them anytime.</p>
        <a href="collection.html" onclick="closeWishlistDrawer()" class="btn-wishlist-explore">Explore New Arrivals</a>
      </div>
    `;
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="wishlist-item-card">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" class="wishlist-item-img">
      <div class="wishlist-item-details">
        <h4 class="wishlist-item-title">${escapeHtml(item.name)}</h4>
        <div class="wishlist-item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
        <div class="wishlist-item-actions">
          <button onclick="moveWishlistItemToCart('${item.id}')" class="btn-move-cart">🛍️ Move to Bag</button>
          <button onclick="removeFromWishlist('${item.id}')" class="btn-remove-wishlist">Remove</button>
        </div>
      </div>
    </div>
  `).join('');
}

function openWishlistDrawer() {
  injectWishlistDrawerHTML();
  updateWishlistUI();
  document.getElementById('wishlistDrawerBackdrop')?.classList.add('active');
  document.getElementById('wishlistDrawer')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlistDrawer() {
  document.getElementById('wishlistDrawerBackdrop')?.classList.remove('active');
  document.getElementById('wishlistDrawer')?.classList.remove('active');
  document.body.style.overflow = '';
}

function showWishlistToast(msg) {
  let toast = document.getElementById('wishlistToastNotice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'wishlistToastNotice';
    toast.className = 'wishlist-toast-notice';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function injectWishlistStyles() {
  if (document.getElementById('wishlistDynamicStyles')) return;
  const style = document.createElement('style');
  style.id = 'wishlistDynamicStyles';
  style.textContent = `
    .wishlist-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
      z-index: 10010; opacity: 0; visibility: hidden; transition: all 0.3s ease;
    }
    .wishlist-backdrop.active { opacity: 1; visibility: visible; }

    .wishlist-drawer {
      position: fixed; top: 0; right: 0; bottom: 0; width: 380px; max-width: 90vw;
      background: #ffffff; color: #111111; z-index: 10011; display: flex; flex-direction: column;
      box-shadow: -10px 0 40px rgba(0,0,0,0.2); transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .wishlist-drawer.active { transform: translateX(0); }

    .wishlist-drawer-header {
      padding: 20px 24px; border-bottom: 1px solid #eeeeee; display: flex; justify-content: space-between; align-items: center; background: #faf9f6;
    }
    .wishlist-header-title { display: flex; align-items: center; gap: 10px; }
    .wishlist-count-badge { background: #C3A167; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 12px; }
    .wishlist-close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #666; }
    .wishlist-close-btn:hover { color: #111; }

    .wishlist-drawer-body { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .wishlist-empty-state { text-align: center; padding: 60px 20px; }
    .btn-wishlist-explore {
      display: inline-block; padding: 12px 24px; background: #111; color: #fff; text-decoration: none;
      font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; border-radius: 4px; transition: background 0.2s;
    }
    .btn-wishlist-explore:hover { background: #C3A167; }

    .wishlist-item-card { display: flex; gap: 16px; padding: 14px 0; border-bottom: 1px solid #f0f0f0; align-items: center; }
    .wishlist-item-img { width: 70px; height: 85px; object-fit: cover; border-radius: 6px; }
    .wishlist-item-details { flex: 1; }
    .wishlist-item-title { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-weight: 600; margin: 0 0 4px; color: #111; }
    .wishlist-item-price { font-size: 14px; font-weight: 700; color: #C3A167; margin-bottom: 8px; }
    .wishlist-item-actions { display: flex; gap: 8px; }
    .btn-move-cart { background: #111; color: #fff; border: none; padding: 6px 10px; font-size: 11px; border-radius: 4px; cursor: pointer; }
    .btn-move-cart:hover { background: #25D366; }
    .btn-remove-wishlist { background: none; border: 1px solid #ddd; color: #888; padding: 6px 10px; font-size: 11px; border-radius: 4px; cursor: pointer; }
    .btn-remove-wishlist:hover { color: #d32f2f; border-color: #d32f2f; }

    .wishlist-toast-notice {
      position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px);
      background: #111; color: #fff; padding: 12px 24px; border-radius: 30px; font-size: 12px;
      font-weight: 500; z-index: 10020; opacity: 0; visibility: hidden; transition: all 0.3s ease;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(195,161,103,0.4);
    }
    .wishlist-toast-notice.show { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
  `;
  document.head.appendChild(style);
}

// Assign global functions on window object for instant availability
window.getWishlistItems = getWishlistItems;
window.saveWishlistItems = saveWishlistItems;
window.isInWishlist = isInWishlist;
window.toggleWishlist = toggleWishlist;
window.removeFromWishlist = removeFromWishlist;
window.moveWishlistItemToCart = moveWishlistItemToCart;
window.openWishlistDrawer = openWishlistDrawer;
window.closeWishlistDrawer = closeWishlistDrawer;
window.updateWishlistUI = updateWishlistUI;

// Run immediate drawer injection if document is already interactive/ready
if (document.readyState === 'interactive' || document.readyState === 'complete') {
  injectWishlistDrawerHTML();
  updateWishlistUI();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    injectWishlistDrawerHTML();
    updateWishlistUI();
  });
}

// Global click event delegation for heart icons and wishlist buttons
document.addEventListener('click', (e) => {
  const target = e.target.closest('[aria-label="Wishlist"], .btn-wishlist, [data-wishlist-trigger], .quick-action-btn[title*="Wishlist"], [title*="Wishlist"], .mobile-dock-item[href*="wishlist"]');
  if (target) {
    e.preventDefault();
    const card = target.closest('.product-card, .product-container, [data-product-id]');
    if (card) {
      const id = card.getAttribute('data-product-id') || target.getAttribute('data-product-id') || 'prod-' + Date.now();
      const titleEl = card.querySelector('.product-card-title, .product-title, h1');
      const priceEl = card.querySelector('.product-card-price, .product-price, .price');
      const imgEl = card.querySelector('img');

      const name = titleEl ? titleEl.textContent.trim() : 'Luxury Kurti Ensemble';
      const price = priceEl ? parseFloat(priceEl.textContent.replace(/[^0-9.]/g, '')) || 3500 : 3500;
      const image = imgEl ? imgEl.src : 'images/logo.png';

      toggleWishlist({ id, name, price, image });
    } else {
      openWishlistDrawer();
    }
  }
});
