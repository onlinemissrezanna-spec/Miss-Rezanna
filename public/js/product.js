document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Accordion Logic
  window.toggleAccordion = function(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('i');
    
    // Close others
    document.querySelectorAll('.accordion-content').forEach(el => {
      if(el !== content) {
        el.style.display = 'none';
        if (el.previousElementSibling.querySelector('i')) {
          el.previousElementSibling.querySelector('i').setAttribute('data-lucide', 'plus');
        }
      }
    });
    
    if (content.style.display === 'block') {
      content.style.display = 'none';
      if (icon) icon.setAttribute('data-lucide', 'plus');
    } else {
      content.style.display = 'block';
      if (icon) icon.setAttribute('data-lucide', 'minus');
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // Size Selection Logic
  const sizeBtns = document.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Mobile Gallery Scroll Dots Logic
  const gallery = document.getElementById('pdpGallery');
  const dots = document.querySelectorAll('.pdp-dot');
  
  if (gallery && dots.length > 0) {
    gallery.addEventListener('scroll', () => {
      const scrollPosition = gallery.scrollLeft;
      const width = gallery.clientWidth;
      const index = Math.round(scrollPosition / width);
      
      dots.forEach((dot, i) => {
        if (i === index) dot.classList.add('active');
        else dot.classList.remove('active');
      });
    });
  }

  // Sticky Action Bar Observer
  const mainActions = document.getElementById('mainActions');
  const stickyBar = document.getElementById('stickyActionBar');
  
  if (mainActions && stickyBar) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          stickyBar.classList.add('visible');
        } else {
          stickyBar.classList.remove('visible');
        }
      });
    }, { threshold: 0 });

    observer.observe(mainActions);
  }
});

// Helper function to bind Add to Cart / Buy Now buttons
function bindAddToCartButtons(currentProduct) {
  const activeSizeBtn = document.querySelector('.size-btn.active');
  const size = activeSizeBtn ? activeSizeBtn.innerText.trim() : 'M';
  
  const name = currentProduct ? currentProduct.name : (document.getElementById('pdp-title')?.innerText || 'Midnight Silk Kurti');
  const price = currentProduct ? currentProduct.price : (document.getElementById('pdp-price')?.innerText || '₹ 3,000');
  
  let img = 'images/A.jpeg';
  if (currentProduct && currentProduct.images && currentProduct.images.length > 0) {
      img = currentProduct.images[0];
  } else {
      const firstImg = document.querySelector('.pdp-img');
      if (firstImg) img = firstImg.getAttribute('src');
  }

  document.querySelectorAll('.btn-add, .btn-buy').forEach(btn => {
      btn.onclick = (e) => {
          if (typeof addToCart === 'function') {
              addToCart(e, name, price, img, size, 'Standard');
          } else {
              console.warn('addToCart function missing, redirecting to cart page.');
              window.location.href = 'cart.html';
          }
      };
  });
}

// Immediate binding on DOM Ready for instant responsiveness
document.addEventListener('DOMContentLoaded', () => {
  bindAddToCartButtons(null);

  // Re-bind when size changes
  document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          setTimeout(() => bindAddToCartButtons(window.activeProduct || null), 10);
      });
  });
});

