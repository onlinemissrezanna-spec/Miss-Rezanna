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
    // Open Dashboard tab by default on login
    switchTab('dashboard', document.querySelector('.nav-item[data-tab="dashboard"]'));
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
  document.querySelectorAll('.tab-view').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
  if (el) el.classList.add('active');

  if (tabName === 'dashboard') loadDashboard();
  if (tabName === 'orders') loadOrders();
  if (tabName === 'products') loadProducts();
  if (tabName === 'customers') loadCustomers();
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

function autoGenerateSlug(name) {
  const slugInput = document.getElementById('pf-slug');
  if (slugInput) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    slugInput.value = slug;
    updateSeoAudit();
  }
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
      .pform-tabs-bar { display:flex; gap:4px; border-bottom:1px solid #e0e0e0; margin-bottom:16px; overflow-x:auto; }
      .pform-tab-btn { background:none; border:none; padding:10px 14px; font-size:12px; font-weight:600; color:#666; cursor:pointer; border-bottom:2px solid transparent; white-space:nowrap; }
      .pform-tab-btn.active { color:#000; border-bottom-color:#C3A167; }
      .pform-tab-content { display:none; }
      .serp-card { background:#fff; border:1px solid #dfe1e5; border-radius:8px; padding:14px; font-family:arial,sans-serif; }
      .serp-title { color:#1a0dab; font-size:18px; line-height:1.2; text-decoration:hover; cursor:pointer; }
      .serp-url { color:#202124; font-size:13px; margin-top:2px; }
      .serp-desc { color:#4d5156; font-size:13px; margin-top:4px; line-height:1.48; }
    </style>

    <div class="pform-tabs-bar">
      <button type="button" class="pform-tab-btn active" id="tabbtn-basic" onclick="switchFormTab('basic')">📝 Basic Info</button>
      <button type="button" class="pform-tab-btn" id="tabbtn-pricing" onclick="switchFormTab('pricing')">💰 Price & Stock</button>
      <button type="button" class="pform-tab-btn" id="tabbtn-specs" onclick="switchFormTab('specs')">✨ Specs & Attributes</button>
      <button type="button" class="pform-tab-btn" id="tabbtn-photos" onclick="switchFormTab('photos')">🖼️ Photos</button>
      <button type="button" class="pform-tab-btn" id="tabbtn-seo" onclick="switchFormTab('seo')">🎯 SEO & Social</button>
      <button type="button" class="pform-tab-btn" id="tabbtn-audit" onclick="switchFormTab('audit')">⚡ Live SEO Audit</button>
      <button type="button" class="pform-tab-btn" id="tabbtn-schema" onclick="switchFormTab('schema')">📦 Schemas & FAQs</button>
    </div>

    <form id="productForm" onsubmit="handleProductFormSubmit(event, ${productId})">

      <!-- TAB 1: BASIC INFO -->
      <div class="pform-tab-content" id="pformtab-basic" style="display:block;">
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

      <!-- TAB 2: PRICING & STOCK -->
      <div class="pform-tab-content" id="pformtab-pricing">
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

        <div class="form-row">
          <div class="form-group">
            <label>Total Inventory Stock *</label>
            <input type="number" id="pf-stock" class="form-control" value="${data.stock !== undefined ? data.stock : '50'}" placeholder="50" required min="0">
          </div>
          <div class="form-group">
            <label>Tax Percentage (%) *</label>
            <input type="number" id="pf-tax" class="form-control" value="${data.taxPercentage !== undefined ? data.taxPercentage : '0'}" placeholder="12" required step="0.1">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>SKU Code *</label>
            <input type="text" id="pf-sku" class="form-control" value="${escapeHtml(data.sku || '')}" placeholder="MR-KU-001" required>
          </div>
          <div class="form-group">
            <label>Barcode / GTIN</label>
            <input type="text" id="pf-barcode" class="form-control" value="${escapeHtml(data.barcode || '')}" placeholder="8901234567890">
          </div>
        </div>
      </div>

      <!-- TAB 3: SPECS & ATTRIBUTES -->
      <div class="pform-tab-content" id="pformtab-specs">
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

      <!-- TAB 4: PHOTOS -->
      <div class="pform-tab-content" id="pformtab-photos">
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

      <!-- TAB 5: SEO & SOCIAL -->
      <div class="pform-tab-content" id="pformtab-seo">
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

      <!-- TAB 6: LIVE SEO AUDIT & PREVIEWS -->
      <div class="pform-tab-content" id="pformtab-audit">
        <div style="background:#f4f6f8;padding:16px;border-radius:8px;margin-bottom:16px;border:1px solid #e1e4e8;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-weight:700;font-size:14px;color:#111;">🎯 SEO Optimization Score</span>
            <span id="seo-score-num" style="font-size:18px;font-weight:800;color:#2e7d32;">0%</span>
          </div>
          <div style="background:#e0e0e0;height:10px;border-radius:5px;overflow:hidden;margin-bottom:14px;">
            <div id="seo-score-bar" style="width:0%;height:100%;background:#c62828;transition:all 0.3s;"></div>
          </div>
          <div id="seo-checklist-box" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;"></div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="font-weight:700;font-size:13px;display:block;margin-bottom:8px;">🔍 Google Search Result SERP Preview</label>
          <div class="serp-card">
            <div class="serp-url" id="serp-preview-url">https://www.missrezanna.com › product</div>
            <div class="serp-title" id="serp-preview-title">Product Title Preview</div>
            <div class="serp-desc" id="serp-preview-desc">Product snippet description preview will appear right here...</div>
          </div>
        </div>
      </div>

      <!-- TAB 7: SCHEMAS & FAQS -->
      <div class="pform-tab-content" id="pformtab-schema">
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
        <button type="submit" class="btn-action primary" id="btnSaveProduct" style="background:#C3A167;color:#000;font-weight:700;">${productId ? 'Save Changes' : 'Create Product'}</button>
      </div>
    </form>
  `;

  renderFaqsList();
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
