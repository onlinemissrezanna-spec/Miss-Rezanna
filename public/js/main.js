/**
 * MISS REZANNA - MAIN JS
 * Handles initializing icons, header scroll effects, and GSAP animations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // 1. Header Scroll Effect
  const header = document.getElementById('site-header');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });

  // 2. GSAP Animations for Hero Section
  
  // Create a timeline for synchronized luxury reveal
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  // Reveal the image column (Subtle reveal from the right)
  tl.fromTo('.hero-image-col', 
    { opacity: 0, x: 40 },
    { opacity: 1, x: 0, duration: 1.5, ease: "power4.out" }
  )
  // Subtle zoom out on the image itself
  .to('.hero-image', 
    { scale: 1, duration: 2, ease: "power2.out" },
    "-=1.5"
  )
  // Fade up the Label
  .fromTo('.hero-label',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    "-=1.2"
  )
  // Fade up the Headline
  .fromTo('.hero-title',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8 },
    "-=0.7"
  )
  // Fade up the Subheadline (delayed by ~0.2s from headline)
  .fromTo('.hero-subtitle',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    "-=0.5"
  )
  // Fade up the Buttons (delayed by ~0.4s from headline)
  .fromTo('.hero-actions',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.8 },
    "-=0.5"
  )
  // Fade in the scroll indicator
  .fromTo(['.scroll-text', '.scroll-line'],
    { opacity: 0 },
    { opacity: 1, duration: 1, stagger: 0.2 },
    "-=0.5"
  );

  // 3. GSAP ScrollTrigger for Our Story Section
  gsap.registerPlugin(ScrollTrigger);

  const storyTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.our-story-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  storyTl
    // Image fades in from left
    .fromTo('.our-story-image-col',
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1.2 }
    )
    // Subtle image zoom reveal
    .fromTo('.our-story-img',
      { scale: 1.05 },
      { scale: 1, duration: 1.5, ease: "power2.out" },
      "-=1.2"
    )
    // Text slides in gently from right
    .fromTo('.our-story-content-col',
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 1 },
      "-=1"
    )
    // Icons appear one by one
    .fromTo('.highlight-item',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
      "-=0.5"
    );

  // 4. GSAP ScrollTrigger for Collections Section
  const collectionsTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.collections-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  collectionsTl
    // Fade up the section header
    .fromTo('.collections-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    // Cards fade upward sequentially
    .fromTo('.collection-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
      "-=0.4"
    );

  // 5. GSAP ScrollTrigger for Craftsmanship Section
  const craftTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.craftsmanship-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  craftTl
    // Image fades in from the left
    .fromTo('.craftsmanship-image-col',
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 1.2 }
    )
    // Label fades upward
    .fromTo('.craft-label',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.8"
    )
    // Heading fades upward
    .fromTo('.craft-title',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    // Copy fades upward
    .fromTo('.craft-copy',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    // Feature blocks appear sequentially
    .fromTo('.craft-feature',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, stagger: 0.15 },
      "-=0.4"
    )
    // Button gently slides upward
    .fromTo('.btn-craft',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      "-=0.2"
    );

  // 6. GSAP ScrollTrigger for New Arrivals Section
  const arrivalsTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.new-arrivals-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  arrivalsTl
    // Header
    .fromTo('.arrivals-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    // Cards stagger
    .fromTo('.product-item',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
      "-=0.4"
    )
    // Footer button
    .fromTo('.arrivals-footer',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

  // 8. GSAP ScrollTrigger for Exhibitions Section
  const eventsTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.events-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  eventsTl
    // Slider fades in
    .fromTo('.events-slider-col',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 1 }
    )
    // Label slides up
    .fromTo('.event-label',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    // Title slides up
    .fromTo('.event-title',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    // Copy slides up
    .fromTo('.event-copy',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    // Card gently floats up
    .fromTo('.event-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1 },
      "-=0.4"
    );

  // Auto-sliding logic for the exhibition images
  const sliderImages = document.querySelectorAll('.slider-img');
  let currentSlide = 0;

  if (sliderImages.length > 0) {
    setInterval(() => {
      sliderImages[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % sliderImages.length;
      sliderImages[currentSlide].classList.add('active');
    }, 5000);
  }

  // 9. GSAP ScrollTrigger for The Journal Section
  const journalTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.journal-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  journalTl
    // Header fades up
    .fromTo('.journal-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    // Cards fade up sequentially
    .fromTo('.journal-card',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
      "-=0.4"
    );

  // 11. GSAP ScrollTrigger for The Lookbook Section
  const lookbookTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.lookbook-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  lookbookTl
    .fromTo('.lookbook-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo('.lookbook-item',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
      "-=0.4"
    )
    .fromTo('.lookbook-footer',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

  // 11b. GSAP ScrollTrigger for Styling Banner
  const stylingTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.styling-banner',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  stylingTl
    .fromTo(['.styling-banner-title', '.styling-banner-subtitle'],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
    )
    .fromTo('.styling-banner-list',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    )
    .fromTo('.styling-banner-btn-wrapper',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

  // 12. GSAP ScrollTrigger for The Experience Section
  const experienceTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.experience-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  experienceTl
    .fromTo('.experience-label',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo('.experience-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    .fromTo('.experience-card',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
      "-=0.4"
    )
    .fromTo('.experience-footer',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

  // 13. GSAP ScrollTrigger for The Circle Section
  const circleTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.circle-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  circleTl
    .fromTo('.circle-label, .circle-title, .circle-desc',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }
    )
    .fromTo('.circle-divider',
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: 0.8 },
      "-=0.4"
    )
    .fromTo('.circle-benefit-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
      "-=0.4"
    )
    .fromTo('.circle-form-wrapper',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.2"
    );

  // 14. GSAP ScrollTrigger for Footer
  gsap.fromTo('.footer-top > div',
    { opacity: 0, y: 30 },
    {
      opacity: 1, 
      y: 0, 
      duration: 0.8, 
      stagger: 0.1,
      scrollTrigger: {
        trigger: '.site-footer',
        start: 'top 90%',
        toggleActions: 'play none none none'
      },
      ease: "power3.out"
    }
  );

  // 15. Back to Top Button Logic
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 16. GSAP ScrollTrigger for Fabric Banner
  const fabricTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.fabric-banner',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  fabricTl
    .fromTo(['.fabric-banner-left', '.fabric-banner-right'],
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 }
    );

  // 17. GSAP ScrollTrigger for Complete The Look Section
  const lookTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.complete-look-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  lookTl
    .fromTo('.complete-look-image-col',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 1 }
    )
    .fromTo('.complete-look-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    .fromTo('.look-step',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
      "-=0.6"
    )
    .fromTo('.complete-look-action',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

  // 18. GSAP ScrollTrigger for Size Guide Section
  const sizeTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.size-guide-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  sizeTl
    .fromTo('.size-guide-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo('.size-guide-form',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.4"
    );

  // 19. GSAP ScrollTrigger for Testimonials
  const testTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.testimonials-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  testTl
    .fromTo('.testimonials-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 }
    )
    .fromTo('.testimonial-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2 },
      "-=0.4"
    );

  // 20. GSAP ScrollTrigger for Unboxing
  const unboxingTl = gsap.timeline({
    scrollTrigger: {
      trigger: '.unboxing-section',
      start: 'top 75%',
      toggleActions: 'play none none none'
    },
    defaults: { ease: "power3.out" }
  });

  unboxingTl
    .fromTo('.unboxing-image-col',
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 1 }
    )
    .fromTo('.unboxing-header',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8 },
      "-=0.6"
    )
    .fromTo('.unboxing-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15 },
      "-=0.6"
    );

  // Re-initialize Lucide Icons for dynamically added content if needed
  lucide.createIcons();

  // Initialize Luxury Slide Bar Navigation Drawer
  initSlideBar();

  // Initialize Luxury Search Modal
  initSearchModal();
});

function injectSlideBarStyles() {
  if (document.getElementById('slideBarInjectedStyles')) return;
  const css = `
    /* SELF-CONTAINED SLIDE BAR DRAWER STYLES (PREVENTS STATIC RENDERING AT BOTTOM OF PAGE) */
    #slideBarBackdrop {
      display: none !important;
      position: fixed !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.65) !important;
      backdrop-filter: blur(6px) !important;
      z-index: 100000 !important;
      opacity: 0 !important;
      visibility: hidden !important;
      transition: opacity 0.35s ease, visibility 0.35s ease !important;
    }
    #slideBarBackdrop.active {
      display: block !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    #slideBarDrawer {
      display: none !important;
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      bottom: 0 !important;
      width: 320px !important;
      max-width: 85vw !important;
      background: #111111 !important;
      color: #ffffff !important;
      z-index: 100001 !important;
      flex-direction: column !important;
      box-shadow: 10px 0 40px rgba(0, 0, 0, 0.5) !important;
      transform: translateX(-100%) !important;
      opacity: 0 !important;
      visibility: hidden !important;
      pointer-events: none !important;
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, visibility 0.4s ease !important;
      overflow-y: auto !important;
      -webkit-overflow-scrolling: touch !important;
      list-style: none !important;
    }
    #slideBarDrawer.active {
      display: flex !important;
      transform: translateX(0) !important;
      opacity: 1 !important;
      visibility: visible !important;
      pointer-events: auto !important;
    }
    #slideBarDrawer .slide-bar-menu {
      list-style: none !important;
      padding: 20px 0 !important;
      margin: 0 !important;
      flex: 1 !important;
    }
    #slideBarDrawer .slide-bar-item {
      margin: 0 !important;
      list-style: none !important;
    }
    #slideBarDrawer .slide-bar-link {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      padding: 15px 28px !important;
      color: #e0e0e0 !important;
      text-decoration: none !important;
      font-family: 'Playfair Display', serif !important;
      font-size: 16px !important;
      letter-spacing: 0.08em !important;
      transition: all 0.25s ease !important;
      border-left: 3px solid transparent !important;
    }
    #slideBarDrawer .slide-bar-link:hover,
    #slideBarDrawer .slide-bar-link.active {
      color: #ffffff !important;
      background: rgba(195, 161, 103, 0.08) !important;
      border-left-color: #c3a167 !important;
      padding-left: 34px !important;
    }
    #slideBarDrawer .slide-bar-footer {
      padding: 20px 24px !important;
      border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
      background: #0a0a0a !important;
    }
    #slideBarDrawer .slide-bar-cta-btn {
      display: block !important;
      width: 100% !important;
      padding: 14px 18px !important;
      text-align: center !important;
      background: rgba(195, 161, 103, 0.15) !important;
      color: #c3a167 !important;
      border: 1px solid #c3a167 !important;
      text-decoration: none !important;
      font-size: 13px !important;
      font-weight: 600 !important;
      letter-spacing: 0.1em !important;
      text-transform: uppercase !important;
      transition: all 0.25s ease !important;
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.id = 'slideBarInjectedStyles';
  styleEl.innerHTML = css;
  document.head.appendChild(styleEl);
}

