// MISS REZANNA — Admin Portal JavaScript
// Connects to all backend API endpoints

// Auto-detect backend URL: if serving from Railway, use same origin. Otherwise use Railway production URL.
const BACKEND_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://miss-rezanna-production.up.railway.app';
const API = `${BACKEND_BASE}/api/v1`;
let adminToken = localStorage.getItem('mr_admin_token') || null;
let allOrders = [];
let currentOrderPage = 1;

// =============================================
// INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dashDate').innerText = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
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
    overlay.classList.add('hidden');
    // Open Products tab by default right after login
    switchTab('products', document.querySelector('.nav-item[onclick*="products"]'));
  } else {
    overlay.classList.remove('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const btn = document.getElementById('btnLogin');
  const errorEl = document.getElementById('loginError');
  errorEl.innerText = '';

  btn.innerText = 'Verifying…';
  btn.disabled = true;

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
    errorEl.innerText = err.message;
  } finally {
    btn.innerText = 'Sign In Securely';
    btn.disabled = false;
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
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${path}`, opts);
  const data = await res.json();
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
      let imgSrc = 'images/A.jpeg';
      try {
        const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(imgs) && imgs.length > 0) {
          imgSrc = typeof imgs[0] === 'string' ? imgs[0] : (imgs[0].imageUrl || imgSrc);
        }
      } catch (e) { }

      const price = p.basePrice || p.price || 0;
      const status = p.status || 'active';
      const hasYoutube = p.youtubeUrl ? true : false;

      return `<div class="product-admin-card">
        <div style="position:relative;">
          <img src="${imgSrc}" class="product-admin-img" alt="${escapeHtml(p.name)}" onerror="this.src='images/A.jpeg'">
          ${hasYoutube ? `<span class="badge" style="position:absolute;top:8px;right:8px;background:#FF0000;color:#fff;font-size:10px;">▶ YouTube Video</span>` : ''}
        </div>
        <div class="product-admin-info">
          <div class="product-admin-name">${escapeHtml(p.name)}</div>
          <div class="product-admin-price">₹ ${parseFloat(price).toLocaleString('en-IN')}</div>
          <div class="product-admin-meta">
            <span>${p.category?.name || 'Collection'}</span>
            <span class="badge badge-${status}">${status}</span>
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
    status: 'active'
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

    renderProductFormModal(productId, p);
  } catch (err) {
    body.innerHTML = `<div style="color:var(--admin-red);padding:20px;">Error: ${err.message}</div>`;
  }
}

