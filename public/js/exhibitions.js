document.addEventListener('DOMContentLoaded', () => {
  // Initialize Icons
  lucide.createIcons();

  // Header Scroll Effect (Copied from main.js)
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Register GSAP ScrollTrigger
  gsap.registerPlugin(ScrollTrigger);

  // 1. Hero Animation
  gsap.to('.hero-anim', {
    opacity: 1,
    y: 0,
    duration: 1,
    delay: 0.2,
    ease: "power3.out"
  });

  // 2. Split Event Section
  gsap.to('.split-anim', {
    scrollTrigger: {
      trigger: '.event-split-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.2,
    ease: "power3.out"
  });

  // 3. Highlights Section
  gsap.to('.highlight-anim', {
    scrollTrigger: {
      trigger: '.highlights-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: "power3.out"
  });

  // 4. Past Gallery Section
  gsap.to('.gallery-anim', {
    scrollTrigger: {
      trigger: '.past-gallery-section',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 1,
    y: 0,
    duration: 0.8,
    stagger: 0.1,
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
