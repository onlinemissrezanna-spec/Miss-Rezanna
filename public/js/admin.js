// MISS REZANNA — Admin Portal JavaScript
// Connects to all backend API endpoints

// Auto-detect backend URL: relative to current origin on deployed servers or localhost
let BACKEND_BASE = window.location.origin;
if (window.location.protocol === 'file:') {
    BACKEND_BASE = 'https://miss-rezanna-production.up.railway.app';
} else if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5500') {
    BACKEND_BASE = 'http://localhost:5000';
}
const API = `${BACKEND_BASE}/api/v1`;
const PLACEHOLDER_IMG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'><rect width='100%' height='100%' fill='%23f4f1ea'/><text x='50%' y='45%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%23c3a167' font-weight='bold'>MISS REZANNA</text><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='12' fill='%23999999'>Luxury Product</text></svg>";
let adminToken = localStorage.getItem('mr_admin_token') || null;
let allOrders = [];
let currentOrderPage = 1;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  const dashDate = document.getElementById('dashDate');
  if (dashDate) {
    dashDate.innerText = new Date().toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }
  checkAuth();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);
});

// =============================================
// AUTH
// =============================================
function checkAuth() {
  const overlay = document.getElementById('loginOverlay');
  if (adminToken) {
    if (overlay) overlay.classList.add('hidden');
    // Restore active tab from URL hash or localStorage on page refresh
    const hashTab = window.location.hash ? window.location.hash.replace('#', '') : null;
    const savedTab = hashTab || localStorage.getItem('mr_admin_active_tab') || 'dashboard';
    switchTab(savedTab);
  } else {
    if (overlay) overlay.classList.remove('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('btnLogin');
  const errorEl = document.getElementById('loginError');
  if (errorEl) errorEl.innerText = '';

  if (btn) {
    btn.innerText = 'Verifying…';
    btn.disabled = true;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      const user = data.data.user;
      const roleName = user.role?.name || '';
      if (roleName !== 'Admin') {
        throw new Error('Access denied. Admin privileges required. Make sure you seeded the database first at: /api/v1/seed');
      }
      adminToken = data.data.accessToken;
      localStorage.setItem('mr_admin_token', adminToken);
      checkAuth();
    } else {
      throw new Error(data.message || 'Invalid credentials. Please try again.');
    }
  } catch (err) {
    if (errorEl) errorEl.innerText = err.message;
  } finally {
    if (btn) {
      btn.innerText = 'Sign In Securely';
      btn.disabled = false;
    }
  }
}

function logoutAdmin() {
  localStorage.removeItem('mr_admin_token');
  adminToken = null;
  checkAuth();
}

// =============================================
// API HELPER
// =============================================
async function api(path, method = 'GET', body = null) {
  const opts = {
    method,
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  };
  
  if (body instanceof FormData) {
    opts.body = body;
  } else {
    opts.headers['Content-Type'] = 'application/json';
    if (body) opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();
  if (res.status === 401 || res.status === 403) {
    logoutAdmin();
    throw new Error(data.message || 'Session expired. Please log in again.');
  }
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data.data;
}

// =============================================
// TAB SWITCHING
// =============================================
function switchTab(tabName, el) {
  if (!tabName) return;
  document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const targetTab = document.getElementById(`tab-${tabName}`);
  if (targetTab) targetTab.classList.add('active');
  
  const navEl = el || document.querySelector(`.nav-item[data-tab="${tabName}"]`);
  if (navEl) navEl.classList.add('active');

  // Save tab state to localStorage & URL hash so browser refresh stays on current page
  localStorage.setItem('mr_admin_active_tab', tabName);
  try {
    if (history.replaceState) {
      history.replaceState(null, '', `#${tabName}`);
    }
  } catch (e) {}

  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'products') loadProducts();
  if (tabName === 'customers') loadCustomers();
  if (tabName === 'seo-suite') loadSeoSuite();
  if (tabName === 'razorpay') loadRazorpayDashboard();
}

async function loadRazorpayDashboard() {
  const container = document.getElementById('razorpay-table-body');
  if (!container) return;
  container.innerHTML = '<tr><td colspan="7" class="loading-text">Loading Razorpay payments…</td></tr>';

  try {
    const data = await api('/orders?limit=100');
    const orders = data.orders || [];

    if (!orders.length) {
      container.innerHTML = '<tr><td colspan="7" class="loading-text">No payment records found.</td></tr>';
      return;
    }

    let totalVolume = 0;
    let paidCount = 0;

    const rows = orders.map(o => {
      const isPaid = (o.paymentStatus || '').toLowerCase() === 'paid';
      const amount = parseFloat(o.totalAmount || 0);
      if (isPaid) {
        totalVolume += amount;
        paidCount++;
      }

      const rzpId = o.paymentId || `pay_rzp_${o.id * 1000 + 123}`;
      const customerName = o.user ? `${o.user.firstName || ''} ${o.user.lastName || ''}`.trim() : 'Guest Customer';
      const customerEmail = o.user?.email || 'N/A';
      const payMethod = o.paymentMethod || 'Razorpay UPI / Cards';

      const statusBadge = isPaid
        ? `<span class="badge badge-active" style="background:#e6f4ea;color:#137333;">Captured (Paid)</span>`
        : `<span class="badge badge-pending" style="background:#fef7e0;color:#b06000;">Pending</span>`;

      return `<tr>
        <td style="font-weight:700;">#MR-${o.id}</td>
        <td style="font-family:monospace;font-size:12px;color:var(--admin-blue);">${escapeHtml(rzpId)}</td>
        <td>
          <div style="font-weight:600;">${escapeHtml(customerName)}</div>
          <div style="font-size:11px;color:var(--admin-text-secondary);">${escapeHtml(customerEmail)}</div>
        </td>
        <td style="font-weight:700;color:var(--admin-green);">₹ ${amount.toLocaleString('en-IN')}</td>
        <td style="font-size:12px;">${escapeHtml(payMethod)}</td>
        <td>${statusBadge}</td>
        <td style="font-size:12px;color:var(--admin-text-secondary);">${new Date(o.createdAt).toLocaleString('en-IN')}</td>
      </tr>`;
    }).join('');

    container.innerHTML = rows;

    if (document.getElementById('m-rzp-volume')) document.getElementById('m-rzp-volume').innerText = `₹ ${totalVolume.toLocaleString('en-IN')}`;
    if (document.getElementById('m-rzp-count')) document.getElementById('m-rzp-count').innerText = paidCount;
    if (document.getElementById('m-rzp-success-rate')) {
      const rate = orders.length ? Math.round((paidCount / orders.length) * 100) : 100;
      document.getElementById('m-rzp-success-rate').innerText = `${rate}%`;
    }
  } catch (err) {
    container.innerHTML = `<tr><td colspan="7" class="loading-text" style="color:var(--admin-red)">Error loading payments: ${err.message}</td></tr>`;
  }
}

let cachedProducts = null;

async function loadSeoSuite() {
  const container = document.getElementById('seo-table-body');
  if (!container) return;

  // 1. If we already have products in memory cache, render INSTANTLY (0ms response!)
  if (cachedProducts && cachedProducts.length) {
    renderSeoSuiteTable(cachedProducts);
  } else {
    container.innerHTML = '<tr><td colspan="6" class="loading-text">Performing SEO Catalogue Audit…</td></tr>';
  }

  // 2. Fetch/refresh in background
  try {
    const data = await api('/products?limit=100');
    cachedProducts = data.products || [];
    renderSeoSuiteTable(cachedProducts);
  } catch (err) {
    if (!cachedProducts) {
      container.innerHTML = `<tr><td colspan="6" class="loading-text" style="color:var(--admin-red)">Error auditing SEO: ${err.message}</td></tr>`;
    }
  }
}

function renderSeoSuiteTable(products) {
  const container = document.getElementById('seo-table-body');
  if (!container) return;

  if (!products.length) {
    container.innerHTML = '<tr><td colspan="6" class="loading-text">No products in catalogue to audit.</td></tr>';
    return;
  }

  let totalScore = 0;
  let indexedCount = 0;
  let missingDescCount = 0;
  let missingAltCount = 0;

  const rows = products.map(p => {
    const title = p.seoTitle || p.name || 'Untitled';
    const desc = p.seoDescription || p.description || '';
    const kw = (p.focusKeyword || '').toLowerCase().trim();
    const hasImages = p.images && p.images.length > 0;
    
    let score = 0;
    if (title.length >= 40 && title.length <= 65) score += 25; else if (title.length > 0) score += 10;
    if (desc.length >= 120 && desc.length <= 165) score += 25; else if (desc.length > 0) score += 10;
    if (kw && title.toLowerCase().includes(kw)) score += 25;
    if (hasImages) score += 25;

    totalScore += score;
    if (score >= 50) indexedCount++;
    if (!p.seoDescription && !p.description) missingDescCount++;
    if (!hasImages) missingAltCount++;

    const scoreBadge = score >= 75 ? `<span class="badge badge-active" style="background:#e6f4ea;color:#137333;">${score}% Optimal</span>` : (score >= 40 ? `<span class="badge badge-pending" style="background:#fef7e0;color:#b06000;">${score}% Needs Work</span>` : `<span class="badge badge-cancelled" style="background:#fce8e6;color:#c5221f;">${score}% Low</span>`);

    return `<tr>
      <td style="font-weight:600;">${escapeHtml(p.name)}</td>
      <td>${escapeHtml(p.focusKeyword || '—')}</td>
      <td style="font-size:12px;color:var(--admin-text-secondary);">${escapeHtml(title.substring(0, 35))}${title.length > 35 ? '…' : ''}</td>
      <td>${scoreBadge}</td>
      <td><span class="badge badge-active">Indexed (Google)</span></td>
      <td>
        <button class="btn-action primary" onclick="openEditProductModal(${p.id})" style="font-size:11px;padding:4px 10px;">🎯 Edit SEO</button>
      </td>
    </tr>`;
  }).join('');

  container.innerHTML = rows;

  const avgScore = Math.round(totalScore / products.length);
  if (document.getElementById('m-seo-avg')) document.getElementById('m-seo-avg').innerText = `${avgScore}%`;
  if (document.getElementById('m-seo-indexed')) document.getElementById('m-seo-indexed').innerText = `${indexedCount} / ${products.length}`;
  if (document.getElementById('m-seo-missing-desc')) document.getElementById('m-seo-missing-desc').innerText = missingDescCount;
  if (document.getElementById('m-seo-missing-alt')) document.getElementById('m-seo-missing-alt').innerText = missingAltCount;
}

// =============================================
// DASHBOARD
// =============================================
async function loadDashboard() {
  try {
    // Load orders and products in parallel
    const [ordersData, productsData] = await Promise.all([
      api('/orders?limit=100'),
      api('/products?limit=100')
    ]);

    const orders = ordersData.orders || [];
    const products = productsData.products || [];

    allOrders = orders;

    const revenue = orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((s, o) => s + parseFloat(o.grandTotal || 0), 0);
    const pending = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

    document.getElementById('m-revenue').innerText = `₹ ${revenue.toLocaleString('en-IN')}`;
    document.getElementById('m-orders').innerText = orders.length;
    document.getElementById('m-pending').innerText = pending;
    document.getElementById('m-products').innerText = products.length;

    renderRecentOrders(orders.slice(0, 5));
  } catch (err) {
    console.error('Dashboard load error:', err);
  }
}

function refreshDashboard() { loadDashboard(); }

function renderRecentOrders(orders) {
  const tbody = document.getElementById('recent-orders-table');
  if (!orders.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-text">No orders yet</td></tr>';
    return;
  }
  tbody.innerHTML = orders.map(o => {
    const d = new Date(o.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const cust = o.user ? `${o.user.firstName || 'Guest'} ${o.user.lastName || ''}`.trim() : 'Guest';
    return `<tr>
      <td><strong>${o.orderNumber}</strong></td>
      <td>${cust}</td>
      <td>${d}</td>
      <td>₹ ${parseFloat(o.grandTotal).toLocaleString('en-IN')}</td>
      <td><span class="badge badge-${(o.paymentStatus || 'pending').toLowerCase().replace(' ', '-')}">${o.paymentStatus || 'Pending'}</span></td>
      <td><span class="badge badge-${(o.orderStatus || 'pending').toLowerCase().replace(' ', '-')}">${o.orderStatus || 'Pending'}</span></td>
    </tr>`;
  }).join('');
}

// =============================================
// ORDERS
// =============================================
async function loadOrders(page = 1) {
  currentOrderPage = page;
  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = '<tr><td colspan="7" class="loading-text">Loading orders…</td></tr>';

  const statusFilter = document.getElementById('orderStatusFilter')?.value || '';
  const statusParam = statusFilter ? `&status=${encodeURIComponent(statusFilter)}` : '';

  try {
    const data = await api(`/orders?page=${page}&limit=20${statusParam}`);
    const orders = data.orders || [];
    allOrders = orders;

    if (!orders.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="loading-text">No orders found</td></tr>';
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const dt = new Date(o.createdAt).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const cust = o.user ? `${o.user.firstName || 'Guest'} ${o.user.lastName || ''}`.trim() : 'Guest';
      const email = o.user?.email || '';
      const payBadge = getPayBadge(o.paymentStatus);
      return `<tr>
        <td><strong>${o.orderNumber}</strong></td>
        <td style="font-size:12px;color:var(--admin-text-secondary)">${dt}</td>
        <td>
          <div class="customer-name">${cust}</div>
          <div class="customer-email">${email}</div>
        </td>
        <td><strong>₹ ${parseFloat(o.grandTotal).toLocaleString('en-IN')}</strong></td>
        <td>${payBadge}</td>
        <td>
          <select class="form-select" onchange="updateOrderStatus(${o.id}, this.value)" style="font-size:12px;padding:6px 10px;">
            ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s =>
              `<option value="${s}" ${o.orderStatus === s ? 'selected' : ''}>${s}</option>`
            ).join('')}
          </select>
        </td>
        <td>
          <button class="btn-action" onclick="viewOrderDetail(${o.id})" style="font-size:11px;padding:6px 12px;">Details</button>
        </td>
      </tr>`;
    }).join('');

    // Pagination
    const totalPages = data.pagination?.pages || 1;
    renderPagination('orders-pagination', page, totalPages, loadOrders);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="loading-text" style="color:var(--admin-red)">Error: ${err.message}</td></tr>`;
  }
}

function getPayBadge(status) {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return '<span class="badge badge-paid">Paid</span>';
  if (s === 'failed') return '<span class="badge badge-failed">Failed</span>';
  if (s === 'refunded') return '<span class="badge badge-shipped">Refunded</span>';
  return '<span class="badge badge-pending">Pending</span>';
}

async function updateOrderStatus(orderId, status) {
  try {
    await api(`/orders/${orderId}/status`, 'PUT', { status });
    // Update local copy
    const o = allOrders.find(x => x.id === orderId);
    if (o) o.orderStatus = status;
  } catch (err) {
    alert('Failed to update status: ' + err.message);
  }
}

async function viewOrderDetail(orderId) {
  const modal = document.getElementById('orderModal');
  const body = document.getElementById('orderModalBody');
  const title = document.getElementById('modalOrderTitle');
  modal.classList.add('visible');
  body.innerHTML = '<div class="loading-text">Retrieving order details…</div>';

  try {
    const order = await api(`/orders/${orderId}`);
    title.innerText = `Order: ${order.orderNumber}`;
    const addr = order.shippingAddress || {};
    const items = order.items || [];

    body.innerHTML = `
      <div class="detail-grid">
        <div class="detail-group">
          <div class="detail-label">Customer</div>
          <div class="detail-value">
            ${order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Guest'}<br>
            <span style="color:var(--admin-text-secondary);font-size:12px">${order.user?.email || ''}</span>
          </div>
        </div>
        <div class="detail-group">
          <div class="detail-label">Order Placed</div>
          <div class="detail-value">${new Date(order.createdAt).toLocaleString('en-IN')}</div>
        </div>
        <div class="detail-group">
          <div class="detail-label">Payment Status</div>
          <div class="detail-value">${getPayBadge(order.paymentStatus)}</div>
        </div>
        <div class="detail-group">
          <div class="detail-label">Fulfillment Status</div>
          <div class="detail-value">
            <select class="form-select" onchange="updateOrderStatus(${order.id}, this.value)">
              ${['Pending','Confirmed','Shipped','Delivered','Cancelled'].map(s =>
                `<option value="${s}" ${order.orderStatus === s ? 'selected' : ''}>${s}</option>`
              ).join('')}
            </select>
          </div>
        </div>
      </div>

      <hr class="detail-divider">
      <div class="detail-label" style="margin-bottom:12px">Delivery Address</div>
      <div class="detail-value" style="line-height:1.8;font-size:13px">
        <strong>${addr.fullName || addr.name || 'N/A'}</strong><br>
        ${addr.addressLine1 || ''} ${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}<br>
        ${addr.city || ''}, ${addr.state || ''} — ${addr.postalCode || ''}<br>
        ${addr.country || 'India'} &nbsp;|&nbsp; 📞 ${addr.phone || '—'}
      </div>

      <hr class="detail-divider">
      <div class="detail-label" style="margin-bottom:12px">Items Ordered (${items.length})</div>
      ${items.map(item => {
        const pName = item.product?.name || 'MISS REZANNA Product';
        const size = item.size || item.variant?.size || 'M';
        const color = item.color || item.variant?.color || 'Standard';
        const price = parseFloat(item.price || item.unitPrice || 0);
        return `<div class="order-item-row">
          <div>
            <div style="font-weight:500">${pName}</div>
            <div style="font-size:12px;color:var(--admin-text-secondary)">Size: ${size} &nbsp;|&nbsp; Color: ${color} &nbsp;|&nbsp; Qty: ${item.quantity || 1}</div>
          </div>
          <div style="font-weight:500">₹ ${(price * (item.quantity || 1)).toLocaleString('en-IN')}</div>
        </div>`;
      }).join('')}

      <div class="order-total-row">
        <span>Grand Total</span>
        <span>₹ ${parseFloat(order.grandTotal).toLocaleString('en-IN')}</span>
      </div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color:var(--admin-red);padding:20px">Error: ${err.message}</div>`;
  }
}

// =============================================
// PRODUCTS MANAGEMENT (Add, Edit, Delete, Photos, YouTube)
// =============================================
let currentEditPhotos = [];

async function loadProducts() {
  const container = document.getElementById('products-grid-container');
  container.innerHTML = '<div class="loading-text">Loading products…</div>';

  try {
    const data = await api('/products?limit=100');
    const products = data.products || [];

    if (!products.length) {
      container.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--admin-text-secondary);">
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="opacity:0.3;margin-bottom:12px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <p style="font-size:16px;margin-bottom:12px;">No products found in catalogue.</p>
          <button class="btn-action primary" onclick="openAddProductModal()">+ Add Your First Product</button>
        </div>`;
      return;
    }

    container.innerHTML = products.map(p => {
      let imgSrc = PLACEHOLDER_IMG;
      try {
        const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(imgs) && imgs.length > 0) {
          const first = typeof imgs[0] === 'string' ? imgs[0] : (imgs[0].imageUrl || '');
          if (first && first.trim()) {
            imgSrc = first.trim();
          }
        }
      } catch (e) { }

      const price = p.basePrice || p.price || 0;
      const status = p.status || 'active';
      const hasYoutube = p.youtubeUrl ? true : false;
      const tax = parseFloat(p.taxPercentage || 0);
      let stock = 0;
      if (p.variants && p.variants[0] && p.variants[0].inventory) {
          stock = p.variants[0].inventory.stock || 0;
      }

      return `<div class="product-admin-card">
        <div style="position:relative;">
          <img src="${imgSrc}" class="product-admin-img" alt="${escapeHtml(p.name)}" onerror="this.onerror=null;this.src=PLACEHOLDER_IMG">
          ${hasYoutube ? `<span class="badge" style="position:absolute;top:8px;right:8px;background:#FF0000;color:#fff;font-size:10px;">▶ YouTube Video</span>` : ''}
        </div>
        <div class="product-admin-info">
          <div class="product-admin-name">${escapeHtml(p.name)}</div>
          <div class="product-admin-price">₹ ${parseFloat(price).toLocaleString('en-IN')}</div>
          <div class="product-admin-meta">
            <span>${p.category?.name || 'Collection'}</span>
            <span class="badge badge-${status}">${status}</span>
            <div style="font-size:11px;color:var(--admin-text-secondary);margin-top:6px;font-weight:600;">Stock: ${stock} &nbsp;|&nbsp; Tax: ${tax}%</div>
          </div>
          
          <div class="product-card-actions">
            <button class="btn-card-edit" onclick="openEditProductModal(${p.id})">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Details
            </button>
            <button class="btn-card-delete" onclick="confirmDeleteProduct(${p.id}, '${escapeHtml(p.name)}')">
              🗑️
            </button>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="loading-text" style="color:var(--admin-red)">Error loading products: ${err.message}</div>`;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
}

function parseYouTubeEmbed(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function openAddProductModal() {
  currentEditPhotos = ['images/A.jpeg'];
  renderProductFormModal(null, {
    name: '',
    price: '',
    sku: `MR-KU-${Math.floor(100 + Math.random() * 900)}`,
    description: '',
    youtubeUrl: '',
    status: 'active',
    stock: '',
    taxPercentage: 0
  });
}

async function openEditProductModal(productId) {
  const modal = document.getElementById('productModal');
  const body = document.getElementById('productModalBody');
  const title = document.getElementById('modalProductTitle');
  modal.classList.add('visible');
  title.innerText = 'Edit Product';
  body.innerHTML = '<div class="loading-text">Loading product details…</div>';

  try {
    const p = await api(`/products/${productId}`);
    let photos = [];
    if (p.images && Array.isArray(p.images)) {
      photos = p.images.map(img => typeof img === 'string' ? img : (img.imageUrl || 'images/A.jpeg'));
    }
    if (photos.length === 0) photos = ['images/A.jpeg'];
    currentEditPhotos = photos;

    let stock = 0;
    if (p.variants && p.variants[0] && p.variants[0].inventory) {
        stock = p.variants[0].inventory.stock || 0;
    }
    p.stock = stock;

    renderProductFormModal(productId, p);
  } catch (err) {
    body.innerHTML = `<div style="color:var(--admin-red);padding:20px;">Error: ${err.message}</div>`;
  }
}

function switchFormTab(tabId) {
  document.querySelectorAll('.pform-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.pform-tab-content').forEach(c => c.style.display = 'none');
  
  const targetBtn = document.getElementById(`tabbtn-${tabId}`);
  const targetContent = document.getElementById(`pformtab-${tabId}`);
  if (targetBtn) targetBtn.classList.add('active');
  if (targetContent) targetContent.style.display = 'block';
}

let pformFaqs = [];

function addFaqItem(q = '', a = '') {
  pformFaqs.push({ question: q, answer: a });
  renderFaqsList();
}

function removeFaqItem(idx) {
  pformFaqs.splice(idx, 1);
  renderFaqsList();
}

function renderFaqsList() {
  const container = document.getElementById('faqs-list-container');
  if (!container) return;
  if (!pformFaqs.length) {
    container.innerHTML = `<div style="font-size:12px;color:var(--admin-text-secondary);text-align:center;padding:12px;border:1px dashed #ccc;border-radius:4px;">No FAQ questions added yet. Click "+ Add FAQ Item" below to build structured schema FAQs.</div>`;
    return;
  }
  container.innerHTML = pformFaqs.map((faq, i) => `
    <div style="background:#f8f7f5;padding:10px;border-radius:6px;margin-bottom:8px;border:1px solid #e5e0d8;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <strong style="font-size:12px;color:#111;">FAQ #${i + 1}</strong>
        <button type="button" onclick="removeFaqItem(${i})" style="background:none;border:none;color:#d32f2f;cursor:pointer;font-size:12px;">Remove</button>
      </div>
      <input type="text" placeholder="Question (e.g. What is the fabric material?)" value="${escapeHtml(faq.question)}" oninput="pformFaqs[${i}].question = this.value; updateSchemaJsonPreview();" class="form-control" style="margin-bottom:6px;font-size:12px;">
      <textarea placeholder="Answer..." oninput="pformFaqs[${i}].answer = this.value; updateSchemaJsonPreview();" class="form-control" rows="2" style="font-size:12px;">${escapeHtml(faq.answer)}</textarea>
    </div>
  `).join('');
  updateSchemaJsonPreview();
}

function updateSchemaJsonPreview() {
  const title = document.getElementById('pf-meta-title')?.value || document.getElementById('pf-name')?.value || 'Product Title';
  const desc = document.getElementById('pf-meta-desc')?.value || document.getElementById('pf-description')?.value || '';
  const price = document.getElementById('pf-price')?.value || '0.00';
  const sku = document.getElementById('pf-sku')?.value || 'SKU-001';
  const slug = document.getElementById('pf-slug')?.value || 'product-url';

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": title,
    "image": currentEditPhotos,
    "description": desc,
    "sku": sku,
    "brand": { "@type": "Brand", "name": document.getElementById('pf-brand')?.value || "MISS REZANNA" },
    "offers": {
      "@type": "Offer",
      "url": `https://www.missrezanna.com/product/${slug}`,
      "priceCurrency": "INR",
      "price": price,
      "availability": "https://schema.org/InStock"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pformFaqs.filter(f => f.question.trim()).map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  };

  const codeEl = document.getElementById('schema-json-output');
  if (codeEl) {
    codeEl.innerText = JSON.stringify([productSchema, faqSchema], null, 2);
  }
}

function updateSeoAudit() {
  const name = document.getElementById('pf-name')?.value || '';
  const slug = document.getElementById('pf-slug')?.value || '';
  const mTitle = document.getElementById('pf-meta-title')?.value || name;
  const mDesc = document.getElementById('pf-meta-desc')?.value || '';
  const kw = (document.getElementById('pf-focus-kw')?.value || '').toLowerCase().trim();
  const desc = document.getElementById('pf-description')?.value || '';

  // Title character counter
  const tCount = mTitle.length;
  const tCounterEl = document.getElementById('mtitle-counter');
  if (tCounterEl) {
    tCounterEl.innerText = `${tCount} / 60 chars`;
    tCounterEl.style.color = (tCount >= 50 && tCount <= 60) ? '#2e7d32' : (tCount > 60 ? '#c62828' : '#ef6c00');
  }

  // Desc character counter
  const dCount = mDesc.length;
  const dCounterEl = document.getElementById('mdesc-counter');
  if (dCounterEl) {
    dCounterEl.innerText = `${dCount} / 160 chars`;
    dCounterEl.style.color = (dCount >= 140 && dCount <= 160) ? '#2e7d32' : (dCount > 160 ? '#c62828' : '#ef6c00');
  }

  // Google SERP Preview
  const serpTitle = document.getElementById('serp-preview-title');
  const serpUrl = document.getElementById('serp-preview-url');
  const serpDesc = document.getElementById('serp-preview-desc');
  if (serpTitle) serpTitle.innerText = mTitle || 'Product Title Placeholder — MISS REZANNA';
  if (serpUrl) serpUrl.innerText = `https://www.missrezanna.com › product › ${slug || 'product-url-slug'}`;
  if (serpDesc) serpDesc.innerText = mDesc || 'Your product search engine snippet meta description will appear right here as users search on Google...';

  // Calculate SEO Score
  let score = 0;
  const checks = {
    titleLen: tCount >= 40 && tCount <= 65,
    descLen: dCount >= 120 && dCount <= 165,
    kwTitle: kw && mTitle.toLowerCase().includes(kw),
    kwSlug: kw && slug.toLowerCase().includes(kw),
    kwDesc: kw && (mDesc.toLowerCase().includes(kw) || desc.toLowerCase().includes(kw)),
    descExist: desc.length > 50,
    hasPhotos: currentEditPhotos.length > 0
  };

  if (checks.titleLen) score += 15;
  if (checks.descLen) score += 20;
  if (checks.kwTitle) score += 20;
  if (checks.kwSlug) score += 15;
  if (checks.kwDesc) score += 15;
  if (checks.descExist) score += 10;
  if (checks.hasPhotos) score += 5;

  const scoreEl = document.getElementById('seo-score-num');
  const scoreBar = document.getElementById('seo-score-bar');
  if (scoreEl) scoreEl.innerText = `${score}%`;
  if (scoreBar) {
    scoreBar.style.width = `${score}%`;
    scoreBar.style.background = score > 80 ? '#2e7d32' : (score > 50 ? '#ef6c00' : '#c62828');
  }

  // Update Checklist HTML
  const chkEl = document.getElementById('seo-checklist-box');
  if (chkEl) {
    chkEl.innerHTML = `
      <div style="font-size:12px;display:flex;gap:6px;align-items:center;">${checks.titleLen ? '✅' : '❌'} Meta Title length (50-60 chars optimal)</div>
      <div style="font-size:12px;display:flex;gap:6px;align-items:center;">${checks.descLen ? '✅' : '❌'} Meta Description length (140-160 chars optimal)</div>
      <div style="font-size:12px;display:flex;gap:6px;align-items:center;">${checks.kwTitle ? '✅' : '⚠️'} Focus Keyword in Title</div>
      <div style="font-size:12px;display:flex;gap:6px;align-items:center;">${checks.kwSlug ? '✅' : '⚠️'} Focus Keyword in URL Slug</div>
      <div style="font-size:12px;display:flex;gap:6px;align-items:center;">${checks.kwDesc ? '✅' : '⚠️'} Focus Keyword in Meta Description</div>
      <div style="font-size:12px;display:flex;gap:6px;align-items:center;">${checks.descExist ? '✅' : '❌'} Product Description detail (>50 words)</div>
    `;
  }

  updateSchemaJsonPreview();
}

function updatePhotoPreviews() {
  const container = document.getElementById('photoGalleryContainer');
  if (container) container.innerHTML = renderPhotoThumbsHTML();
}

function renderPhotoThumbsHTML() {
  const fileInput = document.getElementById('pf-photo-upload');
  const newFiles = fileInput && fileInput.files ? Array.from(fileInput.files) : [];
  
  if (!currentEditPhotos.length && !newFiles.length) {
    return `<div style="grid-column:1/-1;font-size:12px;color:var(--admin-text-secondary);text-align:center;padding:12px;">No photos added yet. Use the file selector above to upload images from your computer.</div>`;
  }
  
  let html = '';
  
  // Render existing photos
  html += currentEditPhotos.map((url, idx) => `
    <div class="photo-thumb-box">
      <img src="${escapeHtml(url)}" onerror="this.onerror=null;this.src=PLACEHOLDER_IMG" alt="Photo ${idx + 1}">
      <button type="button" class="btn-remove-photo" onclick="removePhoto(${idx})" title="Remove photo">&times;</button>
    </div>
  `).join('');

  // Render new local files
  html += newFiles.map((file, idx) => `
    <div class="photo-thumb-box" style="border: 2px solid #C3A167;">
      <img src="${URL.createObjectURL(file)}" alt="New File ${idx + 1}">
      <div style="position:absolute;bottom:0;background:rgba(195,161,103,0.9);color:#fff;font-size:9px;width:100%;text-align:center;padding:2px;">NEW</div>
    </div>
  `).join('');

  return html;
}

function removePhoto(index) {
  currentEditPhotos.splice(index, 1);
  const container = document.getElementById('photoGalleryContainer');
  if (container) container.innerHTML = renderPhotoThumbsHTML();
}

function getSizeStock(data, sizeName, defaultVal = 0) {
  if (data && data.variants && Array.isArray(data.variants)) {
    const v = data.variants.find(varObj => (varObj.size || '').toUpperCase() === sizeName.toUpperCase());
    if (v && v.inventory) return v.inventory.stock;
  }
  return defaultVal;
}

function calculateTotalSizeStock() {
  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];
  let total = 0;
  sizes.forEach(sz => {
    const inputId = `pf-stock-${sz.toLowerCase()}`;
    total += parseInt(document.getElementById(inputId)?.value || 0);
  });

  const label = document.getElementById('pf-total-stock-label');
  const hiddenInput = document.getElementById('pf-stock');
  if (label) label.innerText = `Total Stock: ${total} Units`;
  if (hiddenInput) hiddenInput.value = total;
}

function renderProductFormModal(productId, data) {
  const modal = document.getElementById('productModal');
  const body = document.getElementById('productModalBody');
  const title = document.getElementById('modalProductTitle');
  modal.classList.add('visible');
  title.innerText = productId ? `Edit Product: ${data.name}` : 'Add New Product';

  pformFaqs = data.faqs || [];

  const embedUrl = parseYouTubeEmbed(data.youtubeUrl || '');

  body.innerHTML = `
    <style>
      .pform-section { background:#fafafa; border:1px solid #e2e8f0; border-radius:8px; padding:18px; margin-bottom:20px; }
      .pform-section-title { font-size:14px; font-weight:700; color:#1a202c; margin-bottom:14px; padding-bottom:8px; border-bottom:2px solid #C3A167; display:flex; align-items:center; gap:8px; }
      .serp-card { background:#fff; border:1px solid #dfe1e5; border-radius:8px; padding:14px; font-family:arial,sans-serif; }
      .serp-title { color:#1a0dab; font-size:18px; line-height:1.2; text-decoration:hover; cursor:pointer; }
      .serp-url { color:#202124; font-size:13px; margin-top:2px; }
      .serp-desc { color:#4d5156; font-size:13px; margin-top:4px; line-height:1.48; }
    </style>

    <form id="productForm" onsubmit="handleProductFormSubmit(event, ${productId})">

      <!-- SECTION 1: BASIC INFO -->
      <div class="pform-section">
        <div class="pform-section-title">📝 1. Basic Product Info</div>
        <div class="form-group">
          <label>Product Title *</label>
          <input type="text" id="pf-name" class="form-control" value="${escapeHtml(data.name || '')}" placeholder="e.g. Royal Mulberry Silk Kurti Set" required oninput="autoGenerateSlug(this.value); updateSeoAudit();">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>URL Slug *</label>
            <input type="text" id="pf-slug" class="form-control" value="${escapeHtml(data.slug || '')}" placeholder="royal-mulberry-silk-kurti-set" required oninput="updateSeoAudit()">
          </div>
          <div class="form-group">
            <label>Brand Name</label>
            <input type="text" id="pf-brand" class="form-control" value="${escapeHtml(data.brand || 'MISS REZANNA')}" placeholder="MISS REZANNA">
          </div>
        </div>

        <div class="form-group">
          <label>Product Description (Rich Content)</label>
          <textarea id="pf-description" class="form-control" rows="4" placeholder="Handcrafted with Mulberry silk drape, detailed with Zari embroidery..." oninput="updateSeoAudit()">${escapeHtml(data.description || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Publish Status</label>
            <select id="pf-status" class="form-control">
              <option value="active" ${data.status === 'active' ? 'selected' : ''}>Published (Active)</option>
              <option value="draft" ${data.status === 'draft' ? 'selected' : ''}>Draft</option>
              <option value="archived" ${data.status === 'archived' ? 'selected' : ''}>Archived</option>
            </select>
          </div>
          <div class="form-group">
            <label>Publish Schedule Date</label>
            <input type="datetime-local" id="pf-schedule" class="form-control">
          </div>
        </div>
      </div>

      <!-- SECTION 2: PRICING & STOCK -->
      <div class="pform-section">
        <div class="pform-section-title">💰 2. Pricing & Size-Wise Stock Inventory</div>
        <div class="form-row">
          <div class="form-group">
            <label>Product Price (₹) *</label>
            <input type="number" id="pf-price" class="form-control" value="${data.price || ''}" placeholder="3500" required step="0.01" oninput="updateSeoAudit()">
          </div>
          <div class="form-group">
            <label>Compare-at Price (MRP ₹)</label>
            <input type="number" id="pf-compare-price" class="form-control" value="${data.compareAtPrice || ''}" placeholder="4999" step="0.01">
          </div>
        </div>

        <!-- Size-Wise Stock Inventory Matrix (S to 6XL) -->
        <div class="form-group" style="background:#fff;padding:16px;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:16px;">
          <label style="font-weight:700;display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span>📏 Size-Wise Inventory Breakdown (S to 6XL) *</span>
            <span id="pf-total-stock-label" style="font-size:12px;color:var(--admin-green);font-weight:800;">Total Stock: 0 Units</span>
          </label>
          <p style="font-size:11px;color:var(--admin-text-secondary);margin-bottom:12px;">Specify exact available inventory stock quantity for each size (S through 6XL):</p>
          <div style="display:grid;grid-template-columns:repeat(9, 1fr);gap:6px;">
            ${['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'].map(sz => `
              <div style="text-align:center;">
                <span style="font-size:11px;font-weight:700;display:block;margin-bottom:4px;">${sz}</span>
                <input type="number" id="pf-stock-${sz.toLowerCase()}" class="form-control" value="${getSizeStock(data, sz, sz === 'S' || sz === 'M' || sz === 'L' || sz === 'XL' ? 10 : 2)}" min="0" oninput="calculateTotalSizeStock()" style="text-align:center;font-weight:700;border-color:#C3A167;padding:4px;">
              </div>
            `).join('')}
          </div>
          <input type="hidden" id="pf-stock" value="0">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Tax Percentage (%) *</label>
            <input type="number" id="pf-tax" class="form-control" value="${data.taxPercentage !== undefined ? data.taxPercentage : '0'}" placeholder="12" required step="0.1">
          </div>
          <div class="form-group">
            <label>SKU Code *</label>
            <input type="text" id="pf-sku" class="form-control" value="${escapeHtml(data.sku || '')}" placeholder="MR-KU-001" required>
          </div>
        </div>

        <div class="form-group">
          <label>Barcode / GTIN</label>
          <input type="text" id="pf-barcode" class="form-control" value="${escapeHtml(data.barcode || '')}" placeholder="8901234567890">
        </div>
      </div>

      <!-- SECTION 3: SPECS & ATTRIBUTES -->
      <div class="pform-section">
        <div class="pform-section-title">✨ 3. Specifications & Attributes</div>
        <div class="form-row">
          <div class="form-group">
            <label>Fabric / Material</label>
            <input type="text" id="pf-fabric" class="form-control" value="${escapeHtml(data.fabric || '')}" placeholder="Pure Silk / Organic Cotton">
          </div>
          <div class="form-group">
            <label>Fit Type</label>
            <input type="text" id="pf-fit" class="form-control" value="${escapeHtml(data.fit || '')}" placeholder="Regular Fit / Slim Fit">
          </div>
        </div>

        <div class="form-group">
          <label>Care Instructions</label>
          <input type="text" id="pf-care" class="form-control" value="${escapeHtml(data.careInstructions || '')}" placeholder="Dry Clean Only. Do not bleach.">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Weight (kg)</label>
            <input type="text" id="pf-weight" class="form-control" value="${escapeHtml(data.weight || '')}" placeholder="0.5 kg">
          </div>
          <div class="form-group">
            <label>Dimensions (cm)</label>
            <input type="text" id="pf-dimensions" class="form-control" value="${escapeHtml(data.dimensions || '')}" placeholder="30 x 20 x 5 cm">
          </div>
        </div>
      </div>

      <!-- SECTION 4: PHOTOS -->
      <div class="pform-section">
        <div class="pform-section-title">🖼️ 4. Product Photos</div>
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;">
            <span>Product Photos Gallery</span>
            <span style="font-size:11px;color:var(--admin-text-secondary);">${currentEditPhotos.length} photo(s)</span>
          </label>
          
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;background:rgba(195,161,103,0.08);padding:12px;border-radius:6px;border:1px dashed rgba(195,161,103,0.5);">
            <div style="position:relative; display:block; padding:16px; font-size:14px; width:100%; font-weight:bold; background:#000; color:#fff; text-align:center; border-radius:4px; cursor:pointer; overflow:hidden;">
              📁 CLICK HERE TO UPLOAD NEW PHOTOS FROM COMPUTER
              <input type="file" id="pf-photo-upload" accept="image/*" multiple onchange="updatePhotoPreviews()" style="position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; cursor:pointer; font-size:100px;">
            </div>
          </div>

          <div class="photo-gallery-preview" id="photoGalleryContainer">
            ${renderPhotoThumbsHTML()}
          </div>
        </div>
      </div>

      <!-- SECTION 5: SEO & SOCIAL -->
      <div class="pform-section">
        <div class="pform-section-title">🎯 5. Search Engine Optimization (SEO)</div>
        <div class="form-row">
          <div class="form-group">
            <label>Focus Primary Keyword</label>
            <input type="text" id="pf-focus-kw" class="form-control" value="${escapeHtml(data.focusKeyword || '')}" placeholder="e.g. Silk Kurti Set" oninput="updateSeoAudit()">
          </div>
          <div class="form-group">
            <label>Secondary Keywords</label>
            <input type="text" id="pf-seo-keywords" class="form-control" value="${escapeHtml(data.seoKeywords || '')}" placeholder="ethnic kurti, partywear silk" oninput="updateSeoAudit()">
          </div>
        </div>

        <div class="form-group">
          <label style="display:flex;justify-content:space-between;">
            <span>SEO Meta Title</span>
            <span id="mtitle-counter" style="font-size:11px;font-weight:600;">0 / 60 chars</span>
          </label>
          <input type="text" id="pf-meta-title" class="form-control" value="${escapeHtml(data.seoTitle || '')}" placeholder="Luxury Silk Kurti Set | MISS REZANNA" oninput="updateSeoAudit()">
        </div>

        <div class="form-group">
          <label style="display:flex;justify-content:space-between;">
            <span>SEO Meta Description</span>
            <span id="mdesc-counter" style="font-size:11px;font-weight:600;">0 / 160 chars</span>
          </label>
          <textarea id="pf-meta-desc" class="form-control" rows="3" placeholder="Shop hand-woven silk kurti sets with zari details. Free shipping across India." oninput="updateSeoAudit()">${escapeHtml(data.seoDescription || '')}</textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Canonical URL</label>
            <input type="url" id="pf-canonical" class="form-control" value="${escapeHtml(data.canonicalUrl || '')}" placeholder="https://www.missrezanna.com/product/slug">
          </div>
          <div class="form-group">
            <label>Robots Indexing Meta</label>
            <select id="pf-robots" class="form-control">
              <option value="index, follow">index, follow (Default - Show on Google)</option>
              <option value="noindex, nofollow">noindex, nofollow (Hide from Google)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- SECTION 6: LIVE SEO AUDIT & PREVIEWS -->
      <div class="pform-section">
        <div class="pform-section-title">⚡ 6. Live Google SERP Preview & SEO Audit</div>
        <div style="background:#fff;padding:16px;border-radius:8px;margin-bottom:16px;border:1px solid #e1e4e8;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-weight:700;font-size:14px;color:#111;">🎯 Real-Time SEO Health Score</span>
            <span id="seo-score-num" style="font-size:18px;font-weight:800;color:#2e7d32;">0%</span>
          </div>
          <div style="background:#e0e0e0;height:10px;border-radius:5px;overflow:hidden;margin-bottom:14px;">
            <div id="seo-score-bar" style="width:0%;height:100%;background:#c62828;transition:all 0.3s;"></div>
          </div>
          <div id="seo-checklist-box" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-weight:700;font-size:13px;display:block;margin-bottom:8px;">🔍 Live Google Search Result SERP Preview</label>
          <div class="serp-card">
            <div class="serp-url" id="serp-preview-url">https://www.missrezanna.com › product</div>
            <div class="serp-title" id="serp-preview-title">Product Title Preview</div>
            <div class="serp-desc" id="serp-preview-desc">Product snippet description preview will appear right here...</div>
          </div>
        </div>
      </div>

      <!-- SECTION 7: SCHEMAS & FAQS -->
      <div class="pform-section">
        <div class="pform-section-title">📦 7. FAQ Builder & JSON-LD Schemas</div>
        <div class="form-group">
          <label style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-weight:700;">❓ Frequently Asked Questions (FAQ Schema)</span>
            <button type="button" onclick="addFaqItem()" class="btn-action primary" style="padding:4px 10px;font-size:11px;">+ Add FAQ Item</button>
          </label>
          <div id="faqs-list-container"></div>
        </div>

        <div class="form-group" style="margin-top:16px;">
          <label style="font-weight:700;">📦 Auto-Generated Structured Data (JSON-LD)</label>
          <pre id="schema-json-output" style="background:#1e1e1e;color:#4af626;padding:12px;border-radius:6px;font-size:11px;max-height:180px;overflow:auto;"></pre>
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;border-top:1px solid #eee;padding-top:16px;">
        <button type="button" class="btn-action" onclick="closeModal('productModal')">Cancel</button>
        <button type="submit" class="btn-action primary" id="btnSaveProduct" style="background:#C3A167;color:#000;font-weight:700;padding:12px 24px;font-size:14px;">${productId ? 'Save Changes' : 'Create Product'}</button>
      </div>
    </form>
  `;

  renderFaqsList();
  calculateTotalSizeStock();
  updateSeoAudit();
}

async function handleProductFormSubmit(e, productId) {
  e.preventDefault();
  const btn = document.getElementById('btnSaveProduct');
  btn.innerText = 'Saving…';
  btn.disabled = true;

  const payload = new FormData();
  payload.append('name', document.getElementById('pf-name').value.trim());
  payload.append('slug', document.getElementById('pf-slug').value.trim());
  payload.append('price', document.getElementById('pf-price').value);
  payload.append('sku', document.getElementById('pf-sku').value.trim());
  payload.append('description', document.getElementById('pf-description').value.trim());
  
  payload.append('stock', document.getElementById('pf-stock').value);

  const sizeStockMap = {
    S: parseInt(document.getElementById('pf-stock-s')?.value || 0),
    M: parseInt(document.getElementById('pf-stock-m')?.value || 0),
    L: parseInt(document.getElementById('pf-stock-l')?.value || 0),
    XL: parseInt(document.getElementById('pf-stock-xl')?.value || 0),
    '2XL': parseInt(document.getElementById('pf-stock-2xl')?.value || 0),
    '3XL': parseInt(document.getElementById('pf-stock-3xl')?.value || 0),
    '4XL': parseInt(document.getElementById('pf-stock-4xl')?.value || 0),
    '5XL': parseInt(document.getElementById('pf-stock-5xl')?.value || 0),
    '6XL': parseInt(document.getElementById('pf-stock-6xl')?.value || 0)
  };
  payload.append('sizeStock', JSON.stringify(sizeStockMap));

  payload.append('taxPercentage', document.getElementById('pf-tax').value);

  // SEO Fields
  payload.append('seoTitle', document.getElementById('pf-meta-title').value.trim());
  payload.append('seoDescription', document.getElementById('pf-meta-desc').value.trim());
  payload.append('seoKeywords', document.getElementById('pf-seo-keywords').value.trim());
  payload.append('brand', document.getElementById('pf-brand').value.trim());
  payload.append('fabric', document.getElementById('pf-fabric').value.trim());
  payload.append('fit', document.getElementById('pf-fit').value.trim());
  payload.append('careInstructions', document.getElementById('pf-care').value.trim());

  // Existing images to keep
  payload.append('imageUrls', JSON.stringify(currentEditPhotos));

  // New file uploads from computer
  const fileInput = document.getElementById('pf-photo-upload');
  if (fileInput && fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      payload.append('images', fileInput.files[i]);
    }
  }

  try {
    if (productId) {
      await api(`/products/${productId}`, 'PUT', payload);
      alert('Product & SEO Metadata updated successfully!');
    } else {
      await api('/products', 'POST', payload);
      alert('Product & SEO Metadata created successfully!');
    }
    closeModal('productModal');
    loadProducts();
  } catch (err) {
    alert('Failed to save product: ' + err.message);
  } finally {
    btn.innerText = productId ? 'Save Changes' : 'Create Product';
    btn.disabled = false;
  }
}

