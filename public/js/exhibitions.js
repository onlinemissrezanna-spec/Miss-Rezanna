document.addEventListener('DOMContentLoaded', () => {
  // Initialize Icons safely
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Header Scroll Effect
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // Register GSAP ScrollTrigger if available
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Animation
    gsap.fromTo('.hero-anim', 
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 1, delay: 0.2, ease: "power3.out" }
    );

    // 2. Split Event Section
    gsap.fromTo('.split-anim', 
      { opacity: 0, y: 25 },
      {
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
      }
    );

    // 3. Highlights Section
    gsap.fromTo('.highlight-anim', 
      { opacity: 0, y: 25 },
      {
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
      }
    );

    // 4. Past Gallery Section
    gsap.fromTo('.gallery-anim', 
      { opacity: 0, y: 25 },
      {
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
      }
    );
  }

  // Visitor Registration Form Handler
  const regForm = document.querySelector('.reg-form');
  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = regForm.querySelector('input[type="text"]');
      const emailInput = regForm.querySelector('input[type="email"]');
      const phoneInput = regForm.querySelector('input[type="tel"]');
      const selectSession = regForm.querySelector('.reg-select');
      const submitBtn = regForm.querySelector('.btn-rsvp');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const session = selectSession ? selectSession.value : '';

      // Indian mobile validation if provided
      if (phone) {
        const phoneRegex = /^(?:\+91|91|0)?[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/[\s\-()]/g, '');
        if (!phoneRegex.test(cleanPhone)) {
          alert('Please enter a valid 10-digit Indian mobile number (e.g. +91 98765 43210).');
          if (phoneInput) phoneInput.focus();
          return;
        }
      }

      // Store in localStorage
      const rsvpData = { name, email, phone, session, timestamp: new Date().toISOString() };
      try {
        const stored = JSON.parse(localStorage.getItem('mr_exhibition_rsvps') || '[]');
        stored.push(rsvpData);
        localStorage.setItem('mr_exhibition_rsvps', JSON.stringify(stored));
      } catch (err) {
        console.warn('Storage error:', err);
      }

      // Push GTM event
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'generate_lead',
          lead_type: 'exhibition_rsvp',
          event_name: 'Winter 2026 Showcase New Delhi',
          user_phone: phone,
          timestamp: new Date().toISOString()
        });
      }

      // Inline UI confirmation
      regForm.innerHTML = `
        <div style="background: rgba(37, 211, 102, 0.1); border: 1px solid #25D366; border-radius: 8px; padding: 24px; text-align: center;">
          <h4 style="font-family: var(--font-heading); font-size: 1.4rem; color: #111; margin-bottom: 8px;">Registration Confirmed</h4>
          <p style="font-size: 14px; color: #555; line-height: 1.6; margin-bottom: 16px;">
            Thank you, <strong>${name}</strong>. Your entry pass for the <strong>Winter 2026 Showcase</strong> at Taj Palace, New Delhi has been reserved.
          </p>
          <a href="https://wa.me/919877327186?text=Hi%20Miss%20Rezanna,%20I%20have%20registered%20for%20the%20Winter%20Showcase%20(Name:%20${encodeURIComponent(name)})" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #25D366; color: #fff; padding: 12px 20px; border-radius: 4px; text-decoration: none; font-weight: 600; font-size: 13px;">
            Connect on WhatsApp for VIP Styling
          </a>
        </div>
      `;
    });
  }
});