const staticProductCatalog = {
  'navy-blue-embroidered-kurta-pant-set': {
    name: 'Navy Blue Floral Embroidered Kurta Pant Set',
    seoTitle: 'Navy Blue Embroidered Kurta Pant Set for Women | MISS REZANNA',
    metaDesc: 'Shop the navy blue embroidered kurta pant set by MISS REZANNA, featuring intricate floral embroidery and a sophisticated contemporary silhouette.',
    price: '₹ 4,500',
    label: 'Festive Edit · Kurta Pant Set',
    images: [
      'images/navy-blue-embroidered-kurta-pant-set-3.png',
      'images/navy-blue-embroidered-kurta-pant-set-1.png',
      'images/navy-blue-embroidered-kurta-pant-set-2.png',
      'images/navy-blue-embroidered-kurta-pant-set-4.png',
      'images/navy-blue-embroidered-kurta-pant-set-5.png'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">A deeper expression of contemporary Indian elegance.</p>
      <p style="margin-bottom: 16px; font-weight: 500;">A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Elegance Meets Contemporary Craftsmanship</h4>
      <p style="margin-bottom: 12px;">This sophisticated navy blue kurta pant set features intricate floral embroidery across the front and sleeves, creating a beautifully balanced statement while keeping the overall look refined.</p>
      <p style="margin-bottom: 12px;">The deep navy base gives the ensemble a timeless character, while the delicate multicolour floral detailing adds depth and individuality. Paired with matching straight-cut pants, the set creates an effortlessly polished silhouette.</p>
      <p style="margin-bottom: 16px;">Designed for women who prefer graceful dressing without excessive embellishment, this ensemble transitions beautifully from festive gatherings to intimate celebrations and elegant evening occasions.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style It With:</strong> Minimal earrings, delicate bracelets, and classic heels for a polished, occasion-ready look.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Product Highlights</h4>
      <ul style="padding-left: 20px; margin-bottom: 20px; line-height: 1.8;">
        <li>Intricate multicolour floral thread embroidery</li>
        <li>Rich, deep navy blue colour palette</li>
        <li>Coordinated 2-piece Kurta &amp; Pant set</li>
        <li>Contemporary ethnic silhouette with side slits</li>
        <li>Elegant 3/4 sleeves with embroidered sleeve cuffs</li>
        <li>Refined Mandarin / keyhole neckline</li>
        <li>Designed for versatile festive &amp; evening celebrations</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Garment Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Set Includes:</td><td style="padding: 8px 0;">1 Kurta + 1 Coordinated Pant</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Colour:</td><td style="padding: 8px 0;">Navy Blue</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Pattern:</td><td style="padding: 8px 0;">Multicolour Floral Embroidery</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Neckline:</td><td style="padding: 8px 0;">Mandarin / Keyhole Neck</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Sleeves:</td><td style="padding: 8px 0;">3/4 Sleeves</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fit:</td><td style="padding: 8px 0;">Relaxed / Regular Fit</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Pant Style:</td><td style="padding: 8px 0;">Full-Length Straight Cut</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Occasion:</td><td style="padding: 8px 0;">Festive, Evening, Dinner, Family Gatherings</td></tr>
      </table>
    `
  }
};

// Dynamic Product Loading from API
document.addEventListener('DOMContentLoaded', async () => {
  let currentProductCatalog = {};
  if (typeof fetchProducts === 'function') {
      try {
          currentProductCatalog = await fetchProducts();
      } catch (err) {
          console.warn('Could not fetch dynamic catalog, using static fallback:', err);
      }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'navy-blue-embroidered-kurta-pant-set';
  
  const product = (currentProductCatalog && currentProductCatalog[productId]) 
    ? currentProductCatalog[productId] 
    : (staticProductCatalog[productId] || staticProductCatalog['navy-blue-embroidered-kurta-pant-set']);

  if (product) {
      window.activeProduct = product;
      
      // Update Title & Meta
      document.title = product.seoTitle || `${product.name} | MISS REZANNA`;
      
      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl && product.metaDesc) metaDescEl.setAttribute('content', product.metaDesc);
      
      // Update DOM Elements
      if (document.getElementById('pdp-title')) document.getElementById('pdp-title').innerText = product.name;
      if (document.getElementById('pdp-price')) document.getElementById('pdp-price').innerText = product.price;
      if (document.getElementById('pdp-label')) document.getElementById('pdp-label').innerText = product.label || 'Festive Edit';
      if (document.getElementById('pdp-desc')) document.getElementById('pdp-desc').innerHTML = product.description || '';
      
      // Sticky Bar
      if (document.getElementById('sticky-title')) document.getElementById('sticky-title').innerText = product.name;
      if (document.getElementById('sticky-price')) document.getElementById('sticky-price').innerText = product.price;
      
      // Images
      const gallery = document.getElementById('pdpGallery');
      if (gallery && product.images && product.images.length > 0) {
        gallery.innerHTML = product.images.map(img => `
            <div class="pdp-img-wrapper">
              <img src="${img}" alt="${product.name} for Women by MISS REZANNA" class="pdp-img">
            </div>
        `).join('');
      }
      
      // Dots
      const dotsContainer = document.querySelector('.pdp-gallery-dots');
      if (dotsContainer && product.images && product.images.length > 0) {
        dotsContainer.innerHTML = product.images.map((_, i) => `
            <div class="pdp-dot ${i === 0 ? 'active' : ''}"></div>
        `).join('');
      }

      // Re-bind buttons with dynamic product data
      bindAddToCartButtons(product);
  }
});