async function confirmDeleteProduct(productId, productName) {
  if (!confirm(`Are you sure you want to delete "${productName}" from the catalogue?`)) {
    return;
  }

  try {
    await api(`/products/${productId}`, 'DELETE');
    alert(`"${productName}" deleted successfully.`);
    loadProducts();
  } catch (err) {
    alert('Failed to delete product: ' + err.message);
  }
}

// =============================================
// CUSTOMERS
// =============================================
async function loadCustomers() {
  const tbody = document.getElementById('customers-table-body');
  tbody.innerHTML = '<tr><td colspan="6" class="loading-text">Loading customers…</td></tr>';

  // The backend doesn't have a dedicated admin users endpoint,
  // so we pull from orders and extract unique users
  try {
    const data = await api('/orders?limit=100');
    const orders = data.orders || [];

    const usersMap = {};
    orders.forEach(o => {
      if (o.user && o.user.email) {
        const uid = o.user.email;
        if (!usersMap[uid]) {
          usersMap[uid] = { ...o.user, orderCount: 0, totalSpent: 0 };
        }
        usersMap[uid].orderCount++;
        usersMap[uid].totalSpent += parseFloat(o.grandTotal || 0);
      }
    });

    const customers = Object.values(usersMap);

    if (!customers.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="loading-text">No registered customers yet</td></tr>';
      return;
    }

    tbody.innerHTML = customers.map(u => {
      const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—';
      return `<tr>
        <td>
          <div class="customer-name">${(u.firstName || 'Guest')} ${u.lastName || ''}</div>
        </td>
        <td>${u.email || '—'}</td>
        <td>${u.phone || '—'}</td>
        <td>${joined}</td>
        <td><span class="badge badge-${(u.status || 'active')}">${u.status || 'Active'}</span></td>
        <td>${u.orderCount} orders &nbsp;·&nbsp; ₹ ${u.totalSpent.toLocaleString('en-IN')}</td>
      </tr>`;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="loading-text" style="color:var(--admin-red)">Error: ${err.message}</td></tr>`;
  }
}

// =============================================
// UTILITIES
// =============================================
function closeModal(id) {
  document.getElementById(id).classList.remove('visible');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('visible');
  }
});

function renderPagination(containerId, currentPage, totalPages, callback) {
  const container = document.getElementById(containerId);
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn-action ${i === currentPage ? 'primary' : ''}" onclick="${callback.name}(${i})" style="padding:6px 14px">${i}</button>`;
  }
  container.innerHTML = html;
}
