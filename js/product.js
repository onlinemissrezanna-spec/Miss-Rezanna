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
  const productId = urlParams.get('id') || 'midnight-kurti';
  
  if (currentProductCatalog && currentProductCatalog[productId]) {
      const product = currentProductCatalog[productId];
      window.activeProduct = product;
      
      // Update Title & Meta
      document.title = `${product.name} - MISS REZANNA`;
      
      // Update DOM Elements
      if (document.getElementById('pdp-title')) document.getElementById('pdp-title').innerText = product.name;
      if (document.getElementById('pdp-price')) document.getElementById('pdp-price').innerText = product.price;
      if (document.getElementById('pdp-label')) document.getElementById('pdp-label').innerText = product.label || 'Festive Edit';
      if (document.getElementById('pdp-desc')) document.getElementById('pdp-desc').innerText = product.description || '';
      
      // Sticky Bar
      if (document.getElementById('sticky-title')) document.getElementById('sticky-title').innerText = product.name;
      if (document.getElementById('sticky-price')) document.getElementById('sticky-price').innerText = product.price;
      
      // Images
      const gallery = document.getElementById('pdpGallery');
      if (gallery && product.images && product.images.length > 0) {
        gallery.innerHTML = product.images.map(img => `
            <div class="pdp-img-wrapper">
              <img src="${img}" alt="${product.name}" class="pdp-img">
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
