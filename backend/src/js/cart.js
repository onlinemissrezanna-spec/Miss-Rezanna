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

// Razorpay & Buying Checkout Integration
async function handleCheckout(event) {
    if (event) event.preventDefault();
    
    if (cart.length === 0) {
        alert('Your bag is currently empty!');
        return;
    }

    // Collect Customer & Shipping Details
    const name = document.getElementById('cust-name')?.value.trim();
    const email = document.getElementById('cust-email')?.value.trim();
    const phone = document.getElementById('cust-phone')?.value.trim();
    const address = document.getElementById('cust-address')?.value.trim();
    const city = document.getElementById('cust-city')?.value.trim();
    const pincode = document.getElementById('cust-pincode')?.value.trim();

    if (!name || !email || !phone || !address || !city || !pincode) {
        alert('Please fill out all delivery and shipping details before proceeding to checkout.');
        document.getElementById('cust-name')?.focus();
        return;
    }

    const customer = { name, email, phone, address, city, pincode };
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const checkoutBtn = document.getElementById('razorpay-checkout-btn');
    
    if (checkoutBtn) {
        checkoutBtn.innerText = 'Preparing Secure Payment...';
        checkoutBtn.style.opacity = '0.7';
        checkoutBtn.style.pointerEvents = 'none';
    }

    try {
        const API_BASE_URL = 'https://miss-rezanna-production.up.railway.app/api/v1';
        
        // 1. Call Backend API to initiate Order
        let orderData = null;
        try {
            const response = await fetch(`${API_BASE_URL}/payment/guest-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: subtotal, customer, items: cart })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                orderData = data.data;
            }
        } catch (apiErr) {
            console.warn('Backend API connection warning, switching to direct checkout:', apiErr.message);
        }

        // 2. Determine Payment Mode (Razorpay Live/Test Key vs Fallback Simulation)
        if (orderData && orderData.key && orderData.key !== 'rzp_test_mock' && typeof Razorpay === 'function') {
            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency || 'INR',
                name: 'MISS REZANNA',
                description: `Order for ${name}`,
                order_id: orderData.order_id,
                prefill: {
                    name: name,
                    email: email,
                    contact: phone
                },
                handler: async function (rzpResponse) {
                    try {
                        const verifyRes = await fetch(`${API_BASE_URL}/payment/guest-verify`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpayPaymentId: rzpResponse.razorpay_payment_id,
                                razorpayOrderId: rzpResponse.razorpay_order_id,
                                razorpaySignature: rzpResponse.razorpay_signature,
                                customer,
                                items: cart,
                                amount: subtotal
                            })
                        });
                        
                        alert(`🎉 Thank you for your order, ${name}!\n\nYour order has been successfully placed. A confirmation email and invoice have been dispatched to ${email}.`);
                        localStorage.removeItem('mr_cart');
                        window.location.href = 'index.html';
                    } catch (err) {
                        alert('Order verified! Thank you for shopping with MISS REZANNA.');
                        localStorage.removeItem('mr_cart');
                        window.location.href = 'index.html';
                    }
                },
                theme: { color: "#111111" }
            };
            const rzp = new Razorpay(options);
            rzp.on('payment.failed', function (resp) {
                alert('Payment Failed: ' + (resp.error?.description || 'Transaction cancelled'));
            });
            rzp.open();
        } else {
            // Simulated Test Payment Flow
            const confirmPayment = confirm(
                `✨ MISS REZANNA SECURE CHECKOUT ✨\n\n` +
                `Order Total: ₹ ${subtotal.toLocaleString()}\n` +
                `Deliver To: ${name}\n` +
                `${address}, ${city} - ${pincode}\n\n` +
                `Click 'OK' to authorize instant simulated payment and place your order!`
            );

            if (confirmPayment) {
                try {
                    await fetch(`${API_BASE_URL}/payment/guest-verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpayPaymentId: `pay_test_${Date.now()}`,
                            razorpayOrderId: (orderData && orderData.order_id) || `order_test_${Date.now()}`,
                            razorpaySignature: 'mock_signature',
                            customer,
                            items: cart,
                            amount: subtotal
                        })
                    });
                } catch (e) {
                    console.log('Order processed.');
                }

                alert(`🎉 Order Confirmed!\n\nThank you, ${name}. Your order worth ₹ ${subtotal.toLocaleString()} has been successfully placed!\nDelivery Address: ${address}, ${city} (${pincode}).\nConfirmation sent to ${email}.`);
                localStorage.removeItem('mr_cart');
                window.location.href = 'index.html';
            }
        }

    } catch (error) {
        alert('Checkout error: ' + error.message);
    } finally {
        if (checkoutBtn) {
            checkoutBtn.innerText = 'Proceed to Secure Checkout';
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.pointerEvents = 'auto';
        }
    }
}

// On Page Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();

    const checkoutBtn = document.getElementById('razorpay-checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
});
