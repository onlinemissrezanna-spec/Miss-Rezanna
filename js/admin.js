// MISS REZANNA — Admin Portal JavaScript
// Connects to all backend API endpoints

const API = 'https://miss-rezanna-production.up.railway.app/api/v1';
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
    loadDashboard();
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
      if (!user.role || user.role.name !== 'Admin') {
        throw new Error('Access denied. Admin privileges required.');
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
// PRODUCTS
// =============================================
async function loadProducts() {
  const container = document.getElementById('products-grid-container');
  container.innerHTML = '<div class="loading-text">Loading products…</div>';

  try {
    const data = await api('/products?limit=50');
    const products = data.products || [];

    if (!products.length) {
      container.innerHTML = '<div class="loading-text">No products found. Seed the database first.</div>';
      return;
    }

    container.innerHTML = products.map(p => {
      // Parse images
      let imgSrc = 'images/A.jpeg';
      try {
        const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
        if (Array.isArray(imgs) && imgs.length > 0) imgSrc = imgs[0];
        else if (p.images && Array.isArray(p.images) && p.images.length > 0) imgSrc = p.images[0].imageUrl || imgs[0];
      } catch (e) { }

      const price = p.basePrice || p.price || 0;
      const status = p.status || 'active';

      return `<div class="product-admin-card" onclick="viewProductDetail(${p.id})">
        <img src="${imgSrc}" class="product-admin-img" alt="${p.name}" onerror="this.src='images/A.jpeg'">
        <div class="product-admin-info">
          <div class="product-admin-name">${p.name}</div>
          <div class="product-admin-price">₹ ${parseFloat(price).toLocaleString('en-IN')}</div>
          <div class="product-admin-meta">
            <span>${p.category?.name || 'Uncategorised'}</span>
            <span class="badge badge-${status}">${status}</span>
          </div>
        </div>
      </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div class="loading-text" style="color:var(--admin-red)">Error: ${err.message}</div>`;
  }
}

async function viewProductDetail(productId) {
  const modal = document.getElementById('productModal');
  const body = document.getElementById('productModalBody');
  const title = document.getElementById('modalProductTitle');
  modal.classList.add('visible');
  body.innerHTML = '<div class="loading-text">Loading product…</div>';

  try {
    const p = await api(`/products/${productId}`);
    title.innerText = p.name;

    let imgSrc = 'images/A.jpeg';
    try {
      const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
      if (Array.isArray(imgs) && imgs.length) imgSrc = imgs[0];
      else if (Array.isArray(p.images) && p.images.length) imgSrc = p.images[0].imageUrl || imgSrc;
    } catch (e) {}

    body.innerHTML = `
      <img src="${imgSrc}" onerror="this.src='images/A.jpeg'" alt="${p.name}" style="width:100%;max-height:300px;object-fit:cover;border-radius:2px;margin-bottom:20px;">
      <div class="detail-grid">
        <div class="detail-group">
          <div class="detail-label">Price</div>
          <div class="detail-value">₹ ${parseFloat(p.basePrice || p.price || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="detail-group">
          <div class="detail-label">Status</div>
          <div class="detail-value"><span class="badge badge-${p.status || 'active'}">${p.status || 'Active'}</span></div>
        </div>
        <div class="detail-group">
          <div class="detail-label">Category</div>
          <div class="detail-value">${p.category?.name || '—'}</div>
        </div>
        <div class="detail-group">
          <div class="detail-label">SKU</div>
          <div class="detail-value" style="font-size:12px">${p.sku || '—'}</div>
        </div>
      </div>
      <div class="detail-label" style="margin-bottom:8px">Description</div>
      <div class="detail-value" style="font-size:13px;color:var(--admin-text-secondary);line-height:1.6">${p.description || p.shortDescription || '—'}</div>
    `;
  } catch (err) {
    body.innerHTML = `<div style="color:var(--admin-red);padding:20px">Error: ${err.message}</div>`;
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
