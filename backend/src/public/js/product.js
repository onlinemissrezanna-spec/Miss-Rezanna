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
      const sz = btn.getAttribute('data-size') || btn.innerText.trim();
      const currentSelectedSize = document.getElementById('currentSelectedSize');
      if (currentSelectedSize) currentSelectedSize.innerText = sz;
    });
  });

  // Auto-restore saved pincode if present
  try {
    const savedPin = localStorage.getItem('mr_saved_pincode');
    if (savedPin) {
      const pinInput = document.getElementById('pincodeInput');
      if (pinInput) {
        pinInput.value = savedPin;
        window.checkPincodeDelivery();
      }
    }
  } catch(e) {}

  // ========== IMAGE SLIDER CONTROLLER ==========
  let currentSlide = 0;
  let totalSlides = 0;
  let touchStartX = 0;
  let touchEndX = 0;

  window.refreshSlider = function() {
    const track = document.getElementById('pdpGallery');
    const slides = track ? track.querySelectorAll('.pdp-img-wrapper') : [];
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    currentSlide = 0;
    
    // Rebuild dots
    const dotsContainer = document.getElementById('sliderDots');
    if (dotsContainer) {
      dotsContainer.innerHTML = Array.from(slides).map((_, i) => `
        <div class="pdp-dot ${i === 0 ? 'active' : ''}"></div>
      `).join('');
    }

    // Rebuild counter
    const counter = document.getElementById('sliderCounter');
    if (counter) counter.textContent = `1 / ${totalSlides}`;

    // Rebuild thumbnails
    const thumbsContainer = document.getElementById('sliderThumbs');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = Array.from(slides).map((slide, i) => {
        const img = slide.querySelector('img');
        const imgSrc = img ? img.getAttribute('src') : '';
        return `
          <div class="slider-thumb ${i === 0 ? 'active' : ''}" onclick="window.goToSlide(${i})">
            <img src="${imgSrc}" alt="Thumbnail ${i + 1}">
          </div>
        `;
      }).join('');
    }

    window.goToSlide(0);
  };

  window.goToSlide = function(index) {
    const track = document.getElementById('pdpGallery');
    const slides = track ? track.querySelectorAll('.pdp-img-wrapper') : [];
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentSlide = index;

    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

    const counter = document.getElementById('sliderCounter');
    if (counter) counter.textContent = `${currentSlide + 1} / ${totalSlides}`;

    const dots = document.querySelectorAll('#sliderDots .pdp-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });

    const thumbs = document.querySelectorAll('.slider-thumb');
    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle('active', i === currentSlide);
    });
  };

  // Arrow buttons
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');
  if (prevBtn) prevBtn.addEventListener('click', () => window.goToSlide(currentSlide - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => window.goToSlide(currentSlide + 1));

  // Touch swipe on slider
  const slider = document.getElementById('pdpSlider');
  if (slider) {
    slider.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) window.goToSlide(currentSlide + 1); // swipe left = next
        else window.goToSlide(currentSlide - 1); // swipe right = prev
      }
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') window.goToSlide(currentSlide - 1);
    if (e.key === 'ArrowRight') window.goToSlide(currentSlide + 1);
  });

  // Initialize slider
  window.refreshSlider();

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

