document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  // Accordion Logic
  window.toggleAccordion = function(button) {
    const content = button.nextElementSibling;
    const icon = button.querySelector('i');
    
    // Close others
    document.querySelectorAll('.accordion-content').forEach(el => {
      if(el !== content) {
        el.style.display = 'none';
        el.previousElementSibling.querySelector('i').setAttribute('data-lucide', 'plus');
      }
    });
    
    if (content.style.display === 'block') {
      content.style.display = 'none';
      icon.setAttribute('data-lucide', 'plus');
    } else {
      content.style.display = 'block';
      icon.setAttribute('data-lucide', 'minus');
    }
    lucide.createIcons();
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
      // Calculate which image is mostly in view
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
    // When the main actions scroll OUT of view, show the sticky bar
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // We only care if we've scrolled PAST it (it's above the viewport)
        // If it's not intersecting and bounding box is negative, it's above us.
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

// Load Product Data from URL ID
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'midnight-kurti'; // Default if none
  
  // Use catalog if available (requires catalog.js to be loaded)
  if (typeof productCatalog !== 'undefined' && productCatalog[productId]) {
      const product = productCatalog[productId];
      
      // Update Title & Meta
      document.title = `${product.name} - MISS REZANNA`;
      
      // Update DOM Elements
      document.getElementById('pdp-title').innerText = product.name;
      document.getElementById('pdp-price').innerText = product.price;
      document.getElementById('pdp-label').innerText = product.label;
      document.getElementById('pdp-desc').innerText = product.description;
      
      // Sticky Bar
      document.getElementById('sticky-title').innerText = product.name;
      document.getElementById('sticky-price').innerText = product.price;
      
      // Images
      const gallery = document.getElementById('pdpGallery');
      gallery.innerHTML = product.images.map(img => `
          <div class="pdp-img-wrapper">
            <img src="${img}" alt="${product.name}" class="pdp-img">
          </div>
      `).join('');
      
      // Dots
      const dotsContainer = document.querySelector('.pdp-gallery-dots');
      dotsContainer.innerHTML = product.images.map((_, i) => `
          <div class="pdp-dot ${i === 0 ? 'active' : ''}"></div>
      `).join('');

      // Add to Cart Button Logic Update
      const updateCartButtons = () => {
          const activeSizeBtn = document.querySelector('.size-btn.active');
          const size = activeSizeBtn ? activeSizeBtn.innerText : 'M';
          
          document.querySelectorAll('.btn-add, .btn-buy').forEach(btn => {
              btn.onclick = (e) => addToCart(e, product.name, product.price, product.images[0], size, 'Standard');
          });
      };
      
      // Initialize buttons
      updateCartButtons();
      
      // Listen for size changes
      document.querySelectorAll('.size-btn').forEach(btn => {
          btn.addEventListener('click', () => {
              // Wait a tick for active class to apply
              setTimeout(updateCartButtons, 10); 
          });
      });
  }
});