function renderProductFormModal(productId, data) {
  const modal = document.getElementById('productModal');
  const body = document.getElementById('productModalBody');
  const title = document.getElementById('modalProductTitle');
  modal.classList.add('visible');
  title.innerText = productId ? `Edit Product: ${data.name}` : 'Add New Product';

  const embedUrl = parseYouTubeEmbed(data.youtubeUrl || '');

  body.innerHTML = `
    <form id="productForm" onsubmit="handleProductFormSubmit(event, ${productId})">
      <div class="form-group">
        <label>Product Name *</label>
        <input type="text" id="pf-name" class="form-control" value="${escapeHtml(data.name || '')}" placeholder="e.g. Royal Silk Kurti Set" required>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Price (₹) *</label>
          <input type="number" id="pf-price" class="form-control" value="${data.price || ''}" placeholder="3500" required step="0.01">
        </div>
        <div class="form-group">
          <label>SKU Code *</label>
          <input type="text" id="pf-sku" class="form-control" value="${escapeHtml(data.sku || '')}" placeholder="MR-KU-001" required>
        </div>
      </div>

      <div class="form-group">
        <label>Description</label>
        <textarea id="pf-description" class="form-control" rows="3" placeholder="Intricate threadwork with ethically sourced Mulberry silk drape...">${escapeHtml(data.description || '')}</textarea>
      </div>

      <!-- YOUTUBE VIDEO INTEGRATION -->
      <div class="form-group" style="background:rgba(255,0,0,0.03);padding:14px;border:1px solid rgba(255,0,0,0.15);border-radius:6px;">
        <label style="color:#d32f2f;display:flex;align-items:center;gap:6px;">
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          YouTube Video Link (Optional)
        </label>
        <input type="url" id="pf-youtube" class="form-control" value="${escapeHtml(data.youtubeUrl || '')}" placeholder="Paste YouTube link (e.g. https://www.youtube.com/watch?v=VIDEO_ID)" oninput="updateYouTubePreview(this.value)">
        <div style="font-size:11px;color:var(--admin-text-secondary);margin-top:4px;">Paste any YouTube video link to display embedded video on product page.</div>
        
        <div id="youtube-preview-container" class="youtube-preview-box" style="${embedUrl ? 'display:block;' : 'display:none;'}">
          <iframe id="youtube-iframe" src="${embedUrl || ''}" allowfullscreen></iframe>
        </div>
      </div>

      <!-- PHOTOS MANAGEMENT SECTION -->
      <div class="form-group">
        <label style="display:flex;justify-content:space-between;align-items:center;">
          <span>Product Photos Gallery</span>
          <span style="font-size:11px;color:var(--admin-text-secondary);">${currentEditPhotos.length} photo(s)</span>
        </label>
        
        <div style="display:flex;gap:8px;margin-bottom:10px;">
          <input type="text" id="pf-new-photo-url" class="form-control" placeholder="Enter Photo Image URL (e.g. images/A.jpeg or https://...)">
          <button type="button" class="btn-action primary" onclick="addPhotoUrl()" style="white-space:nowrap;padding:8px 14px;">+ Add Photo</button>
        </div>

        <div class="photo-gallery-preview" id="photoGalleryContainer">
          ${renderPhotoThumbsHTML()}
        </div>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:24px;">
        <button type="button" class="btn-action" onclick="closeModal('productModal')">Cancel</button>
        <button type="submit" class="btn-action primary" id="btnSaveProduct">${productId ? 'Save Changes' : 'Create Product'}</button>
      </div>
    </form>
  `;
}

function renderPhotoThumbsHTML() {
  if (!currentEditPhotos.length) {
    return `<div style="grid-column:1/-1;font-size:12px;color:var(--admin-text-secondary);text-align:center;padding:12px;">No photos added yet. Add an image URL above.</div>`;
  }
  return currentEditPhotos.map((url, idx) => `
    <div class="photo-thumb-box">
      <img src="${escapeHtml(url)}" onerror="this.src='images/A.jpeg'" alt="Photo ${idx + 1}">
      <button type="button" class="btn-remove-photo" onclick="removePhoto(${idx})" title="Remove photo">&times;</button>
    </div>
  `).join('');
}

function addPhotoUrl() {
  const input = document.getElementById('pf-new-photo-url');
  const url = (input.value || '').trim();
  if (!url) return;
  currentEditPhotos.push(url);
  input.value = '';
  document.getElementById('photoGalleryContainer').innerHTML = renderPhotoThumbsHTML();
}

function removePhoto(index) {
  currentEditPhotos.splice(index, 1);
  document.getElementById('photoGalleryContainer').innerHTML = renderPhotoThumbsHTML();
}

function updateYouTubePreview(url) {
  const container = document.getElementById('youtube-preview-container');
  const iframe = document.getElementById('youtube-iframe');
  const embed = parseYouTubeEmbed(url);

  if (embed) {
    iframe.src = embed;
    container.style.display = 'block';
  } else {
    iframe.src = '';
    container.style.display = 'none';
  }
}

async function handleProductFormSubmit(e, productId) {
  e.preventDefault();
  const btn = document.getElementById('btnSaveProduct');
  btn.innerText = 'Saving…';
  btn.disabled = true;

  const payload = {
    name: document.getElementById('pf-name').value.trim(),
    price: parseFloat(document.getElementById('pf-price').value),
    sku: document.getElementById('pf-sku').value.trim(),
    description: document.getElementById('pf-description').value.trim(),
    youtubeUrl: document.getElementById('pf-youtube').value.trim() || null,
    imageUrls: currentEditPhotos
  };

  try {
    if (productId) {
      await api(`/products/${productId}`, 'PUT', payload);
      alert('Product updated successfully!');
    } else {
      await api('/products', 'POST', payload);
      alert('Product created successfully!');
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