function initSlideBar() {
  injectSlideBarStyles();
  if (!document.getElementById('slideBarDrawer')) {
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const isCol = window.location.pathname.includes('collection');
    const isAbout = window.location.pathname.includes('about');
    const isJour = window.location.pathname.includes('journal');
    const isExh = window.location.pathname.includes('exhibitions');
    const isCont = window.location.pathname.includes('contact');

    const slideBarHtml = `
      <div class="slide-bar-backdrop" id="slideBarBackdrop" style="display: none; opacity: 0; visibility: hidden; pointer-events: none;" onclick="closeSlideBar()"></div>
      <div class="slide-bar-drawer" id="slideBarDrawer" style="display: none; opacity: 0; visibility: hidden; pointer-events: none;">
        <div class="slide-bar-header" style="align-items:center;">
          <div style="flex:1;">
            <a href="index.html" class="slide-bar-brand" style="display:block;">
              <img src="images/logo.png" alt="MISS REZANNA" style="height: 85px; max-height: 85px; width: auto; display: block;">
            </a>
          </div>
          <button class="slide-bar-close-btn" onclick="closeSlideBar()" aria-label="Close menu">✕</button>
        </div>

        <ul class="slide-bar-menu">
          <li class="slide-bar-item">
            <a href="index.html" class="slide-bar-link ${isHome ? 'active' : ''}">
              <span>Home</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </a>
          </li>
          <li class="slide-bar-item">
            <a href="index.html#new-arrivals" class="slide-bar-link" onclick="closeSlideBar()">
              <span>New Arrivals</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/></svg>
            </a>
          </li>
          <li class="slide-bar-item">
            <a href="collection.html" class="slide-bar-link ${isCol ? 'active' : ''}">
              <span>Collections</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </a>
          </li>
          <li class="slide-bar-item">
            <a href="about.html" class="slide-bar-link ${isAbout ? 'active' : ''}">
              <span>About</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </a>
          </li>
          <li class="slide-bar-item">
            <a href="journal.html" class="slide-bar-link ${isJour ? 'active' : ''}">
              <span>Journal</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6m-6 4h6"/></svg>
            </a>
          </li>
          <li class="slide-bar-item">
            <a href="exhibitions.html" class="slide-bar-link ${isExh ? 'active' : ''}">
              <span>Exhibitions</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/></svg>
            </a>
          </li>
          <li class="slide-bar-item">
            <a href="contact.html" class="slide-bar-link ${isCont ? 'active' : ''}">
              <span>Contact</span>
              <svg class="item-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </a>
          </li>
        </ul>

        <div class="slide-bar-footer">
          <a href="cart.html" class="slide-bar-cta-btn" style="margin-bottom:10px;">🛍️ View Shopping Bag</a>
          <a href="https://wa.me/919877327186?text=Hello%20Miss%20Rezanna,%20I%20would%20like%20personal%20styling%20assistance." target="_blank" class="slide-bar-cta-btn" style="background:#25D366;color:#fff;border:none;">💬 Chat with Personal VIP Stylist</a>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', slideBarHtml);
  }

  // Hook hamburger buttons
  document.querySelectorAll('.hamburger-toggle-btn, .mobile-menu-toggle, [data-slide-toggle]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSlideBar();
    });
  });

  // Hook account buttons to Customer Auth & Profile Modal
  document.querySelectorAll('[aria-label="Account"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof openCustomerAuthModal === 'function') {
        openCustomerAuthModal();
      } else {
        window.location.href = 'admin.html';
      }
    });
  });
}

function openSlideBar() {
  initSlideBar();
  const backdrop = document.getElementById('slideBarBackdrop');
  const drawer = document.getElementById('slideBarDrawer');
  if (backdrop && drawer) {
    backdrop.style.display = 'block';
    drawer.style.display = 'flex';
    setTimeout(() => {
      backdrop.classList.add('active');
      drawer.classList.add('active');
      drawer.style.transform = 'translateX(0)';
      drawer.style.visibility = 'visible';
      drawer.style.opacity = '1';
      drawer.style.pointerEvents = 'auto';
    }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function closeSlideBar() {
  const backdrop = document.getElementById('slideBarBackdrop');
  const drawer = document.getElementById('slideBarDrawer');
  if (backdrop && drawer) {
    backdrop.classList.remove('active');
    drawer.classList.remove('active');
    drawer.style.transform = 'translateX(-100%)';
    drawer.style.opacity = '0';
    drawer.style.visibility = 'hidden';
    drawer.style.pointerEvents = 'none';
    setTimeout(() => {
      if (!drawer.classList.contains('active')) {
        backdrop.style.display = 'none';
        drawer.style.display = 'none';
      }
    }, 400);
    document.body.style.overflow = '';
  }
}

/* ==========================================================================
   INSTANT LIVE SEARCH OVERLAY MODAL
   ========================================================================== */

const SEARCH_CATALOG = [
  { id: 'midnight-kurti', name: 'Midnight Silk Kurti', price: 3000, category: 'Kurti Sets', image: 'images/A.jpeg' },
  { id: 'ivory-fusion', name: 'Ivory Linen Co-ord', price: 3000, category: 'Co-ord Sets', image: 'images/B.jpeg' },
  { id: 'crimson-set', name: 'Crimson Festivity Set', price: 3000, category: 'Festive Collection', image: 'images/C.jpeg' },
  { id: 'terracotta-pant', name: 'Terracotta Flow Pant', price: 3000, category: 'Bottom Wear', image: 'images/N.jpeg' },
  { id: 'olive-kurti', name: 'Olive Blossom Kurti', price: 3000, category: 'Kurti Sets', image: 'images/design 1 col 2.jpeg' },
  { id: 'emerald-luxury', name: 'Emerald Heritage Kurti', price: 3000, category: 'Festive Collection', image: 'images/NV.jpeg' },
  { id: 'sapphire-coord', name: 'Sapphire Modern Co-ord', price: 3000, category: 'Co-ord Sets', image: 'images/Q.jpeg' },
  { id: 'rose-ensemble', name: 'Rose Petal Kurti Set', price: 3000, category: 'Kurti Sets', image: 'images/R.jpeg' },
  { id: 'gold-chanderi', name: 'Gold Chanderi Ensemble', price: 3000, category: 'Festive Collection', image: 'images/T.jpeg' }
];

function initSearchModal() {
  if (document.getElementById('searchModalBackdrop')) return;

  const html = `
    <div class="search-modal-backdrop" id="searchModalBackdrop" style="display: none; opacity: 0; visibility: hidden; pointer-events: none;" onclick="closeSearchModal()"></div>
    <div class="search-modal-box" id="searchModalBox" style="display: none; opacity: 0; visibility: hidden; pointer-events: none;">
      <div class="search-modal-header">
        <input type="text" id="searchInputField" class="search-input-field" placeholder="Search kurtis, co-ords, ensembles..." oninput="handleSearchInput(this.value)">
        <button class="search-modal-close" onclick="closeSearchModal()">✕</button>
      </div>
      <div class="search-results-list" id="searchResultsList">
        <p style="color:#888;font-size:13px;text-align:center;padding:30px 0;">Type to search Miss Rezanna luxury collections...</p>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', html);
  injectSearchModalStyles();

  document.querySelectorAll('[aria-label="Search"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearchModal();
    });
  });
}

