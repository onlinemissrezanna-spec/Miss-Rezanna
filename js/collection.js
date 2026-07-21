document.addEventListener('DOMContentLoaded', () => {
  // Initialize Icons
  lucide.createIcons();

  // Header Scroll Effect
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  gsap.registerPlugin(ScrollTrigger);

  // 1. Cinematic Hero Fades (Very soft and slow)
  const heroTl = gsap.timeline();
  
  heroTl
    .to('.collection-hero-title', {
      opacity: 1,
      duration: 2.5,
      ease: "power2.inOut"
    })
    .to('.collection-hero-subtitle', {
      opacity: 1,
      duration: 2,
      ease: "power2.inOut"
    }, "-=1.5")
    .to('.collection-scroll-indicator', {
      opacity: 1,
      duration: 1.5,
      ease: "power2.out"
    }, "-=0.5");

  // 2. Intro Text
  gsap.to('.intro-anim', {
    scrollTrigger: {
      trigger: '.collection-intro',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 1.2,
    stagger: 0.2,
    ease: "power3.out"
  });

  // 3. Product Grid
  gsap.to('.product-card', {
    scrollTrigger: {
      trigger: '.collection-grid-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out"
  });

  // Footer Animation
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
});
