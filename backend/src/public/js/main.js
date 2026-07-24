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
});
