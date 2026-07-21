// MISS REZANNA - E-Commerce Cart Logic

// Initialize Cart
let cart = JSON.parse(localStorage.getItem('mr_cart')) || [];

// Save Cart
function saveCart() {
    localStorage.setItem('mr_cart', JSON.stringify(cart));
    updateCartBadge();
}

// Add Item
function addToCart(event, name, priceStr, img, size = 'M', color = 'Standard') {
    // If the click came from a link, we might not want to prevent default if we want to redirect to cart page immediately
    // but we can prevent default, save, and then redirect manually to ensure it saves.
    if(event) {
        event.preventDefault();
    }
    
    // Parse price string to number
    const priceNum = parseInt(priceStr.replace(/[^0-9]/g, ''), 10);
    
    const existingItem = cart.find(item => item.name === name && item.size === size);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: Date.now(),
            name: name,
            price: priceNum,
            priceStr: priceStr,
            img: img,
            size: size,
            color: color,
            qty: 1
        });
    }
    
    saveCart();
    
    // Redirect to cart
    window.location.href = 'cart.html';
}

// Remove Item
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
}

// Update Quantity
function updateQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            renderCart();
        }
    }
}

// Update Badge in Header
function updateCartBadge() {
    // Count total items
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    
    // Find cart icons in header
    const cartBtns = document.querySelectorAll('a[aria-label="Cart"], button[aria-label="Cart"]');
    
    cartBtns.forEach(btn => {
        // If badge doesn't exist, create it
        let badge = btn.querySelector('.cart-badge');
        if (!badge && totalItems > 0) {
            btn.style.position = 'relative';
            badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.style.position = 'absolute';
            badge.style.top = '-5px';
            badge.style.right = '-5px';
            badge.style.backgroundColor = 'var(--color-accent-magenta)';
            badge.style.color = '#fff';
            badge.style.fontSize = '10px';
            badge.style.fontWeight = 'bold';
            badge.style.padding = '2px 5px';
            badge.style.borderRadius = '10px';
            btn.appendChild(badge);
        }
        
        if (totalItems > 0) {
            badge.innerText = totalItems;
        } else if (badge) {
            badge.remove();
        }
    });
}

// Render Cart Page (Only runs if on cart.html)
function renderCart() {
    const cartContainer = document.querySelector('.cart-items');
    if (!cartContainer) return; // Not on cart page
    
    const countLabel = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    if(countLabel) countLabel.innerText = `${totalItems} Item${totalItems !== 1 ? 's' : ''}`;
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div style="padding: 40px; text-align: center; border-bottom: 1px solid var(--color-border);">
                <h3 style="font-family: var(--font-heading); margin-bottom: 16px;">Your bag is currently empty.</h3>
                <a href="index.html" style="color: var(--color-text-primary);">Continue Shopping</a>
            </div>
        `;
    } else {
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
              <img src="${item.img}" alt="${item.name}" class="item-img">
              <div class="item-details">
                <span class="item-brand">MISS REZANNA</span>
                <h3 class="item-name">${item.name}</h3>
                <span class="item-meta">Size: ${item.size} | Color: ${item.color}</span>
                <span class="item-price">₹ ${item.price.toLocaleString()}</span>
              </div>
              <div class="item-actions">
                <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                <div class="qty-selector">
                  <button class="qty-btn" aria-label="Decrease quantity" onclick="updateQty(${item.id}, -1)">-</button>
                  <input type="text" class="qty-input" value="${item.qty}" readonly>
                  <button class="qty-btn" aria-label="Increase quantity" onclick="updateQty(${item.id}, 1)">+</button>
                </div>
              </div>
            </div>
        `).join('');
    }
    
    // Update Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const subtotalEls = document.querySelectorAll('.summary-row:first-of-type span:last-child, .summary-total span:last-child');
    
    subtotalEls.forEach(el => {
        el.innerText = `₹ ${subtotal.toLocaleString()}`;
    });
}

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
});
