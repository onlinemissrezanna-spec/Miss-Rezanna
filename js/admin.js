// MISS REZANNA - Admin Dashboard Portal Logic
const API_BASE_URL = 'https://miss-rezanna-production.up.railway.app/api/v1';

let adminToken = localStorage.getItem('mr_admin_token') || null;
let allOrders = [];

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

// Check Auth state
function checkAuth() {
    const loginOverlay = document.getElementById('loginOverlay');
    if (adminToken) {
        loginOverlay.style.display = 'none';
        fetchAdminDashboardData();
    } else {
        loginOverlay.style.display = 'flex';
    }
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const btnSubmit = document.getElementById('btnSubmitLogin');

    btnSubmit.innerText = 'Verifying Credentials...';
    btnSubmit.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Confirm the user is actually an Admin
            if (data.data.user.role && data.data.user.role.name === 'Admin') {
                adminToken = data.data.accessToken;
                localStorage.setItem('mr_admin_token', adminToken);
                checkAuth();
            } else {
                throw new Error('Access denied. You do not have administrator privileges.');
            }
        } else {
            throw new Error(data.message || 'Login failed. Invalid email or password.');
        }
    } catch (err) {
        alert(err.message);
    } finally {
        btnSubmit.innerText = 'Secure Sign In';
        btnSubmit.disabled = false;
    }
}

// Sign Out
function logoutAdmin() {
    localStorage.removeItem('mr_admin_token');
    adminToken = null;
    checkAuth();
}

// Fetch Admin Orders & Calculate Stats
async function fetchAdminDashboardData() {
    const tableBody = document.getElementById('orders-table-body');
    try {
        const response = await fetch(`${API_BASE_URL}/orders?limit=100`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            allOrders = data.data.orders || [];
            renderStats();
            renderOrdersTable();
        } else {
            throw new Error(data.message || 'Failed to fetch dashboard data.');
        }
    } catch (err) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-error); padding: 40px;">Error loading orders: ${err.message}</td></tr>`;
    }
}

// Render Metrics / Statistics
function renderStats() {
    const totalOrders = allOrders.length;
    const revenue = allOrders
        .filter(order => order.paymentStatus === 'Paid')
        .reduce((sum, order) => sum + parseFloat(order.grandTotal), 0);
    const pendingFulfillment = allOrders.filter(order => order.orderStatus !== 'Delivered').length;

    document.getElementById('stat-total-orders').innerText = totalOrders;
    document.getElementById('stat-revenue').innerText = `₹ ${revenue.toLocaleString()}`;
    document.getElementById('stat-pending').innerText = pendingFulfillment;
}

// Render Orders Table
function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    
    if (allOrders.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: #666; padding: 40px;">No orders have been placed yet.</td></tr>`;
        return;
    }

    tableBody.innerHTML = allOrders.map(order => {
        const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const custName = order.user ? `${order.user.firstName || 'Guest'} ${order.user.lastName || ''}`.trim() : 'Guest';
        const custEmail = order.user ? order.user.email : '-';

        return `
            <tr>
              <td><strong>${order.orderNumber}</strong></td>
              <td>${dateStr}</td>
              <td>
                <div>${custName}</div>
                <div style="font-size: 12px; color: #666;">${custEmail}</div>
              </td>
              <td>₹ ${parseFloat(order.grandTotal).toLocaleString()}</td>
              <td>
                <span class="badge ${order.paymentStatus === 'Paid' ? 'badge-paid' : 'badge-pending'}">${order.paymentStatus}</span>
              </td>
              <td>
                <select class="status-select" onchange="updateFulfillmentStatus(${order.id}, this.value)">
                  <option value="Pending" ${order.orderStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                  <option value="Confirmed" ${order.orderStatus === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                  <option value="Shipped" ${order.orderStatus === 'Shipped' ? 'selected' : ''}>Shipped</option>
                  <option value="Delivered" ${order.orderStatus === 'Delivered' ? 'selected' : ''}>Delivered</option>
                </select>
              </td>
              <td>
                <button class="btn-logout" style="padding: 6px 12px; border-color: #ddd;" onclick="viewOrderDetails(${order.id})">View Details</button>
              </td>
            </tr>
        `;
    }).join('');
}

// Update Order Status on Backend
async function updateFulfillmentStatus(orderId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({ status })
        });
        const data = await response.json();

        if (response.ok && data.success) {
            // Update local memory and re-render stats
            const orderIdx = allOrders.findIndex(o => o.id === orderId);
            if (orderIdx !== -1) {
                allOrders[orderIdx].orderStatus = status;
                renderStats();
            }
        } else {
            throw new Error(data.message || 'Fulfillment update failed.');
        }
    } catch (err) {
        alert('Error updating order status: ' + err.message);
        fetchAdminDashboardData(); // Refresh UI
    }
}

// View Details Modal Popup
async function viewOrderDetails(orderId) {
    const modal = document.getElementById('detailsModal');
    const content = document.getElementById('modalContent');
    const title = document.getElementById('modalOrderNumber');

    modal.style.display = 'flex';
    content.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Retrieving order contents...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        const data = await response.json();

        if (response.ok && data.success) {
            const order = data.data;
            title.innerText = `Order Detail: ${order.orderNumber}`;

            const addr = order.shippingAddress || {};
            const itemsList = order.items || [];

            content.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                  <div>
                    <div class="details-label">Fulfillment Summary</div>
                    <div class="details-row">Status: <strong>${order.orderStatus}</strong></div>
                    <div class="details-row">Payment Status: <strong>${order.paymentStatus}</strong></div>
                  </div>
                  <div>
                    <div class="details-label">Customer Contact</div>
                    <div class="details-row">${order.user ? `${order.user.firstName || 'Guest'} ${order.user.lastName || ''}`.trim() : 'Guest'}</div>
                    <div class="details-row" style="color: #666;">${order.user ? order.user.email : ''}</div>
                  </div>
                </div>

                <div style="margin-bottom: 24px;">
                  <div class="details-label">Delivery Address</div>
                  <div class="details-row" style="line-height: 1.5;">
                    ${addr.fullName || 'Guest Customer'}<br>
                    ${addr.addressLine1 || ''}, ${addr.city || ''}<br>
                    ${addr.state || ''} - ${addr.postalCode || ''}<br>
                    Country: ${addr.country || 'India'}<br>
                    Phone: ${addr.phone || '9999999999'}
                  </div>
                </div>

                <div class="order-items-list">
                  <div class="details-label">Items Ordered</div>
                  ${itemsList.map(item => `
                    <div class="order-item-detail">
                      <div>
                        <strong>${item.product ? item.product.name : 'Mulberry Silk Product'}</strong>
                        <div style="font-size: 12px; color: #666;">Size: ${item.size || 'M'} | Color: ${item.color || 'Standard'}</div>
                      </div>
                      <div style="text-align: right;">
                        <div>₹ ${parseFloat(item.price).toLocaleString()}</div>
                        <div style="font-size: 12px; color: #666;">Qty: ${item.quantity || 1}</div>
                      </div>
                    </div>
                  `).join('')}
                  <div style="display: flex; justify-content: space-between; font-weight: 600; margin-top: 16px; font-size: 16px;">
                    <span>Grand Total</span>
                    <span>₹ ${parseFloat(order.grandTotal).toLocaleString()}</span>
                  </div>
                </div>
            `;
        } else {
            throw new Error(data.message || 'Failed to fetch details');
        }
    } catch (err) {
        content.innerHTML = `<div style="color: var(--color-error); padding: 40px;">Error loading details: ${err.message}</div>`;
    }
}

// Close Modal
function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
}