function openSearchModal() {
  initSearchModal();
  const backdrop = document.getElementById('searchModalBackdrop');
  const box = document.getElementById('searchModalBox');
  if (backdrop && box) {
    backdrop.style.display = 'block';
    box.style.display = 'flex';
    setTimeout(() => {
      backdrop.classList.add('active');
      box.classList.add('active');
      box.style.opacity = '1';
      box.style.visibility = 'visible';
      box.style.pointerEvents = 'auto';
      document.getElementById('searchInputField')?.focus();
    }, 10);
    document.body.style.overflow = 'hidden';
  }
}

function closeSearchModal() {
  const backdrop = document.getElementById('searchModalBackdrop');
  const box = document.getElementById('searchModalBox');
  if (backdrop && box) {
    backdrop.classList.remove('active');
    box.classList.remove('active');
    box.style.opacity = '0';
    box.style.visibility = 'hidden';
    box.style.pointerEvents = 'none';
    setTimeout(() => {
      if (!box.classList.contains('active')) {
        backdrop.style.display = 'none';
        box.style.display = 'none';
      }
    }, 350);
    document.body.style.overflow = '';
  }
}

function handleSearchInput(query) {
  const container = document.getElementById('searchResultsList');
  if (!container) return;
  const q = String(query || '').trim().toLowerCase();

  if (!q) {
    container.innerHTML = `<p style="color:#888;font-size:13px;text-align:center;padding:30px 0;">Type to search Miss Rezanna luxury collections...</p>`;
    return;
  }

  const matches = SEARCH_CATALOG.filter(item => 
    item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
  );

  if (matches.length === 0) {
    container.innerHTML = `<p style="color:#888;font-size:13px;text-align:center;padding:30px 0;">No ensembles found matching "${escapeHtml(q)}"</p>`;
    return;
  }

  container.innerHTML = matches.map(item => `
    <a href="product.html?id=${item.id}" onclick="closeSearchModal()" class="search-result-card">
      <img src="${item.image}" alt="${escapeHtml(item.name)}" class="search-result-img">
      <div class="search-result-info">
        <h4 class="search-result-title">${escapeHtml(item.name)}</h4>
        <span class="search-result-cat">${escapeHtml(item.category)}</span>
        <div class="search-result-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
      </div>
    </a>
  `).join('');
}

