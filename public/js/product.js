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

  // ========== IMAGE SLIDER CONTROLLER ==========
  let currentSlide = 0;
  let totalSlides = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  function initSlider() {
    const track = document.getElementById('pdpGallery');
    const slides = track ? track.querySelectorAll('.pdp-img-wrapper') : [];
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    goToSlide(0);
    buildThumbnails();

    // Arrow buttons
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

    // Touch swipe on slider
    const slider = document.getElementById('pdpSlider');
    if (slider) {
      slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      slider.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 40) {
          if (diff > 0) goToSlide(currentSlide + 1); // swipe left = next
          else goToSlide(currentSlide - 1); // swipe right = prev
        }
      });
    }

    // Dot clicks
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
      dotsContainer.addEventListener('click', (e) => {
        const dot = e.target.closest('.pdp-dot');
        if (!dot) return;
        const allDots = Array.from(dotsContainer.querySelectorAll('.pdp-dot'));
        const idx = allDots.indexOf(dot);
        if (idx >= 0) goToSlide(idx);
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1);
      if (e.key === 'ArrowRight') goToSlide(currentSlide + 1);
    });
  }

  function goToSlide(index) {
    if (totalSlides === 0) return;
    // Loop around
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    // Move track
    const track = document.getElementById('pdpGallery');
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update counter
    const counter = document.getElementById('sliderCounter');
    if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;

    // Update dots
    const dots = document.querySelectorAll('#sliderDots .pdp-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    // Update thumbnails
    const thumbs = document.querySelectorAll('.slider-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentSlide);
    });
  }

  function buildThumbnails() {
    const track = document.getElementById('pdpGallery');
    const thumbsContainer = document.getElementById('sliderThumbs');
    if (!track || !thumbsContainer) return;
    const images = track.querySelectorAll('.pdp-img');
    thumbsContainer.innerHTML = '';
    images.forEach((img, i) => {
      const thumb = document.createElement('div');
      thumb.className = 'slider-thumb' + (i === 0 ? ' active' : '');
      thumb.innerHTML = `<img src="${img.src}" alt="Thumbnail ${i + 1}">`;
      thumb.addEventListener('click', () => goToSlide(i));
      thumbsContainer.appendChild(thumb);
    });
  }

  // Initialize slider
  initSlider();

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
      'images/navy-blue-embroidered-kurta-pant-set-1.png',
      'images/navy-blue-embroidered-kurta-pant-set-2.png',
      'images/navy-blue-embroidered-kurta-pant-set-3.png',
      'images/navy-blue-embroidered-kurta-pant-set-4.jpg',
      'images/navy-blue-embroidered-kurta-pant-set-5.jpg'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">A deeper expression of contemporary Indian elegance.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">A refined navy blue kurta pant set featuring intricate multicolour floral embroidery, designed for the modern woman who appreciates understated elegance.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Elegance Meets Contemporary Indian Craftsmanship</h4>
      <p style="margin-bottom: 12px;">This sophisticated navy blue kurta pant set features intricate floral embroidery across the front and sleeves, creating a beautifully balanced statement while keeping the overall look refined.</p>
      <p style="margin-bottom: 12px;">The deep navy base gives the ensemble a timeless character, while the delicate multicolour floral detailing adds depth and individuality. Paired with matching straight-cut pants, the set creates an effortlessly polished silhouette.</p>
      <p style="margin-bottom: 16px;">Designed for women who prefer graceful dressing without excessive embellishment, this ensemble transitions beautifully from festive gatherings to intimate celebrations and elegant evening occasions.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style It With:</strong> Minimal earrings, delicate bracelets and classic heels for a polished occasion-ready look.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Product Highlights</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ Intricate floral embroidery</li>
        <li>✦ Rich navy blue colour</li>
        <li>✦ Coordinated kurta and pant set</li>
        <li>✦ Contemporary ethnic silhouette</li>
        <li>✦ Elegant 3/4 sleeves</li>
        <li>✦ Refined Mandarin neckline</li>
        <li>✦ Designed for versatile occasions</li>
        <li>✦ Premium statement look with understated elegance</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Kurta Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Navy Blue</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Multicolour Floral Embroidery</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Neck:</td><td style="padding: 8px 0;">Mandarin / Keyhole Neck</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Sleeves:</td><td style="padding: 8px 0;">3/4 Sleeve</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Silhouette:</td><td style="padding: 8px 0;">Straight / Relaxed Fit</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Length:</td><td style="padding: 8px 0;">Long Kurta</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Front:</td><td style="padding: 8px 0;">Embroidered Front &amp; Sleeves</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Side Slit:</td><td style="padding: 8px 0;">Yes</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Hem:</td><td style="padding: 8px 0;">Embroidered Border</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Closure:</td><td style="padding: 8px 0;">Front neckline opening</td></tr>
      </table>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">👖 Pant Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Matching Navy Blue</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Style:</td><td style="padding: 8px 0;">Straight / Wide Straight</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fit:</td><td style="padding: 8px 0;">Regular Fit</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Length:</td><td style="padding: 8px 0;">Full Length</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Pattern:</td><td style="padding: 8px 0;">Solid</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Set Type:</td><td style="padding: 8px 0;">Coordinated Bottom</td></tr>
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
      
      // Images — rebuild slider
      const gallery = document.getElementById('pdpGallery');
      if (gallery && product.images && product.images.length > 0) {
        gallery.innerHTML = product.images.map(img => `
            <div class="pdp-img-wrapper">
              <img src="${img}" alt="${product.name} for Women by MISS REZANNA" class="pdp-img">
            </div>
        `).join('');
      }
      
      // Dots — rebuild for slider
      const dotsContainer = document.getElementById('sliderDots');
      if (dotsContainer && product.images && product.images.length > 0) {
        dotsContainer.innerHTML = product.images.map((_, i) => `
            <div class="pdp-dot ${i === 0 ? 'active' : ''}"></div>
        `).join('');
      }

      // Counter
      const counter = document.getElementById('sliderCounter');
      if (counter && product.images) {
        counter.textContent = `1 / ${product.images.length}`;
      }

      // Rebuild thumbnails & re-init slider state
      totalSlides = product.images ? product.images.length : 0;
      currentSlide = 0;
      buildThumbnails();

      // Re-bind buttons with dynamic product data
      bindAddToCartButtons(product);
  }
});
