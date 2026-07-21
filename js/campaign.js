document.addEventListener('DOMContentLoaded', () => {
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

  // Campaign Hub Animations
  gsap.to('.campaign-card', {
    scrollTrigger: {
      trigger: '.campaign-list',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 1,
    stagger: 0.15,
    ease: "power3.out"
  });

  // Individual Campaign Hero Fades
  const heroTl = gsap.timeline();
  
  heroTl
    .to('.campaign-label', { opacity: 1, duration: 1, ease: "power2.out" }, "+=0.2")
    .to('.campaign-title', { opacity: 1, duration: 1.5, ease: "power2.out" }, "-=0.5")
    .to('.campaign-desc', { opacity: 1, duration: 1.5, ease: "power2.out" }, "-=1");

  // Re-use product grid animation from collection logic
  gsap.to('.product-card', {
    scrollTrigger: {
      trigger: '.collection-grid',
      start: 'top 85%',
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
