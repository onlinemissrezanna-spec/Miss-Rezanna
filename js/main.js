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
});

function initSlideBar() {
  if (!document.getElementById('slideBarDrawer')) {
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const isCol = window.location.pathname.includes('collection');
    const isAbout = window.location.pathname.includes('about');
    const isJour = window.location.pathname.includes('journal');
    const isExh = window.location.pathname.includes('exhibitions');
    const isCont = window.location.pathname.includes('contact');

    const slideBarHtml = `
      <div class="slide-bar-backdrop" id="slideBarBackdrop" onclick="closeSlideBar()"></div>
      <div class="slide-bar-drawer" id="slideBarDrawer">
        <div class="slide-bar-header">
          <div>
            <a href="index.html" class="slide-bar-brand">MISS REZANNA</a>
            <div class="slide-bar-subbrand">Luxury Couture</div>
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
          <a href="cart.html" class="slide-bar-cta-btn">🛍️ View Shopping Bag</a>
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
}

function openSlideBar() {
  const backdrop = document.getElementById('slideBarBackdrop');
  const drawer = document.getElementById('slideBarDrawer');
  if (backdrop && drawer) {
    backdrop.classList.add('active');
    drawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeSlideBar() {
  const backdrop = document.getElementById('slideBarBackdrop');
  const drawer = document.getElementById('slideBarDrawer');
  if (backdrop && drawer) {
    backdrop.classList.remove('active');
    drawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}