// Helper function to bind Add to Cart / Buy Now buttons or Out-of-Stock state
function bindAddToCartButtons(currentProduct) {
  const isOutOfStock = currentProduct ? (currentProduct.inStock === false) : Boolean(window.SITE_CONFIG && window.SITE_CONFIG.ALL_PRODUCTS_OUT_OF_STOCK);

  const mainActions = document.getElementById('mainActions');
  const stickyBar = document.getElementById('stickyActionBar');

  const name = currentProduct ? currentProduct.name : (document.getElementById('pdp-title')?.innerText || 'Navy Blue Floral Embroidered Kurta Pant Set');
  const price = currentProduct ? currentProduct.price : (document.getElementById('pdp-price')?.innerText || '₹ 2,360');

  if (isOutOfStock) {
    // 1. Disable Main Actions and provide Out of Stock + WhatsApp notification + Waitlist
    if (mainActions) {
      mainActions.innerHTML = `
        <div class="pdp-stock-notice">Out of stock. Back soon.</div>
        <a href="https://wa.me/919877327186?text=Hello%20Miss%20Rezanna,%20please%20notify%20me%20when%20this%20is%20available%20again." target="_blank" rel="noopener noreferrer" class="btn-whatsapp-notify" aria-label="Get notified on WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:8px;"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
          Get notified on WhatsApp
        </a>
        <a href="index.html#waitlist" class="btn-waitlist-link">✦ Join the Winter Waitlist</a>
      `;
    }

    // 2. Disable Size Selectors (keep them visible but non-functional)
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.classList.add('disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('disabled', 'disabled');
    });

    // 3. Update Sticky Bottom Action Bar
    if (stickyBar) {
      stickyBar.innerHTML = `
        <div class="sticky-info">
          <span class="sticky-title" id="sticky-title">${name}</span>
          <span class="sticky-stock-msg">Out of stock. Back soon.</span>
        </div>
        <a href="https://wa.me/919877327186?text=Hello%20Miss%20Rezanna,%20please%20notify%20me%20when%20this%20is%20available%20again." target="_blank" rel="noopener noreferrer" class="btn-whatsapp-notify" style="padding: 10px 16px; font-size: 12px; min-height: 44px; flex: 1; max-width: 260px;">
          WhatsApp Notify
        </a>
      `;
    }

    // 4. Update JSON-LD Product availability to OutOfStock
    const schemaEl = document.querySelector('script[type="application/ld+json"]');
    if (schemaEl) {
      try {
        const schema = JSON.parse(schemaEl.textContent);
        if (schema && schema.offers) {
          schema.offers.availability = "https://schema.org/OutOfStock";
          schemaEl.textContent = JSON.stringify(schema, null, 2);
        }
      } catch (e) {}
    }

    return;
  }

  // Normal in-stock purchasing mode: ensure buttons exist and are active
  if (mainActions) {
    mainActions.innerHTML = `
      <button class="btn-pdp btn-add" id="btnAddToCart">Add to Bag</button>
      <button class="btn-pdp btn-buy" id="btnBuyNow">Buy it Now</button>
    `;
  }
  if (stickyBar) {
    stickyBar.innerHTML = `
      <div class="sticky-info">
        <span class="sticky-title" id="sticky-title">${name}</span>
        <span class="sticky-price" id="sticky-price">${price}</span>
      </div>
      <button class="btn-pdp btn-add">Add to Bag</button>
      <button class="btn-pdp btn-buy">Buy it Now</button>
    `;
  }

  // Enable all size buttons
  document.querySelectorAll('.size-btn').forEach(btn => {
    btn.classList.remove('disabled');
    btn.removeAttribute('aria-disabled');
    btn.removeAttribute('disabled');
  });

  const activeSizeBtn = document.querySelector('.size-btn.active');
  const size = activeSizeBtn ? activeSizeBtn.innerText.trim() : 'M';
  
  let img = 'images/black-embroidered-jacket-coord-set-1.jpg';
  if (currentProduct && currentProduct.images && currentProduct.images.length > 0) {
      img = currentProduct.images[0];
  } else {
      const firstImg = document.querySelector('.pdp-img');
      if (firstImg) img = firstImg.getAttribute('src');
  }

  document.querySelectorAll('.btn-add, .btn-buy').forEach(btn => {
      btn.removeAttribute('disabled');
      btn.removeAttribute('aria-disabled');
      btn.onclick = (e) => {
          const currentSize = (document.querySelector('.size-btn.active')?.innerText || 'M').trim();
          if (typeof addToCart === 'function') {
              addToCart(e, name, price, img, currentSize, 'Standard');
              if (btn.classList.contains('btn-buy')) {
                setTimeout(() => { window.location.href = 'cart.html'; }, 300);
              }
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
  'black-embroidered-jacket-coord-set': {
    id: 'black-embroidered-jacket-coord-set',
    name: 'Zuri Arch Embroidered Jacket & Trousers Co-ord Set - Noir Black',
    seoTitle: 'Black Embroidered Jacket Co-ord Set for Women | Summer Edit — MISS REZANNA',
    metaDesc: 'Shop the noir black embroidered jacket co-ord set by MISS REZANNA. Features antique gold arch threadwork, inner top & wide-leg trousers. Enjoy 25% off.',
    price: '₹ 2,771',
    mrp: '₹ 3,695',
    discount: '25% OFF',
    label: 'Summer Luxe · 3-Piece Co-ord Set',
    inStock: true,
    stock: 90,
    stockPerSize: { S: 10, M: 10, L: 10, XL: 10, '2XL': 10, '3XL': 10, '4XL': 10, '5XL': 10, '6XL': 10 },
    images: [
      'images/black-embroidered-jacket-coord-set-1.jpg'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">Understated luxury in a commanding noir palette.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">The Zuri 3-Piece Co-ord Set unites architectural grandeur with fluid summer ease. Tailored in an all-black silhouette, it features a structured open-front jacket adorned with majestic antique gold, ivory, and champagne arch threadwork, layered over a soft inner top and finished with tailored wide-leg trousers.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Artisanal Arch Needlework &amp; Modern Tailoring</h4>
      <p style="margin-bottom: 12px;">Crafted for women who command quiet confidence, the dramatic scalloped zardozi-inspired embroidery traces the lapels and bracelet-length cuffs, bringing vintage regal charm into everyday modern dressing.</p>
      <p style="margin-bottom: 12px;">The airy, breathable drape allows seamless comfort from daytime gallery visits to cocktail evenings under ambient starlight.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style Note:</strong> Pair with pointed stiletto pumps, minimal gold studs, and a sleek structured box clutch for an immaculate evening appearance.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Features</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ Complete 3-Piece Co-ord Set (Jacket, Inner Top &amp; Trousers)</li>
        <li>✦ Intricate antique gold &amp; champagne arch embroidery</li>
        <li>✦ Deep Noir Black premium breathable rayon-cotton fabric</li>
        <li>✦ Bracelet-length wide sleeves with embroidered cuffs</li>
        <li>✦ High-rise wide-leg palazzo trousers with relaxed comfort fit</li>
        <li>✦ Inclusive size availability from S up to 6XL</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Garment Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Noir Black &amp; Antique Gold</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fabric:</td><td style="padding: 8px 0;">Premium Breathable Rayon-Cotton Blend</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Resham &amp; Zardozi Arch Border Detailing</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Jacket Style:</td><td style="padding: 8px 0;">Open-Front Layered Overlay</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Trouser Style:</td><td style="padding: 8px 0;">Wide-Leg Palazzo with Elasticated Comfort Band</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Wash Care:</td><td style="padding: 8px 0;">Gentle Machine Wash or Dry Clean</td></tr>
      </table>
    `
  },
  'charcoal-floral-embroidered-tunic-coord-set': {
    id: 'charcoal-floral-embroidered-tunic-coord-set',
    name: 'Gulnar Rose Embroidered Linen Tunic Co-ord Set - Charcoal Slate',
    seoTitle: 'Charcoal Linen Floral Embroidered Co-ord Set | Summer Wear — MISS REZANNA',
    metaDesc: 'Buy charcoal slate linen-cotton co-ord set with rose pink floral embroidery & straight trousers. Handcrafted in Ludhiana for effortless summer grace. 25% off.',
    price: '₹ 2,621',
    mrp: '₹ 3,495',
    discount: '25% OFF',
    label: 'Summer Soiree · 2-Piece Linen Co-ord Set',
    inStock: true,
    stock: 90,
    stockPerSize: { S: 10, M: 10, L: 10, XL: 10, '2XL': 10, '3XL': 10, '4XL': 10, '5XL': 10, '6XL': 10 },
    images: [
      'images/charcoal-floral-embroidered-tunic-coord-set-1.jpg'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">Delicate Kashmiri roses blossoming against cool slate linen.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">The Gulnar Co-ord Set infuses classic Indian craftsmanship with effortless everyday luxury. The textured charcoal slate base is brought to life with intricate dusty pink and blush rose medallion embroidery down the front placket and across the poet balloon sleeves.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Textured Slub Linen &amp; Artisan Rosettes</h4>
      <p style="margin-bottom: 12px;">Crafted from a breathable slub linen-cotton blend that naturally softens with every wear, this two-piece ensemble keeps you cool and poised during warm summer days.</p>
      <p style="margin-bottom: 12px;">Features a chic mandarin collar, covered button detailing, and coordinating tailored straight trousers with crisp center creases.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style Note:</strong> Elevate the feminine pink embroidery with pearl earrings, strappy metallic block heels, and a soft rose lip.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Features</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ 2-Piece Set: Embroidered Tunic &amp; Matching Straight Trousers</li>
        <li>✦ Multi-shade rose pink &amp; beige botanical threadwork</li>
        <li>✦ Breathable natural slub linen-cotton texture</li>
        <li>✦ Mandarin band collar with buttoned placket</li>
        <li>✦ Elegant gathered balloon sleeves with embroidered cuffs</li>
        <li>✦ Tailored ankle-length trousers with comfortable fit</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Garment Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Charcoal Slate Grey with Rose Pink Embroidery</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fabric:</td><td style="padding: 8px 0;">Pure Slub Linen-Cotton Blend</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Fine Kashmiri-inspired Rosette Needlework</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Neckline:</td><td style="padding: 8px 0;">Mandarin Band Collar</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Trouser Style:</td><td style="padding: 8px 0;">Tailored Straight Cut with Elastic Waist</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Wash Care:</td><td style="padding: 8px 0;">Gentle Hand Wash or Machine Wash Cold</td></tr>
      </table>
    `
  },
  'sage-green-embroidered-linen-coord-set': {
    id: 'sage-green-embroidered-linen-coord-set',
    name: 'Vanya Botanical Embroidered Linen Shirt Co-ord Set - Sage Mint',
    seoTitle: 'Sage Mint Green Embroidered Linen Co-ord Set for Women — MISS REZANNA',
    metaDesc: 'Explore our sage green linen shirt co-ord set with intricate botanical vine embroidery and tailored trousers. Summer comfort meets artisan luxury at 25% off.',
    price: '₹ 2,400',
    mrp: '₹ 3,200',
    discount: '25% OFF',
    label: 'Artisanal Craft · 2-Piece Shirt Co-ord Set',
    inStock: true,
    stock: 90,
    stockPerSize: { S: 10, M: 10, L: 10, XL: 10, '2XL': 10, '3XL': 10, '4XL': 10, '5XL': 10, '6XL': 10 },
    images: [
      'images/sage-green-embroidered-linen-coord-set-1.jpg'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">Lush botanical tapestries woven into serene mint linen.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">The Vanya Co-ord Set is a celebration of organic motifs and artisanal precision. Designed in an ultra-refreshing sage mint hue, this shirt-style tunic features symmetrical Suzani-inspired botanical vines, peacock wheel medallions, and floral motifs in deep teal, violet, and ochre.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Pure Breathable Linen for Warm Climates</h4>
      <p style="margin-bottom: 12px;">Crafted from 100% fine-count slub linen, this co-ord set delivers exceptional breathability and effortless poise. The neat spread collar and button-down front create a modern resort-ready feel.</p>
      <p style="margin-bottom: 12px;">Complemented by matching straight trousers that elongate the silhouette, this ensemble is an instant favorite for summer travels, brunches, and casual gatherings.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style Note:</strong> Team with neutral espadrilles or leather slides and tortoiseshell sunglasses for a chic European summer aesthetic.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Features</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ 2-Piece Co-ord Set (Embroidered Shirt-Tunic &amp; Straight Pants)</li>
        <li>✦ Vibrant jewel-tone Suzani floral &amp; vine needlework</li>
        <li>✦ 100% Premium fine slub linen with natural cooling drape</li>
        <li>✦ Classic shirt spread collar with full button front</li>
        <li>✦ Straight-cut trousers with deep side pockets</li>
        <li>✦ Inclusive sizes S to 6XL</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Garment Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Sage Mint Green with Jewel-tone Embroidery</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fabric:</td><td style="padding: 8px 0;">100% Fine Slub Linen</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Multi-colored Botanical Vine &amp; Floral Medallion</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Collar:</td><td style="padding: 8px 0;">Classic Spread Shirt Collar</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Trouser Style:</td><td style="padding: 8px 0;">Straight Trouser with Comfort Back Elastic</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Wash Care:</td><td style="padding: 8px 0;">Hand Wash or Gentle Machine Wash Cold</td></tr>
      </table>
    `
  },
  'denim-blue-lotus-embroidered-coord-set': {
    id: 'denim-blue-lotus-embroidered-coord-set',
    name: 'Padma Lotus Embroidered Summer Co-ord Set - Indigo Denim Blue',
    seoTitle: 'Indigo Denim Blue Lotus Embroidered Co-ord Set for Women — MISS REZANNA',
    metaDesc: 'Shop indigo denim blue summer co-ord set with lotus threadwork & functional side pockets. Light, stylish everyday luxury at ₹1,980 (25% off). Fast shipping.',
    price: '₹ 1,980',
    mrp: '₹ 2,640',
    discount: '25% OFF',
    label: 'Everyday Luxury · 2-Piece Pocket Co-ord Set',
    inStock: true,
    stock: 90,
    stockPerSize: { S: 10, M: 10, L: 10, XL: 10, '2XL': 10, '3XL': 10, '4XL': 10, '5XL': 10, '6XL': 10 },
    images: [
      'images/denim-blue-lotus-embroidered-coord-set-1.jpg'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">Effortless everyday ease with sacred lotus motifs.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">The Padma Co-ord Set redefines casual dressing with an artisanal spirit. Tailored from a soft-washed slub chambray in an indigo denim blue tone, the tunic features stylized lotus flower and leaf motifs embroidered across the upper chest in deep maroon and sage green.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Designed for Daily Comfort with Functional Pockets</h4>
      <p style="margin-bottom: 12px;">Engineered for modern, active lifestyles, the tunic includes deep, practical side-seam pockets, a buttoned shirt front, and a gentle curved hemline that flatters all body types.</p>
      <p style="margin-bottom: 12px;">The matching tapered trousers complete a polished, contemporary look that seamlessly transitions from smart workdays to casual weekend outings.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style Note:</strong> Wear with leather mules and an oversized tote bag for clean, understated daytime sophistication.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Features</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ 2-Piece Co-ord Set (Pocket Shirt Tunic &amp; Tapered Trousers)</li>
        <li>✦ Handcrafted lotus bloom threadwork embroidery</li>
        <li>✦ Soft-washed, pre-shrunk chambray cotton fabric</li>
        <li>✦ Two functional deep side-seam pockets</li>
        <li>✦ Relaxed comfort fit with curved shirt hem</li>
        <li>✦ Sizes from S to 6XL</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Garment Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Indigo Denim Blue</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fabric:</td><td style="padding: 8px 0;">Soft-Washed Slub Chambray Cotton</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Pockets:</td><td style="padding: 8px 0;">2 Functional Side Pockets</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Lotus Flower &amp; Foliage Resham Work</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Trouser Style:</td><td style="padding: 8px 0;">Tapered Cigarette Pants with Elastic Waist</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Wash Care:</td><td style="padding: 8px 0;">Machine Wash Cold with Similar Colours</td></tr>
      </table>
    `
  },
  'ocean-teal-floral-embroidered-coord-set': {
    id: 'ocean-teal-floral-embroidered-coord-set',
    name: 'Mehrab Floral Embroidered Luxury Co-ord Set - Ocean Teal',
    seoTitle: 'Ocean Teal Floral Embroidered Luxury Co-ord Set — MISS REZANNA',
    metaDesc: 'Discover our ocean teal blue luxury co-ord set with architectural floral embroidery on tunic & matching trousers. Premium summer couture at 25% off.',
    price: '₹ 3,071',
    mrp: '₹ 4,095',
    discount: '25% OFF',
    label: 'Atelier Couture · 2-Piece Embroidered Co-ord Set',
    inStock: true,
    stock: 90,
    stockPerSize: { S: 10, M: 10, L: 10, XL: 10, '2XL': 10, '3XL': 10, '4XL': 10, '5XL': 10, '6XL': 10 },
    images: [
      'images/ocean-teal-floral-embroidered-coord-set-1.jpg'
    ],
    description: `
      <p style="font-size: 1.05rem; font-style: italic; color: #b89728; margin-bottom: 12px;">Regal Persian arches and flourishing summer vines.</p>
      <p style="margin-bottom: 16px; font-weight: 500; line-height: 1.6;">The Mehrab Co-ord Set represents the pinnacle of Miss Rezanna's artisanal couture. Crafted in an evocative ocean teal blue hue, both the collared long tunic and the matching trousers are lavishly embellished with architectural floral border panels inspired by Mughal palace frescoes.</p>
      
      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.15rem; margin: 20px 0 10px; color: #111;">Comprehensive Front &amp; Trouser Hem Embroidery</h4>
      <p style="margin-bottom: 12px;">Unlike standard sets, the Mehrab ensemble features intricate border embroidery wrapping around the shirt placket, side seams, sleeve cuffs, and the entire lower hem of the wide-leg trousers.</p>
      <p style="margin-bottom: 12px;">Woven from a luxurious blend of premium cotton and linen, it provides unmatched breathability, drape, and enduring elegance for festive and formal occasions.</p>
      
      <p style="background: #f9f8f6; padding: 12px 16px; border-left: 3px solid #b89728; margin-bottom: 20px; font-size: 0.95rem;">
        <strong>Style Note:</strong> Complete the couture look with statement silver jhumkas, a crystal-embellished potli bag, and elegant block heels.
      </p>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">✦ Key Features</h4>
      <ul style="padding-left: 20px; margin-bottom: 24px; line-height: 1.9; font-size: 0.95rem;">
        <li>✦ 2-Piece Couture Co-ord Set (Embroidered Tunic &amp; Embroidered Palazzo)</li>
        <li>✦ Architectural Mehrab floral border embroidery on tunic &amp; trouser hem</li>
        <li>✦ Rich Ocean Teal Blue pure cotton-linen luxury fabric</li>
        <li>✦ Tailored notched shirt collar with covered buttons</li>
        <li>✦ Wide-leg palazzo trousers with detailed embroidered borders</li>
        <li>✦ Inclusively tailored from size S to 6XL</li>
      </ul>

      <h4 style="font-family: 'Playfair Display', serif; font-size: 1.1rem; margin: 24px 0 12px; color: #111;">📋 Garment Specifications</h4>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600; width: 40%;">Colour:</td><td style="padding: 8px 0;">Ocean Teal Blue with Multi-color Floral Resham</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Fabric:</td><td style="padding: 8px 0;">Pure Fine-Count Cotton Linen</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Embroidery:</td><td style="padding: 8px 0;">Mehrab Arch &amp; Botanical Vine Border Work</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Top Style:</td><td style="padding: 8px 0;">Collared Long Tunic with Front Button Placket</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Trouser Style:</td><td style="padding: 8px 0;">Embroidered Border Palazzo with Comfort Fit</td></tr>
        <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: 600;">Wash Care:</td><td style="padding: 8px 0;">Dry Clean or Gentle Cold Wash Recommended</td></tr>
      </table>
    `
  },
  'navy-blue-embroidered-kurta-pant-set': {
    id: 'navy-blue-embroidered-kurta-pant-set',
    name: 'Navy Blue Floral Embroidered Kurta Pant Set',
    seoTitle: 'Navy Blue Embroidered Kurta Pant Set for Women | MISS REZANNA',
    metaDesc: 'Shop the navy blue embroidered kurta pant set by MISS REZANNA, featuring intricate floral embroidery and a sophisticated contemporary silhouette.',
    price: '₹ 2,360',
    mrp: '₹ 2,950',
    discount: '20% OFF',
    label: 'Festive Edit · Kurta Pant Set',
    inStock: true,
    stock: 90,
    stockPerSize: { S: 10, M: 10, L: 10, XL: 10, '2XL': 10, '3XL': 10, '4XL': 10, '5XL': 10, '6XL': 10 },
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

// Dynamic Product Loading from URL or Catalog
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
  const productId = urlParams.get('id') || 'black-embroidered-jacket-coord-set';
  
  const product = (currentProductCatalog && currentProductCatalog[productId]) 
    ? currentProductCatalog[productId] 
    : (staticProductCatalog[productId] || staticProductCatalog['black-embroidered-jacket-coord-set']);

  if (product) {
      window.activeProduct = product;
      
      // Update Title & Meta
      document.title = product.seoTitle || `${product.name} | MISS REZANNA`;
      
      const metaDescEl = document.querySelector('meta[name="description"]');
      if (metaDescEl && product.metaDesc) metaDescEl.setAttribute('content', product.metaDesc);

      // Open Graph & Twitter Social Tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', product.seoTitle || product.name);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', product.metaDesc || product.name);
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', window.location.href);
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg && product.images && product.images[0]) ogImg.setAttribute('content', window.location.origin + '/' + product.images[0]);
      const twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', product.seoTitle || product.name);
      const twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', product.metaDesc || product.name);
      
      // Update DOM Elements
      if (document.getElementById('pdp-title')) document.getElementById('pdp-title').innerText = product.name;
      const priceHtml = `${product.price} <span style="text-decoration: line-through; color: #999; font-size: 0.8em; margin-left: 8px;">${product.mrp}</span> <span style="color: #c3a167; font-size: 0.75em; font-weight: 600; margin-left: 6px;">(${product.discount})</span>`;
      if (document.getElementById('pdp-price')) document.getElementById('pdp-price').innerHTML = priceHtml;
      if (document.getElementById('pdp-label')) document.getElementById('pdp-label').innerText = product.label || 'Summer Luxe Co-ord';
      if (document.getElementById('pdp-desc')) document.getElementById('pdp-desc').innerHTML = product.description || '';
      
      // Breadcrumb title update if present
      const breadcrumbCurrent = document.querySelector('.pdp-breadcrumb span:last-child');
      if (breadcrumbCurrent) breadcrumbCurrent.innerText = product.name;

      // Sticky Bar
      if (document.getElementById('sticky-title')) document.getElementById('sticky-title').innerText = product.name;
      if (document.getElementById('sticky-price')) document.getElementById('sticky-price').innerHTML = priceHtml;
      
      // Images — rebuild slider
      const gallery = document.getElementById('pdpGallery');
      if (gallery && product.images && product.images.length > 0) {
        gallery.innerHTML = product.images.map(img => `
            <div class="pdp-img-wrapper">
              <img src="${img}" alt="${product.name} for Women by MISS REZANNA" class="pdp-img">
            </div>
        `).join('');
      }
      
      if (typeof window.refreshSlider === 'function') {
        window.refreshSlider();
      }

      // Re-bind buttons with dynamic product data
      bindAddToCartButtons(product);

      // Dynamic Schema.org JSON-LD Update for Google Merchant & Rich Snippets
      const numericPrice = parseInt(String(product.price).replace(/[^0-9]/g, ''), 10) || 2771;
      const schemaEl = document.querySelector('script[type="application/ld+json"]');
      if (schemaEl) {
        try {
          const schema = JSON.parse(schemaEl.textContent);
          if (schema) {
            schema.name = product.name;
            schema.description = product.metaDesc || product.name;
            if (product.images && product.images.length > 0) {
              schema.image = product.images.map(img => window.location.origin + '/' + img.replace(/^\//, ''));
            }
            if (schema.offers) {
              schema.offers.price = String(numericPrice);
              schema.offers.url = window.location.href;
              schema.offers.availability = product.inStock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
            }
            schemaEl.textContent = JSON.stringify(schema, null, 2);
          }
        } catch (e) {}
      }

      // Push GA4 view_item event to dataLayer
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            currency: 'INR',
            value: numericPrice,
            items: [{
              item_id: productId,
              item_name: product.name,
              price: numericPrice,
              item_category: 'Co-ord Sets',
              quantity: 1
            }]
          }
        });
      } catch (analyticsErr) {
        console.warn('Analytics event push error:', analyticsErr);
      }
  }
});

// ==========================================================================
// LIBAS-INSPIRED PDP INTERACTIVE TOOLS & CONTROLLERS
// ==========================================================================

// 1. Size Guide Modal Controller (Inches & CM with Measurement Guide)
const sizeChartData = [
  { size: 'S', bustIn: 36, waistIn: 32, hipIn: 38, lengthIn: 44, shoulderIn: 14.5 },
  { size: 'M', bustIn: 38, waistIn: 34, hipIn: 40, lengthIn: 44, shoulderIn: 15.0 },
  { size: 'L', bustIn: 40, waistIn: 36, hipIn: 42, lengthIn: 45, shoulderIn: 15.5 },
  { size: 'XL', bustIn: 42, waistIn: 38, hipIn: 44, lengthIn: 45, shoulderIn: 16.0 },
  { size: '2XL', bustIn: 44, waistIn: 40, hipIn: 46, lengthIn: 46, shoulderIn: 16.5 },
  { size: '3XL', bustIn: 46, waistIn: 42, hipIn: 48, lengthIn: 46, shoulderIn: 17.0 },
  { size: '4XL', bustIn: 48, waistIn: 44, hipIn: 50, lengthIn: 46, shoulderIn: 17.5 },
  { size: '5XL', bustIn: 50, waistIn: 46, hipIn: 52, lengthIn: 47, shoulderIn: 18.0 },
  { size: '6XL', bustIn: 52, waistIn: 48, hipIn: 54, lengthIn: 47, shoulderIn: 18.5 }
];

let currentSizeUnit = 'in';

function renderSizeChart(unit) {
  const tbody = document.getElementById('sizeChartBody');
  if (!tbody) return;

  const isCm = unit === 'cm';
  tbody.innerHTML = sizeChartData.map(row => {
    const bust = isCm ? Math.round(row.bustIn * 2.54) : row.bustIn;
    const waist = isCm ? Math.round(row.waistIn * 2.54) : row.waistIn;
    const hip = isCm ? Math.round(row.hipIn * 2.54) : row.hipIn;
    const len = isCm ? Math.round(row.lengthIn * 2.54) : row.lengthIn;
    const shoulder = isCm ? (row.shoulderIn * 2.54).toFixed(1) : row.shoulderIn.toFixed(1);

    return `
      <tr>
        <td><strong>${row.size}</strong></td>
        <td>${bust} ${unit}</td>
        <td>${waist} ${unit}</td>
        <td>${hip} ${unit}</td>
        <td>${len} ${unit}</td>
        <td>${shoulder} ${unit}</td>
      </tr>
    `;
  }).join('');
}

window.openSizeGuideModal = function() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderSizeChart(currentSizeUnit);
  }
};

