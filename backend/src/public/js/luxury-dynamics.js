/**
 * MISS REZANNA - LUXURY DYNAMIC EXPERIENCE & MICRO-INTERACTIONS
 * Transforms the website into an interactive, high-end editorial fashion boutique.
 */

(function() {
  // 1. TOP ANNOUNCEMENT TICKER BAR
  function initLuxuryTicker() {
    if (document.getElementById('luxuryTickerBar')) return;

    const tickerHTML = `
      <div id="luxuryTickerBar" class="luxury-ticker-bar" role="region" aria-label="Boutique Announcements">
        <div class="ticker-track">
          <div class="ticker-item"><span class="gold-symbol">❖</span> COMPLIMENTARY EXPRESS SHIPPING ON ALL INDIAN ORDERS OVER ₹15,000</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> HANDCRAFTED IN LUDHIANA, PUNJAB — BESPOKE KNITWEAR FOR THE DISCERNING</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> AUTUMN / WINTER '26 COLLECTION NOW AVAILABLE</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> PRIVATE APPOINTMENTS & CUSTOM MEASUREMENTS VIA WHATSAPP</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> COMPLIMENTARY EXPRESS SHIPPING ON ALL INDIAN ORDERS OVER ₹15,000</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> HANDCRAFTED IN LUDHIANA, PUNJAB — BESPOKE KNITWEAR FOR THE DISCERNING</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> AUTUMN / WINTER '26 COLLECTION NOW AVAILABLE</div>
          <div class="ticker-item"><span class="gold-symbol">❖</span> PRIVATE APPOINTMENTS & CUSTOM MEASUREMENTS VIA WHATSAPP</div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', tickerHTML);
  }

  // 2. GOLD EDITORIAL SCROLL PROGRESS BAR
  function initScrollProgressBar() {
    if (document.getElementById('luxuryScrollProgress')) return;

    const progressHTML = `<div id="luxuryScrollProgress" class="luxury-scroll-progress"></div>`;
    document.body.insertAdjacentHTML('beforeend', progressHTML);

    const progressEl = document.getElementById('luxuryScrollProgress');

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      if (progressEl) {
        progressEl.style.width = scrolled + '%';
      }
    }, { passive: true });
  }

  // 3. INTERACTIVE QUICK-VIEW MODAL FOR PRODUCTS
  function initQuickViewModal() {
    if (document.getElementById('quickviewModalBackdrop')) return;

    const modalHTML = `
      <div id="quickviewModalBackdrop" class="quickview-modal-backdrop" onclick="closeQuickView(event)">
        <div class="quickview-modal-card" onclick="event.stopPropagation()">
          <button class="quickview-close-btn" onclick="closeQuickView(event)" aria-label="Close Modal">✕</button>
          
          <div class="quickview-image-container">
            <img id="qvImage" src="images/logo.png" alt="Product Quick View">
          </div>

          <div class="quickview-info-panel">
            <div>
              <div id="qvCategory" class="quickview-category-label">MISS REZANNA COLLECTION</div>
              <h3 id="qvTitle" class="quickview-title">Artisanal Cashmere Garment</h3>
              <div id="qvPrice" class="quickview-price-badge">₹ 12,500</div>
              <p id="qvDesc" class="quickview-desc">
                Handcrafted from select luxury yarns in our Ludhiana atelier. Designed with tailored elegance, supreme comfort, and timeless silhouette for the discerning wardrobe.
              </p>

              <div class="quickview-size-selector">
                <div class="quickview-size-title">Select Bespoke Size:</div>
                <div class="size-pill-group" id="qvSizeGroup">
                  <button class="size-pill" data-size="XS" onclick="selectQvSize(this)">XS</button>
                  <button class="size-pill active" data-size="S" onclick="selectQvSize(this)">S</button>
                  <button class="size-pill" data-size="M" onclick="selectQvSize(this)">M</button>
                  <button class="size-pill" data-size="L" onclick="selectQvSize(this)">L</button>
                  <button class="size-pill" data-size="XL" onclick="selectQvSize(this)">XL</button>
                </div>
              </div>
            </div>

            <div class="quickview-cta-group">
              <a id="qvWaBtn" href="#" target="_blank" class="btn-quick-wa">
                <span>❖</span> Order Direct via WhatsApp
              </a>
              <button id="qvCartBtn" class="btn-quick-cart" onclick="addQvToCart()">
                Add to Luxury Shopping Bag
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Expose close & size selectors globally
    window.closeQuickView = function(e) {
      if (e && e.preventDefault) e.preventDefault();
      const backdrop = document.getElementById('quickviewModalBackdrop');
      if (backdrop) backdrop.classList.remove('open');
    };

    window.selectQvSize = function(btn) {
      const pills = document.querySelectorAll('#qvSizeGroup .size-pill');
      pills.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      updateWaLink();
    };

    window.addQvToCart = function() {
      const title = document.getElementById('qvTitle').innerText;
      const activeSizeBtn = document.querySelector('#qvSizeGroup .size-pill.active');
      const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'S';
      
      // Trigger luxury cart drawer or toast
      if (typeof window.openCartDrawer === 'function') {
        window.openCartDrawer();
      } else {
        alert(`✦ Added to Luxury Shopping Bag:\n${title} (Size: ${size})`);
      }
      window.closeQuickView();
    };

    function updateWaLink() {
      const titleEl = document.getElementById('qvTitle');
      const priceEl = document.getElementById('qvPrice');
      const waBtn = document.getElementById('qvWaBtn');
      const activeSizeBtn = document.querySelector('#qvSizeGroup .size-pill.active');
      const size = activeSizeBtn ? activeSizeBtn.getAttribute('data-size') : 'S';

      if (titleEl && priceEl && waBtn) {
        const text = `Hello MISS REZANNA, I would like to order "${titleEl.innerText}" in Size (${size}) at ${priceEl.innerText}. Please share payment details.`;
        waBtn.href = `https://wa.me/919877327186?text=${encodeURIComponent(text)}`;
      }
    }

    // Attach quick view buttons to all product cards
    attachQuickViewTriggers();
  }

  function attachQuickViewTriggers() {
    const cards = document.querySelectorAll('.product-card, .collection-item, .arrival-card');
    cards.forEach(card => {
      card.classList.add('sheen-card');
      if (card.querySelector('.quick-view-trigger-btn')) return;

      const btn = document.createElement('button');
      btn.className = 'quick-view-trigger-btn';
      btn.innerText = '✦ Quick View';
      btn.setAttribute('aria-label', 'Quick View Product Details');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const imgEl = card.querySelector('img');
        const titleEl = card.querySelector('.product-title, .item-title, h3, h4');
        const priceEl = card.querySelector('.product-price, .item-price, .price');

        const imgSrc = imgEl ? imgEl.src : 'images/logo.png';
        const title = titleEl ? titleEl.innerText.trim() : 'Bespoke Knitwear Creation';
        const price = priceEl ? priceEl.innerText.trim() : '₹ 14,500';

        const qvImg = document.getElementById('qvImage');
        const qvTitle = document.getElementById('qvTitle');
        const qvPrice = document.getElementById('qvPrice');

        if (qvImg) qvImg.src = imgSrc;
        if (qvTitle) qvTitle.innerText = title;
        if (qvPrice) qvPrice.innerText = price;

        // Reset default size to S
        const pills = document.querySelectorAll('#qvSizeGroup .size-pill');
        pills.forEach((p, idx) => {
          if (idx === 1) p.classList.add('active');
          else p.classList.remove('active');
        });

        // Trigger Wa link update
        const activeBtn = document.querySelector('#qvSizeGroup .size-pill.active');
        const size = activeBtn ? activeBtn.getAttribute('data-size') : 'S';
        const waBtn = document.getElementById('qvWaBtn');
        if (waBtn) {
          const text = `Hello MISS REZANNA, I would like to order "${title}" in Size (${size}) at ${price}. Please share payment details.`;
          waBtn.href = `https://wa.me/919877327186?text=${encodeURIComponent(text)}`;
        }

        const backdrop = document.getElementById('quickviewModalBackdrop');
        if (backdrop) backdrop.classList.add('open');
      });

      card.appendChild(btn);
    });
  }

  // 4. WISHLIST FLOATING GOLD HEART PARTICLES
  function initHeartParticles() {
    document.addEventListener('click', (e) => {
      const heartBtn = e.target.closest('[aria-label*="Wishlist"], [data-lucide="heart"], .wishlist-btn');
      if (heartBtn) {
        for (let i = 0; i < 3; i++) {
          createHeartParticle(e.clientX, e.clientY);
        }
      }
    });

    function createHeartParticle(x, y) {
      const heart = document.createElement('div');
      heart.className = 'heart-particle';
      heart.innerText = '♥';
      heart.style.left = (x + (Math.random() - 0.5) * 40) + 'px';
      heart.style.top = (y - 10) + 'px';
      document.body.appendChild(heart);

      setTimeout(() => {
        heart.remove();
      }, 1200);
    }
  }

  // Initialize all dynamic features
  function initLuxuryDynamics() {
    initLuxuryTicker();
    initScrollProgressBar();
    initQuickViewModal();
    initHeartParticles();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryDynamics);
  } else {
    initLuxuryDynamics();
  }
})();
