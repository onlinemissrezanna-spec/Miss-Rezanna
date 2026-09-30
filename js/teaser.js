/**
 * MISS REZANNA - WINTER 2026 TEASER MODE CONTROLLER
 * Reads configuration from window.SITE_CONFIG (js/site-config.js).
 * Handles the teaser hero, countdown ticker, waitlist signup,
 * section hiding, announcement bar, and GTM dataLayer pushes.
 */

(function () {
  'use strict';

  function isTeaserMode() {
    return Boolean(window.SITE_CONFIG && window.SITE_CONFIG.TEASER_MODE);
  }

  // 1. Top Announcement Bar across all pages
  function initAnnouncementBar() {
    if (!isTeaserMode()) return;
    if (document.querySelector('.site-announcement-bar')) return;

    const bar = document.createElement('div');
    bar.className = 'site-announcement-bar';
    bar.innerHTML = `
      Winter 2026 launches 15/10/2026.
      <a href="index.html#waitlist">Join the waitlist for 24-hour early access &rarr;</a>
    `;

    const header = document.querySelector('.site-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(bar, header);
    } else {
      document.body.insertAdjacentElement('afterbegin', bar);
    }
  }

  // 2. Countdown Clock Logic
  function startCountdown(targetIsoDate, startIsoDate) {
    const startDate = startIsoDate ? new Date(startIsoDate).getTime() : 0;
    const targetDate = new Date(targetIsoDate).getTime();
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    const clockEl = document.getElementById('winterCountdown');

    if (!clockEl) return;

    function update() {
      const now = new Date().getTime();

      // If scheduled countdown start time is in the future, keep countdown hidden
      if (startDate && now < startDate) {
        clockEl.style.display = 'none';
        return;
      }

      clockEl.style.display = 'flex';

      const diff = targetDate - now;

      if (diff <= 0) {
        clockEl.innerHTML = '<span class="countdown-live-msg">Launching Now</span>';
        clearInterval(timerInterval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(mins).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    const timerInterval = setInterval(update, 1000);
  }

  // 3. Indian Phone Number Validator
  function isValidIndianMobile(phoneStr) {
    if (!phoneStr) return false;
    const clean = phoneStr.replace(/[\s\-\(\)]/g, '');
    return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(clean);
  }

  // 4. Waitlist Form Submission Handler
  function handleWaitlistSubmission(form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();

      const nameInput = form.querySelector('[name="name"]');
      const phoneInput = form.querySelector('[name="phone"]');
      const emailInput = form.querySelector('[name="email"]');
      const consentInput = form.querySelector('[name="consent"]');
      const feedbackEl = form.querySelector('.waitlist-feedback');
      const submitBtn = form.querySelector('button[type="submit"]');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';

      function showFeedback(msg, isSuccess) {
        if (!feedbackEl) {
          alert(msg);
          return;
        }
        feedbackEl.textContent = msg;
        feedbackEl.className = 'waitlist-feedback ' + (isSuccess ? 'success' : 'error');
        feedbackEl.style.display = 'block';
      }

      if (!name) {
        showFeedback('Please enter your full name.', false);
        nameInput?.focus();
        return;
      }

      if (!isValidIndianMobile(phone)) {
        showFeedback('Please enter a valid 10-digit Indian WhatsApp mobile number.', false);
        phoneInput?.focus();
        return;
      }

      if (consentInput && !consentInput.checked) {
        showFeedback('Please agree to receive launch updates.', false);
        consentInput?.focus();
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Securing Your Access...';
      }

      const payload = {
        name,
        phone,
        email,
        timestamp: new Date().toISOString(),
        source: window.location.pathname
      };

      // 1. Local backup so data is never lost
      try {
        const stored = JSON.parse(localStorage.getItem('mr_waitlist') || '[]');
        stored.push(payload);
        localStorage.setItem('mr_waitlist', JSON.stringify(stored));
      } catch (err) {
        console.warn('LocalStorage waitlist store error:', err);
      }

      // 2. Post to custom endpoint if provided by owner
      const endpoint = window.SITE_CONFIG?.WAITLIST_ENDPOINT;
      if (endpoint && endpoint.trim().length > 0 && !endpoint.includes('[OWNER INPUT')) {
        try {
          await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } catch (postErr) {
          console.warn('Waitlist remote endpoint notification error:', postErr);
        }
      }

      // 3. Push to GTM & GA4
      try {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'waitlist_signup',
          user_name: name,
          user_phone: phone,
          user_email: email
        });
        window.dataLayer.push({
          event: 'generate_lead',
          currency: 'INR',
          value: 0
        });
      } catch (gtmErr) {
        console.warn('GTM dataLayer push error:', gtmErr);
      }

      // 4. Success UI
      showFeedback('You are on the list. We will message you on WhatsApp on launch day.', true);
      form.reset();

      if (submitBtn) {
        submitBtn.textContent = '✓ Access Confirmed';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Join Winter Waitlist';
        }, 5000);
      }
    });
  }

  // 5. Initialize Homepage Teaser
  function initHomepageTeaser() {
    if (!isTeaserMode()) return;

    // Check if we are on homepage
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    // Render Deep Midnight Blue & Warm Gold Teaser Hero
    const teaserHeroHtml = `
      <section class="winter-teaser-hero" id="waitlist">
        <div class="winter-teaser-container">
          <span class="winter-teaser-tag">Winter 2026 Collection</span>
          
          <h1 class="winter-teaser-title">
            Winter is back.
            <span>Timeless Luxury in Pure Yarns</span>
          </h1>
          
          <p class="winter-teaser-subtitle">
            Miss Rezanna Winter 2026 launches 15/10/2026. Join the private list for 24-hour early access and bespoke atelier previews.
          </p>

          <!-- Live Countdown (Scheduled to display from 01/10/2026 12:00 AM IST) -->
          <div class="winter-countdown" id="winterCountdown" style="display: none;">
            <div class="countdown-box">
              <span class="countdown-number" id="cd-days">00</span>
              <span class="countdown-label">Days</span>
            </div>
            <div class="countdown-box">
              <span class="countdown-number" id="cd-hours">00</span>
              <span class="countdown-label">Hours</span>
            </div>
            <div class="countdown-box">
              <span class="countdown-number" id="cd-mins">00</span>
              <span class="countdown-label">Minutes</span>
            </div>
            <div class="countdown-box">
              <span class="countdown-number" id="cd-secs">00</span>
              <span class="countdown-label">Seconds</span>
            </div>
          </div>

          <!-- Waitlist Card -->
          <div class="winter-waitlist-card">
            <div class="winter-waitlist-header">
              <h2 class="winter-waitlist-title">Reserve 24-Hour Early Access</h2>
              <p class="winter-waitlist-desc">Exclusive invitations sent via WhatsApp before public release.</p>
            </div>

            <form id="winterWaitlistForm">
              <div class="waitlist-form-row">
                <label for="wl-name">Full Name *</label>
                <input type="text" id="wl-name" name="name" class="waitlist-input" placeholder="e.g. Ananya Sharma" required autocomplete="name">
              </div>

              <div class="waitlist-form-row">
                <label for="wl-phone">WhatsApp Number *</label>
                <input type="tel" id="wl-phone" name="phone" class="waitlist-input" placeholder="+91 98765 43210" required autocomplete="tel">
              </div>

              <div class="waitlist-form-row">
                <label for="wl-email">Email Address (Optional)</label>
                <input type="email" id="wl-email" name="email" class="waitlist-input" placeholder="ananya@example.com" autocomplete="email">
              </div>

              <div class="waitlist-consent">
                <input type="checkbox" id="wl-consent" name="consent" checked required>
                <label for="wl-consent">I agree to receive launch updates and private invitations from Miss Rezanna.</label>
              </div>

              <button type="submit" class="btn-waitlist-submit" id="wl-submit-btn">Join Winter Waitlist</button>
              
              <div class="waitlist-feedback" role="alert"></div>
            </form>
          </div>
        </div>
      </section>
    `;

    // Replace hero section content
    heroSection.outerHTML = teaserHeroHtml;

    // Start countdown with start and target dates
    const launchDate = window.SITE_CONFIG?.LAUNCH_DATETIME_IST || "2026-10-15T10:00:00+05:30";
    const startDate = window.SITE_CONFIG?.COUNTDOWN_START_DATETIME_IST || "2026-10-01T00:00:00+05:30";
    startCountdown(launchDate, startDate);

    // Bind form
    const form = document.getElementById('winterWaitlistForm');
    if (form) handleWaitlistSubmission(form);

    // Hide out-of-season and audit sections in teaser mode
    const sectionsToHide = [
      '#collections',     // Signature Collections (Summer Heritage, Botanical Bloom, Floral Grace)
      '#fabric',          // "Feel The Difference / Cotton Blend"
      '#lookbook',        // Summer lookbook
      '#complete-look',   // Complete The Look
      '#size-guide',      // Find Your Perfect Fit
      '#new-arrivals',    // New Arrivals
      '#testimonials',    // Worn Beautifully testimonials (until real named reviews)
      '#events'           // Stale Upcoming Exhibition 19-21 July
    ];

    sectionsToHide.forEach(selector => {
      const el = document.querySelector(selector);
      if (el) {
        el.style.display = 'none';
        el.setAttribute('data-teaser-hidden', 'true');
      }
    });

    // Also link the footer "Join the Circle" form to the waitlist logic
    const circleForm = document.querySelector('.circle-form');
    if (circleForm) {
      circleForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const input = circleForm.querySelector('.circle-input');
        const email = input ? input.value.trim() : '';
        if (email) {
          window.location.href = '#waitlist';
          const wlEmail = document.getElementById('wl-email');
          if (wlEmail) wlEmail.value = email;
          const wlPhone = document.getElementById('wl-phone');
          if (wlPhone) wlPhone.focus();
        }
      });
    }
  }

  // 6. Initialize Collection Page Teaser
  function initCollectionTeaser() {
    if (!isTeaserMode()) return;

    const grid = document.querySelector('.collection-grid-section');
    if (!grid) return;

    if (!document.querySelector('.collection-teaser-banner')) {
      const banner = document.createElement('div');
      banner.className = 'collection-teaser-banner';
      banner.innerHTML = `
        <h3>Winter 2026 is Coming</h3>
        <p>
          Current collection items are out of stock in preparation for our Winter 2026 release on 15/10/2026.
          <br><a href="index.html#waitlist">Join the winter waitlist for 24-hour early access &rarr;</a>
        </p>
      `;
      grid.parentNode.insertBefore(banner, grid);
    }

    // Add Out of Stock badge to any product cards
    document.querySelectorAll('.product-card').forEach(card => {
      const wrapper = card.querySelector('.product-img-wrapper');
      if (wrapper && !wrapper.querySelector('.badge-out-of-stock')) {
        wrapper.style.position = 'relative';
        const badge = document.createElement('div');
        badge.className = 'badge-out-of-stock';
        badge.style.position = 'absolute';
        badge.style.top = '14px';
        badge.style.left = '14px';
        badge.style.zIndex = '3';
        badge.textContent = 'Out of Stock';
        wrapper.appendChild(badge);
      }
    });
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initAnnouncementBar();
      initHomepageTeaser();
      initCollectionTeaser();
    });
  } else {
    initAnnouncementBar();
    initHomepageTeaser();
    initCollectionTeaser();
  }
})();
