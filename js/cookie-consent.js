/**
 * MISS REZANNA - LUXURY COOKIE & PRIVACY CONSENT MANAGER
 */

(function() {
  const STORAGE_KEY = 'miss_rezanna_cookie_consent';

  function initCookieBanner() {
    // Avoid duplicate insertion
    if (document.getElementById('cookieConsentBanner')) return;

    const consent = localStorage.getItem(STORAGE_KEY);
    
    const bannerHTML = `
      <div id="cookieConsentBanner" class="cookie-banner-container" role="dialog" aria-live="polite" aria-label="Cookie Consent">
        <div class="cookie-banner-inner">
          <div class="cookie-banner-header">
            <h3 class="cookie-banner-title"><span>❖</span> Your Privacy & Luxury Experience</h3>
          </div>
          <p class="cookie-banner-text">
            We use essential and tailored cookies to elevate your shopping journey, curate bespoke fashion recommendations, and analyze boutique traffic. By continuing, you agree to our <a href="privacy-policy.html">Privacy Policy</a> and <a href="terms-conditions.html">Terms & Conditions</a>.
          </p>
          <div class="cookie-banner-actions">
            <button id="btnDeclineCookies" class="cookie-btn cookie-btn-decline">Decline Non-Essential</button>
            <button id="btnAcceptCookies" class="cookie-btn cookie-btn-accept">Accept All</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    const bannerEl = document.getElementById('cookieConsentBanner');
    const btnAccept = document.getElementById('btnAcceptCookies');
    const btnDecline = document.getElementById('btnDeclineCookies');

    if (!consent) {
      // Show banner after 1.2 seconds delay for seamless initial page render
      setTimeout(() => {
        if (bannerEl) bannerEl.classList.add('show-banner');
      }, 1200);
    }

    if (btnAccept) {
      btnAccept.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        hideBanner();
      });
    }

    if (btnDecline) {
      btnDecline.addEventListener('click', () => {
        localStorage.setItem(STORAGE_KEY, 'declined');
        hideBanner();
      });
    }

    function hideBanner() {
      if (bannerEl) {
        bannerEl.classList.remove('show-banner');
      }
    }
  }

  // Global function to reopen from footer
  window.openCookieSettings = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const bannerEl = document.getElementById('cookieConsentBanner');
    if (bannerEl) {
      bannerEl.classList.add('show-banner');
    } else {
      localStorage.removeItem(STORAGE_KEY);
      initCookieBanner();
      setTimeout(() => {
        const newBanner = document.getElementById('cookieConsentBanner');
        if (newBanner) newBanner.classList.add('show-banner');
      }, 100);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();