function injectSearchModalStyles() {
  if (document.getElementById('searchModalStyles')) return;
  const style = document.createElement('style');
  style.id = 'searchModalStyles';
  style.textContent = `
    .search-modal-backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px);
      z-index: 10020; opacity: 0; visibility: hidden; transition: all 0.3s ease;
    }
    .search-modal-backdrop.active { opacity: 1; visibility: visible; }

    .search-modal-box {
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%) translateY(-20px);
      width: 600px; max-width: 92vw; background: #ffffff; border-radius: 12px;
      z-index: 10021; box-shadow: 0 20px 50px rgba(0,0,0,0.3); opacity: 0; visibility: hidden;
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1); overflow: hidden;
    }
    .search-modal-box.active { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

    .search-modal-header { display: flex; align-items: center; padding: 16px 20px; border-bottom: 1px solid #eee; background: #faf9f6; }
    .search-input-field { flex: 1; border: none; background: transparent; font-size: 16px; font-family: 'Cormorant Garamond', serif; outline: none; color: #111; }
    .search-modal-close { background: none; border: none; font-size: 20px; color: #666; cursor: pointer; padding: 4px 8px; }

    .search-results-list { max-height: 420px; overflow-y: auto; padding: 12px 20px; }
    .search-result-card { display: flex; align-items: center; gap: 14px; padding: 10px 0; border-bottom: 1px solid #f5f5f5; text-decoration: none; color: inherit; transition: background 0.2s; }
    .search-result-card:hover { background: #fafafa; }
    .search-result-img { width: 50px; height: 60px; object-fit: cover; border-radius: 4px; }
    .search-result-info { flex: 1; }
    .search-result-title { font-family: 'Cormorant Garamond', serif; font-size: 16px; margin: 0 0 2px; color: #111; }
    .search-result-cat { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; display: block; }
    .search-result-price { font-size: 13px; font-weight: 700; color: #C3A167; }
  `;
  document.head.appendChild(style);
}

window.openSlideBar = openSlideBar;
window.closeSlideBar = closeSlideBar;
window.openSearchModal = openSearchModal;
window.closeSearchModal = closeSearchModal;
