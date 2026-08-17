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
    description: `A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.<br><br><strong>Elegance meets contemporary Indian craftsmanship.</strong><br><br>This sophisticated navy blue kurta pant set features intricate floral embroidery across the front and sleeves, creating a beautifully balanced statement while keeping the overall look refined.<br><br>The deep navy base gives the ensemble a timeless character, while the delicate multicolour floral detailing adds depth and individuality. Paired with matching straight-cut pants, the set creates an effortlessly polished silhouette.<br><br>Designed for women who prefer graceful dressing without excessive embellishment, this ensemble transitions beautifully from festive gatherings to intimate celebrations and elegant evening occasions.<br><br><em>Style it with: minimal earrings, delicate bracelets and classic heels for a polished occasion-ready look.</em><br><br><strong>✦ Key Product Highlights</strong><br>• Intricate multicolour floral embroidery<br>• Rich navy blue colour palette<br>• Coordinated 2-piece kurta and pant set<br>• Contemporary ethnic silhouette<br>• Elegant 3/4 sleeves<br>• Refined Mandarin / keyhole neckline<br>• Designed for versatile festive & evening occasions`
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