window.closeSizeGuideModal = function() {
  const modal = document.getElementById('sizeGuideModal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
};

window.handleModalBackdropClick = function(e) {
  if (e.target && e.target.id === 'sizeGuideModal') {
    window.closeSizeGuideModal();
  }
};

window.switchSizeUnit = function(unit) {
  currentSizeUnit = unit;
  document.getElementById('btnUnitIn')?.classList.toggle('active', unit === 'in');
  document.getElementById('btnUnitCm')?.classList.toggle('active', unit === 'cm');
  renderSizeChart(unit);
};

// 2. Copy Coupon Code
window.copyCouponCode = function(code) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('btnCopyCode');
      if (btn) {
        btn.textContent = '✓ Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      }
    }).catch(() => fallbackCopy(code));
  } else {
    fallbackCopy(code);
  }
};

function fallbackCopy(code) {
  const tempInput = document.createElement('input');
  tempInput.value = code;
  document.body.appendChild(tempInput);
  tempInput.select();
  try {
    document.execCommand('copy');
  } catch(e) {}
  document.body.removeChild(tempInput);
  const btn = document.getElementById('btnCopyCode');
  if (btn) {
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  }
}

// 3. Pincode Delivery & COD Estimator (Libas Standard)
window.checkPincodeDelivery = function() {
  const input = document.getElementById('pincodeInput');
  const result = document.getElementById('pincodeResult');
  if (!input || !result) return;

  const val = input.value.trim();
  if (!/^\d{6}$/.test(val)) {
    result.style.display = 'block';
    result.className = 'pincode-result error';
    result.innerHTML = '✕ Please enter a valid 6-digit Indian postal PIN code.';
    return;
  }

  // Calculate estimated delivery: 4 days from today
  const now = new Date();
  now.setDate(now.getDate() + 4);
  const dateStr = now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

  result.style.display = 'block';
  result.className = 'pincode-result success';
  result.innerHTML = `
    <div style="font-weight: 600; margin-bottom: 4px;">✓ Delivery available for <strong>${val}</strong></div>
    <div>🚚 Estimated Delivery by <strong>${dateStr}</strong></div>
    <div>💵 <strong>Cash on Delivery (COD)</strong> Available</div>
    <div>🔄 14-Day Easy Return &amp; Size Exchange Eligible</div>
  `;

  try {
    localStorage.setItem('mr_saved_pincode', val);
  } catch(e) {}
};

// 4. WhatsApp Product Share
window.shareProductWhatsApp = function() {
  const url = window.location.href;
  const title = document.getElementById('pdp-title')?.innerText || 'Navy Blue Floral Embroidered Kurta Pant Set';
  const text = encodeURIComponent(`Hi! Check out this stunning ${title} by MISS REZANNA:\n${url}`);
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

